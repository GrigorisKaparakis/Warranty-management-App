/**
 * auditUtils.ts: Βοηθητικές συναρτήσεις για τη δημιουργία λεπτομερών Audit Logs.
 */

import { Entry, Part } from '../core/types';

/**
 * Συγκρίνει δύο αντικείμενα εγγύησης και επιστρέφει μια λίστα με τις αλλαγές.
 */
export const generateAuditDetails = (
  oldData: Partial<Entry> | null,
  newData: Partial<Entry>,
  statusLabels?: Record<string, string>
): string => {
  if (!oldData) return "🆕 ΔΗΜΙΟΥΡΓΙΑ ΝΕΑΣ ΕΓΓΡΑΦΗΣ";

  const changes: string[] = [];

  const getLabel = (status: string) => statusLabels?.[status] || status;

  // 1. Status Change
  if (newData.status && oldData.status !== newData.status) {
    changes.push(`ΚΑΤΑΣΤΑΣΗ: ${getLabel(oldData.status || '')} ➔ ${getLabel(newData.status)}`);
  }

  // 2. Field Tracking
  const fieldsToTrack: { key: keyof Entry; label: string }[] = [
    { key: 'vin', label: 'VIN' },
    { key: 'fullName', label: 'ΟΝΟΜΑ' },
    { key: 'brand', label: 'ΜΑΡΚΑ' },
    { key: 'company', label: 'ΕΤΑΙΡΕΙΑ' },
    { key: 'warrantyId', label: 'ΑΡΙΘΜΟΣ ΕΓΓΥΗΣΗΣ' },
    { key: 'isPaid', label: 'ΠΛΗΡΩΜΗ' },
    { key: 'expiryAt', label: 'ΗΜ/ΝΙΑ ΛΗΞΗΣ' },
    { key: 'notes', label: 'ΣΗΜΕΙΩΣΕΙΣ' }
  ];

  fieldsToTrack.forEach(({ key, label }) => {
    if (newData[key] !== undefined && oldData[key] !== newData[key]) {
      let oldVal = oldData[key];
      let newVal = newData[key];

      if (key === 'isPaid') {
        oldVal = oldData[key] ? 'ΠΛΗΡΩΜΕΝΟ' : 'ΑΠΛΗΡΩΤΟ';
        newVal = newData[key] ? 'ΠΛΗΡΩΜΕΝΟ' : 'ΑΠΛΗΡΩΤΟ';
      } else if (key === 'expiryAt') {
        oldVal = oldData[key] ? new Date(oldData[key] as number).toLocaleDateString('el-GR') : 'ΚΑΝΕΝΑ';
        newVal = newData[key] ? new Date(newData[key] as number).toLocaleDateString('el-GR') : 'ΚΑΝΕΝΑ';
      } else if (key === 'notes') {
        const hasOld = !!oldData.notes?.trim();
        const hasNew = !!newData.notes?.trim();
        if (!hasOld && hasNew) {
          changes.push(`ΠΡΟΣΘΗΚΗ ΣΗΜΕΙΩΣΗΣ`);
          return;
        }
        changes.push(`ΕΝΗΜΕΡΩΣΗ ΣΗΜΕΙΩΣΕΩΝ`);
        return;
      }

      if (newVal !== undefined) {
        changes.push(`${label}: ${oldVal || '---'} ➔ ${newVal}`);
      }
    }
  });

  // 3. Parts Tracking
  if (newData.parts && JSON.stringify(oldData.parts) !== JSON.stringify(newData.parts)) {
    const oldParts = oldData.parts || [];
    const newParts = newData.parts || [];

    const added = newParts.filter(np => !oldParts.find(op => op.code === np.code));
    added.forEach(p => changes.push(`+ ΑΝΤΑΛΛΑΚΤΙΚΟ: ${p.description} (${p.code})`));

    newParts.forEach(np => {
      const op = oldParts.find(p => p.code === np.code);
      if (op && JSON.stringify(op) !== JSON.stringify(np)) {
        if (op.description !== np.description) {
          changes.push(`✎ ΠΕΡΙΓΡΑΦΗ (${np.code}): ${op.description} ➔ ${np.description}`);
        }
        if (op.isReady !== np.isReady) {
          changes.push(`⚙️ ΕΤΟΙΜΟΤΗΤΑ (${np.code}): ${op.isReady ? 'ΕΤΟΙΜΟ' : 'ΣΕ ΑΝΑΜΟΝΗ'} ➔ ${np.isReady ? 'ΕΤΟΙΜΟ' : 'ΣΕ ΑΝΑΜΟΝΗ'}`);
        }
        if (op.quantity !== np.quantity) {
          changes.push(`🔢 ΠΟΣΟΤΗΤΑ (${np.code}): ${op.quantity} ➔ ${np.quantity}`);
        }
      }
    });

    const removed = oldParts.filter(op => !newParts.find(np => np.code === op.code));
    removed.forEach(p => changes.push(`- ΑΦΑΙΡΕΣΗ ΑΝΤΑΛΛΑΚΤΙΚΟΥ: ${p.description} (${p.code})`));
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
