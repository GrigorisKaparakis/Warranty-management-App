import React, { useState } from 'react';
import { MenuItem, UserRole, StatusConfig, GarageSettings } from '../../core/types';
import { ICONS, ONBOARDING_DEFAULTS, DEFAULT_MENU } from '../../core/config';
import { useStore } from '../../store/useStore';
import { toast } from '../../utils/toast';
import { useSettingsActions } from '../../hooks/useSettingsActions';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Trash2, Plus, ArrowUp, ArrowDown, RotateCcw, Zap, Layout, Shield, Settings2, Clock, Info, Save } from 'lucide-react';
import { FirestoreService } from '../../services/firebase/db';

interface AppSettingsProps {
  activeTab: string;
}

/**
 * AppSettings: Διαχειρίζεται τις βασικές ρυθμίσεις της εφαρμογής, όπως το μενού,
 * τις καταστάσεις (workflow), τις εταιρείες και τα όρια του συστήματος.
 */
export const AppSettings: React.FC<AppSettingsProps> = ({ activeTab }) => {
  const settings = useStore(s => s?.settings);
  const { updateMenu, updateStatuses, updateBranding, updateGarageSettings } = useSettingsActions();
  
  const [newMenuItem, setNewMenuItem] = useState<Omit<MenuItem, 'roles'>>({ id: '', label: '', icon: ICONS.dashboard, category: 'main' });
  const [newCompanyInput, setNewCompanyInput] = useState('');
  const [brandInputs, setBrandInputs] = useState<Record<string, string>>({});
  const [newStatusKey, setNewStatusKey] = useState('');
  const [confirmingDeleteKey, setConfirmingDeleteKey] = useState<string | null>(null);
  const [confirmingDeleteCompany, setConfirmingDeleteCompany] = useState<string | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isMigratingStatuses, setIsMigratingStatuses] = useState(false);
  const [migrationCount, setMigrationCount] = useState(0);

  // --- LOCAL STATE FOR BUFFERED UPDATES ---
  const [localBranding, setLocalBranding] = useState(settings.branding);
  const [localLimits, setLocalLimits] = useState(settings.limits);
  const [localThresholds, setLocalThresholds] = useState(settings.expiryThresholds);
  const [localStatuses, setLocalStatuses] = useState(settings.statusConfigs);
  const [localStatusOrder, setLocalStatusOrder] = useState(settings.statusOrder);
  const [localMenu, setLocalMenu] = useState(settings.menuConfig);
  const [localCompanyMap, setLocalCompanyMap] = useState(settings.companyBrandMap);
  const [localExpiryRules, setLocalExpiryRules] = useState(settings.companyExpiryRules);
  
  const [isDirty, setIsDirty] = useState<Record<string, boolean>>({});

  // Sync local state when global settings change (if not dirty)
  React.useEffect(() => {
    if (!isDirty.app_label) setLocalBranding(settings.branding);
  }, [settings.branding, isDirty.app_label]);

  React.useEffect(() => {
    if (!isDirty.app_limits) setLocalLimits(settings.limits);
  }, [settings.limits, isDirty.app_limits]);

  React.useEffect(() => {
    if (!isDirty.expiry_thresholds) setLocalThresholds(settings.expiryThresholds);
  }, [settings.expiryThresholds, isDirty.expiry_thresholds]);

  React.useEffect(() => {
    if (!isDirty.status) {
      setLocalStatuses(settings.statusConfigs);
      setLocalStatusOrder(settings.statusOrder);
    }
  }, [settings.statusConfigs, settings.statusOrder, isDirty.status]);

  React.useEffect(() => {
    if (!isDirty.menu) setLocalMenu(settings.menuConfig);
  }, [settings.menuConfig, isDirty.menu]);

  React.useEffect(() => {
    if (!isDirty.companies) {
      setLocalCompanyMap(settings.companyBrandMap);
      setLocalExpiryRules(settings.companyExpiryRules);
    }
  }, [settings.companyBrandMap, settings.companyExpiryRules, isDirty.companies]);

  if (!['companies', 'status', 'menu', 'app_label', 'dashboard', 'app_limits', 'expiry_thresholds'].includes(activeTab)) return null;

  const availableRoles = settings?.availableRoles || ONBOARDING_DEFAULTS.DEFAULT_ROLES;

  // --- SAVE HANDLERS ---
  const saveSection = async (section: string) => {
    let updates: Partial<GarageSettings> = {};
    
    if (section === 'app_label') updates = { branding: localBranding };
    if (section === 'app_limits') updates = { limits: localLimits };
    if (section === 'expiry_thresholds') updates = { expiryThresholds: localThresholds };
    if (section === 'status') updates = { statusConfigs: localStatuses, statusOrder: localStatusOrder };
    if (section === 'menu') updates = { menuConfig: localMenu };
    if (section === 'companies') updates = { companyBrandMap: localCompanyMap, companyExpiryRules: localExpiryRules };

    const success = await updateGarageSettings(updates);
    if (success) {
      setIsDirty(prev => ({ ...prev, [section]: false }));
    }
  };

  const cancelSection = (section: string) => {
    if (section === 'app_label') setLocalBranding(settings.branding);
    if (section === 'app_limits') setLocalLimits(settings.limits);
    if (section === 'expiry_thresholds') setLocalThresholds(settings.expiryThresholds);
    if (section === 'status') {
      setLocalStatuses(settings.statusConfigs);
      setLocalStatusOrder(settings.statusOrder);
    }
    if (section === 'menu') setLocalMenu(settings.menuConfig);
    if (section === 'companies') {
      setLocalCompanyMap(settings.companyBrandMap);
      setLocalExpiryRules(settings.companyExpiryRules);
    }
    setIsDirty(prev => ({ ...prev, [section]: false }));
  };

  // --- HANDLERS ---

  const handleUpdateMenuItem = (itemId: string, field: string, value: any) => {
    setLocalMenu(prev => (prev || []).map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
    setIsDirty(prev => ({ ...prev, menu: true }));
  };

  const handleAddMenuItem = () => {
    if (!newMenuItem.id || !newMenuItem.label) return;
    if ((localMenu || []).find(m => m.id === newMenuItem.id)) {
      toast.error("Το ID υπάρχει ήδη!");
      return;
    }
    setLocalMenu(prev => [...(prev || []), { ...newMenuItem, roles: ['ADMIN'] } as MenuItem]);
    setNewMenuItem({ id: '', label: '', icon: ICONS.dashboard, category: 'main' });
    setIsDirty(prev => ({ ...prev, menu: true }));
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setLocalMenu(prev => (prev || []).filter(m => m.id !== itemId));
    setIsDirty(prev => ({ ...prev, menu: true }));
  };

  const handleMoveMenu = (itemId: string, direction: 'up' | 'down') => {
    const updated = [...(localMenu || [])];
    const idx = updated.findIndex(m => m.id === itemId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= updated.length) return;
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setLocalMenu(updated);
    setIsDirty(prev => ({ ...prev, menu: true }));
  };

  const handleResetMenu = () => {
    if (!isConfirmingReset) {
      setIsConfirmingReset(true);
      setTimeout(() => setIsConfirmingReset(false), 3000);
      return;
    }
    setLocalMenu(DEFAULT_MENU as MenuItem[]);
    setIsConfirmingReset(false);
    setIsDirty(prev => ({ ...prev, menu: true }));
    toast.success("ΤΟ ΜΕΝΟΥ ΕΠΑΝΑΦΕΡΘΗΚΕ ΤΟΠΙΚΑ. ΠΑΤΗΣΤΕ ΑΠΟΘΗΚΕΥΣΗ.");
  };

  const handleUpdateStatus = (statusKey: string, field: keyof StatusConfig, value: any) => {
    setLocalStatuses(prev => ({
      ...prev,
      [statusKey]: {
        ...prev[statusKey],
        [field]: value
      }
    }));
    setIsDirty(prev => ({ ...prev, status: true }));
  };

  const handleToggleStatusRole = (statusKey: string, role: UserRole) => {
    const roles = [...(localStatuses[statusKey]?.allowedRoles || [])];
    const idx = roles.indexOf(role);
    if (idx > -1) roles.splice(idx, 1); else roles.push(role);
    handleUpdateStatus(statusKey, 'allowedRoles', roles);
  };

  const handleAddStatus = () => {
    if (!newStatusKey) return;
    const key = newStatusKey.trim().toUpperCase().replace(/\s/g, '_');
    if (localStatuses[key]) {
      toast.error("Το κλειδί υπάρχει ήδη!");
      return;
    }
    setLocalStatuses(prev => ({
      ...prev,
      [key]: { label: key, color: '#64748b', allowedRoles: [] }
    }));
    setLocalStatusOrder(prev => [...prev, key]);
    setIsDirty(prev => ({ ...prev, status: true }));
    setNewStatusKey('');
  };

  const handleDeleteStatus = (key: string) => {
    if (confirmingDeleteKey !== key) {
      setConfirmingDeleteKey(key);
      setTimeout(() => setConfirmingDeleteKey(null), 3000);
      return;
    }
    const updated = { ...localStatuses };
    delete updated[key];
    setLocalStatuses(updated);
    setLocalStatusOrder(prev => prev.filter(k => k !== key));
    setIsDirty(prev => ({ ...prev, status: true }));
    setConfirmingDeleteKey(null);
  };

  const handleMoveStatus = (statusKey: string, direction: 'up' | 'down') => {
    const currentOrder = [...localStatusOrder];
    const idx = currentOrder.indexOf(statusKey);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= currentOrder.length) return;
    [currentOrder[idx], currentOrder[newIdx]] = [currentOrder[newIdx], currentOrder[idx]];
    setLocalStatusOrder(currentOrder);
    setIsDirty(prev => ({ ...prev, status: true }));
  };

  const handleMigrateStatuses = async () => {
    setIsMigratingStatuses(true);
    setMigrationCount(0);
    try {
      const mapping: Record<string, string> = {};
      Object.entries(settings.statusConfigs || {}).forEach(([key, conf]) => {
        mapping[conf.label] = key;
      });
      await FirestoreService.migrateStatuses(mapping, (c) => setMigrationCount(c));
      toast.success("ΟΛΟΚΛΗΡΩΘΗΚΕ!");
    } catch (e) {
      toast.error("ΣΦΑΛΜΑ");
    } finally {
      setIsMigratingStatuses(false);
    }
  };

  const handleUpdateCompanies = (company: string, brands: string[]) => {
    setLocalCompanyMap(prev => ({ ...prev, [company]: brands }));
    setIsDirty(prev => ({ ...prev, companies: true }));
  };

  const addBrandToCompany = (company: string) => {
    const brandName = (brandInputs[company] || '').trim().toUpperCase();
    if (!brandName) return;
    const currentBrands = localCompanyMap[company] || [];
    if (currentBrands.includes(brandName)) {
      toast.error("Η μάρκα υπάρχει ήδη!");
      return;
    }
    handleUpdateCompanies(company, [...currentBrands, brandName]);
    setBrandInputs(prev => ({ ...prev, [company]: '' }));
  };

  const removeCompany = (company: string) => {
    if (confirmingDeleteCompany !== company) {
      setConfirmingDeleteCompany(company);
      setTimeout(() => setConfirmingDeleteCompany(null), 3000);
      return;
    }
    const newMap = { ...localCompanyMap };
    delete newMap[company];
    const newRules = { ...localExpiryRules };
    delete newRules[company];
    
    setLocalCompanyMap(newMap);
    setLocalExpiryRules(newRules);
    setIsDirty(prev => ({ ...prev, companies: true }));
    setConfirmingDeleteCompany(null);
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Status Tab Content */}
      {activeTab === 'status' && (
        <Card 
          title="WORKFLOW & STATUS EDITOR" 
          subtitle="ΔΙΑΧΕΙΡΙΣΗ ΤΩΝ ΣΤΑΔΙΩΝ ΤΗΣ ΕΓΓΥΗΣΗΣ"
          actions={
            <div className="flex items-center gap-2">
              {isDirty.status && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => cancelSection('status')}>ΑΚΥΡΩΣΗ</Button>
                  <Button variant="primary" size="sm" icon={Save} onClick={() => saveSection('status')}>ΑΠΟΘΗΚΕΥΣΗ</Button>
                </>
              )}
              <Button 
                variant="secondary" 
                size="sm" 
                icon={RotateCcw}
                onClick={handleMigrateStatuses}
                loading={isMigratingStatuses}
              >
                {isMigratingStatuses ? `ΣΥΓΧΡΟΝΙΣΜΟΣ (${migrationCount})...` : 'ΔΙΟΡΘΩΣΗ ΠΑΛΙΩΝ STATUS'}
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="flex gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <input 
                type="text" 
                placeholder="ΝΕΟ ΚΛΕΙΔΙ (Π.Χ. WAITING_PARTS)..." 
                value={newStatusKey}
                onChange={e => setNewStatusKey(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-zinc-200 rounded-xl font-bold outline-none text-sm"
              />
              <Button onClick={handleAddStatus} icon={Plus} size="sm">ΠΡΟΣΘΗΚΗ</Button>
            </div>

            <div className="space-y-3">
              {localStatusOrder.map((key, idx, arr) => {
                const config = localStatuses[key];
                if (!config) return null;
                return (
                  <div key={key} className="flex items-center gap-4 p-4 bg-white border border-zinc-100 rounded-xl hover:border-zinc-200 transition-all group">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleMoveStatus(key, 'up')} disabled={idx === 0} className="text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowUp size={14} /></button>
                      <button onClick={() => handleMoveStatus(key, 'down')} disabled={idx === arr.length - 1} className="text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowDown size={14} /></button>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">ΚΛΕΙΔΙ: {key}</div>
                        <input type="text" value={config.label} onChange={(e) => handleUpdateStatus(key, 'label', e.target.value)} className="w-full bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-lg text-sm font-bold outline-none focus:bg-white" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">ΧΡΩΜΑ</div>
                        <div className="flex items-center gap-2">
                          <input type="color" value={config.color} onChange={(e) => handleUpdateStatus(key, 'color', e.target.value)} className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                          <span className="text-xs font-mono text-zinc-500">{config.color}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">ΠΡΟΣΒΑΣΗ ΡΟΛΩΝ</div>
                        <div className="flex flex-wrap gap-1">
                          {availableRoles.map(role => (
                            <button 
                              key={role} 
                              onClick={() => handleToggleStatusRole(key, role)} 
                              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${config.allowedRoles?.includes(role) ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      icon={Trash2}
                      onClick={() => handleDeleteStatus(key)}
                    >
                      {confirmingDeleteKey === key ? 'ΕΠΙΒΕΒΑΙΩΣΗ' : ''}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Menu Tab Content */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <Card 
            title="ΠΡΟΣΘΗΚΗ ΝΕΟΥ VIEW" 
            subtitle="ΕΠΙΛΕΞΤΕ ΑΠΟ ΤΑ ΠΡΟΚΑΘΟΡΙΣΜΕΝΑ TEMPLATES Η ΔΗΜΙΟΥΡΓΗΣΤΕ ΔΙΚΟ ΣΑΣ"
            actions={
              isDirty.menu && (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => cancelSection('menu')}>ΑΚΥΡΩΣΗ</Button>
                  <Button variant="primary" size="sm" icon={Save} onClick={() => saveSection('menu')}>ΑΠΟΘΗΚΕΥΣΗ</Button>
                </div>
              )
            }
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">ΠΡΟΤΥΠΟ (TEMPLATE)</label>
                  <select 
                    onChange={e => {
                      const val = e.target.value;
                      if (!val) return;
                      
                      if (val.startsWith('STATUS_')) {
                        const statusKey = val.replace('STATUS_', '');
                        const config = localStatuses[statusKey];
                        setNewMenuItem({
                          id: `warranty/view/${statusKey}`,
                          label: config?.label || statusKey,
                          icon: ICONS.all,
                          category: 'views'
                        });
                      } else {
                        const template = (DEFAULT_MENU as MenuItem[]).find(m => m.id === val);
                        if (template) {
                          setNewMenuItem({
                            id: template.id,
                            label: template.label,
                            icon: template.icon,
                            category: template.category || (['dashboard', 'entry', 'all'].includes(template.id) ? 'main' : 'views')
                          });
                        }
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                  >
                    <option value="">ΕΠΙΛΕΞΤΕ ΠΡΟΤΥΠΟ...</option>
                    <optgroup label="ΒΑΣΙΚΕΣ ΣΕΛΙΔΕΣ">
                      {(DEFAULT_MENU as MenuItem[]).map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="ΠΡΟΒΟΛΕΣ ΚΑΤΑΣΤΑΣΕΩΝ (STATUS VIEWS)">
                      {Object.entries(localStatuses).map(([key, config]) => (
                        <option key={key} value={`STATUS_${key}`}>{config.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="flex items-end">
                  <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                    Επιλέξτε ένα πρότυπο για να συμπληρωθούν αυτόματα τα πεδία. Μπορείτε να τα τροποποιήσετε στη συνέχεια.
                  </p>
                </div>
              </div>

              <div className="h-px bg-zinc-100" />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block ml-1">ID / PATH</label>
                  <input 
                    type="text" 
                    placeholder="π.χ. reports"
                    value={newMenuItem.id} 
                    onChange={e => setNewMenuItem({...newMenuItem, id: e.target.value.trim()})} 
                    className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold outline-none text-xs focus:ring-2 focus:ring-zinc-900/5 transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block ml-1">ΕΤΙΚΕΤΑ</label>
                  <input 
                    type="text" 
                    placeholder="π.χ. ΑΝΑΦΟΡΕΣ"
                    value={newMenuItem.label} 
                    onChange={e => setNewMenuItem({...newMenuItem, label: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold outline-none text-xs focus:ring-2 focus:ring-zinc-900/5 transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block ml-1">ΕΙΚΟΝΙΔΙΟ</label>
                  <select 
                    value={newMenuItem.icon} 
                    onChange={e => setNewMenuItem({...newMenuItem, icon: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold outline-none text-xs focus:ring-2 focus:ring-zinc-900/5 transition-all"
                  >
                    {Object.keys(ICONS).map(key => <option key={key} value={ICONS[key]}>{key}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block ml-1">ΚΑΤΗΓΟΡΙΑ</label>
                  <select 
                    value={newMenuItem.category} 
                    onChange={e => setNewMenuItem({...newMenuItem, category: e.target.value as any})} 
                    className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold outline-none text-xs focus:ring-2 focus:ring-zinc-900/5 transition-all"
                  >
                    <option value="main">MAIN (ΠΑΝΩ)</option>
                    <option value="views">VIEWS (ΜΕΣΗ)</option>
                    <option value="admin">ADMIN (ΚΑΤΩ)</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleAddMenuItem} icon={Plus} className="w-full py-4">ΠΡΟΣΘΗΚΗ ΣΤΟ ΜΕΝΟΥ</Button>
            </div>
          </Card>

          <Card 
            title="EDITOR ΜΕΝΟΥ" 
            subtitle="ΔΙΑΧΕΙΡΙΣΗ ΣΕΙΡΑΣ ΚΑΙ ΡΥΘΜΙΣΕΩΝ ΜΕΝΟΥ"
            actions={
              <div className="flex items-center gap-2">
                <Button 
                  variant={isConfirmingReset ? "danger" : "secondary"} 
                  size="sm" 
                  icon={RotateCcw} 
                  onClick={handleResetMenu}
                >
                  {isConfirmingReset ? 'ΕΠΙΒΕΒΑΙΩΣΗ ΕΠΑΝΑΦΟΡΑΣ;' : 'ΕΠΑΝΑΦΟΡΑ'}
                </Button>
              </div>
            }
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 border-b border-zinc-100">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ΣΕΙΡΑ</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ICON</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">CATEGORY</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">LABEL</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ΕΝΕΡΓΕΙΕΣ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {localMenu.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => handleMoveMenu(item.id, 'up')} disabled={idx === 0} className="text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowUp size={12} /></button>
                          <button onClick={() => handleMoveMenu(item.id, 'down')} disabled={idx === localMenu.length - 1} className="text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowDown size={12} /></button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select value={item.icon} onChange={(e) => handleUpdateMenuItem(item.id, 'icon', e.target.value)} className="bg-transparent border-0 text-xs font-bold outline-none cursor-pointer">
                          {Object.keys(ICONS).map(key => <option key={key} value={ICONS[key]}>{key}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select value={item.category || 'main'} onChange={(e) => handleUpdateMenuItem(item.id, 'category', e.target.value)} className="bg-transparent border-0 text-xs font-bold outline-none cursor-pointer">
                          <option value="main">MAIN</option>
                          <option value="views">VIEWS</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-zinc-900">{item.id}</td>
                      <td className="px-6 py-4">
                        <input type="text" value={item.label} onChange={(e) => handleUpdateMenuItem(item.id, 'label', e.target.value)} className="bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-lg text-xs font-bold w-full outline-none focus:bg-white" />
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDeleteMenuItem(item.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Companies Tab Content */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <Card 
            title="ΠΡΟΣΘΗΚΗ ΕΤΑΙΡΕΙΑΣ" 
            subtitle="ΟΡΙΣΤΕ ΝΕΟΥΣ ΔΙΑΝΟΜΕΙΣ"
            actions={
              isDirty.companies && (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => cancelSection('companies')}>ΑΚΥΡΩΣΗ</Button>
                  <Button variant="primary" size="sm" icon={Save} onClick={() => saveSection('companies')}>ΑΠΟΘΗΚΕΥΣΗ</Button>
                </div>
              )
            }
          >
            <div className="flex gap-4">
              <input type="text" placeholder="ΟΝΟΜΑ ΕΤΑΙΡΕΙΑΣ..." value={newCompanyInput} onChange={e => setNewCompanyInput(e.target.value)} className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl font-bold outline-none text-sm" />
              <Button onClick={() => { if (newCompanyInput.trim()) { handleUpdateCompanies(newCompanyInput.trim().toUpperCase(), []); setNewCompanyInput(''); } }} icon={Plus}>ΠΡΟΣΘΗΚΗ</Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(localCompanyMap).map(([company, brands]) => (
              <Card 
                key={company} 
                title={company} 
                actions={
                  <button 
                    onClick={() => removeCompany(company)} 
                    className={`transition-all ${confirmingDeleteCompany === company ? 'text-red-600 animate-pulse' : 'text-zinc-400 hover:text-red-500'}`}
                  >
                    {confirmingDeleteCompany === company ? <span className="text-[10px] font-black uppercase">ΕΠΙΒΕΒΑΙΩΣΗ;</span> : <Trash2 size={16} />}
                  </button>
                }
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {(brands as string[]).map((b, i) => (
                      <Badge key={i} variant="info" className="gap-1">
                        {b}
                        <button onClick={() => handleUpdateCompanies(company, (brands as string[]).filter((_, idx) => idx !== i))} className="hover:text-red-500">×</button>
                      </Badge>
                    ))}
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">ΚΑΝΟΝΑΣ ΛΗΞΗΣ</label>
                    <select 
                      value={localExpiryRules?.[company] || ''} 
                      onChange={(e) => {
                        setLocalExpiryRules(prev => ({ ...prev, [company]: e.target.value }));
                        setIsDirty(prev => ({ ...prev, companies: true }));
                      }}
                      className="w-full bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold outline-none"
                    >
                      <option value="">ΧΩΡΙΣ ΚΑΝΟΝΑ</option>
                      <option value="END_OF_NEXT_MONTH">ΤΕΛΟΣ ΕΠΟΜΕΝΟΥ ΜΗΝΑ</option>
                      <option value="3 months">3 ΜΗΝΕΣ</option>
                      <option value="6 months">6 ΜΗΝΕΣ</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input type="text" placeholder="+ ΜΑΡΚΑ" value={brandInputs[company] || ''} onChange={(e) => setBrandInputs(prev => ({ ...prev, [company]: e.target.value.toUpperCase() }))} className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold outline-none focus:bg-white" />
                    <Button size="sm" onClick={() => addBrandToCompany(company)} icon={Plus} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* App Label Tab Content */}
      {activeTab === 'app_label' && (
        <Card 
          title="BRANDING & LABELS" 
          subtitle="ΔΙΑΜΟΡΦΩΣΗ ΤΗΣ ΟΠΤΙΚΗΣ ΤΑΥΤΟΤΗΤΑΣ"
          actions={
            isDirty.app_label && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => cancelSection('app_label')}>ΑΚΥΡΩΣΗ</Button>
                <Button variant="primary" size="sm" icon={Save} onClick={() => saveSection('app_label')}>ΑΠΟΘΗΚΕΥΣΗ</Button>
              </div>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900">
                <Layout size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">ΕΠΩΝΥΜΙΑ ΕΠΙΧΕΙΡΗΣΗΣ</h4>
              </div>
              <input 
                type="text" 
                value={localBranding?.appName || ''} 
                onChange={e => {
                  setLocalBranding(prev => ({ ...prev, appName: e.target.value }));
                  setIsDirty(prev => ({ ...prev, app_label: true }));
                }} 
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl font-bold outline-none text-sm focus:bg-white" 
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900">
                <Zap size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">LOGO (TEXT)</h4>
              </div>
              <input 
                type="text" 
                value={localBranding?.logoText || ''} 
                onChange={e => {
                  setLocalBranding(prev => ({ ...prev, logoText: e.target.value }));
                  setIsDirty(prev => ({ ...prev, app_label: true }));
                }} 
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl font-bold outline-none text-sm focus:bg-white" 
              />
            </div>
          </div>
        </Card>
      )}

      {/* App Limits Tab Content */}
      {activeTab === 'app_limits' && (
        <Card 
          title="APP PERFORMANCE LIMITS" 
          subtitle="ΔΙΑΧΕΙΡΙΣΗ ΟΡΙΩΝ ΑΠΟΔΟΣΗΣ"
          actions={
            isDirty.app_limits && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => cancelSection('app_limits')}>ΑΚΥΡΩΣΗ</Button>
                <Button variant="primary" size="sm" icon={Save} onClick={() => saveSection('app_limits')}>ΑΠΟΘΗΚΕΥΣΗ</Button>
              </div>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'FETCH LIMIT', key: 'fetchLimit', icon: Settings2, desc: 'ΜΕΓΙΣΤΟΣ ΑΡΙΘΜΟΣ ΕΓΓΥΗΣΕΩΝ' },
              { label: 'INVENTORY PAGE SIZE', key: 'inventoryPageSize', icon: Layout, desc: 'ΕΓΓΡΑΦΕΣ ΑΝΑ ΣΕΛΙΔΑ' },
              { label: 'AI CHAT HISTORY', key: 'aiChatHistoryLimit', icon: Info, desc: 'ΜΗΝΥΜΑΤΑ ΣΤΟ ΙΣΤΟΡΙΚΟ' },
              { label: 'DASHBOARD LOGS', key: 'dashboardAuditLogs', icon: Shield, desc: 'ΠΡΟΣΦΑΤΕΣ ΕΝΕΡΓΕΙΕΣ' },
              { label: 'AUDIT LOG FETCH', key: 'auditLogFetchLimit', icon: Shield, desc: 'ΣΥΝΟΛΙΚΑ LOGS' },
            ].map((limit) => (
              <div key={limit.key} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <limit.icon size={14} />
                  <label className="text-[10px] font-bold uppercase tracking-wider">{limit.label}</label>
                </div>
                <input 
                  type="number" 
                  value={(localLimits as any)?.[limit.key] || 0} 
                  onChange={e => {
                    setLocalLimits(prev => ({ 
                      ...prev, 
                      [limit.key]: parseInt(e.target.value) || 0 
                    }));
                    setIsDirty(prev => ({ ...prev, app_limits: true }));
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg font-bold text-sm outline-none"
                />
                <p className="text-[9px] text-zinc-400 italic">{limit.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Expiry Thresholds Tab Content */}
      {activeTab === 'expiry_thresholds' && (
        <Card 
          title="ΠΑΡΑΜΕΤΡΟΠΟΙΗΣΗ ΛΗΞΕΩΝ" 
          subtitle="ΟΡΙΣΤΕ ΤΑ ΧΡΟΝΙΚΑ ΟΡΙΑ ΕΙΔΟΠΟΙΗΣΕΩΝ (ΣΕ ΗΜΕΡΕΣ)"
          actions={
            isDirty.expiry_thresholds && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => cancelSection('expiry_thresholds')}>ΑΚΥΡΩΣΗ</Button>
                <Button variant="primary" size="sm" icon={Save} onClick={() => saveSection('expiry_thresholds')}>ΑΠΟΘΗΚΕΥΣΗ</Button>
              </div>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'ΚΡΙΣΙΜΗ ΛΗΞΗ', key: 'criticalDays', color: 'text-red-500', icon: Clock },
              { label: 'ΠΡΟΕΙΔΟΠΟΙΗΣΗ', key: 'warningDays', color: 'text-amber-500', icon: Clock },
              { label: 'ΣΥΝΤΟΜΑ', key: 'soonDays', color: 'text-blue-500', icon: Clock },
            ].map((t) => (
              <div key={t.key} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <t.icon size={14} />
                  <label className="text-[10px] font-bold uppercase tracking-wider">{t.label}</label>
                </div>
                <input 
                  type="number" 
                  value={(localThresholds as any)?.[t.key] ?? 0} 
                  onChange={e => {
                    setLocalThresholds(prev => ({ 
                      ...(prev || { warningDays: 10, criticalDays: 7, soonDays: 30 }), 
                      [t.key]: parseInt(e.target.value) || 0 
                    }));
                    setIsDirty(prev => ({ ...prev, expiry_thresholds: true }));
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg font-bold text-sm outline-none"
                />
                <p className={`text-[9px] font-bold uppercase ${t.color}`}>ΕΝΔΕΙΞΗ {t.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
