/**
 * auditUtils.ts: Βοηθητικές συναρτήσεις για τη δημιουργία λεπτομερών Audit Logs.
 */

import { Entry, Part } from '../core/types';

/**
 * Συγκρίνει δύο αντικείμενα εγγύησης και επιστρέφει μια λίστα με τις αλλαγές.
 */
export const generateAuditDetails = (oldData: Partial<Entry> | null, newData: Partial<Entry>): string => {
  if (!oldData) return "ΔΗΜΙΟΥΡΓΙΑ ΝΕΑΣ ΕΓΓΡΑΦΗΣ";

  const changes: string[] = [];

  // 1. Status Change (Smart Diff)
  if (newData.status && oldData.status !== newData.status) {
    changes.push(`STATUS: ${oldData.status} ➔ ${newData.status}`);
  }

  // 2. Field Tracking
  const fieldsToTrack: { key: keyof Entry; label: string }[] = [
    { key: 'vin', label: 'VIN' },
    { key: 'fullName', label: 'ΟΝΟΜΑ' },
    { key: 'brand', label: 'ΜΑΡΚΑ' },
    { key: 'company', label: 'ΕΤΑΙΡΕΙΑ' },
    { key: 'warrantyId', label: 'WARRANTY ID' },
    { key: 'isPaid', label: 'ΠΛΗΡΩΜΗ' }
  ];

  fieldsToTrack.forEach(({ key, label }) => {
    if (newData[key] !== undefined && oldData[key] !== newData[key]) {
      const oldVal = key === 'isPaid' ? (oldData[key] ? 'ΝΑΙ' : 'ΟΧΙ') : oldData[key];
      const newVal = key === 'isPaid' ? (newData[key] ? 'ΝΑΙ' : 'ΟΧΙ') : newData[key];
      changes.push(`${label}: ${oldVal} ➔ ${newVal}`);
    }
  });

  // 3. Parts Tracking
  if (newData.parts && JSON.stringify(oldData.parts) !== JSON.stringify(newData.parts)) {
    const oldParts = oldData.parts || [];
    const newParts = newData.parts || [];

    // Προσθήκες
    const added = newParts.filter(np => !oldParts.find(op => op.code === np.code));
    added.forEach(p => changes.push(`ΠΡΟΣΘΗΚΗ ΑΝΤΑΛΛΑΚΤΙΚΟΥ: ${p.description} (${p.code})`));

    // Αλλαγές σε υπάρχοντα
    newParts.forEach(np => {
      const op = oldParts.find(p => p.code === np.code);
      if (op && JSON.stringify(op) !== JSON.stringify(np)) {
        if (op.description !== np.description) {
          changes.push(`ΑΛΛΑΓΗ ΠΕΡΙΓΡΑΦΗΣ (${np.code}): ${op.description} ➔ ${np.description}`);
        }
        if (op.isReady !== np.isReady) {
          changes.push(`ΚΑΤΑΣΤΑΣΗ (${np.code}): ${op.isReady ? 'READY' : 'WAITING'} ➔ ${np.isReady ? 'READY' : 'WAITING'}`);
        }
      }
    });

    // Διαγραφές
    const removed = oldParts.filter(op => !newParts.find(np => np.code === op.code));
    removed.forEach(p => changes.push(`ΑΦΑΙΡΕΣΗ ΑΝΤΑΛΛΑΚΤΙΚΟΥ: ${p.description} (${p.code})`));
  }

  return changes.length > 0 ? changes.join(' | ') : "ΕΝΗΜΕΡΩΣΗ ΣΤΟΙΧΕΙΩΝ";
};

/**
 * Επιστρέφει το χρώμα της ενέργειας για το UI.
 */
export const getActionColor = (action: string): string => {
  switch (action) {
    case 'CREATE': return 'emerald';
    case 'UPDATE': return 'blue';
    case 'DELETE': return 'rose';
    case 'RESTORE': return 'amber';
    default: return 'zinc';
  }
};
