/**
 * settingsSlice.ts: Διαχείριση των ρυθμίσεων της εφαρμογής.
 * Περιλαμβάνει τις ρυθμίσεις του συνεργείου και το status των migrations.
 */

import { StateCreator } from 'zustand';
import { GarageSettings } from '../../core/types';

import { FULL_GARAGE_DEFAULTS } from '../../core/config';

export interface SettingsSlice {
  settings: GarageSettings;
  setSettings: (settings: GarageSettings) => void;

  // Migration States
  isMigratingNotes: boolean;
  setIsMigratingNotes: (val: boolean) => void;
  notesMigrationCount: number;
  setNotesMigrationCount: (count: number) => void;
  notesMigrationFeedback: {msg: string, type: 'success' | 'error'} | null;
  setNotesMigrationFeedback: (feedback: {msg: string, type: 'success' | 'error'} | null) => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  settings: {} as GarageSettings,
  setSettings: (settings) => set({ settings }),

  isMigratingNotes: false,
  setIsMigratingNotes: (isMigratingNotes) => set({ isMigratingNotes }),
  notesMigrationCount: 0,
  setNotesMigrationCount: (notesMigrationCount) => set({ notesMigrationCount }),
  notesMigrationFeedback: null,
  setNotesMigrationFeedback: (notesMigrationFeedback) => set({ notesMigrationFeedback }),
});
