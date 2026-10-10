# Architecture SOP — B.L.A.S.T. Messenger
**Version**: 0.1.0.0 | **Layer**: 1 — Architecture

---

## Goal
Provide a privacy-first, modular mobile messenger with E2E encryption, GOV.br identity verification, and a downloadable integration system.

## Inputs
- GOV.br OAuth2 token (identity verification)
- User-typed messages (encrypted on-device before transmission)
- Media files (encrypted before upload)
- Module install/uninstall requests

## Outputs
- Encrypted ciphertext delivered to recipient(s)
- Push notification payloads (conversation ID only — no content)
- User profile data (never GOV.br identity)
- Module asset bundles (downloaded on demand)

## Core Workflows

### 1. First Launch
1. Show auth screen
2. User taps "Entrar com GOV.br"
3. GOV.br OAuth2 flow (expo-auth-session)
4. Receive `sub` → compute `gov_identity_hash`
5. Create or retrieve `users` record
6. Generate Signal Protocol key bundle → upload public keys
7. Store private keys in expo-secure-store
8. Show LGPD consent screen (v1.0)
9. On consent → set `lgpd_consent_at` + navigate to conversation list

### 2. Send a Message (1v1)
1. User types message (plaintext, in-device memory only)
2. Encryption module: encrypt with recipient's Double Ratchet session key
3. Send `ciphertext` to `messages` table via DAL
4. Supabase Realtime pushes to recipient's subscription
5. Recipient receives ciphertext → decrypts with their local session
6. If content filter enabled → classifier runs locally before render

### 3. Send a Message (Group)
1. Sender encrypts with Sender Key for this group
2. Server stores `ciphertext` (opaque)
3. Each member decrypts with their copy of the Sender Key
4. On member join/leave → re-key event distributed

### 4. Module Install
1. User browses module registry
2. Taps Install → module signature verified
3. Feature flag enabled in local store
4. Module assets downloaded (external API integrations, not code)
5. Module UI becomes visible in navigation

### 5. Legal Hold
1. Court order documented
2. Legal officer runs `tools/legal-hold-cli`
3. CLI decrypts `gov_identity_encrypted` for the specific user
4. GOV.br sub returned to legal officer
5. Decryption event logged immutably
6. GOV.br sub transmitted to authorities

## Edge Cases

| Case | Behavior |
|---|---|
| User has no one-time prekeys left | Fall back to signed prekey only (X3DH still valid) |
| GOV.br OAuth fails | Show error, let user retry — no partial state saved |
| Network failure during send | Message queued locally, retry on reconnect |
| Module signature invalid | Installation blocked, user notified |
| User deletes account | Soft-delete immediately, hard-delete after 30 days |
| LGPD consent withdrawn | Triggers account deletion flow |

## Failure Conditions
- **Auth**: GOV.br down → block sign-in, show outage message
- **Encryption**: Private key missing → force re-registration (key loss = session loss)
- **Realtime**: WebSocket drop → fallback to pull on app foreground
- **Legal Hold CLI**: Without valid court order ID → decryption refused, audit log writes the attempt

## Security Considerations
- Private keys never leave the device
- Server stores zero plaintext
- `gov_identity_encrypted` excluded from all RLS policies
- Push notification payloads contain zero message content
- Module code is not dynamically loaded (iOS App Store policy)

## Golden Rule
**If any system logic changes → update this document first. Code follows architecture.**
