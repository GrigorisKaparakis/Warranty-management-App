/**
 * batch.ts: Μαζικές ενέργειες (Batch Operations) για τις εγγυήσεις.
 * Διαχειρίζεται τη μαζική ενημέρωση και διαγραφή εγγραφών με αυτόματη ενημέρωση των στατιστικών.
 */
import { query, where, documentId, writeBatch, doc } from "firebase/firestore";
import { db, entriesCollection, deepSanitize, handleFirestoreError, OperationType, auth } from "../core";
import { Entry } from "../../../core/types";
import { monitoredGetDocs } from "../monitor";
import { StatsUpdater } from "../stats-updater";
import { AuditLogger } from "../audit-logger";
import { EntryTransactions } from "../entries-transactions";

export const EntryBatch = {
  async updateEntriesBatch(ids: string[], updates: Partial<Entry>): Promise<void> {
    if (ids.length === 0) return;
    const batch = writeBatch(db);
    const timestamp = Date.now();
    const statsDocRef = EntryTransactions.getStatsDocRef();
    const username = auth.currentUser?.email?.split('@')[0] || 'system';
    
    const logMsg = updates.status 
      ? `[${username}] ΜΑΖΙΚΗ ΑΛΛΑΓΗ ΚΑΤΑΣΤΑΣΗΣ ΣΕ ${updates.status}`
      : updates.isPaid !== undefined 
        ? `[${username}] ΜΑΖΙΚΗ ΣΗΜΑΝΣΗ ΩΣ ${updates.isPaid ? 'ΠΛΗΡΩΜΕΝΟ' : 'ΑΠΛΗΡΩΤΟ'}`
        : `[${username}] ΜΑΖΙΚΗ ΕΝΗΜΕΡΩΣΗ`;

    try {
      const statusDeltas: Record<string, number> = {};
      let paidDelta = 0;
      let unpaidDelta = 0;
      const logs: any[] = [];

      for (let i = 0; i < ids.length; i += 30) {
        const chunk = ids.slice(i, i + 30);
        const q = query(entriesCollection, where(documentId(), "in", chunk));
        const snapshot = await monitoredGetDocs(q);

        snapshot.docs.forEach(snap => {
          const oldData = snap.data() as Entry;
          const currentNotes = (oldData.notes || '').trim();
          const finalUpdates = { 
            ...updates, 
            notes: currentNotes + (currentNotes ? '\n' : '') + logMsg 
          };
          
          const { id: _, ...cleanUpdates } = finalUpdates as any;
          batch.update(snap.ref, deepSanitize(cleanUpdates));
          
          if (updates.status && updates.status !== oldData.status) {
            statusDeltas[oldData.status] = (statusDeltas[oldData.status] || 0) - 1;
            statusDeltas[updates.status] = (statusDeltas[updates.status] || 0) + 1;
          }

          if (updates.isPaid !== undefined && updates.isPaid !== oldData.isPaid) {
            if (updates.isPaid) { paidDelta++; unpaidDelta--; }
            else { paidDelta--; unpaidDelta++; }
          }

          logs.push({
            id: snap.id,
            warrantyId: oldData.warrantyId || 'N/A',
            oldData,
            newData: { ...oldData, ...updates }
          });
        });
      }

      const statsUpdate = StatsUpdater.getBatchUpdateStats({ statusDeltas, paidDelta, unpaidDelta });
      if (statsUpdate) {
        batch.update(statsDocRef, statsUpdate);
      }

      await batch.commit();
      
      for (const log of logs) {
        AuditLogger.logAction('UPDATE', log.id, log.warrantyId, `📦 ΜΑΖΙΚΗ ΕΝΕΡΓΕΙΑ: ${logMsg}`, log.oldData, log.newData);
      }
    } catch (error) {
      await AuditLogger.logError('BATCH', 'N/A', error, "ΑΠΟΤΥΧΙΑ ΜΑΖΙΚΗΣ ΕΝΗΜΕΡΩΣΗΣ");
      handleFirestoreError(error, OperationType.WRITE, "entries_batch");
    }
  },

  async deleteEntriesBatch(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const batch = writeBatch(db);
    const timestamp = Date.now();
    const statsDocRef = EntryTransactions.getStatsDocRef();

    try {
      const statusCounts: Record<string, number> = {};
      let paidDelta = 0;
      let unpaidDelta = 0;
      const logs: any[] = [];

      for (let i = 0; i < ids.length; i += 30) {
        const chunk = ids.slice(i, i + 30);
        const q = query(entriesCollection, where(documentId(), "in", chunk));
        const snapshot = await monitoredGetDocs(q);

        snapshot.docs.forEach(snap => {
          const d = snap.data() as Entry;
          batch.delete(snap.ref);
          
          if (d.status) statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
          if (d.isPaid) paidDelta++; else unpaidDelta++;

          logs.push({
            id: snap.id,
            warrantyId: d.warrantyId || 'N/A',
            oldData: d
          });
        });
      }

      const statsUpdate = StatsUpdater.getBatchDeleteStats(ids.length, statusCounts, paidDelta, unpaidDelta);
      batch.update(statsDocRef, statsUpdate);

      await batch.commit();

      for (const log of logs) {
        AuditLogger.logAction('DELETE', log.id, log.warrantyId, `🗑️ ΜΑΖΙΚΗ ΔΙΑΓΡΑΦΗ: ${log.warrantyId}`, log.oldData, null);
      }
    } catch (error) {
      await AuditLogger.logError('BATCH', 'N/A', error, "ΑΠΟΤΥΧΙΑ ΜΑΖΙΚΗΣ ΔΙΑΓΡΑΦΗΣ");
      handleFirestoreError(error, OperationType.DELETE, "entries_batch");
    }
  }
};
