/**
 * uiSlice.ts: Διαχείριση της κατάστασης του User Interface.
 * Περιλαμβάνει loading states, toasts (ειδοποιήσεις) και modals.
 */

import { StateCreator } from 'zustand';
import { APP_DEFAULTS } from '../../core/config';

export interface UISlice {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  dragCounter: number;
  setDragCounter: (count: number | ((prev: number) => number)) => void;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  refetchSignal: number;
  triggerRefetch: () => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  isLive: false,
  setIsLive: (isLive) => set({ isLive }),
  dragActive: false,
  setDragActive: (dragActive) => set({ dragActive }),
  dragCounter: 0,
  setDragCounter: (update) => set((state) => ({ 
    dragCounter: typeof update === 'function' ? update(state.dragCounter) : update 
  })),
  isChangePasswordModalOpen: false,
  setIsChangePasswordModalOpen: (isChangePasswordModalOpen) => set({ isChangePasswordModalOpen }),
  refetchSignal: 0,
  triggerRefetch: () => set((state) => ({ refetchSignal: state.refetchSignal + 1 })),
});
