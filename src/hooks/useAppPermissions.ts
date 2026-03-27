
import { useMemo } from 'react';
import { DEFAULT_MENU, DEFAULT_PERMISSIONS } from '../core/config';
import { MenuItem } from '../core/types';
import { useStore } from '../store/useStore';

/**
 * useAppPermissions: Hook για τη διαχείριση των δικαιωμάτων (RBAC) και του μενού.
 */
export const useAppPermissions = () => {
  const profile = useStore(s => s?.profile);
  const settings = useStore(s => s?.settings);
  
  const currentRole = profile?.role || 'USER';
  const isAdmin = currentRole === 'ADMIN';

  /**
   * fullMenu: Η πλήρης λίστα των μενού. 
   */
  const fullMenu = useMemo(() => {
    let base = Array.isArray(settings.menuConfig) ? settings.menuConfig : [];

    if (base.length === 0 && isAdmin) {
      base = (DEFAULT_MENU as MenuItem[]).filter(m => m.id === 'dashboard' || m.id === 'maintenance' || m.id === 'users');
    }

    return base.map(item => {
      let roles = settings.rolePermissions?.[item.id] || item.roles || ['ADMIN'];
      if (!Array.isArray(roles)) roles = ['ADMIN'];
      
      return {
        ...item,
        roles
      };
    });
  }, [settings.menuConfig, settings.rolePermissions, isAdmin]);

  /**
   * dynamicMenu: Υπολογίζει ποια στοιχεία μενού είναι ορατά βάσει του ρόλου του χρήστη.
   */
  const dynamicMenu = useMemo(() => {
    return fullMenu.filter(item => item.roles.includes(currentRole));
  }, [fullMenu, currentRole]);

  const canEdit = useMemo(() => dynamicMenu.some(m => m.id === 'entry'), [dynamicMenu]);
  const canManageUsers = useMemo(() => dynamicMenu.some(m => m.id === 'users') || isAdmin, [dynamicMenu, isAdmin]);
  
  const canDelete = useMemo(() => {
    if (isAdmin) return true;
    const allowed = settings.rolePermissions?.['delete_entry'] || DEFAULT_PERMISSIONS.delete_entry;
    return allowed.includes(currentRole);
  }, [settings.rolePermissions, currentRole, isAdmin]);

  const canBroadcast = useMemo(() => {
    if (isAdmin) return true;
    const allowed = settings.rolePermissions?.['broadcast_notice'] || DEFAULT_PERMISSIONS.broadcast_notice;
    return allowed.includes(currentRole);
  }, [settings.rolePermissions, currentRole, isAdmin]);

  const canSeeAudit = useMemo(() => {
    if (isAdmin) return true;
    const allowed = settings.rolePermissions?.['auditLog'] || DEFAULT_PERMISSIONS.auditLog;
    return allowed.includes(currentRole);
  }, [settings.rolePermissions, currentRole, isAdmin]);

  return {
    currentRole,
    isAdmin,
    fullMenu,
    dynamicMenu,
    canEdit,
    canManageUsers,
    canDelete,
    canBroadcast,
    canSeeAudit
  };
};
