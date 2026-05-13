import { useEffect } from 'react';
import { FirestoreService } from '@/services/firebase/db';
import { initKillSwitch } from '@/services/firebase/monitor';
import { useStore } from '@/store/useStore';
import { UI_LIMITS } from '@/core/config';

/**
 * useConnectionManager: Hook για τη διαχείριση των real-time συνδέσεων με το Firebase.
 */
export const useConnectionManager = () => {
  const user = useStore(s => s.user);
  const isAppIdle = useStore(s => s.isAppIdle);
  const fetchLimit = useStore(s => s.settings?.limits?.fetchLimit);

  const setSettings = useStore(s => s.setSettings);
  const setNotices = useStore(s => s.setNotices);
  const setEntries = useStore(s => s.setEntries);
  const setIsLoading = useStore(s => s.setIsLoading);
  const setIsLive = useStore(s => s.setIsLive);
  const setGlobalStats = useStore(s => s.setGlobalStats);
  const setParts = useStore(s => s.setParts);
  const setVehicles = useStore(s => s.setVehicles);
  const setCustomers = useStore(s => s.setCustomers);

  // --- GLOBAL MONITORING (KILL-SWITCH) ---
  useEffect(() => {
    if (isAppIdle) return;
    const unsubscribeKillSwitch = initKillSwitch();
    return () => unsubscribeKillSwitch();
  }, [isAppIdle]);

  // --- GLOBAL FIRESTORE SUBSCRIPTIONS ---
  useEffect(() => {
    if (!user || isAppIdle) return;

    let isCancelled = false;
    const unsubSettings = FirestoreService.subscribeToSettings((data) => setSettings(data));
    const unsubNotices = FirestoreService.subscribeToNotices((data) => setNotices(data));

    const limit = fetchLimit || UI_LIMITS.FETCH_LIMIT;
    setIsLoading(true);

    const unsubEntries = FirestoreService.subscribeToEntries(limit, (data) => {
      if (isCancelled) return;
      setEntries(data);
      setIsLoading(false);
      setIsLive(true);
    });

    FirestoreService.getGlobalStats().then(statsData => {
      if (!isCancelled && statsData) setGlobalStats(statsData);
    }).catch(e => console.error("Stats Error:", e));

    return () => {
      isCancelled = true;
      unsubSettings();
      unsubNotices();
      unsubEntries();
    };
  }, [user, isAppIdle, fetchLimit, setSettings, setNotices, setEntries, setIsLoading, setIsLive, setGlobalStats]);

  // --- PERSISTENT REGISTRIES ---
  useEffect(() => {
    if (!user || isAppIdle) return;

    const unsubParts = FirestoreService.subscribeToParts((data) => setParts(data));
    const unsubVehicles = FirestoreService.subscribeToVehicles((data) => setVehicles(data));
    const unsubCustomers = FirestoreService.subscribeToCustomers((data) => setCustomers(data));

    return () => {
      unsubParts(); unsubVehicles(); unsubCustomers();
    };
  }, [user, isAppIdle, setParts, setVehicles, setCustomers]);
};
