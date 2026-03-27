import React from 'react';
import { DashboardConfig } from '../../core/types';
import { UI_LIMITS } from '../../core/config';
import { useStore } from '../../store/useStore';
import { useSettingsActions } from '../../hooks/useSettingsActions';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface DashboardSettingsProps {
  activeTab: string;
}

/**
 * DashboardSettings: Επιτρέπει στον Admin να παραμετροποιήσει την εμφάνιση του Dashboard,
 * επιλέγοντας ποια στατιστικά και ποιες καταστάσεις θα εμφανίζονται.
 */
/**
 * DashboardSettings: Επιτρέπει στον Admin να παραμετροποιήσει την εμφάνιση
 * και τα δεδομένα που προβάλλονται στο κεντρικό Dashboard.
 */
export const DashboardSettings: React.FC<DashboardSettingsProps> = ({ activeTab }) => {
  const settings = useStore(s => s?.settings);
  const { updateGarageSettings } = useSettingsActions();
  
  if (activeTab !== 'dashboard') return null;

  const config = settings?.dashboardConfig || {
    globalStats: ['TOTAL', 'PAID'],
    featuredStatuses: [],
    distributionStatuses: [],
    visibleCompanies: [],
    showAuditLog: true
  };

  const updateConfig = async (newConfig: Partial<DashboardConfig>) => {
    await updateGarageSettings({
      dashboardConfig: { ...config, ...newConfig }
    });
  };

  const toggleItem = (list: string[], item: string, max?: number) => {
    if (list.includes(item)) {
      return list.filter(i => i !== item);
    } else {
      const newList = [...list, item];
      return max ? newList.slice(-max) : newList;
    }
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Global Stats */}
      <Card title="GLOBAL DASHBOARD STATS" subtitle="ΕΠΙΛΕΞΤΕ ΠΟΙΑ ΓΕΝΙΚΑ ΣΤΑΤΙΣΤΙΚΑ ΘΑ ΕΜΦΑΝΙΖΟΝΤΑΙ ΣΤΗΝ ΚΟΡΥΦΗ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'TOTAL', label: 'ΣΥΝΟΛΙΚΕΣ ΕΓΓΡΑΦΕΣ', color: 'bg-blue-500' },
            { id: 'PAID', label: 'ΠΟΣΟΣΤΟ ΠΛΗΡΩΜΩΝ', color: 'bg-emerald-500' },
            { id: 'EXPIRING', label: 'ΛΗΓΟΥΝ ΣΥΝΤΟΜΑ', color: 'bg-red-500' }
          ].map(stat => {
            const isSelected = config.globalStats?.includes(stat.id);
            return (
              <button 
                key={stat.id}
                onClick={() => updateConfig({ globalStats: toggleItem(config.globalStats || [], stat.id) })}
                className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${isSelected ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'}`}
              >
                <div className="flex justify-between items-center">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  {isSelected && <Badge variant="success">SELECTED</Badge>}
                </div>
                <div className="text-[11px] font-bold text-zinc-900 uppercase">{stat.label}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Featured Statuses */}
      <Card title="FEATURED DASHBOARD CARDS" subtitle={`ΕΠΙΛΕΞΤΕ ΕΩΣ ${UI_LIMITS.DASHBOARD_FEATURED_STATUSES} ΚΑΤΑΣΤΑΣΕΙΣ ΓΙΑ ΤΙΣ ΚΥΡΙΕΣ ΚΑΡΤΕΣ`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(settings.statusConfigs || {}).map(key => {
            const status = settings.statusConfigs![key];
            const isSelected = config.featuredStatuses?.includes(key);
            return (
              <button 
                key={key}
                onClick={() => updateConfig({ featuredStatuses: toggleItem(config.featuredStatuses || [], key, UI_LIMITS.DASHBOARD_FEATURED_STATUSES) })}
                className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${isSelected ? 'border-blue-600 bg-blue-50/30' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                  {isSelected && <Badge variant="info">SELECTED</Badge>}
                </div>
                <div className="text-[11px] font-bold text-zinc-900 uppercase">{status.label}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Distribution Statuses */}
      <Card title="ΚΑΤΑΝΟΜΗ ΚΑΤΑΣΤΑΣΕΩΝ (CHART)" subtitle="ΕΠΙΛΕΞΤΕ ΠΟΙΕΣ ΚΑΤΑΣΤΑΣΕΙΣ ΘΑ ΕΜΦΑΝΙΖΟΝΤΑΙ ΣΤΟ ΓΡΑΦΗΜΑ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(settings.statusConfigs || {}).map(key => {
            const status = settings.statusConfigs![key];
            const isSelected = config.distributionStatuses?.includes(key);
            return (
              <button 
                key={key}
                onClick={() => updateConfig({ distributionStatuses: toggleItem(config.distributionStatuses || [], key) })}
                className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${isSelected ? 'border-emerald-600 bg-emerald-50/30' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                  {isSelected && <Badge variant="success">VISIBLE</Badge>}
                </div>
                <div className="text-[11px] font-bold text-zinc-900 uppercase">{status.label}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Visible Companies */}
      <Card title="ΕΤΑΙΡΕΙΕΣ ΣΤΟ DASHBOARD" subtitle="ΕΠΙΛΕΞΤΕ ΠΟΙΕΣ ΕΤΑΙΡΕΙΕΣ ΘΑ ΕΜΦΑΝΙΖΟΝΤΑΙ ΣΤΗ ΛΙΣΤΑ TOP">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(settings.companyBrandMap || {}).map(company => {
            const isSelected = config.visibleCompanies?.includes(company);
            return (
              <button 
                key={company}
                onClick={() => updateConfig({ visibleCompanies: toggleItem(config.visibleCompanies || [], company) })}
                className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${isSelected ? 'border-indigo-600 bg-indigo-50/30' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
                  {isSelected && <Badge variant="info">VISIBLE</Badge>}
                </div>
                <div className="text-[11px] font-bold text-zinc-900 uppercase">{company}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Other Dashboard Settings */}
      <Card title="ΕΠΙΠΛΕΟΝ ΡΥΘΜΙΣΕΙΣ" subtitle="ΛΟΙΠΕΣ ΕΠΙΛΟΓΕΣ DASHBOARD">
        <div className="flex items-center justify-between p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
          <div>
            <div className="text-[11px] font-bold text-zinc-900 uppercase">ΕΜΦΑΝΙΣΗ ΠΡΟΣΦΑΤΗΣ ΔΡΑΣΤΗΡΙΟΤΗΤΑΣ (AUDIT LOG)</div>
            <div className="text-[9px] font-bold text-zinc-400 uppercase italic">ΕΜΦΑΝΙΖΕΙ ΤΙΣ ΤΕΛΕΥΤΑΙΕΣ ΕΝΕΡΓΕΙΕΣ ΤΩΝ ΧΡΗΣΤΩΝ</div>
          </div>
          <button 
            onClick={() => updateConfig({ showAuditLog: !config.showAuditLog })}
            className={`w-14 h-8 rounded-full transition-all relative ${config.showAuditLog ? 'bg-zinc-900' : 'bg-zinc-300'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${config.showAuditLog ? 'right-1' : 'left-1'}`}></div>
          </button>
        </div>
      </Card>
    </div>
  );
};
