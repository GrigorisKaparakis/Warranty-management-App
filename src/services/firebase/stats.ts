
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, getCountFromServer, query, where, collection } from "firebase/firestore";
import { db, handleFirestoreError, OperationType, entriesCollection } from "./core";
import { EntryStatus } from "../../core/config";

export interface GlobalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  paid: number;
  unpaid: number;
  lastUpdated: any;
}

const STATS_DOC_PATH = "metadata/stats";

export const StatsService = {
  async getGlobalStats(): Promise<GlobalStats | null> {
    try {
      const docRef = doc(db, STATS_DOC_PATH);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as GlobalStats;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, STATS_DOC_PATH);
      return null;
    }
  },

  /**
   * Επαναϋπολογισμός όλων των μετρητών από τη βάση (Truth).
   */
  async recalculateStats(): Promise<GlobalStats | null> {
    try {
      const [
        totalSnap,
        pendingSnap,
        approvedSnap,
        rejectedSnap,
        paidSnap,
        unpaidSnap
      ] = await Promise.all([
        getCountFromServer(entriesCollection),
        getCountFromServer(query(entriesCollection, where("status", "==", EntryStatus.WAITING))),
        getCountFromServer(query(entriesCollection, where("status", "==", EntryStatus.COMPLETED))),
        getCountFromServer(query(entriesCollection, where("status", "==", EntryStatus.REJECTED))),
        getCountFromServer(query(entriesCollection, where("isPaid", "==", true))),
        getCountFromServer(query(entriesCollection, where("isPaid", "==", false))),
      ]);

      const newStats: GlobalStats = {
        total: totalSnap.data().count,
        pending: pendingSnap.data().count,
        approved: approvedSnap.data().count,
        rejected: rejectedSnap.data().count,
        paid: paidSnap.data().count,
        unpaid: unpaidSnap.data().count,
        lastUpdated: serverTimestamp()
      };

      const docRef = doc(db, STATS_DOC_PATH);
      await setDoc(docRef, newStats);
      return newStats;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, STATS_DOC_PATH);
      return null;
    }
  },

  /**
   * Ενημερώνει τους μετρητές βάσει της αλλαγής κατάστασης.
   */
  async updateCounters(changes: {
    total?: number;
    pending?: number;
    approved?: number;
    rejected?: number;
    paid?: number;
    unpaid?: number;
  }) {
    const docRef = doc(db, STATS_DOC_PATH);
    const updateData: any = {
      lastUpdated: serverTimestamp()
    };

    if (changes.total) updateData.total = increment(changes.total);
    if (changes.pending) updateData.pending = increment(changes.pending);
    if (changes.approved) updateData.approved = increment(changes.approved);
    if (changes.rejected) updateData.rejected = increment(changes.rejected);
    if (changes.paid) updateData.paid = increment(changes.paid);
    if (changes.unpaid) updateData.unpaid = increment(changes.unpaid);

    try {
      await updateDoc(docRef, updateData);
    } catch (error) {
      // Αν το έγγραφο δεν υπάρχει, το δημιουργούμε
      await setDoc(docRef, {
        total: Math.max(0, changes.total || 0),
        pending: Math.max(0, changes.pending || 0),
        approved: Math.max(0, changes.approved || 0),
        rejected: Math.max(0, changes.rejected || 0),
        paid: Math.max(0, changes.paid || 0),
        unpaid: Math.max(0, changes.unpaid || 0),
        lastUpdated: serverTimestamp()
      });
    }
  }
};
