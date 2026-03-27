
import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useAppPermissions } from './useAppPermissions';
import { useAppStats } from './useAppStats';
import { useAppNavigation } from './useAppNavigation';
import { useAppFileDrop } from './useAppFileDrop';

/**
 * useAppState: Κεντρικό hook που συγκεντρώνει τη λογική της εφαρμογής.
 * Αναδιοργανώθηκε σε μικρότερα hooks για καλύτερη συντηρησιμότητα.
 */
export const useAppState = () => {
  const user = useStore(s => s?.user);
  const settings = useStore(s => s?.settings);
  
  // Hooks για επιμέρους λειτουργίες
  const permissions = useAppPermissions();
  const stats = useAppStats();
  const navigation = useAppNavigation();
  const fileDrop = useAppFileDrop();

  /**
   * isOnboardingRequired: Ελέγχει αν η εφαρμογή χρειάζεται αρχική ρύθμιση.
   */
  const isOnboardingRequired = useMemo(() => {
    if (!user || !permissions.isAdmin) return false;
    const hasNoStatuses = !settings.statusConfigs || Object.keys(settings.statusConfigs).length === 0;
    return hasNoStatuses;
  }, [user, permissions.isAdmin, settings.statusConfigs]);

  return {
    ...permissions,
    ...stats,
    ...navigation,
    ...fileDrop,
    isOnboardingRequired
  };
};
