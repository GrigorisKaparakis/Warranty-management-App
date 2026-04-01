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
    <div className="animate-slide-up space-y-8 pb-32">
      {/* Permissions Tab Content */}
      {activeTab === 'permissions' && (
        <Card title="SECURITY CLEARANCE MATRIX" subtitle="COMMAND PERMISSIONS & ACCESS CONTROL PROTOCOLS" noPadding>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">ENDPOINT / MODULE</th>
                  {availableRoles.map(role => (
                    <th key={role} className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-center">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="bg-blue-600/[0.02]">
                  <td colSpan={availableRoles.length + 1} className="px-8 py-3 text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] italic bg-blue-600/5">
                    CMD: CORE SYSTEM OPERATIONS
                  </td>
                </tr>
                {[
                  { id: 'delete_entry', label: 'PURGE WARRANTY RECORD', defaultRoles: ['ADMIN'] },
                  { id: 'broadcast_notice', label: 'DISPATCH GLOBAL SYSTEM NOTICE', defaultRoles: ['ADMIN', 'EMPLOYEE'] },
                  { id: 'auditLog', label: 'ACCESS SYSTEM AUDIT LOGS', defaultRoles: ['ADMIN', 'EMPLOYEE'] }
                ].map(feature => {
                  const allowedRoles = settings.rolePermissions?.[feature.id] || feature.defaultRoles;
                  return (
                    <tr key={feature.id} className="group hover:bg-white/[0.03] transition-all">
                      <td className="px-8 py-6">
                        <div className="text-[12px] font-black text-blue-400 uppercase tracking-tighter italic">{feature.label}</div>
                        <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest font-mono">ID: {feature.id}</div>
                      </td>
                      {availableRoles.map(role => (
                        <td key={role} className="px-8 py-6 text-center">
                          <button 
                            onClick={() => handleUpdatePermission(feature.id, role)}
                            className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center mx-auto border italic shadow-2xl ${
                              allowedRoles.includes(role) 
                                ? 'bg-blue-600 border-blue-400 text-white shadow-blue-900/40' 
                                : 'bg-slate-950 text-slate-700 border-white/5 hover:border-slate-700'
                            }`}
                          >
                            {allowedRoles.includes(role) ? <Check size={20} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}

                <tr className="bg-emerald-600/[0.02]">
                  <td colSpan={availableRoles.length + 1} className="px-8 py-3 text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] italic bg-emerald-600/5">
                    NAV: INTERFACE LAYER COUPLING
                  </td>
                </tr>
                {fullMenu.map(item => {
                  const allowedRoles = settings.rolePermissions?.[item.id] || item.roles || [];
                  return (
                    <tr key={item.id} className="group hover:bg-white/[0.03] transition-all">
                      <td className="px-8 py-6">
                        <div className="text-[12px] font-black text-white uppercase tracking-tighter italic">{item.label}</div>
                        <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest font-mono">PATH: /{item.id}</div>
                      </td>
                      {availableRoles.map(role => {
                        const isLockedAdmin = (role === 'ADMIN' && item.id === 'maintenance') || item.id === 'users';
                        return (
                          <td key={role} className="px-8 py-6 text-center">
                            <button 
                              onClick={() => !isLockedAdmin && handleUpdatePermission(item.id, role)}
                              disabled={isLockedAdmin}
                              className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center mx-auto border italic shadow-2xl ${
                                allowedRoles.includes(role) 
                                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-900/40' 
                                  : 'bg-slate-950 text-slate-700 border-white/5 hover:border-slate-700'
                              } ${isLockedAdmin ? 'opacity-20 cursor-not-allowed scale-90 grayscale' : ''}`}
                            >
                              {allowedRoles.includes(role) ? <Check size={20} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
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
          <div className="m-8 p-6 glass-dark rounded-[2rem] border border-blue-500/20 flex gap-4 shadow-2xl relative overflow-hidden group/info">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover/info:bg-blue-600/20 transition-all"></div>
            <Info size={20} className="text-blue-500 shrink-0 mt-1" />
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] leading-relaxed italic relative z-10">
              PERMISSIONS ARE UPDATED IN REAL-TIME ACROSS ALL DISTRIBUTED INSTANCES. <br/>
              <span className="text-blue-400 font-black">SECURITY LOCK:</span> 'ADMIN' ROLE MAINTAINS IMMUTABLE CLEARANCE TO MAINTENANCE & USER REGISTRIES.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
