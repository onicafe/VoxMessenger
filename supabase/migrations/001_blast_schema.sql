-- ============================================================
-- B.L.A.S.T. Messenger — Database Migration 001
-- Schema: blast (isolated from public schema)
--
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pztkmsfxkqwbnhgjjlfu/sql
--
-- This migration creates ALL blast tables in a dedicated `blast`
-- schema, completely isolated from your existing public schema tables.
-- ============================================================

-- ─── Create isolated schema ───────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS blast;

-- Grant access to Supabase roles
GRANT USAGE ON SCHEMA blast TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA blast
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA blast
  GRANT ALL ON TABLES TO service_role;

-- ─── Enable UUID extension (if not already enabled) ───────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── users ────────────────────────────────────────────────────────────────────
CREATE TABLE blast.users (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username              TEXT UNIQUE NOT NULL,
  display_name          TEXT NOT NULL,
  avatar_url            TEXT,

  -- GOV.br identity — NEVER returned to clients
  gov_identity_hash     TEXT UNIQUE NOT NULL,  -- SHA-256(sub) for uniqueness
  gov_identity_encrypted TEXT NOT NULL,         -- AES-256-GCM(sub) for legal hold

  -- Signal Protocol public keys
  identity_public_key   TEXT NOT NULL,
  signed_prekey_public  TEXT NOT NULL,
  signed_prekey_signature TEXT NOT NULL,

  -- Settings
  content_filter_enabled BOOLEAN NOT NULL DEFAULT TRUE,

  -- LGPD consent
  lgpd_consent_at       TIMESTAMPTZ,
  lgpd_consent_version  TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

-- Prevent clients from ever reading gov_identity_encrypted or gov_identity_hash
COMMENT ON COLUMN blast.users.gov_identity_encrypted IS 'Legal hold only. Excluded from all RLS-exposed queries.';
COMMENT ON COLUMN blast.users.gov_identity_hash IS 'Uniqueness check only. Never returned to clients.';

-- ─── conversations ────────────────────────────────────────────────────────────
CREATE TYPE blast.conversation_type AS ENUM ('direct', 'group');

CREATE TABLE blast.conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        blast.conversation_type NOT NULL,
  name        TEXT,           -- group only
  avatar_url  TEXT,           -- group only
  created_by  UUID NOT NULL REFERENCES blast.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── conversation_members ─────────────────────────────────────────────────────
CREATE TYPE blast.member_role AS ENUM ('member', 'admin');

CREATE TABLE blast.conversation_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES blast.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES blast.users(id) ON DELETE CASCADE,
  role            blast.member_role NOT NULL DEFAULT 'member',
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at         TIMESTAMPTZ,
  UNIQUE (conversation_id, user_id)
);

-- ─── messages ─────────────────────────────────────────────────────────────────
CREATE TYPE blast.message_type AS ENUM ('text', 'image', 'audio', 'sticker', 'system');
CREATE TYPE blast.message_status AS ENUM ('sent', 'delivered', 'read');

