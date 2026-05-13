/**
 * stats.ts: Διαχείριση των στατιστικών της εφαρμογής (Global Stats).
 * Παρέχει λειτουργίες για την ανάκτηση και ενημέρωση των συνόλων που εμφανίζονται στο Dashboard.
 */
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, getCountFromServer, query, where, collection } from "firebase/firestore";
import { db, handleFirestoreError, OperationType, entriesCollection } from "./core";
import { EntryStatus } from "../../core/config";

export interface GlobalStats {
  total: number;
  statusCounts: Record<string, number>;
  paid: number;
  unpaid: number;
  lastUpdated: any;
  /** @deprecated use statusCounts */
  pending?: number;
  /** @deprecated use statusCounts */
  approved?: number;
  /** @deprecated use statusCounts */
  rejected?: number;
}

const STATS_DOC_PATH = "metadata/stats";

export const StatsService = {
  async getGlobalStats(): Promise<GlobalStats | null> {
    try {
      const docRef = doc(db, STATS_DOC_PATH);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as GlobalStats;
        // Migration/Compatibility for older components that might expect pending/approved/rejected
        if (data.statusCounts) {
          data.pending = data.statusCounts[EntryStatus.WAITING] || 0;
          data.approved = data.statusCounts[EntryStatus.COMPLETED] || 0;
          data.rejected = data.statusCounts[EntryStatus.REJECTED] || 0;
        }
        return data;
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
      const statuses = Object.values(EntryStatus);
      const statusQueries = statuses.map(s => getCountFromServer(query(entriesCollection, where("status", "==", s))));
      
      const [
        totalSnap,
        paidSnap,
        unpaidSnap,
        ...statusSnaps
      ] = await Promise.all([
        getCountFromServer(entriesCollection),
        getCountFromServer(query(entriesCollection, where("isPaid", "==", true))),
        getCountFromServer(query(entriesCollection, where("isPaid", "==", false))),
        ...statusQueries
      ]);

      const statusCounts: Record<string, number> = {};
      statuses.forEach((status, index) => {
        statusCounts[status] = statusSnaps[index].data().count;
      });

      const newStats: GlobalStats = {
        total: totalSnap.data().count,
        statusCounts,
        paid: paidSnap.data().count,
        unpaid: unpaidSnap.data().count,
        lastUpdated: serverTimestamp(),
        // Backwards compatibility
        pending: statusCounts[EntryStatus.WAITING] || 0,
        approved: statusCounts[EntryStatus.COMPLETED] || 0,
        rejected: statusCounts[EntryStatus.REJECTED] || 0
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
    paid?: number;
    unpaid?: number;
    statusDeltas?: Record<string, number>;
  }) {
    const docRef = doc(db, STATS_DOC_PATH);
    const updateData: any = {
      lastUpdated: serverTimestamp()
    };

    if (changes.total) updateData.total = increment(changes.total);
    if (changes.paid) updateData.paid = increment(changes.paid);
    if (changes.unpaid) updateData.unpaid = increment(changes.unpaid);
    
    if (changes.statusDeltas) {
      Object.entries(changes.statusDeltas).forEach(([status, delta]) => {
        updateData[`statusCounts.${status}`] = increment(delta);
        
        // Also update legacy fields for compatibility
        if (status === EntryStatus.WAITING) updateData.pending = increment(delta);
        if (status === EntryStatus.COMPLETED) updateData.approved = increment(delta);
        if (status === EntryStatus.REJECTED) updateData.rejected = increment(delta);
      });
    }

    try {
      await updateDoc(docRef, updateData);
    } catch (error) {
      // If doc doesn't exist, we should probably run a full recalculation instead of partial sync
      await this.recalculateStats();
    }
  }
};
