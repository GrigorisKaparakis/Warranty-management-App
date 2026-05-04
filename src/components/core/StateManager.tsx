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
  // Use individual selectors for stability
  const user = useStore(s => s.user);
  const profile = useStore(s => s.profile);
  const fetchLimit = useStore(s => s.settings?.limits?.fetchLimit);
  const auditLimit = useStore(s => s.settings?.limits?.auditLogFetchLimit);
  const rolePermissions = useStore(s => s.settings?.rolePermissions);
  const isAppIdle = useStore(s => s.isAppIdle);
  
  const setAuth = useStore(s => s.setAuth);
  const setAccountDisabled = useStore(s => s.setAccountDisabled);
  const setIsLoading = useStore(s => s.setIsLoading);
  const setIsLive = useStore(s => s.setIsLive);
  const setEntries = useStore(s => s.setEntries);
  const setSettings = useStore(s => s.setSettings);
  const setNotices = useStore(s => s.setNotices);
  const setNotes = useStore(s => s.setNotes);
  const setParts = useStore(s => s.setParts);
  const setVehicles = useStore(s => s.setVehicles);
  const setCustomers = useStore(s => s.setCustomers);
  const setUsers = useStore(s => s.setUsers);
  const setAuditLogs = useStore(s => s.setAuditLogs);
  const setGlobalStats = useStore(s => s.setGlobalStats);

  const location = useLocation();
  const currentPath = location.pathname;
  const hasShownWelcome = useRef(false);

  // --- AUTH WATCHER ---
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = AuthService.subscribe(async (currentUser) => {
      if (currentUser) {
        if (unsubscribeProfile) unsubscribeProfile();
        
        // Skip profile listener if app is idle to save resources
        if (isAppIdle) return;

        unsubscribeProfile = AuthService.subscribeToProfile(currentUser.uid, async (userProfile) => {
          if (!userProfile) {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              role: ONBOARDING_DEFAULTS.DEFAULT_USER_ROLE,
              disabled: false
            };

            setAuth(currentUser, newProfile);
            setAccountDisabled(false);
            await FirestoreService.updateUserProfile(currentUser.uid, newProfile);
            return;
          }

          if (userProfile.disabled) {
            setAccountDisabled(true);
          } else {
            setAccountDisabled(false);
          }
          
          // Important: Only update auth if data actually changed to maintain reference stability
          setAuth(currentUser, userProfile);
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
        setAuth(null, null);
        setAccountDisabled(false);
        hasShownWelcome.current = false;
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [setAuth, setAccountDisabled, isAppIdle]); // Added isAppIdle to close profile listener if idle

  // --- GLOBAL MONITORING (KILL-SWITCH & DEBUG) ---
  useEffect(() => {
    if (isAppIdle) return;
    const unsubscribeKillSwitch = initKillSwitch();
    return () => unsubscribeKillSwitch();
  }, [isAppIdle]);

  // --- GLOBAL FIRESTORE SUBSCRIPTIONS ---
  useEffect(() => {
    if (!user || isAppIdle) return;

    let isCancelled = false;

    // These subscriptions are core and should be stable
    const unsubSettings = FirestoreService.subscribeToSettings((data) => setSettings(data));
    const unsubNotices = FirestoreService.subscribeToNotices((data) => setNotices(data));

    const limit = fetchLimit || FETCH_LIMIT;

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
  }, [user, isAppIdle, fetchLimit, setNotes, setSettings, setNotices, setEntries, setIsLoading, setIsLive, setGlobalStats]);

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

  // --- LAZY ADMIN DATA ---
  useEffect(() => {
    if (!user || !profile || isAppIdle) return;

    const currentRole = profile.role || ONBOARDING_DEFAULTS.DEFAULT_USER_ROLE;
    const isAdmin = currentRole === 'ADMIN';

    const canSeeAudit = isAdmin || (rolePermissions?.['auditLog'] || []).includes(currentRole);
    const canManageUsers = isAdmin || (rolePermissions?.['users'] || []).includes(currentRole);

    let unsubUsers = () => { };
    let unsubAudit = () => { };
    let unsubNotes = () => { };

    if (canManageUsers && currentPath === '/users') {
      unsubUsers = FirestoreService.subscribeToUsers((data) => setUsers(data));
    }

    if (currentPath === '/notes') {
      unsubNotes = FirestoreService.subscribeToNotes((data) => setNotes(data));
    }

    const isDashboard = currentPath === '/dashboard';
    const isAuditLog = currentPath === '/auditLog';

    if (canSeeAudit && (isDashboard || isAuditLog)) {
      const limit = auditLimit || UI_LIMITS.AUDIT_LOG_FETCH_LIMIT;
      unsubAudit = FirestoreService.subscribeToAuditLogs(limit, (data) => setAuditLogs(data));
    }

    return () => {
      unsubUsers(); unsubAudit(); unsubNotes();
    };
  }, [user, isAppIdle, profile, currentPath, rolePermissions, auditLimit, setUsers, setAuditLogs, setNotes]);

  return null;
};
