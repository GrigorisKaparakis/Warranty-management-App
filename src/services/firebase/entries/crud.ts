/**
 * crud.ts: Βασικές λειτουργίες διαχείρισης (Create, Read, Update, Delete) εγγυήσεων.
 * Χρησιμοποιεί Firestore Transactions για τη διασφάλιση της ακεραιότητας των δεδομένων και των στατιστικών.
 */
import { doc, runTransaction } from "firebase/firestore";
import { db, entriesCollection, deepSanitize, handleFirestoreError, OperationType } from "../core";
import { Entry } from "../../../core/types";
import { generateAuditDetails } from "../../../utils/auditUtils";
import { StatsUpdater } from "../stats-updater";
import { AuditLogger } from "../audit-logger";
import { EntryTransactions } from "../entries-transactions";

export const EntryCRUD = {
  async addEntry(entry: Omit<Entry, 'id'>): Promise<string> {
    const newDocRef = doc(entriesCollection);
    const statsDocRef = EntryTransactions.getStatsDocRef();
    
    try {
      await runTransaction(db, async (transaction) => {
        transaction.set(newDocRef, deepSanitize(entry));
        const statsUpdate = StatsUpdater.getAddEntryUpdate(entry);
        transaction.update(statsDocRef, statsUpdate);
      });

      await AuditLogger.logAction(
        'CREATE', 
        newDocRef.id, 
        entry.warrantyId, 
        generateAuditDetails(null, entry), 
        null, 
        entry
      );
      return newDocRef.id;
    } catch (error) {
      await AuditLogger.logError('N/A', entry.warrantyId, error, "ΑΠΟΤΥΧΙΑ ΔΗΜΙΟΥΡΓΙΑΣ (Transaction)");
      return handleFirestoreError(error, OperationType.CREATE, "entries") as any;
    }
  },

  async updateEntry(id: string, updates: Partial<Entry>, existingData?: Entry): Promise<void> {
    const docId = id.trim();
    const docRef = doc(db, "entries", docId);
    const statsDocRef = EntryTransactions.getStatsDocRef();

    let oldData: Entry | null = null;
    let cleanUpdatesByRef: any = null;

    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(docRef);
        if (!snap.exists()) throw new Error("Η εγγραφή δεν βρέθηκε.");
        oldData = snap.data() as Entry;

        const { id: _, ...rest } = updates as any;
        cleanUpdatesByRef = rest;
        
        transaction.update(docRef, deepSanitize(cleanUpdatesByRef));

        const statsUpdate = StatsUpdater.getUpdateEntryUpdate(updates, oldData);
        if (statsUpdate) {
          transaction.update(statsDocRef, statsUpdate);
        }
      });

      if (oldData && cleanUpdatesByRef) {
        await AuditLogger.logAction(
          'UPDATE',
          docId,
          updates.warrantyId || oldData.warrantyId || 'N/A',
          generateAuditDetails(oldData, cleanUpdatesByRef),
          oldData,
          { ...oldData, ...cleanUpdatesByRef }
        );
      }
    } catch (error) {
      await AuditLogger.logError(docId, updates.warrantyId || 'N/A', error, "ΑΠΟΤΥΧΙΑ ΕΝΗΜΕΡΩΣΗΣ");
      handleFirestoreError(error, OperationType.UPDATE, `entries/${docId}`);
    }
  },

  async deleteEntry(id: string, warrantyId: string = 'N/A', existingData?: Entry): Promise<void> {
    const docId = id.trim();
    const docRef = doc(db, "entries", docId);
    const statsDocRef = EntryTransactions.getStatsDocRef();

    let oldData: Entry | null = null;

    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(docRef);
        if (!snap.exists()) return;
        oldData = snap.data() as Entry;

        transaction.delete(docRef);
        const statsUpdate = StatsUpdater.getDeleteEntryUpdate(oldData);
        transaction.update(statsDocRef, statsUpdate);
      });

      if (oldData) {
        await AuditLogger.logAction(
          'DELETE',
          docId,
          warrantyId,
          `🗑️ ΟΡΙΣΤΙΚΗ ΔΙΑΓΡΑΦΗ: ${warrantyId}`,
          oldData,
          null
        );
      }
    } catch (error) {
       await AuditLogger.logError(docId, warrantyId, error, "ΑΠΟΤΥΧΙΑ ΔΙΑΓΡΑΦΗΣ");
       handleFirestoreError(error, OperationType.DELETE, `entries/${docId}`);
    }
  }
};