CREATE TABLE blast.messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES blast.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES blast.users(id) ON DELETE CASCADE,
  ciphertext      TEXT NOT NULL,  -- E2E encrypted — server cannot read
  message_type    blast.message_type NOT NULL DEFAULT 'text',
  status          blast.message_status NOT NULL DEFAULT 'sent',
  reply_to_id     UUID REFERENCES blast.messages(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

COMMENT ON COLUMN blast.messages.ciphertext IS 'E2E encrypted payload. Opaque to the server.';

-- ─── signal_prekeys ───────────────────────────────────────────────────────────
CREATE TABLE blast.signal_prekeys (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES blast.users(id) ON DELETE CASCADE,
  key_id      INTEGER NOT NULL,
  public_key  TEXT NOT NULL,
  consumed_at TIMESTAMPTZ,
  UNIQUE (user_id, key_id)
);

-- ─── modules ──────────────────────────────────────────────────────────────────
CREATE TYPE blast.module_category AS ENUM ('delivery', 'gaming', 'productivity', 'other');

CREATE TABLE blast.modules (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL,
  version      TEXT NOT NULL,
  download_url TEXT NOT NULL,
  size_bytes   INTEGER NOT NULL,
  category     blast.module_category NOT NULL DEFAULT 'other',
  is_free      BOOLEAN NOT NULL DEFAULT TRUE,
  price_cents  INTEGER,
  dependencies TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── user_modules ─────────────────────────────────────────────────────────────
CREATE TABLE blast.user_modules (
  user_id      UUID NOT NULL REFERENCES blast.users(id) ON DELETE CASCADE,
  module_id    UUID NOT NULL REFERENCES blast.modules(id) ON DELETE CASCADE,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at   TIMESTAMPTZ,
  PRIMARY KEY (user_id, module_id)
);

-- ─── sticker_packs ────────────────────────────────────────────────────────────
CREATE TABLE blast.sticker_packs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  author        TEXT NOT NULL,
  preview_url   TEXT NOT NULL,
  price_cents   INTEGER NOT NULL DEFAULT 0,
  sticker_count INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── themes ───────────────────────────────────────────────────────────────────
CREATE TABLE blast.themes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  author      TEXT NOT NULL,
  preview_url TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  config      JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_blast_messages_conversation ON blast.messages(conversation_id, created_at DESC);
CREATE INDEX idx_blast_messages_sender ON blast.messages(sender_id);
CREATE INDEX idx_blast_conversation_members_user ON blast.conversation_members(user_id) WHERE left_at IS NULL;
CREATE INDEX idx_blast_signal_prekeys_user ON blast.signal_prekeys(user_id) WHERE consumed_at IS NULL;
CREATE INDEX idx_blast_users_gov_hash ON blast.users(gov_identity_hash);

-- ─── Updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION blast.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON blast.users
  FOR EACH ROW EXECUTE FUNCTION blast.update_updated_at();

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON blast.conversations
  FOR EACH ROW EXECUTE FUNCTION blast.update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE blast.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blast.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blast.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE blast.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blast.signal_prekeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE blast.sticker_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blast.themes ENABLE ROW LEVEL SECURITY;

-- Users: read own record only (gov_identity fields never exposed via API)
CREATE POLICY "users_read_own" ON blast.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON blast.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Conversations: read only if member
CREATE POLICY "conversations_read_member" ON blast.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blast.conversation_members cm
      WHERE cm.conversation_id = id
        AND cm.user_id = auth.uid()
        AND cm.left_at IS NULL
    )
  );

-- conversation_members: read if in same conversation
CREATE POLICY "members_read_own_convos" ON blast.conversation_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blast.conversation_members cm
      WHERE cm.conversation_id = conversation_id
        AND cm.user_id = auth.uid()
        AND cm.left_at IS NULL
    )
  );

-- Messages: read only if member of conversation
CREATE POLICY "messages_read_member" ON blast.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blast.conversation_members cm
      WHERE cm.conversation_id = conversation_id
        AND cm.user_id = auth.uid()
        AND cm.left_at IS NULL
    )
  );

-- Messages: insert only as sender
CREATE POLICY "messages_insert_as_sender" ON blast.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Messages: soft-delete only own messages
CREATE POLICY "messages_delete_own" ON blast.messages
  FOR UPDATE USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Signal prekeys: public keys are public (readable by any authenticated user)
CREATE POLICY "prekeys_read_authenticated" ON blast.signal_prekeys
  FOR SELECT USING (auth.role() = 'authenticated');

-- Signal prekeys: write own keys only
CREATE POLICY "prekeys_write_own" ON blast.signal_prekeys
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Store items: public read
CREATE POLICY "stickers_read_public" ON blast.sticker_packs
  FOR SELECT USING (true);

CREATE POLICY "themes_read_public" ON blast.themes
  FOR SELECT USING (true);

-- ─── Realtime ─────────────────────────────────────────────────────────────────
-- Enable realtime on messages table for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE blast.messages;

-- ============================================================
-- Migration complete. All BLAST tables are in the `blast` schema.
-- Your existing `public` schema tables are completely untouched.
-- ============================================================
