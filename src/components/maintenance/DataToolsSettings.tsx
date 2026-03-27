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
    <div className="animate-slide-up space-y-6">
      <Card title="ΜΑΖΙΚΗ ΕΝΗΜΕΡΩΣΗ ΗΜΕΡΟΜΗΝΙΩΝ ΛΗΞΗΣ" subtitle="ΔΙΑΧΕΙΡΙΣΗ ΚΑΙ ΕΦΑΡΜΟΓΗ ΚΑΝΟΝΩΝ ΛΗΞΗΣ">
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
            <Info size={16} className="text-blue-600 shrink-0" />
            <p className="text-[10px] font-bold text-blue-600 uppercase leading-relaxed italic">
              ΑΥΤΟ ΤΟ ΕΡΓΑΛΕΙΟ ΘΑ ΕΝΗΜΕΡΩΣΕΙ ΤΙΣ ΗΜΕΡΟΜΗΝΙΕΣ ΛΗΞΗΣ ΜΟΝΟ ΓΙΑ ΤΙΣ ΕΝΕΡΓΕΣ ΕΓΓΥΗΣΕΙΣ ΠΟΥ ΔΕΝ ΕΙΝΑΙ ΠΛΗΡΩΜΕΝΕΣ.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ΚΑΝΟΝΕΣ ΛΗΞΗΣ ΑΝΑ ΕΤΑΙΡΕΙΑ</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(settings.companyBrandMap || {}).map((company) => (
                <div key={company} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="text-[11px] font-bold text-zinc-900 w-24 truncate">{company}</span>
                  <select
                    value={companyExpiryRulesUI[company] || ''}
                    onChange={(e) => setCompanyExpiryRulesUI(prev => ({ ...prev, [company]: e.target.value }))}
                    className="flex-1 bg-white border border-zinc-200 px-2 py-1.5 rounded-lg text-xs font-bold outline-none"
                  >
                    <option value="">ΧΩΡΙΣ ΚΑΝΟΝΑ</option>
                    <option value="3 months">3 ΜΗΝΕΣ</option>
                    <option value="6 months">6 ΜΗΝΕΣ</option>
                    <option value="END_OF_NEXT_MONTH">ΤΕΛΟΣ ΕΠΟΜΕΝΟΥ ΜΗΝΑ</option>
                  </select>
                  <Button 
                    size="sm" 
                    variant="neutral" 
                    onClick={() => handleUpdateExpiryRule(company, companyExpiryRulesUI[company] || '')}
                  >
                    SAVE
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={overwriteExistingExpiry}
                  onChange={(e) => setOverwriteExistingExpiry(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-10 h-5 bg-zinc-200 rounded-full peer-checked:bg-indigo-600 transition-all"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase group-hover:text-zinc-900 transition-colors">ΕΠΑΝΕΓΓΡΑΦΗ ΥΠΑΡΧΟΥΣΩΝ ΗΜΕΡΟΜΗΝΙΩΝ</span>
            </label>

            <Button 
              onClick={handleMigrateExpiryDates}
              loading={isMigratingExpiry}
              icon={RefreshCw}
              variant="primary"
            >
              {isMigratingExpiry ? `ΕΝΗΜΕΡΩΣΗ (${expiryMigrationCount})` : 'ΕΚΚΙΝΗΣΗ ΜΑΖΙΚΗΣ ΕΝΗΜΕΡΩΣΗΣ'}
            </Button>
          </div>
        </div>
      </Card>

      <Card title="ΚΑΘΑΡΙΣΜΟΣ ΠΑΡΑΤΗΡΗΣΕΩΝ" subtitle="ΜΕΤΑΤΡΟΠΗ ΠΑΛΙΩΝ ΠΑΡΑΤΗΡΗΣΕΩΝ ΣΕ ΤΥΠΟΠΟΙΗΜΕΝΟ LOG FORMAT">
        <div className="space-y-6">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex gap-3">
            <FileText size={16} className="text-zinc-400 shrink-0" />
            <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed italic">
              ΜΕΤΑΤΡΕΠΕΙ ΤΑ ΣΧΟΛΙΑ ΣΕ ΔΟΜΗΜΕΝΗ ΜΟΡΦΗ ΜΕ ΗΜΕΡΟΜΗΝΙΑ ΚΑΙ ΧΡΗΣΤΗ.
            </p>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleMigrateNotes}
              loading={isMigratingNotes}
              icon={Database}
              variant="outline"
            >
              {isMigratingNotes ? `ΜΕΤΑΤΡΟΠΗ (${notesMigrationCount})` : 'ΕΚΚΙΝΗΣΗ ΚΑΘΑΡΙΣΜΟΥ'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
