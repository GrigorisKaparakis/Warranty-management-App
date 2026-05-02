import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { UISlice, createUISlice } from './slices/uiSlice';
import { WarrantySlice, createWarrantySlice } from './slices/warrantySlice';
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice';
import { AISlice, createAISlice } from './slices/aiSlice';

export type AppStore = AuthSlice & UISlice & WarrantySlice & SettingsSlice & AISlice;

export const useStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createUISlice(...a),
      ...createWarrantySlice(...a),
      ...createSettingsSlice(...a),
      ...createAISlice(...a),
    }),
    {
      name: 'warranty-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Αποθηκεύουμε τα registries και τις ρυθμίσεις για ταχύτητα
        parts: (state as any).parts,
        vehicles: (state as any).vehicles,
        customers: (state as any).customers,
        settings: (state as any).settings,
        entries: (state as any).entries,
        user: state.user,
        profile: state.profile
      }),
    }
  )
);
