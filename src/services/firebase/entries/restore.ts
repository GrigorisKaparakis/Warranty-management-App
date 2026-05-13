/**
 * restore.ts: Λειτουργία επαναφοράς (Restore) διαγραμμένων εγγυήσεων.
 * Χρησιμοποιεί τα δεδομένα από το Audit Log για να επαναφέρει μια εγγραφή στη βάση.
 */
import { doc, runTransaction } from "firebase/firestore";
import { db, deepSanitize, handleFirestoreError, OperationType } from "../core";
import { Entry, AuditEntry } from "../../../core/types";
import { StatsUpdater } from "../stats-updater";
import { AuditLogger } from "../audit-logger";
import { EntryTransactions } from "../entries-transactions";

export const EntryRestore = {
  async restoreEntry(log: AuditEntry): Promise<void> {
    if (!log.oldData) throw new Error("ΔΕΝ ΒΡΕΘΗΚΑΝ ΔΕΔΟΜΕΝΑ ΕΠΑΝΑΦΟΡΑΣ.");
    const docRef = doc(db, "entries", log.targetId);
    const statsDocRef = EntryTransactions.getStatsDocRef();

    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(docRef);
        if (snap.exists()) return;
        
        transaction.set(docRef, deepSanitize(log.oldData));
        const entry = log.oldData as Entry;
        const statsUpdate = StatsUpdater.getAddEntryUpdate(entry);
        transaction.update(statsDocRef, statsUpdate);
      });

      await AuditLogger.logAction(
        'RESTORE',
        log.targetId,
        log.targetWarrantyId,
        `ΕΠΑΝΑΦΟΡΑ ΕΓΓΡΑΦΗΣ (${log.targetWarrantyId})`
      );
    } catch (error) {
      await AuditLogger.logError(log.targetId, log.targetWarrantyId, error, "ΑΠΟΤΥΧΙΑ ΕΠΑΝΑΦΟΡΑΣ");
      handleFirestoreError(error, OperationType.WRITE, `entries/${log.targetId}`);
    }
  }
};
