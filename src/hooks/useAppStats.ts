
import { useMemo } from 'react';
import { EntryStatus, UI_THRESHOLDS } from '../core/config';
import { useStore } from '../store/useStore';

/**
 * useAppStats: Hook για τον υπολογισμό στατιστικών και λήξεων.
 */
export const useAppStats = () => {
  const settings = useStore(s => s?.settings);
  const entries = useStore(s => s?.entries);
  const globalStats = useStore(s => s?.globalStats);

  /**
   * expiringEntries: Φιλτράρει τις εγγυήσεις που λήγουν.
   * Παραμένει ως έχει καθώς εξαρτάται από τις ημερομηνίες των εγγράφων.
   */
  const expiringEntries = useMemo(() => {
    // ... (logic remains same)
    const now = Date.now();
    const warningDays = settings.expiryThresholds?.warningDays ?? UI_THRESHOLDS.EXPIRY_WARNING_DAYS;
    const warningThreshold = now + (warningDays * 24 * 60 * 60 * 1000);
    
    return entries.filter(entry => 
      entry.expiryAt && 
      entry.expiryAt <= warningThreshold &&
      !entry.isPaid && 
      entry.status !== EntryStatus.REJECTED && 
      entry.status !== 'RETURNED'
    ).sort((a, b) => b.createdAt - a.createdAt);
  }, [entries, settings.expiryThresholds]);

  /**
   * stats: Υπολογισμός στατιστικών. 
   * Αν υπάρχει globalStats, το προτιμάμε για τους βασικούς αριθμούς.
   */
  const stats = useMemo(() => {
    // Fallback counts (from loaded entries)
    const localTotal = entries.length;
    let localPaid = 0;
    let localRejected = 0;
    const localCounts: Record<string, number> = {};
    const companyCounts: Record<string, number> = {};
    const brandCounts: Record<string, number> = {};
    const monthlyTrend: Record<string, number> = {};

    entries.forEach(e => {
      if (e.isPaid) localPaid++;
      if (e.status === EntryStatus.REJECTED) localRejected++;
      if (e.status) localCounts[e.status] = (localCounts[e.status] || 0) + 1;
      if (e.company) companyCounts[e.company] = (companyCounts[e.company] || 0) + 1;
      if (e.brand) brandCounts[e.brand] = (brandCounts[e.brand] || 0) + 1;
      
      // Monthly Trend (Last 6 months)
      const date = new Date(e.createdAt);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + 1;
    });

    const companyStats = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]);
    const brandStats = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);
    const trendData = Object.entries(monthlyTrend)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => {
         const [m1, y1] = a.label.split('/').map(Number);
         const [m2, y2] = b.label.split('/').map(Number);
         return y1 !== y2 ? y1 - y2 : m1 - m2;
      }).slice(-6);

    // Use aggregated stats if available
    if (globalStats) {
      const eligibleTotal = globalStats.total - globalStats.rejected;
      return {
        total: globalStats.total,
        paid: globalStats.paid,
        counts: {
          WAITING: globalStats.pending,
          COMPLETED: globalStats.approved,
          REJECTED: globalStats.rejected,
          ...localCounts 
        },
        paidPercent: eligibleTotal > 0 ? Math.round((globalStats.paid / eligibleTotal) * 100) : 0,
        companyStats,
        brandStats,
        trendData,
        expiringCount: expiringEntries.length
      };
    }

    // Default legacy calculation
    const eligibleTotal = localTotal - localRejected;
    return { 
      total: localTotal, 
      paid: localPaid, 
      counts: localCounts, 
      paidPercent: eligibleTotal > 0 ? Math.round((localPaid / eligibleTotal) * 100) : 0, 
      companyStats,
      brandStats,
      trendData,
      expiringCount: expiringEntries.length
    };
  }, [entries, expiringEntries, globalStats]);

  return {
    expiringEntries,
    stats
  };
};
