/**
 * subscriptions.ts: Διαχείριση των συνδρομών (Real-time Subscriptions) για τις εγγυήσεις.
 * Υποστηρίζει τη συνεχή ενημέρωση της λίστας και τη φόρτωση επιπλέον εγγραφών (Pagination).
 */
import { query, orderBy, limit, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
import { visibilityAwareOnSnapshot, monitoredGetDocs } from "../monitor";
import { entriesCollection, sanitizeEntry, handleFirestoreError, OperationType } from "../core";
import { Entry } from "../../../core/types";

export const EntrySubscriptions = {
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
  }
};
