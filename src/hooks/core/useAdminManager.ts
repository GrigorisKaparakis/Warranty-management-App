import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FirestoreService } from '@/services/firebase/db';
import { useStore } from '@/store/useStore';
import { useAppPermissions } from './useAppPermissions';
import { UI_LIMITS } from '@/core/config';

/**
 * useAdminManager: Hook για τη διαχείριση των δεδομένων που αφορούν Admin λειτουργίες.
 * Φορτώνει δεδομένα (Logs, Users, Notes) μόνο όταν χρειάζεται (Lazy loading).
 */
export const useAdminManager = () => {
  const user = useStore(s => s.user);
  const profile = useStore(s => s.profile);
  const isAppIdle = useStore(s => s.isAppIdle);
  const rolePermissions = useStore(s => s.settings?.rolePermissions);
  const auditLimit = useStore(s => s.settings?.limits?.auditLogFetchLimit);

  const setUsers = useStore(s => s.setUsers);
  const setAuditLogs = useStore(s => s.setAuditLogs);
  const setNotes = useStore(s => s.setNotes);

  const location = useLocation();
  const currentPath = location.pathname;
  const { can, isAdmin } = useAppPermissions();

  useEffect(() => {
    if (!user || !profile || isAppIdle) return;

    const canSeeAudit = can('auditLog');
    const canManageUsers = can('users');

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
};
