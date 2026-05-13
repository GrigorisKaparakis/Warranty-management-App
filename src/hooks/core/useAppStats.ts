
import { useMemo } from 'react';
import { EntryStatus, UI_THRESHOLDS } from '../../core/config';
import { useStore } from '../../store/useStore';

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
    const companyCounts: Record<string, number> = {};
    const brandCounts: Record<string, number> = {};
    const monthlyTrend: Record<string, number> = {};
    const localCounts: Record<string, number> = {};
    let localPaid = 0;
    let localRejected = 0;

    entries.forEach(e => {
      // Local counts for consistency in charts
      if (e.isPaid) localPaid++;
      if (e.status === EntryStatus.REJECTED) localRejected++;
      if (e.status) localCounts[e.status] = (localCounts[e.status] || 0) + 1;
      
      // Distributions
      if (e.company) companyCounts[e.company] = (companyCounts[e.company] || 0) + 1;
      if (e.brand) brandCounts[e.brand] = (brandCounts[e.brand] || 0) + 1;
      
      // Monthly Trend
      const date = new Date(e.createdAt);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + 1;
    });

    // Merge global counts with local if available
    // We prefer global stats for the "Big Numbers" but use local for the "Distribution Charts"
    // to preserve consistency in the UI.
    const counts: Record<string, number> = globalStats?.statusCounts 
      ? { ...globalStats.statusCounts } 
      : (globalStats ? {
          [EntryStatus.WAITING]: globalStats.pending || 0,
          [EntryStatus.COMPLETED]: globalStats.approved || 0,
          [EntryStatus.REJECTED]: globalStats.rejected || 0,
          ...localCounts
        } : localCounts);

    const companyStats = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]);
    const brandStats = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);
    const trendData = Object.entries(monthlyTrend)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => {
         const [m1, y1] = a.label.split('/').map(Number);
         const [m2, y2] = b.label.split('/').map(Number);
         return y1 !== y2 ? y1 - y2 : m1 - m2;
      }).slice(-6);

    const total = globalStats ? globalStats.total : entries.length;
    const paid = globalStats ? globalStats.paid : localPaid;
    const rejected = globalStats ? globalStats.rejected : (globalStats?.rejected || localRejected);
    const eligibleTotal = total - rejected;

    return {
      total,
      paid,
      counts, // Global status counts if available
      localCounts, // Actual items in memory
      paidPercent: eligibleTotal > 0 ? Math.round((paid / eligibleTotal) * 100) : 0,
      companyStats,
      brandStats,
      trendData,
      expiringCount: expiringEntries.length
    };
  }, [entries, expiringEntries.length, globalStats]); // Only depend on expiringEntries.length to avoid unnecessary runs

  return {
    expiringEntries,
    stats
  };
};
