import React from 'react';
import { UserRole } from '../../core/types';
import { ONBOARDING_DEFAULTS } from '../../core/config';
import { useStore } from '../../store/useStore';
import { useAppState } from '../../hooks/useAppState';
import { useSettingsActions } from '../../hooks/useSettingsActions';
import { Card } from '../ui/Card';
import { Check, X, Info } from 'lucide-react';

interface SecuritySettingsProps {
  activeTab: string;
}

/**
 * SecuritySettings: Διαχειρίζεται τις ρυθμίσεις ασφαλείας.
 */
export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ activeTab }) => {
  const settings = useStore(s => s?.settings);
  const { fullMenu } = useAppState();
  const { updatePermissions } = useSettingsActions();

  if (activeTab !== 'permissions') return null;

  const availableRoles = settings?.availableRoles || ONBOARDING_DEFAULTS.DEFAULT_ROLES;

  const handleUpdatePermission = async (viewId: string, role: UserRole) => {
    const permissions = { ...(settings.rolePermissions || {}) };
    let currentRoles = permissions[viewId] || fullMenu.find(m => m.id === viewId)?.roles || [];
    if (!Array.isArray(currentRoles)) currentRoles = ['ADMIN'];
    let newRoles = [...currentRoles];
    const idx = newRoles.indexOf(role);
    if (role === 'ADMIN' && (viewId === 'maintenance' || viewId === 'users') && idx > -1) return;
    if (idx > -1) newRoles.splice(idx, 1); else newRoles.push(role);
    updatePermissions({ ...permissions, [viewId]: newRoles });
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Permissions Tab Content */}
      {activeTab === 'permissions' && (
        <Card title="ΔΙΑΧΕΙΡΙΣΗ ΔΙΚΑΙΩΜΑΤΩΝ" subtitle="ΟΡΙΣΤΕ ΠΟΙΟΙ ΡΟΛΟΙ ΕΧΟΥΝ ΠΡΟΣΒΑΣΗ ΣΕ ΚΑΘΕ ΛΕΙΤΟΥΡΓΙΑ" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Σελίδα / Λειτουργία</th>
                  {availableRoles.map(role => (
                    <th key={role} className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                <tr className="bg-zinc-50/50">
                  <td colSpan={availableRoles.length + 1} className="px-8 py-3 text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                    Ειδικές Λειτουργίες
                  </td>
                </tr>
                {[
                  { id: 'delete_entry', label: 'Διαγραφή Εγγύησης', defaultRoles: ['ADMIN'] },
                  { id: 'broadcast_notice', label: 'Αποστολή Ανακοίνωσης', defaultRoles: ['ADMIN', 'EMPLOYEE'] },
                  { id: 'auditLog', label: 'Προβολή Ιστορικού', defaultRoles: ['ADMIN', 'EMPLOYEE'] }
                ].map(feature => {
                  const allowedRoles = settings.rolePermissions?.[feature.id] || feature.defaultRoles;
                  return (
                    <tr key={feature.id} className="hover:bg-zinc-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="text-[12px] font-bold text-blue-600 uppercase">{feature.label}</div>
                        <div className="text-[9px] font-bold text-zinc-400 uppercase">ACTION_ID: {feature.id}</div>
                      </td>
                      {availableRoles.map(role => (
                        <td key={role} className="px-8 py-6 text-center">
                          <button 
                            onClick={() => handleUpdatePermission(feature.id, role)}
                            className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center mx-auto border ${
                              allowedRoles.includes(role) 
                                ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm' 
                                : 'bg-zinc-50 text-zinc-300 border-zinc-100'
                            }`}
                          >
                            {allowedRoles.includes(role) ? <Check size={18} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}

                <tr className="bg-zinc-50/50">
                  <td colSpan={availableRoles.length + 1} className="px-8 py-3 text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                    Πρόσβαση σε Σελίδες
                  </td>
                </tr>
                {fullMenu.map(item => {
                  const allowedRoles = settings.rolePermissions?.[item.id] || item.roles || [];
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="text-[12px] font-bold text-zinc-900 uppercase">{item.label}</div>
                        <div className="text-[9px] font-bold text-zinc-400 uppercase">{item.id}</div>
                      </td>
                      {availableRoles.map(role => {
                        const isLockedAdmin = (role === 'ADMIN' && item.id === 'maintenance') || item.id === 'users';
                        return (
                          <td key={role} className="px-8 py-6 text-center">
                            <button 
                              onClick={() => !isLockedAdmin && handleUpdatePermission(item.id, role)}
                              disabled={isLockedAdmin}
                              className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center mx-auto border ${
                                allowedRoles.includes(role) 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' 
                                  : 'bg-zinc-50 text-zinc-300 border-zinc-100'
                              } ${isLockedAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {allowedRoles.includes(role) ? <Check size={18} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="m-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
            <Info size={16} className="text-blue-600 shrink-0" />
            <p className="text-[10px] font-bold text-blue-600 uppercase leading-relaxed italic">
              ΟΙ ΑΛΛΑΓΕΣ ΕΦΑΡΜΟΖΟΝΤΑΙ ΑΜΕΣΑ. Ο ΡΟΛΟΣ ADMIN ΕΧΕΙ ΠΑΝΤΑ ΠΡΟΣΒΑΣΗ ΣΤΗ ΣΥΝΤΗΡΗΣΗ ΚΑΙ ΣΤΟΥΣ ΧΡΗΣΤΕΣ.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
