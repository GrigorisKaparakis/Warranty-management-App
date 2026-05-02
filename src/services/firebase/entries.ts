/**
 * entries.ts: Διαχείριση των εγγυήσεων (Warranty Entries) στο Firestore.
 * Περιλαμβάνει CRUD λειτουργίες, μαζικές ενημερώσεις και audit logging.
 */

import { doc, query, orderBy, limit, addDoc, updateDoc, deleteDoc, writeBatch, setDoc, where, startAfter, QueryDocumentSnapshot, runTransaction, documentId, getDocs, increment, serverTimestamp } from "firebase/firestore";
import { monitoredOnSnapshot, monitoredGetDocs, monitoredGetDoc, visibilityAwareOnSnapshot } from "./monitor";
import { db, entriesCollection, deepSanitize, sanitizeEntry, auth, handleFirestoreError, OperationType } from "./core";
import { Entry, AuditEntry } from "../../core/types";
import { AdminService } from "./admin";
import { StatsService } from "./stats";
import { generateAuditDetails } from "../../utils/auditUtils";
import { EntryStatus } from "../../core/config";

export const EntryService = {
  subscribeToEntries(limitCount: number | undefined, callback: (entries: Entry[]) => void) {
    let q = query(entriesCollection, orderBy("createdAt", "desc"));
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    return visibilityAwareOnSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((snap: any) => sanitizeEntry(snap.data(), snap.id));
      callback(entries);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "entries"));
  },

  async getEntries(limitCount: number | undefined, lastDoc?: QueryDocumentSnapshot): Promise<{ entries: Entry[], lastDoc: QueryDocumentSnapshot | null }> {
    try {
      let q = query(entriesCollection, orderBy("createdAt", "desc"));
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      const snapshot = await monitoredGetDocs(q);
      const entries = snapshot.docs.map((snap) => sanitizeEntry(snap.data(), snap.id));
      const last = snapshot.docs[snapshot.docs.length - 1] || null;
      return { entries, lastDoc: last };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "entries");
      return { entries: [], lastDoc: null };
    }
  },

  async addEntry(entry: Omit<Entry, 'id'>): Promise<string> {
    const newDocRef = doc(entriesCollection);
    const statsDocRef = doc(db, "metadata/stats");
    
    try {
      await runTransaction(db, async (transaction) => {
        transaction.set(newDocRef, deepSanitize(entry));
        
        const statsUpdate: any = { 
          total: increment(1),
          lastUpdated: serverTimestamp() 
        };
        
        if (entry.status === EntryStatus.WAITING) statsUpdate.pending = increment(1);
        else if (entry.status === EntryStatus.COMPLETED) statsUpdate.approved = increment(1);
        else if (entry.status === EntryStatus.REJECTED) statsUpdate.rejected = increment(1);
        
        if (entry.isPaid) statsUpdate.paid = increment(1); 
        else statsUpdate.unpaid = increment(1);
        
        transaction.update(statsDocRef, statsUpdate);
      });

      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'CREATE',
        targetId: newDocRef.id,
        targetWarrantyId: entry.warrantyId,
        details: generateAuditDetails(null, entry),
        oldData: null,
        newData: deepSanitize(entry)
      });
      return newDocRef.id;
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'ERROR',
        targetId: 'N/A',
        targetWarrantyId: entry.warrantyId,
        details: `ΑΠΟΤΥΧΙΑ ΔΗΜΙΟΥΡΓΙΑΣ (Transaction): ${errMessage.slice(0, 100)}`,
      });
      return handleFirestoreError(error, OperationType.CREATE, "entries") as any;
    }
  },

  async updateEntry(id: string, updates: Partial<Entry>, existingData?: Entry): Promise<void> {
    const docId = id.trim();
    const docRef = doc(db, "entries", docId);
    const statsDocRef = doc(db, "metadata/stats");

    let oldData: Entry | null = null;
    let cleanUpdates: any = null;

    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(docRef);
        if (!snap.exists()) throw new Error("Η εγγραφή δεν βρέθηκε.");
        oldData = snap.data() as Entry;

        const { id: _, ...rest } = updates as any;
        cleanUpdates = rest;
        transaction.update(docRef, deepSanitize(cleanUpdates));

        const statsUpdate: any = { lastUpdated: serverTimestamp() };
        const getStatsField = (status: string) => {
          if (status === EntryStatus.WAITING) return 'pending';
          if (status === EntryStatus.COMPLETED) return 'approved';
          if (status === EntryStatus.REJECTED) return 'rejected';
          return null;
        };

        if (updates.status && updates.status !== oldData.status) {
          const oldField = getStatsField(oldData.status);
          const newField = getStatsField(updates.status);
          if (oldField) statsUpdate[oldField] = increment(-1);
          if (newField) statsUpdate[newField] = increment(1);
        }

        if (updates.isPaid !== undefined && updates.isPaid !== oldData.isPaid) {
          if (updates.isPaid) {
            statsUpdate.paid = increment(1);
            statsUpdate.unpaid = increment(-1);
          } else {
            statsUpdate.paid = increment(-1);
            statsUpdate.unpaid = increment(1);
          }
        }

        if (Object.keys(statsUpdate).length > 1) {
          transaction.update(statsDocRef, statsUpdate);
        }
      });

      if (oldData && cleanUpdates) {
        await AdminService.addAuditLog({
          timestamp: Date.now(),
          userId: auth.currentUser?.uid || 'system',
          userEmail: auth.currentUser?.email || 'system',
          action: 'UPDATE',
          targetId: docId,
          targetWarrantyId: updates.warrantyId || oldData.warrantyId || 'N/A',
          details: generateAuditDetails(oldData, cleanUpdates),
          oldData: deepSanitize(oldData),
          newData: deepSanitize({ ...oldData, ...cleanUpdates })
        });
      }
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'ERROR',
        targetId: docId,
        targetWarrantyId: updates.warrantyId || 'N/A',
        details: `ΑΠΟΤΥΧΙΑ ΕΝΗΜΕΡΩΣΗΣ: ${errMessage.slice(0, 100)}`,
      });
      handleFirestoreError(error, OperationType.UPDATE, `entries/${docId}`);
    }
  },

  async deleteEntry(id: string, warrantyId: string = 'N/A', existingData?: Entry): Promise<void> {
    const docId = id.trim();
    const docRef = doc(db, "entries", docId);
    const statsDocRef = doc(db, "metadata/stats");

    let oldData: Entry | null = null;

    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(docRef);
        if (!snap.exists()) return;
        oldData = snap.data() as Entry;

        transaction.delete(docRef);

        const statsUpdate: any = { 
          total: increment(-1),
          lastUpdated: serverTimestamp() 
        };
        
        const getStatsField = (status: string) => {
          if (status === EntryStatus.WAITING) return 'pending';
          if (status === EntryStatus.COMPLETED) return 'approved';
          if (status === EntryStatus.REJECTED) return 'rejected';
          return null;
        };

        const field = getStatsField(oldData.status);
        if (field) statsUpdate[field] = increment(-1);
        
        if (oldData.isPaid) statsUpdate.paid = increment(-1); 
        else statsUpdate.unpaid = increment(-1);
        
        transaction.update(statsDocRef, statsUpdate);
      });

      if (oldData) {
        await AdminService.addAuditLog({
          timestamp: Date.now(),
          userId: auth.currentUser?.uid || 'system',
          userEmail: auth.currentUser?.email || 'system',
          action: 'DELETE',
          targetId: docId,
          targetWarrantyId: warrantyId,
          details: `🗑️ ΟΡΙΣΤΙΚΗ ΔΙΑΓΡΑΦΗ: ${warrantyId}`,
          oldData: deepSanitize(oldData),
          newData: null
        });
      }
    } catch (error) {
       const errMessage = error instanceof Error ? error.message : String(error);
       await AdminService.addAuditLog({
         timestamp: Date.now(),
         userId: auth.currentUser?.uid || 'system',
         userEmail: auth.currentUser?.email || 'system',
         action: 'ERROR',
         targetId: docId,
         targetWarrantyId: warrantyId,
         details: `ΑΠΟΤΥΧΙΑ ΔΙΑΓΡΑΦΗΣ: ${errMessage.slice(0, 100)}`,
       });
       handleFirestoreError(error, OperationType.DELETE, `entries/${docId}`);
    }
  },

  async updateEntriesBatch(ids: string[], updates: Partial<Entry>): Promise<void> {
    if (ids.length === 0) return;
    const batch = writeBatch(db);
    const timestamp = Date.now();
    const statsDocRef = doc(db, "metadata/stats");
    const username = auth.currentUser?.email?.split('@')[0] || 'system';
    
    const logMsg = updates.status 
      ? `[${username}] ΜΑΖΙΚΗ ΑΛΛΑΓΗ ΚΑΤΑΣΤΑΣΗΣ ΣΕ ${updates.status}`
      : updates.isPaid !== undefined 
        ? `[${username}] ΜΑΖΙΚΗ ΣΗΜΑΝΣΗ ΩΣ ${updates.isPaid ? 'ΠΛΗΡΩΜΕΝΟ' : 'ΑΠΛΗΡΩΤΟ'}`
        : `[${username}] ΜΑΖΙΚΗ ΕΝΗΜΕΡΩΣΗ`;

    try {
      const auditLogsToCapture: any[] = [];
      const statsUpdate: any = { lastUpdated: serverTimestamp() };
      
      const getStatsField = (status: string) => {
        if (status === EntryStatus.WAITING) return 'pending';
        if (status === EntryStatus.COMPLETED) return 'approved';
        if (status === EntryStatus.REJECTED) return 'rejected';
        return null;
      };

      let pendingDelta = 0;
      let approvedDelta = 0;
      let rejectedDelta = 0;
      let paidDelta = 0;
      let unpaidDelta = 0;

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
          
          // Track Stat Changes
          if (updates.status && updates.status !== oldData.status) {
            const oldField = getStatsField(oldData.status);
            const newField = getStatsField(updates.status);
            if (oldField === 'pending') pendingDelta--;
            if (oldField === 'approved') approvedDelta--;
            if (oldField === 'rejected') rejectedDelta--;
            if (newField === 'pending') pendingDelta++;
            if (newField === 'approved') approvedDelta++;
            if (newField === 'rejected') rejectedDelta++;
          }

          if (updates.isPaid !== undefined && updates.isPaid !== oldData.isPaid) {
            if (updates.isPaid) { paidDelta++; unpaidDelta--; }
            else { paidDelta--; unpaidDelta++; }
          }

          auditLogsToCapture.push({
            timestamp,
            userId: auth.currentUser?.uid || 'system',
            userEmail: auth.currentUser?.email || 'system',
            action: 'UPDATE',
            targetId: snap.id,
            targetWarrantyId: oldData.warrantyId || 'N/A',
            details: `📦 ΜΑΖΙΚΗ ΕΝΕΡΓΕΙΑ: ${logMsg}`,
            oldData: deepSanitize(oldData),
            newData: deepSanitize({ ...oldData, ...updates })
          });
        });
      }

      if (pendingDelta !== 0) statsUpdate.pending = increment(pendingDelta);
      if (approvedDelta !== 0) statsUpdate.approved = increment(approvedDelta);
      if (rejectedDelta !== 0) statsUpdate.rejected = increment(rejectedDelta);
      if (paidDelta !== 0) statsUpdate.paid = increment(paidDelta);
      if (unpaidDelta !== 0) statsUpdate.unpaid = increment(unpaidDelta);

      if (Object.keys(statsUpdate).length > 1) {
        batch.update(statsDocRef, statsUpdate);
      }

      await batch.commit();
      
      auditLogsToCapture.forEach(log => {
        AdminService.addAuditLog(log).catch(err => console.error("Batch Audit Error:", err));
      });
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'ERROR',
        targetId: 'BATCH',
        targetWarrantyId: 'N/A',
        details: `ΑΠΟΤΥΧΙΑ ΜΑΖΙΚΗΣ ΕΝΗΜΕΡΩΣΗΣ: ${errMessage.slice(0, 100)}`,
      });
      handleFirestoreError(error, OperationType.WRITE, "entries_batch");
    }
  },

  async deleteEntriesBatch(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const batch = writeBatch(db);
    const timestamp = Date.now();
    const statsDocRef = doc(db, "metadata/stats");

    try {
      const auditLogsToCapture: any[] = [];
      const statusCounts: Record<string, number> = {};
      const paidChange = { paid: 0, unpaid: 0 };

      const getStatsField = (status: string) => {
        if (status === EntryStatus.WAITING) return 'pending';
        if (status === EntryStatus.COMPLETED) return 'approved';
        if (status === EntryStatus.REJECTED) return 'rejected';
        return null;
      };

      for (let i = 0; i < ids.length; i += 30) {
        const chunk = ids.slice(i, i + 30);
        const q = query(entriesCollection, where(documentId(), "in", chunk));
        const snapshot = await monitoredGetDocs(q);

        snapshot.docs.forEach(snap => {
          const d = snap.data() as Entry;
          batch.delete(snap.ref);
          
          const f = getStatsField(d.status);
          if (f) statusCounts[f] = (statusCounts[f] || 0) + 1;
          if (d.isPaid) paidChange.paid++; else paidChange.unpaid++;

          auditLogsToCapture.push({
            timestamp,
            userId: auth.currentUser?.uid || 'system',
            userEmail: auth.currentUser?.email || 'system',
            action: 'DELETE',
            targetId: snap.id,
            targetWarrantyId: d.warrantyId || 'N/A',
            details: `🗑️ ΜΑΖΙΚΗ ΔΙΑΓΡΑΦΗ: ${d.warrantyId}`,
            oldData: deepSanitize(d),
            newData: null
          });
        });
      }

      const finalStatsUpdate: any = { 
        total: increment(-ids.length),
        lastUpdated: serverTimestamp() 
      };
      Object.entries(statusCounts).forEach(([f, count]) => {
        finalStatsUpdate[f] = increment(-count);
      });
      if (paidChange.paid > 0) finalStatsUpdate.paid = increment(-paidChange.paid);
      if (paidChange.unpaid > 0) finalStatsUpdate.unpaid = increment(-paidChange.unpaid);

      batch.update(statsDocRef, finalStatsUpdate);
      await batch.commit();

      auditLogsToCapture.forEach(log => {
        AdminService.addAuditLog(log).catch(err => console.error("Batch Delete Audit Error:", err));
      });
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'ERROR',
        targetId: 'BATCH',
        targetWarrantyId: 'N/A',
        details: `ΑΠΟΤΥΧΙΑ ΜΑΖΙΚΗΣ ΔΙΑΓΡΑΦΗΣ: ${errMessage.slice(0, 100)}`,
      });
      handleFirestoreError(error, OperationType.DELETE, "entries_batch");
    }
  },

  async restoreEntry(log: AuditEntry): Promise<void> {
    if (!log.oldData) throw new Error("ΔΕΝ ΒΡΕΘΗΚΑΝ ΔΕΔΟΜΕΝΑ ΕΠΑΝΑΦΟΡΑΣ.");
    const docRef = doc(db, "entries", log.targetId);
    try {
      await setDoc(docRef, deepSanitize(log.oldData));
      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'RESTORE',
        targetId: log.targetId,
        targetWarrantyId: log.targetWarrantyId,
        details: `ΕΠΑΝΑΦΟΡΑ ΕΓΓΡΑΦΗΣ (${log.targetWarrantyId}) ΑΠΟ ΤΟΝ ΧΡΗΣΤΗ ${auth.currentUser?.email || 'system'}`
      });
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'ERROR',
        targetId: log.targetId,
        targetWarrantyId: log.targetWarrantyId,
        details: `ΑΠΟΤΥΧΙΑ ΕΠΑΝΑΦΟΡΑΣ: ${errMessage.slice(0, 100)}`,
      });
      handleFirestoreError(error, OperationType.WRITE, `entries/${log.targetId}`);
    }
  }
};
