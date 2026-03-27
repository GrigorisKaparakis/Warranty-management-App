/**
 * warrantyLogic.ts: Κεντρική επιχειρηματική λογική για τις εγγυήσεις.
 * Συγκεντρώνει κανόνες που πρέπει να εφαρμόζονται ομοιόμορφα σε όλη την εφαρμογή.
 */

import { Entry, GarageSettings, Part } from '../core/types';
import { calculateExpiryDate } from './dateUtils';

/**
 * Υπολογίζει τις απαραίτητες ενημερώσεις όταν μια εγγύηση ολοκληρώνεται (Status: COMPLETED).
 * Διασφαλίζει ότι τίθενται ημερομηνίες λήξης και ετοιμότητας, και ενημερώνονται τα ανταλλακτικά.
 */
export const getCompletionUpdates = (
  entry: Partial<Entry> & { parts: any[] }, 
  settings: GarageSettings
): Partial<Entry> => {
  const now = Date.now();
  const updates: Partial<Entry> = {
    status: 'COMPLETED'
  };

  // 1. Ενημέρωση ανταλλακτικών: Όλα γίνονται "Ready"
  updates.parts = entry.parts.map(p => ({ ...p, isReady: true }));

  // 2. Ημερομηνία Ετοιμότητας (Ready At): Αν δεν υπάρχει, μπαίνει η τωρινή
  if (!entry.readyAt) {
    updates.readyAt = now;
  }

  // 3. Ημερομηνία Λήξης (Expiry At): Υπολογισμός βάσει κανόνων εταιρείας αν δεν υπάρχει
  if (!entry.expiryAt) {
    const company = entry.company || '';
    const rule = settings.companyExpiryRules?.[company];
    const expiry = calculateExpiryDate(rule);
    if (expiry) {
      updates.expiryAt = expiry;
    }
  }

  return updates;
};
