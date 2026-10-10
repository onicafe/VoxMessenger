/**
 * SupabaseAdapter — MVP concrete implementation of IDataAdapter
 *
 * Business logic never imports this directly.
 * All imports go through the `getDataAdapter()` factory.
 * To swap backends: replace this file and update the factory.
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type {
  IDataAdapter,
  IAuthAdapter,
  IUserAdapter,
  IConversationAdapter,
  IMessageAdapter,
  IPreKeyAdapter,
  IStorageAdapter,
  AuthSession,
  UserRecord,
  ConversationRecord,
  ConversationMember,
  MessageRecord,
  MessageStatus,
  PreKeyRecord,
} from './IDataAdapter';

// ─── Client Setup ─────────────────────────────────────────────────────────────

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[SupabaseAdapter] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Check your .env file.',
  );
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'blast',
  },
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

const auth: IAuthAdapter = {
  async signInWithGovBr(govBrToken: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'keycloak' as never, // GOV.br uses OpenID Connect — mapped via Supabase custom OIDC
      token: govBrToken,
    });
    if (error ?? !data.session) throw new Error(`[Auth] Sign in failed: ${error?.message}`);
    return {
      userId: data.session.user.id,
      accessToken: data.session.access_token,
      expiresAt: data.session.expires_at ?? 0,
    };
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`[Auth] Sign out failed: ${error.message}`);
  },

  async getSession(): Promise<AuthSession | null> {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    return {
      userId: data.session.user.id,
      accessToken: data.session.access_token,
      expiresAt: data.session.expires_at ?? 0,
    };
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────

function mapUser(row: Record<string, unknown>): UserRecord {
  return {
    id: row['id'] as string,
    username: row['username'] as string,
    displayName: row['display_name'] as string,
    avatarUrl: (row['avatar_url'] as string | null) ?? null,
    identityPublicKey: row['identity_public_key'] as string,
    signedPrekeyPublic: row['signed_prekey_public'] as string,
    signedPrekeySignature: row['signed_prekey_signature'] as string,
    contentFilterEnabled: row['content_filter_enabled'] as boolean,
    createdAt: row['created_at'] as string,
  };
}

const users: IUserAdapter = {
  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_url, identity_public_key, signed_prekey_public, signed_prekey_signature, content_filter_enabled, created_at')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    if (error) return null;
    return mapUser(data as Record<string, unknown>);
  },

  async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_url, identity_public_key, signed_prekey_public, signed_prekey_signature, content_filter_enabled, created_at')
      .eq('username', username)
      .is('deleted_at', null)
      .single();
    if (error) return null;
    return mapUser(data as Record<string, unknown>);
  },

  async createUser(payload) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: payload.username,
        display_name: payload.displayName,
        avatar_url: payload.avatarUrl,
        identity_public_key: payload.identityPublicKey,
        signed_prekey_public: payload.signedPrekeyPublic,
        signed_prekey_signature: payload.signedPrekeySignature,
        content_filter_enabled: payload.contentFilterEnabled,
      })
      .select()
      .single();
    if (error ?? !data) throw new Error(`[Users] Create failed: ${error?.message}`);
    return mapUser(data as Record<string, unknown>);
  },

  async updateUser(id, updates) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.displayName !== undefined) dbUpdates['display_name'] = updates.displayName;
    if (updates.avatarUrl !== undefined) dbUpdates['avatar_url'] = updates.avatarUrl;
    if (updates.contentFilterEnabled !== undefined) dbUpdates['content_filter_enabled'] = updates.contentFilterEnabled;
    const { error } = await supabase.from('users').update(dbUpdates).eq('id', id);
    if (error) throw new Error(`[Users] Update failed: ${error.message}`);
  },

  async deleteUser(id) {
    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(`[Users] Delete failed: ${error.message}`);
  },
};

// ─── Conversations ─────────────────────────────────────────────────────────────

function mapConversation(row: Record<string, unknown>): ConversationRecord {
  return {
    id: row['id'] as string,
    type: row['type'] as 'direct' | 'group',
    name: (row['name'] as string | null) ?? null,
    avatarUrl: (row['avatar_url'] as string | null) ?? null,
    createdBy: row['created_by'] as string,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
  };
}

const conversations: IConversationAdapter = {
  async getConversation(id) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return mapConversation(data as Record<string, unknown>);
  },

  async getUserConversations(userId) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, conversation_members!inner(user_id)')
      .eq('conversation_members.user_id', userId)
      .is('conversation_members.left_at', null)
      .order('updated_at', { ascending: false });
    if (error ?? !data) return [];
    return (data as Record<string, unknown>[]).map(mapConversation);
  },

  async createConversation(payload) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ type: payload.type, name: payload.name, created_by: payload.createdBy })
      .select()
      .single();
    if (error ?? !data) throw new Error(`[Conversations] Create failed: ${error?.message}`);
    return mapConversation(data as Record<string, unknown>);
  },

  async getMembers(conversationId) {
    const { data, error } = await supabase
      .from('conversation_members')
      .select('user_id, role, joined_at, left_at')
      .eq('conversation_id', conversationId)
      .is('left_at', null);
    if (error ?? !data) return [];
    return (data as Record<string, unknown>[]).map((row) => ({
      userId: row['user_id'] as string,
      role: row['role'] as 'member' | 'admin',
      joinedAt: row['joined_at'] as string,
      leftAt: (row['left_at'] as string | null) ?? null,
    })) satisfies ConversationMember[];
  },

  async addMember(conversationId, userId, role = 'member') {
    const { error } = await supabase
      .from('conversation_members')
      .upsert({ conversation_id: conversationId, user_id: userId, role, joined_at: new Date().toISOString() });
    if (error) throw new Error(`[Conversations] Add member failed: ${error.message}`);
  },

  async removeMember(conversationId, userId) {
    const { error } = await supabase
      .from('conversation_members')
      .update({ left_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
    if (error) throw new Error(`[Conversations] Remove member failed: ${error.message}`);
  },
};

// ─── Messages ─────────────────────────────────────────────────────────────────

function mapMessage(row: Record<string, unknown>): MessageRecord {
  return {
    id: row['id'] as string,
    conversationId: row['conversation_id'] as string,
    senderId: row['sender_id'] as string,
    ciphertext: row['ciphertext'] as string,
    messageType: row['message_type'] as MessageRecord['messageType'],
    status: row['status'] as MessageStatus,
    replyToId: (row['reply_to_id'] as string | null) ?? null,
    createdAt: row['created_at'] as string,
    deletedAt: (row['deleted_at'] as string | null) ?? null,
  };
}

const messages: IMessageAdapter = {
  async getMessages(conversationId, limit = 50, before) {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (before) query = query.lt('created_at', before);
    const { data, error } = await query;
    if (error ?? !data) return [];
    return (data as Record<string, unknown>[]).map(mapMessage).reverse();
  },

  async sendMessage(payload) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: payload.conversationId,
        sender_id: payload.senderId,
        ciphertext: payload.ciphertext,
        message_type: payload.messageType,
        reply_to_id: payload.replyToId,
        status: 'sent',
      })
      .select()
      .single();
    if (error ?? !data) throw new Error(`[Messages] Send failed: ${error?.message}`);
    return mapMessage(data as Record<string, unknown>);
  },

  async updateStatus(messageId, status) {
    const { error } = await supabase.from('messages').update({ status }).eq('id', messageId);
    if (error) throw new Error(`[Messages] Status update failed: ${error.message}`);
  },

  async deleteMessage(messageId, senderId) {
    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('sender_id', senderId);
    if (error) throw new Error(`[Messages] Delete failed: ${error.message}`);
  },

  subscribeToMessages(conversationId, onMessage) {
    const channel: RealtimeChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'blast', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => onMessage(mapMessage(payload.new as Record<string, unknown>)),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};

// ─── PreKeys ──────────────────────────────────────────────────────────────────

const prekeys: IPreKeyAdapter = {
  async getKeyBundle(userId) {
    const [userResult, prekeyResult] = await Promise.all([
      supabase
        .from('users')
        .select('identity_public_key, signed_prekey_public, signed_prekey_signature')
        .eq('id', userId)
        .single(),
      supabase
        .from('signal_prekeys')
        .select('key_id, public_key')
        .eq('user_id', userId)
        .is('consumed_at', null)
        .limit(1)
        .single(),
    ]);

    if (userResult.error ?? !userResult.data) {
      throw new Error(`[PreKeys] User not found: ${userResult.error?.message}`);
    }

    const u = userResult.data as Record<string, unknown>;

    // Mark selected prekey as consumed
    if (!prekeyResult.error && prekeyResult.data) {
      const pk = prekeyResult.data as Record<string, unknown>;
      await supabase
        .from('signal_prekeys')
        .update({ consumed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('key_id', pk['key_id']);

      return {
        identityPublicKey: u['identity_public_key'] as string,
        signedPrekeyPublic: u['signed_prekey_public'] as string,
        signedPrekeySignature: u['signed_prekey_signature'] as string,
        oneTimePrekey: { keyId: pk['key_id'] as number, publicKey: pk['public_key'] as string },
      };
    }

    return {
      identityPublicKey: u['identity_public_key'] as string,
      signedPrekeyPublic: u['signed_prekey_public'] as string,
      signedPrekeySignature: u['signed_prekey_signature'] as string,
      oneTimePrekey: null,
    };
  },

  async uploadOneTimePrekeys(userId, prekeys: PreKeyRecord[]) {
    const rows = prekeys.map((pk) => ({
      user_id: userId,
      key_id: pk.keyId,
      public_key: pk.publicKey,
    }));
    const { error } = await supabase.from('signal_prekeys').insert(rows);
    if (error) throw new Error(`[PreKeys] Upload failed: ${error.message}`);
  },
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const storage: IStorageAdapter = {
  async uploadFile(bucket, path, data) {
    const { error } = await supabase.storage.from(bucket).upload(path, data, { upsert: true });
    if (error) throw new Error(`[Storage] Upload failed: ${error.message}`);
    return storage.getFileUrl(bucket, path);
  },

  getFileUrl(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async deleteFile(bucket, path) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw new Error(`[Storage] Delete failed: ${error.message}`);
  },
};

// ─── Factory ──────────────────────────────────────────────────────────────────

export const SupabaseAdapter: IDataAdapter = {
  auth,
  users,
  conversations,
  messages,
  prekeys,
  storage,
};
