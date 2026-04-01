import React, { useState } from 'react';
import { ONBOARDING_DEFAULTS } from '../../core/config';
import { useStore } from '../../store/useStore';
import { useSettingsActions } from '../../hooks/useSettingsActions';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Plus, Trash2, Shield } from 'lucide-react';

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
    <Card 
      title="CLEARANCE PROTOCOLS" 
      subtitle="MANAGE SYSTEM ACCESS ROLES & SECURITY CLEARANCE"
    >
      <div className="space-y-8 pt-4">
        <div className="flex flex-wrap gap-3 p-6 bg-slate-950/50 rounded-[2rem] border border-white/5 shadow-inner min-h-[80px] items-center">
          {availableRoles.map(role => (
            <div 
              key={role} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all group/role ${role === 'ADMIN' ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : (confirmingDeleteRole === role ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300')}`}
            >
              <Shield size={12} className={role === 'ADMIN' ? 'text-blue-200' : 'text-slate-600 group-hover/role:text-blue-400'} />
              {confirmingDeleteRole === role ? 'CONFIRM PURGE?' : role}
              {role !== 'ADMIN' && (
                <button 
                  onClick={() => handleDeleteRole(role)}
                  className="w-5 h-5 flex items-center justify-center rounded-md bg-white/5 hover:bg-red-500 hover:text-white transition-all ml-1"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 p-6 bg-slate-950 rounded-[2.5rem] border border-white/5 shadow-2xl group/add">
          <input 
            type="text" 
            placeholder="REGISTER NEW SECURITY ROLE (E.G. MANAGER)..." 
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            className="flex-1 px-6 py-4 bg-slate-900 border border-white/5 rounded-2xl font-black text-sm text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-800 uppercase" 
          />
          <button 
            onClick={handleAddRole}
            className="px-8 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-2xl shadow-blue-900/40 italic"
          >
            <Plus size={18} />
            AUTHORIZE
          </button>
        </div>
      </div>
    </Card>
  );
};
