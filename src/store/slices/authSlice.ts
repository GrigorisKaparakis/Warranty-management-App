/**
 * authSlice.ts: Διαχείριση της κατάστασης ταυτοποίησης (Authentication).
 * Αποθηκεύει τον τρέχοντα χρήστη του Firebase και το προφίλ του από το Firestore.
 */

import { StateCreator } from 'zustand';
import type { User } from 'firebase/auth';
import { UserProfile } from '../../core/types';

export interface AuthSlice {
  user: User | null;
  profile: UserProfile | null;
  authLoading: boolean;
  isAccountDisabled: boolean;
  setAuth: (user: User | null, profile: UserProfile | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setAccountDisabled: (disabled: boolean) => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  profile: null,
  authLoading: true,
  isAccountDisabled: false,
  setAuth: (user, profile) => set({ user, profile, authLoading: false }),
  setAuthLoading: (loading) => set({ authLoading: loading }),
  setAccountDisabled: (disabled) => set({ isAccountDisabled: disabled }),
});
