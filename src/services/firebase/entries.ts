/**
 * entries.ts: Διαχείριση των εγγυήσεων (Warranty Entries) στο Firestore.
 * Περιλαμβάνει CRUD λειτουργίες, μαζικές ενημερώσεις και audit logging.
 */

import { doc, query, orderBy, limit, addDoc, updateDoc, deleteDoc, writeBatch, setDoc, where } from "firebase/firestore";
import { monitoredOnSnapshot, monitoredGetDocs, monitoredGetDoc } from "./monitor";
import { db, entriesCollection, deepSanitize, sanitizeEntry, auth, handleFirestoreError, OperationType } from "./core";
import { Entry, AuditEntry } from "../../core/types";
import { AdminService } from "./admin";
import { generateAuditDetails } from "../../utils/auditUtils";

export const EntryService = {
  subscribeToEntries(limitCount: number | undefined, callback: (entries: Entry[]) => void) {
    let q = query(entriesCollection, orderBy("createdAt", "desc"));
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    return monitoredOnSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((snap: any) => sanitizeEntry(snap.data(), snap.id));
      callback(entries);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "entries"));
  },

  async addEntry(entry: Omit<Entry, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(entriesCollection, deepSanitize(entry));
      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'CREATE',
        targetId: docRef.id,
        targetWarrantyId: entry.warrantyId,
        details: generateAuditDetails(null, entry),
        newData: deepSanitize(entry)
      });
      return docRef.id;
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'ERROR',
        targetId: 'N/A',
        targetWarrantyId: entry.warrantyId,
        details: `ΑΠΟΤΥΧΙΑ ΔΗΜΙΟΥΡΓΙΑΣ: ${errMessage.slice(0, 100)}`,
      });
      return handleFirestoreError(error, OperationType.CREATE, "entries") as any;
    }
  },

  async updateEntry(id: string, updates: Partial<Entry>, existingData?: Entry): Promise<void> {
    const docId = id.trim();
    const docRef = doc(db, "entries", docId);
    let oldData: any = existingData || null;
    try {
      if (!oldData) {
        const snap = await monitoredGetDoc(docRef);
        oldData = snap.exists() ? deepSanitize(snap.data()) : null;
      }

      const { id: _, ...cleanUpdates } = updates as any;
      await updateDoc(docRef, deepSanitize(cleanUpdates));

      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'UPDATE',
        targetId: docId,
        targetWarrantyId: updates.warrantyId || oldData?.warrantyId || 'N/A',
        details: generateAuditDetails(oldData, { ...oldData, ...cleanUpdates }),
        oldData: oldData,
        newData: deepSanitize({ ...oldData, ...cleanUpdates })
      });
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'ERROR',
        targetId: docId,
        targetWarrantyId: updates.warrantyId || oldData?.warrantyId || 'N/A',
        details: `ΑΠΟΤΥΧΙΑ ΕΝΗΜΕΡΩΣΗΣ: ${errMessage.slice(0, 100)}`,
      });
      handleFirestoreError(error, OperationType.UPDATE, `entries/${docId}`);
    }
  },

  async deleteEntry(id: string, warrantyId: string = 'N/A', existingData?: Entry): Promise<void> {
    const docId = id.trim();
    const docRef = doc(db, "entries", docId);
    try {
      let oldData = existingData || null;
      if (!oldData) {
        const snap = await monitoredGetDoc(docRef);
        oldData = snap.exists() ? deepSanitize(snap.data()) : null;
      }

      await deleteDoc(docRef);

      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'DELETE',
        targetId: docId,
        targetWarrantyId: warrantyId,
        details: `ΟΡΙΣΤΙΚΗ ΔΙΑΓΡΑΦΗ ΕΓΓΡΑΦΗΣ (${warrantyId})`,
        oldData: oldData
      });
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
    const batch = writeBatch(db);
    const timestamp = Date.now();
    const username = auth.currentUser?.email?.split('@')[0] || 'system';
    const logMsg = updates.status 
      ? `[${username}] ΜΑΖΙΚΗ ΑΛΛΑΓΗ ΚΑΤΑΣΤΑΣΗΣ ΣΕ ${updates.status}`
      : updates.isPaid !== undefined 
        ? `[${username}] ΜΑΖΙΚΗ ΣΗΜΑΝΣΗ ΩΣ ${updates.isPaid ? 'ΠΛΗΡΩΜΕΝΟ' : 'ΑΠΛΗΡΩΤΟ'}`
        : `[${username}] ΜΑΖΙΚΗ ΕΝΗΜΕΡΩΣΗ`;

    try {
      for (const id of ids) {
        const docRef = doc(db, "entries", id);
        const snap = await monitoredGetDoc(docRef);
        if (snap.exists()) {
          const currentData = snap.data() as Entry;
          const currentNotes = (currentData.notes || '').trim();
          const finalUpdates = { 
            ...updates, 
            notes: currentNotes + (currentNotes ? '\n' : '') + logMsg 
          };
          const { id: _, ...cleanUpdates } = finalUpdates as any;
          batch.update(docRef, deepSanitize(cleanUpdates));
          await AdminService.addAuditLog({
            timestamp,
            userId: auth.currentUser?.uid || 'system',
            userEmail: auth.currentUser?.email || 'system',
            action: 'UPDATE',
            targetId: id,
            targetWarrantyId: currentData.warrantyId || 'N/A',
            details: `ΜΑΖΙΚΗ ΕΝΕΡΓΕΙΑ: ${generateAuditDetails(currentData, { ...currentData, ...cleanUpdates })}`,
            oldData: deepSanitize(currentData),
            newData: deepSanitize({ ...currentData, ...cleanUpdates })
          });
        }
      }
      await batch.commit();
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
    const batch = writeBatch(db);
    const timestamp = Date.now();
    try {
      for (const id of ids) {
        const docRef = doc(db, "entries", id);
        const snap = await monitoredGetDoc(docRef);
        if (snap.exists()) {
          const currentData = snap.data() as Entry;
          batch.delete(docRef);
          await AdminService.addAuditLog({
            timestamp,
            userId: auth.currentUser?.uid || 'system',
            userEmail: auth.currentUser?.email || 'system',
            action: 'DELETE',
            targetId: id,
            targetWarrantyId: currentData.warrantyId || 'N/A',
            details: `ΜΑΖΙΚΗ ΔΙΑΓΡΑΦΗ ΕΓΓΡΑΦΗΣ (${currentData.warrantyId})`,
            oldData: deepSanitize(currentData)
          });
        }
      }
      await batch.commit();
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
  },

  async updatePaymentAmount(id: string, amount: number): Promise<void> {
    const docId = id.trim();
    const docRef = doc(db, "entries", docId);
    try {
      const snap = await monitoredGetDoc(docRef);
      const oldData = snap.exists() ? sanitizeEntry(snap.data(), snap.id) : null;
      
      await updateDoc(docRef, { paymentAmount: amount });

      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action: 'UPDATE',
        targetId: docId,
        targetWarrantyId: oldData?.warrantyId || 'N/A',
        details: `ΕΝΗΜΕΡΩΣΗ ΠΟΣΟΥ ΠΛΗΡΩΜΗΣ: ${oldData?.paymentAmount || 0}€ -> ${amount}€`,
        oldData: oldData,
        newData: { ...oldData, paymentAmount: amount }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `entries/${docId}`);
    }
  }
};
