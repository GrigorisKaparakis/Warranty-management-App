/**
 * stats-updater.ts: Λογική ενημέρωσης των στατιστικών (Atomic Updates).
 * Υπολογίζει τις αυξήσεις/μειώσεις (increments) για τα σύνολα της εφαρμογής κατά τη διάρκεια των συναλλαγών.
 */
import { increment, serverTimestamp } from "firebase/firestore";
import { EntryStatus } from "../../core/config";
import { Entry } from "../../core/types";

export const StatsUpdater = {
  getAddEntryUpdate(entry: Partial<Entry>) {
    const statsUpdate: any = { 
      total: increment(1),
      lastUpdated: serverTimestamp() 
    };
    
    if (entry.status) {
      statsUpdate[`statusCounts.${entry.status}`] = increment(1);
      // Legacy support
      if (entry.status === EntryStatus.WAITING) statsUpdate.pending = increment(1);
      else if (entry.status === EntryStatus.COMPLETED) statsUpdate.approved = increment(1);
      else if (entry.status === EntryStatus.REJECTED) statsUpdate.rejected = increment(1);
    }
    
    if (entry.isPaid) statsUpdate.paid = increment(1); 
    else statsUpdate.unpaid = increment(1);

    return statsUpdate;
  },

  getUpdateEntryUpdate(updates: Partial<Entry>, oldData: Entry) {
    const statsUpdate: any = { lastUpdated: serverTimestamp() };
    
    if (updates.status && updates.status !== oldData.status) {
      statsUpdate[`statusCounts.${oldData.status}`] = increment(-1);
      statsUpdate[`statusCounts.${updates.status}`] = increment(1);
      
      // Legacy support
      if (oldData.status === EntryStatus.WAITING) statsUpdate.pending = increment(-1);
      if (oldData.status === EntryStatus.COMPLETED) statsUpdate.approved = increment(-1);
      if (oldData.status === EntryStatus.REJECTED) statsUpdate.rejected = increment(-1);
      
      if (updates.status === EntryStatus.WAITING) statsUpdate.pending = increment(1);
      if (updates.status === EntryStatus.COMPLETED) statsUpdate.approved = increment(1);
      if (updates.status === EntryStatus.REJECTED) statsUpdate.rejected = increment(1);
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

    return Object.keys(statsUpdate).length > 1 ? statsUpdate : null;
  },

  getDeleteEntryUpdate(oldData: Entry) {
    const statsUpdate: any = { 
      total: increment(-1),
      lastUpdated: serverTimestamp() 
    };
    
    if (oldData.status) {
      statsUpdate[`statusCounts.${oldData.status}`] = increment(-1);
      // Legacy
      if (oldData.status === EntryStatus.WAITING) statsUpdate.pending = increment(-1);
      else if (oldData.status === EntryStatus.COMPLETED) statsUpdate.approved = increment(-1);
      else if (oldData.status === EntryStatus.REJECTED) statsUpdate.rejected = increment(-1);
    }
    
    if (oldData.isPaid) statsUpdate.paid = increment(-1); 
    else statsUpdate.unpaid = increment(-1);

    return statsUpdate;
  },

  getBatchUpdateStats(deltas: { statusDeltas: Record<string, number>, paidDelta: number, unpaidDelta: number }) {
    const statsUpdate: any = { lastUpdated: serverTimestamp() };
    const { statusDeltas, paidDelta, unpaidDelta } = deltas;

    Object.entries(statusDeltas).forEach(([status, delta]) => {
      if (delta !== 0) {
        statsUpdate[`statusCounts.${status}`] = increment(delta);
        // Legacy support
        if (status === EntryStatus.WAITING) statsUpdate.pending = increment(delta);
        if (status === EntryStatus.COMPLETED) statsUpdate.approved = increment(delta);
        if (status === EntryStatus.REJECTED) statsUpdate.rejected = increment(delta);
      }
    });
    
    if (paidDelta !== 0) statsUpdate.paid = increment(paidDelta);
    if (unpaidDelta !== 0) statsUpdate.unpaid = increment(unpaidDelta);

    return Object.keys(statsUpdate).length > 1 ? statsUpdate : null;
  },

  getBatchDeleteStats(count: number, statusCounts: Record<string, number>, paidDelta: number, unpaidDelta: number) {
    const statsUpdate: any = { 
      total: increment(-count),
      lastUpdated: serverTimestamp() 
    };

    Object.entries(statusCounts).forEach(([status, delta]) => {
      statsUpdate[`statusCounts.${status}`] = increment(-delta);
      // Legacy
      if (status === EntryStatus.WAITING) statsUpdate.pending = increment(-delta);
      if (status === EntryStatus.COMPLETED) statsUpdate.approved = increment(-delta);
      if (status === EntryStatus.REJECTED) statsUpdate.rejected = increment(-delta);
    });

    if (paidDelta > 0) statsUpdate.paid = increment(-paidDelta);
    if (unpaidDelta > 0) statsUpdate.unpaid = increment(-unpaidDelta);

    return statsUpdate;
  }
};
