import React, { useState } from 'react';
import { ONBOARDING_DEFAULTS } from '../../core/config';
import { useStore } from '../../store/useStore';
import { useSettingsActions } from '../../hooks/useSettingsActions';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Plus, Trash2 } from 'lucide-react';

interface RolesSettingsProps {
  activeTab: string;
}

/**
 * RolesSettings: Διαχειρίζεται τους διαθέσιμους ρόλους χρηστών στο σύστημα.
 */
export const RolesSettings: React.FC<RolesSettingsProps> = ({ activeTab }) => {
  const settings = useStore(s => s?.settings);
  const { updateGarageSettings } = useSettingsActions();
  const [newRole, setNewRole] = useState('');
  const [confirmingDeleteRole, setConfirmingDeleteRole] = useState<string | null>(null);

  if (activeTab !== 'roles') return null;

  const availableRoles = settings?.availableRoles || ONBOARDING_DEFAULTS.DEFAULT_ROLES;

  const handleUpdateRoles = async (updatedRoles: string[]) => {
    const currentSettings = { ...settings };
    
    // Cleanup permissions for removed roles
    if (currentSettings.rolePermissions) {
      const newPermissions: Record<string, string[]> = {};
      Object.entries(currentSettings.rolePermissions as Record<string, string[]>).forEach(([key, roles]) => {
        newPermissions[key] = roles.filter(r => updatedRoles.includes(r));
      });
      currentSettings.rolePermissions = newPermissions;
    }

    if (currentSettings.statusConfigs) {
      const newStatusConfigs: Record<string, any> = {};
      Object.entries(currentSettings.statusConfigs).forEach(([key, config]) => {
        newStatusConfigs[key] = {
          ...config,
          allowedRoles: (config.allowedRoles || []).filter(r => updatedRoles.includes(r))
        };
      });
      currentSettings.statusConfigs = newStatusConfigs;
    }

    if (currentSettings.menuConfig) {
      currentSettings.menuConfig = currentSettings.menuConfig.map(item => ({
        ...item,
        roles: (item.roles || []).filter(r => updatedRoles.includes(r))
      }));
    }

    await updateGarageSettings({ 
      ...currentSettings, 
      availableRoles: updatedRoles 
    });
  };

  const handleAddRole = () => {
    const val = newRole.trim().toUpperCase();
    if (val && !availableRoles.includes(val)) {
      handleUpdateRoles([...availableRoles, val]);
      setNewRole('');
    }
  };

  const handleDeleteRole = (role: string) => {
    if (confirmingDeleteRole !== role) {
      setConfirmingDeleteRole(role);
      setTimeout(() => setConfirmingDeleteRole(null), 3000);
      return;
    }
    handleUpdateRoles(availableRoles.filter(r => r !== role));
    setConfirmingDeleteRole(null);
  };

  return (
    <Card title="ΔΙΑΘΕΣΙΜΟΙ ΡΟΛΟΙ ΣΥΣΤΗΜΑΤΟΣ" subtitle="ΔΙΑΧΕΙΡΙΣΗ ΡΟΛΩΝ ΧΡΗΣΤΩΝ ΓΙΑ ΤΟΝ ΕΛΕΓΧΟ ΠΡΟΣΒΑΣΗΣ">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {availableRoles.map(role => (
            <Badge 
              key={role} 
              variant={role === 'ADMIN' ? 'success' : (confirmingDeleteRole === role ? 'danger' : 'neutral')} 
              className={`px-4 py-2 text-[10px] font-bold gap-2 transition-all ${confirmingDeleteRole === role ? 'animate-pulse' : ''}`}
            >
              {confirmingDeleteRole === role ? 'ΕΠΙΒΕΒΑΙΩΣΗ;' : role}
              {role !== 'ADMIN' && (
                <button 
                  onClick={() => handleDeleteRole(role)}
                  className="hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </Badge>
          ))}
        </div>

        <div className="flex gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
          <input 
            type="text" 
            placeholder="ΝΕΟΣ ΡΟΛΟΣ (Π.Χ. MANAGER)..." 
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            className="flex-1 px-4 py-2 bg-white border border-zinc-200 rounded-xl font-bold outline-none text-sm" 
          />
          <Button onClick={handleAddRole} icon={Plus}>ΠΡΟΣΘΗΚΗ ΡΟΛΟΥ</Button>
        </div>
      </div>
    </Card>
  );
};
