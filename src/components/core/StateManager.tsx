import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FirestoreService } from '../../services/firebase/db';
import { AuthService } from '../../services/firebase/auth';
import { initKillSwitch } from '../../services/firebase/monitor';
import { useStore } from '../../store/useStore';
import { toast } from '../../utils/toast';
import { UI_LIMITS, ONBOARDING_DEFAULTS } from '../../core/config';
import { UserProfile } from '../../core/types';

const FETCH_LIMIT = UI_LIMITS.FETCH_LIMIT;

/**
 * StateManager: Το "μυαλό" της εφαρμογής.
 * Τρέχει μόνο μία φορά στην κορυφή του App και διαχειρίζεται όλες τις 
 * real-time συνδέσεις με το Firebase.
 */
export const StateManager: React.FC = () => {
  const store = useStore();
  const location = useLocation();
  const currentPath = location.pathname;
  const hasShownWelcome = useRef(false);

  // --- AUTH WATCHER ---
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = AuthService.subscribe(async (currentUser) => {
      if (currentUser) {
        // Καθαρισμός προηγούμενου profile listener αν υπάρχει
        if (unsubscribeProfile) unsubscribeProfile();

        unsubscribeProfile = AuthService.subscribeToProfile(currentUser.uid, async (userProfile) => {
          if (!userProfile) {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              role: ONBOARDING_DEFAULTS.DEFAULT_USER_ROLE,
              disabled: false
            };

            store.setAuth(currentUser, newProfile);
            store.setAccountDisabled(false);

            await FirestoreService.updateUserProfile(currentUser.uid, newProfile);
            return;
          }

          if (userProfile.disabled) {
            store.setAccountDisabled(true);
            store.setAuth(currentUser, userProfile);
          } else {
            store.setAuth(currentUser, userProfile);
            store.setAccountDisabled(false);
          }
        });

        if (!hasShownWelcome.current) {
          const name = currentUser.email?.split('@')[0] || 'Χρήστης';
          toast.info(`Σύνδεση ως ${name}`);
          hasShownWelcome.current = true;
        }
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        store.setAuth(null, null);
        store.setAccountDisabled(false);
        hasShownWelcome.current = false;
      }
    });

    const unsubscribeKillSwitch = initKillSwitch();

    return () => {
      unsubscribeAuth();
      unsubscribeKillSwitch();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // --- GLOBAL FIRESTORE SUBSCRIPTIONS ---
  useEffect(() => {
    const { user, settings, setEntries, setIsLive, setIsLoading } = store;
    if (!user) return;

    let isCancelled = false;

    // Subscriptions
    const unsubNotes = FirestoreService.subscribeToNotes((data) => store.setNotes(data));
    const unsubSettings = FirestoreService.subscribeToSettings((data) => store.setSettings(data));
    const unsubNotices = FirestoreService.subscribeToNotices((data) => store.setNotices(data));

    const limit = settings?.limits?.fetchLimit || FETCH_LIMIT;

    setIsLoading(true);
    const unsubEntries = FirestoreService.subscribeToEntries(limit, (data) => {
      if (isCancelled) return;
      setEntries(data);
      setIsLoading(false);
      setIsLive(true);
    });

    FirestoreService.getGlobalStats().then(statsData => {
      if (!isCancelled && statsData) store.setGlobalStats(statsData);
    }).catch(e => console.error("Stats Error:", e));

    return () => {
      isCancelled = true;
      unsubNotes();
      unsubSettings();
      unsubNotices();
      unsubEntries();
    };
  }, [store.user, store.settings?.limits?.fetchLimit]);

  // --- PERSISTENT REGISTRIES ---
  useEffect(() => {
    if (!store.user) return;

    const unsubParts = FirestoreService.subscribeToParts((data) => store.setParts(data));
    const unsubVehicles = FirestoreService.subscribeToVehicles((data) => store.setVehicles(data));
    const unsubCustomers = FirestoreService.subscribeToCustomers((data) => store.setCustomers(data));

    return () => {
      unsubParts(); unsubVehicles(); unsubCustomers();
    };
  }, [store.user]);

  // --- LAZY ADMIN DATA ---
  useEffect(() => {
    if (!store.user) return;

    const currentRole = store?.profile?.role || ONBOARDING_DEFAULTS.DEFAULT_USER_ROLE;
    const isAdmin = currentRole === 'ADMIN';

    const canSeeAudit = isAdmin || (store?.settings?.rolePermissions?.['auditLog'] || []).includes(currentRole);
    const canManageUsers = isAdmin || (store?.settings?.rolePermissions?.['users'] || []).includes(currentRole);

    let unsubUsers = () => { };
    let unsubAudit = () => { };

    if (canManageUsers && currentPath === '/users') {
      unsubUsers = FirestoreService.subscribeToUsers((data) => store.setUsers(data));
    }

    const isDashboard = currentPath === '/dashboard';
    const isMaintenance = currentPath.startsWith('/maintenance');
    const isAuditLog = currentPath === '/auditLog';

    if (canSeeAudit && (isMaintenance || isDashboard || isAuditLog)) {
      const auditLimit = store.settings?.limits?.auditLogFetchLimit || UI_LIMITS.AUDIT_LOG_FETCH_LIMIT;
      unsubAudit = FirestoreService.subscribeToAuditLogs(auditLimit, (data) => store.setAuditLogs(data));
    }

    return () => {
      unsubUsers(); unsubAudit();
    };
  }, [store.user, currentPath, store.profile?.role, store.settings?.rolePermissions, store.settings?.limits?.auditLogFetchLimit]);

  return null;
};
