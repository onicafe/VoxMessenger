/**
 * IDataAdapter — Data Abstraction Layer Interface
 *
 * All business logic interacts with data through this interface.
 * Supabase is the MVP concrete implementation.
 * Future adapters (self-hosted, Firebase, etc.) must satisfy this contract.
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthSession {
  userId: string;
  accessToken: string;
  expiresAt: number;
}

export interface IAuthAdapter {
  /** Sign in using an external OAuth token (GOV.br) */
  signInWithGovBr(govBrToken: string): Promise<AuthSession>;
  /** Sign out and revoke the current session */
  signOut(): Promise<void>;
  /** Get the current active session, if any */
  getSession(): Promise<AuthSession | null>;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface UserRecord {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  identityPublicKey: string;
  signedPrekeyPublic: string;
  signedPrekeySignature: string;
  contentFilterEnabled: boolean;
  createdAt: string;
}

export interface IUserAdapter {
  getUserById(id: string): Promise<UserRecord | null>;
  getUserByUsername(username: string): Promise<UserRecord | null>;
  createUser(payload: Omit<UserRecord, 'id' | 'createdAt'>): Promise<UserRecord>;
  updateUser(id: string, updates: Partial<Pick<UserRecord, 'displayName' | 'avatarUrl' | 'contentFilterEnabled'>>): Promise<void>;
  /** Soft-delete — sets deleted_at timestamp */
  deleteUser(id: string): Promise<void>;
}

// ─── Conversations ─────────────────────────────────────────────────────────────

export type ConversationType = 'direct' | 'group';

export interface ConversationRecord {
  id: string;
  type: ConversationType;
  name: string | null;
  avatarUrl: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMember {
  userId: string;
  role: 'member' | 'admin';
  joinedAt: string;
  leftAt: string | null;
}

export interface IConversationAdapter {
  getConversation(id: string): Promise<ConversationRecord | null>;
  getUserConversations(userId: string): Promise<ConversationRecord[]>;
  createConversation(payload: Pick<ConversationRecord, 'type' | 'name' | 'createdBy'>): Promise<ConversationRecord>;
  getMembers(conversationId: string): Promise<ConversationMember[]>;
  addMember(conversationId: string, userId: string, role?: 'member' | 'admin'): Promise<void>;
  removeMember(conversationId: string, userId: string): Promise<void>;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'image' | 'audio' | 'sticker' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  /** E2E encrypted payload — opaque to server */
  ciphertext: string;
  messageType: MessageType;
  status: MessageStatus;
  replyToId: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface IMessageAdapter {
  getMessages(conversationId: string, limit?: number, before?: string): Promise<MessageRecord[]>;
  sendMessage(payload: Pick<MessageRecord, 'conversationId' | 'senderId' | 'ciphertext' | 'messageType' | 'replyToId'>): Promise<MessageRecord>;
  updateStatus(messageId: string, status: MessageStatus): Promise<void>;
  /** Soft-delete — only sender can delete */
  deleteMessage(messageId: string, senderId: string): Promise<void>;
  /** Subscribe to new messages in a conversation */
  subscribeToMessages(conversationId: string, onMessage: (msg: MessageRecord) => void): () => void;
}

// ─── Signal Prekeys ───────────────────────────────────────────────────────────

export interface PreKeyRecord {
  keyId: number;
  publicKey: string;
}

export interface IPreKeyAdapter {
  getKeyBundle(userId: string): Promise<{
    identityPublicKey: string;
    signedPrekeyPublic: string;
    signedPrekeySignature: string;
    oneTimePrekey: PreKeyRecord | null;
  }>;
  uploadOneTimePrekeys(userId: string, prekeys: PreKeyRecord[]): Promise<void>;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export interface IStorageAdapter {
  uploadFile(bucket: string, path: string, data: Blob): Promise<string>;
  getFileUrl(bucket: string, path: string): string;
  deleteFile(bucket: string, path: string): Promise<void>;
}

// ─── Composite Interface ───────────────────────────────────────────────────────

export interface IDataAdapter {
  auth: IAuthAdapter;
  users: IUserAdapter;
  conversations: IConversationAdapter;
  messages: IMessageAdapter;
  prekeys: IPreKeyAdapter;
  storage: IStorageAdapter;
}
