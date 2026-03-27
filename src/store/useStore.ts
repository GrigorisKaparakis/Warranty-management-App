
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
      // Επιλέγουμε να αποθηκεύσουμε μόνο τα registries και τις ρυθμίσεις για ταχύτητα
      partialize: (state) => ({
        parts: state.parts,
        vehicles: state.vehicles,
        customers: state.customers,
        settings: state.settings,
        entries: state.entries, // Προσθήκη και των εγγυήσεων για ακαριαίο "πρώτο φόρτωμα"
      }),
    }
  )
);
