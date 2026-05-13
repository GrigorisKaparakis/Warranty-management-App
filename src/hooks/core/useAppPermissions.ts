
import { useMemo } from 'react';
import { DEFAULT_MENU, DEFAULT_PERMISSIONS } from '../../core/config';
import { MenuItem } from '../../core/types';
import { useStore } from '../../store/useStore';

/**
 * useAppPermissions: Hook για τη διαχείριση των δικαιωμάτων (RBAC) και του μενού.
 */
export const useAppPermissions = () => {
  const profile = useStore(s => s?.profile);
  const settings = useStore(s => s?.settings);
  
  const currentRole = profile?.role || 'USER';
  const isAdmin = currentRole === 'ADMIN';

  /**
   * can: Η κεντρική συνάρτηση ελέγχου δικαιωμάτων.
   * Εξασφαλίζει ότι ο ADMIN έχει πρόσβαση παντού, ενώ οι άλλοι ρόλοι
   * ελέγχονται βάσει των ρυθμίσεων (settings).
   */
  const can = (action: string): boolean => {
    if (isAdmin) return true;
    const allowedRoles = settings.rolePermissions?.[action] || DEFAULT_PERMISSIONS[action] || [];
    return allowedRoles.includes(currentRole);
  };

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
    return fullMenu.filter(item => {
      // Αν είναι ADMIN, βλέπει τα πάντα. Αλλιώς ελέγχουμε αν ο ρόλος του είναι στη λίστα.
      if (isAdmin) return true;
      return item.roles.includes(currentRole);
    });
  }, [fullMenu, currentRole, isAdmin]);

  const canEdit = useMemo(() => dynamicMenu.some(m => m.id === 'entry'), [dynamicMenu]);
  const canManageUsers = useMemo(() => can('users') || isAdmin, [isAdmin, settings.rolePermissions, currentRole]);
  
  const canDelete = useMemo(() => can('delete_entry'), [currentRole, isAdmin, settings.rolePermissions]);
  const canBroadcast = useMemo(() => can('broadcast_notice'), [currentRole, isAdmin, settings.rolePermissions]);
  const canSeeAudit = useMemo(() => can('auditLog'), [currentRole, isAdmin, settings.rolePermissions]);

  return {
    profile,
    currentRole,
    isAdmin,
    can, // Επιστρέφουμε τη συνάρτηση για ad-hoc ελέγχους
    fullMenu,
    dynamicMenu,
    canEdit,
    canManageUsers,
    canDelete,
    canBroadcast,
    canSeeAudit
  };
};
