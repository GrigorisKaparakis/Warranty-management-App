
import { useMemo } from 'react';
import { EntryStatus, UI_THRESHOLDS } from '../core/config';
import { useStore } from '../store/useStore';

/**
 * useAppStats: Hook για τον υπολογισμό στατιστικών και λήξεων.
 */
export const useAppStats = () => {
  const settings = useStore(s => s?.settings);
  const entries = useStore(s => s?.entries);

  /**
   * expiringEntries: Φιλτράρει τις εγγυήσεις που λήγουν.
   */
  const expiringEntries = useMemo(() => {
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
   * stats: Υπολογισμός στατιστικών (Analytics) για το Dashboard.
   */
  const stats = useMemo(() => {
    const total = entries.length;
    let paid = 0;
    let rejected = 0;
    const counts: Record<string, number> = {};
    const companyCounts: Record<string, number> = {};

    entries.forEach(e => {
      if (e.isPaid) paid++;
      if (e.status === EntryStatus.REJECTED) rejected++;
      
      if (e.status) {
        counts[e.status] = (counts[e.status] || 0) + 1;
      }
      
      if (e.company) {
        companyCounts[e.company] = (companyCounts[e.company] || 0) + 1;
      }
    });

    const eligibleTotal = total - rejected;
    const companyStats = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]);

    return { 
      total, 
      paid, 
      counts, 
      paidPercent: eligibleTotal > 0 ? Math.round((paid / eligibleTotal) * 100) : 0, 
      companyStats,
      expiringCount: expiringEntries.length
    };
  }, [entries, expiringEntries]);

  return {
    expiringEntries,
    stats
  };
};
