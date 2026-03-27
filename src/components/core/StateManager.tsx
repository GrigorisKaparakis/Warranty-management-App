
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FirestoreService } from '../../services/firebase/db';
import { AuthService } from '../../services/firebase/auth';
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

  // --- AUTH WATCHER ---
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = AuthService.subscribe(async (currentUser) => {
      if (currentUser) {
        unsubscribeProfile = AuthService.subscribeToProfile(currentUser.uid, async (userProfile) => {
          if (!userProfile) {
            // Αν δεν υπάρχει προφίλ, το δημιουργούμε.
            // Ο ιδιοκτήτης (kaparakisgrigoris@gmail.com) ή ο admin@hk.gr γίνονται αυτόματα ADMIN.
            const isOwner = currentUser.email === 'kaparakisgrigoris@gmail.com';
            
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              role: isOwner ? 'ADMIN' : ONBOARDING_DEFAULTS.DEFAULT_USER_ROLE,
              disabled: false
            };
            
            // Ενημερώνουμε το store προσωρινά για να ξεκολλήσει το loading
            store.setAuth(currentUser, newProfile);
            store.setAccountDisabled(false);
            
            // Και το αποθηκεύουμε στη βάση
            await FirestoreService.updateUserProfile(currentUser.uid, newProfile);
            return;
          }

          if (userProfile.disabled) {
            store.setAccountDisabled(true);
            store.setAuth(currentUser, userProfile);
          } else {
            // Διασφάλιση ότι οι bootstrap admins έχουν πάντα το σωστό ρόλο
            const isBootstrapAdmin = currentUser.email === 'kaparakisgrigoris@gmail.com';
            if (isBootstrapAdmin && userProfile.role !== 'ADMIN') {
              const updatedProfile = { ...userProfile, role: 'ADMIN' as const };
              store.setAuth(currentUser, updatedProfile);
              FirestoreService.updateUserProfile(currentUser.uid, { role: 'ADMIN' });
            } else {
              store.setAuth(currentUser, userProfile);
            }
            store.setAccountDisabled(false);
          }
        });
        // Εμφάνιση toast μόνο στην πραγματική είσοδο, όχι σε κάθε re-render
        toast.info(`Σύνδεση ως ${currentUser.email?.split('@')[0]}`);
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        store.setAuth(null, null);
        store.setAccountDisabled(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []); // Τρέχει ΜΟΝΟ μία φορά στο mount της εφαρμογής

  // --- GLOBAL FIRESTORE SUBSCRIPTIONS ---
  useEffect(() => {
    if (!store.user) return;

    const isDashboard = currentPath === '/dashboard';
    const isWarrantyView = currentPath.startsWith('/warranty/') || currentPath === '/paid' || currentPath === '/rejected';
    const limit = (isDashboard || isWarrantyView) ? undefined : (store.settings.limits?.fetchLimit || FETCH_LIMIT);
    
    const unsubEntries = FirestoreService.subscribeToEntries(limit, (data) => { 
      store.setEntries(data); 
      store.setIsLive(true); 
    });
    const unsubNotes = FirestoreService.subscribeToNotes((data) => store.setNotes(data));
    const unsubSettings = FirestoreService.subscribeToSettings((data) => store.setSettings(data));
    const unsubNotices = FirestoreService.subscribeToNotices((data) => store.setNotices(data));
    
    return () => { 
      unsubEntries(); unsubNotes(); unsubSettings(); unsubNotices();
      store.setIsLive(false); 
    };
  }, [store.user, store.settings.limits?.fetchLimit, currentPath]);

  // --- LAZY REGISTRIES & ADMIN DATA ---
  useEffect(() => {
    if (!store.user) return;
    
    const needsRegistries = currentPath === '/warranty/new' || currentPath.startsWith('/maintenance');
    const currentRole = store?.profile?.role || ONBOARDING_DEFAULTS.DEFAULT_USER_ROLE;
    const isAdmin = currentRole === 'ADMIN';
    
    // Δικαιώματα (απλοποιημένα για το manager)
    const canSeeAudit = isAdmin || (store?.settings?.rolePermissions?.['auditLog'] || []).includes(currentRole);
    const canManageUsers = isAdmin || (store?.settings?.rolePermissions?.['users'] || []).includes(currentRole);

    let unsubParts = () => {};
    let unsubVehicles = () => {};
    let unsubCustomers = () => {};
    let unsubUsers = () => {};
    let unsubAudit = () => {};

    if (needsRegistries) {
      unsubParts = FirestoreService.subscribeToParts((data) => store.setParts(data));
      unsubVehicles = FirestoreService.subscribeToVehicles((data) => store.setVehicles(data));
      unsubCustomers = FirestoreService.subscribeToCustomers((data) => store.setCustomers(data));
    }

    if (canManageUsers && currentPath === '/users') {
      unsubUsers = FirestoreService.subscribeToUsers((data) => store.setUsers(data));
    }

    const isDashboard = currentPath === '/dashboard';
    const isMaintenance = currentPath.startsWith('/maintenance');
    const isAuditLog = currentPath === '/auditLog';

    if (canSeeAudit && (isMaintenance || isDashboard || isAuditLog)) {
      const auditLimit = store.settings.limits?.auditLogFetchLimit || UI_LIMITS.AUDIT_LOG_FETCH_LIMIT;
      unsubAudit = FirestoreService.subscribeToAuditLogs(auditLimit, (data) => store.setAuditLogs(data));
    }

    return () => {
      unsubParts(); unsubVehicles(); unsubCustomers(); unsubUsers(); unsubAudit();
    };
  }, [store.user, currentPath, store.profile?.role, store.settings.rolePermissions, store.settings.limits?.auditLogFetchLimit]);

  return null; // Δεν σχεδιάζει τίποτα, απλά διαχειρίζεται το state
};
