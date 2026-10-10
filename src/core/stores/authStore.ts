/**
 * Auth Store — Zustand
 *
 * Manages authentication session state.
 * GOV.br token exchange happens in the auth module.
 * This store only holds the resolved internal session.
 */

import { create } from 'zustand';
import { getDataAdapter } from '@core/dal';
import type { AuthSession, UserRecord } from '@core/dal/IDataAdapter';

interface AuthState {
  session: AuthSession | null;
  user: UserRecord | null;
  isLoading: boolean;
  error: string | null;

  /** Restore session from storage on app launch */
  restoreSession: () => Promise<void>;
  /** Called after GOV.br OAuth completes */
  setSession: (session: AuthSession, user: UserRecord) => void;
  /** Sign out and clear all state */
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  error: null,

  restoreSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = getDataAdapter();
      const session = await db.auth.getSession();
      if (session) {
        const user = await db.users.getUserById(session.userId);
        set({ session, user, isLoading: false });
      } else {
        set({ session: null, user: null, isLoading: false });
      }
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  setSession: (session, user) => {
    set({ session, user, error: null });
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const db = getDataAdapter();
      await db.auth.signOut();
      set({ session: null, user: null, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
