import React from 'react';
import { useAuthManager } from '@/hooks/core/useAuthManager';
import { useConnectionManager } from '@/hooks/core/useConnectionManager';
import { useAdminManager } from '@/hooks/core/useAdminManager';
import { usePresenceManager } from '@/hooks/core/usePresenceManager';

/**
 * StateManager: Ο κεντρικός ενορχηστρωτής του state της εφαρμογής.
 * Πλέον λειτουργεί ως wrapper για τα εξειδικευμένα hooks διαχείρισης.
 */
export const StateManager: React.FC = () => {
  // Διαχείριση Authentication & Profile
  useAuthManager();

  // Διαχείριση Real-time συνδέσεων (Settings, Entries, κλπ)
  useConnectionManager();

  // Διαχείριση Presence (Online/Offline status)
  usePresenceManager();

  // Διαχείριση Admin δεδομένων (Logs, Users)
  useAdminManager();

  return null;
};
