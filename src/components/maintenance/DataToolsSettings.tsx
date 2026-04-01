import React, { useState, useEffect } from 'react';
import { FirestoreService } from '../../services/firebase/db';
import { useStore } from '../../store/useStore';
import { toast } from '../../utils/toast';
import { useSettingsActions } from '../../hooks/useSettingsActions';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RefreshCw, Database, FileText, Info } from 'lucide-react';

interface DataToolsSettingsProps {
  activeTab: string;
}

/**
 * DataToolsSettings: Παρέχει εργαλεία για μαζικές λειτουργίες δεδομένων,
 * όπως η ενημέρωση ημερομηνιών λήξης και ο συγχρονισμός ανταλλακτικών.
 */
export const DataToolsSettings: React.FC<DataToolsSettingsProps> = ({ activeTab }) => {
  const settings = useStore(s => s?.settings);
  const { updateExpiryRules } = useSettingsActions();
  
  const [companyExpiryRulesUI, setCompanyExpiryRulesUI] = useState<Record<string, string>>({});
  const [overwriteExistingExpiry, setOverwriteExistingExpiry] = useState(false);
  
  const [isMigratingExpiry, setIsMigratingExpiry] = useState(false);
  const [expiryMigrationCount, setExpiryMigrationCount] = useState(0);
  
  const [isMigratingNotes, setIsMigratingNotes] = useState(false);
  const [notesMigrationCount, setNotesMigrationCount] = useState(0);

  useEffect(() => {
    if (settings?.companyExpiryRules) {
      setCompanyExpiryRulesUI({ ...settings.companyExpiryRules });
    }
  }, [settings?.companyExpiryRules]);

  const handleUpdateExpiryRule = async (company: string, rule: string) => {
    const currentRules = { ...(settings.companyExpiryRules || {}) };
    if (!rule) {
      delete currentRules[company];
    } else {
      currentRules[company] = rule;
    }
    await updateExpiryRules(currentRules);
    toast.success("Ο ΚΑΝΟΝΑΣ ΛΗΞΗΣ ΕΝΗΜΕΡΩΘΗΚΕ!");
  };

  const handleMigrateExpiryDates = async () => {
    setIsMigratingExpiry(true);
    setExpiryMigrationCount(0);
    try {
      const count = await FirestoreService.migrateExpiryDates(settings.companyExpiryRules || {}, overwriteExistingExpiry, (c) => setExpiryMigrationCount(c));
      toast.success(`ΕΝΗΜΕΡΩΘΗΚΑΝ ${count} ΕΓΓΥΗΣΕΙΣ!`);
    } catch (e: any) {
      toast.error("ΣΦΑΛΜΑ MIGRATION");
    } finally {
      setIsMigratingExpiry(false);
    }
  };

  const handleMigrateNotes = async () => {
    setIsMigratingNotes(true);
    setNotesMigrationCount(0);
    try {
      const count = await FirestoreService.migrateNotesToLogFormat((c) => setNotesMigrationCount(c));
      toast.success(`ΜΕΤΑΤΡΑΠΗΚΑΝ ${count} ΕΓΓΡΑΦΕΣ!`);
    } catch (e: any) {
      toast.error("ΣΦΑΛΜΑ ΜΕΤΑΤΡΟΠΗΣ");
    } finally {
      setIsMigratingNotes(false);
    }
  };

  if (activeTab !== 'dataTools') return null;

  return (
    <div className="animate-slide-up space-y-12 pb-32">
      <Card title="BULK TEMPORAL ALIGNMENT" subtitle="ORCHESTRATE DATA MIGRATION & EXPIRY CALIBRATION">
        <div className="space-y-10 pt-4">
          <div className="p-6 glass-dark rounded-[2rem] border border-blue-500/20 flex gap-4 shadow-2xl relative overflow-hidden group/info">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover/info:bg-blue-600/20 transition-all"></div>
            <Info size={20} className="text-blue-500 shrink-0 mt-1" />
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] leading-relaxed italic relative z-10">
              <span className="text-blue-400">DATA INTEGRITY WARNING:</span> THIS TOOL WILL RECALCULATE EXPIRY VECTORS ONLY FOR ACTIVE, UNPAID WARRANTY RECORDS. 
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">ENTITY-SPECIFIC CALCULATION RULES</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(settings.companyBrandMap || {}).map((company) => (
                <div key={company} className="flex items-center gap-4 p-5 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all group/item shadow-inner">
                  <span className="text-[11px] font-black text-blue-400 w-32 truncate uppercase tracking-tighter italic">{company}</span>
                  <select
                    value={companyExpiryRulesUI[company] || ''}
                    onChange={(e) => setCompanyExpiryRulesUI(prev => ({ ...prev, [company]: e.target.value }))}
                    className="flex-1 bg-slate-900 border border-white/5 px-4 py-2.5 rounded-xl text-[11px] font-black text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-950">NO CALCULATION RULE</option>
                    <option value="3 months" className="bg-slate-950">QUARTERLY (90D)</option>
                    <option value="6 months" className="bg-slate-950">BI-ANNUAL (180D)</option>
                    <option value="END_OF_NEXT_MONTH" className="bg-slate-950">EOM + 30D OFFSET</option>
                  </select>
                  <button 
                    onClick={() => handleUpdateExpiryRule(company, companyExpiryRulesUI[company] || '')}
                    className="h-10 px-6 rounded-xl bg-white/5 text-blue-400 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-black/20 italic"
                  >
                    SYNC
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <label className="flex items-center gap-4 cursor-pointer group/toggle">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={overwriteExistingExpiry}
                  onChange={(e) => setOverwriteExistingExpiry(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-14 h-7 bg-slate-900 rounded-full peer-checked:bg-blue-600 transition-all border border-white/5 shadow-inner"></div>
                <div className="absolute left-1.5 top-1.5 w-4 h-4 bg-slate-500 rounded-full transition-all peer-checked:translate-x-7 peer-checked:bg-white shadow-xl"></div>
              </div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover/toggle:text-white transition-colors italic">OVERWRITE EXISTING DATA VECTORS</span>
            </label>

            <button 
              onClick={handleMigrateExpiryDates}
              disabled={isMigratingExpiry}
              className="h-16 px-10 bg-blue-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 border-none italic disabled:opacity-50"
            >
              {isMigratingExpiry ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  SYNCING ({expiryMigrationCount})
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  EXECUTE BULK ALIGNMENT
                </>
              )}
            </button>
          </div>
        </div>
      </Card>

      <Card title="DATA PURIFICATION" subtitle="NORMALIZE ANALOG NOTES INTO STRUCTURED AUDIT LOGS">
        <div className="space-y-8 pt-4">
          <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 flex gap-4 shadow-inner">
            <FileText size={20} className="text-slate-700 shrink-0 mt-1" />
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-relaxed italic">
              CONVERTS LEGACY UNSTRUCTURED COMMENTS INTO TEMPORALLY TRACKED LOG ENTRY NODES WITH USER ATTRIBUTION.
            </p>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleMigrateNotes}
              disabled={isMigratingNotes}
              className="h-14 px-8 bg-slate-900 text-slate-400 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-3 border border-white/5 italic disabled:opacity-50 shadow-2xl"
            >
              {isMigratingNotes ? (
                <>
                  <Database size={16} className="animate-pulse text-blue-500" />
                  NORMALIZING ({notesMigrationCount})
                </>
              ) : (
                <>
                  <Database size={16} />
                  INITIATE PURIFICATION
                </>
              )}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
