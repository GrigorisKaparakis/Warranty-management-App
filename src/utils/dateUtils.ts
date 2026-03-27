/**
 * dateUtils.ts: Βοηθητικές συναρτήσεις για τη διαχείριση ημερομηνιών.
 * Περιλαμβάνει υπολογισμούς λήξης εγγυήσεων βάσει κανόνων.
 */

import { Entry, GarageSettings } from '../core/types';
import { EntryStatus, UI_THRESHOLDS } from '../core/config';

/**
 * Υπολογίζει την κατάσταση λήξης μιας εγγύησης (π.χ. "ΕΛΗΞΕ", "ΛΗΓΕΙ ΣΕ 5 ΗΜ").
 * Επιστρέφει κείμενο και το αντίστοιχο χρώμα (variant) για το UI.
 */
export const calculateExpiryInfo = (entry: Entry, settings: GarageSettings) => {
  if (!entry.expiryAt) return null;

  const now = Date.now();
  const diff = entry.expiryAt - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  const criticalDays = settings.expiryThresholds?.criticalDays ?? UI_THRESHOLDS.EXPIRY_CRITICAL_DAYS;
  const warningDays = settings.expiryThresholds?.warningDays ?? UI_THRESHOLDS.EXPIRY_WARNING_DAYS;
  const soonDays = settings.expiryThresholds?.soonDays ?? UI_THRESHOLDS.EXPIRY_SOON_DAYS;

  if (days <= 0) return { text: 'ΕΛΗΞΕ', variant: 'danger' as const };
  if (days <= criticalDays) return { text: `ΛΗΓΕΙ ΣΕ ${days} ΗΜ`, variant: 'danger' as const };
  if (days <= warningDays) return { text: `ΛΗΓΕΙ ΣΕ ${days} ΗΜ`, variant: 'warning' as const };
  if (days <= soonDays) return { text: `ΛΗΓΕΙ ΣΕ ${days} ΗΜ`, variant: 'primary' as const };
  return { text: `ΛΗΓΕΙ: ${new Date(entry.expiryAt).toLocaleDateString('el-GR')}`, variant: 'neutral' as const };
};

export const calculateExpiryDate = (rule: string | undefined): number | undefined => {
  if (!rule) return undefined;
  const now = new Date();
  
  if (rule === 'END_OF_NEXT_MONTH') {
    const date = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    date.setHours(23, 59, 59, 999);
    return date.getTime();
  }

  // Support "X months" or "X_months"
  const monthMatch = rule.match(/(\d+)\s*months/i) || rule.match(/(\d+)_months/i);
  if (monthMatch && monthMatch[1]) {
    const months = parseInt(monthMatch[1]);
    const date = new Date(now.setMonth(now.getMonth() + months));
    date.setHours(23, 59, 59, 999);
    return date.getTime();
  }

  // Support "X days" or "X_days" or just "X" (as days)
  const dayMatch = rule.match(/(\d+)\s*days/i) || rule.match(/(\d+)_days/i) || rule.match(/^(\d+)$/);
  if (dayMatch && dayMatch[1]) {
    const days = parseInt(dayMatch[1]);
    const date = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    date.setHours(23, 59, 59, 999);
    return date.getTime();
  }

  // Fallback for rules like "30_DAYS" (split by underscore)
  const parts = rule.split('_');
  const firstPart = parseInt(parts[0]);
  if (!isNaN(firstPart)) {
    const date = new Date(now.getTime() + (firstPart * 24 * 60 * 60 * 1000));
    date.setHours(23, 59, 59, 999);
    return date.getTime();
  }

  return undefined;
};
