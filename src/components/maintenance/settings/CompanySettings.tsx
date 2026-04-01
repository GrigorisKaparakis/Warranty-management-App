import React, { useState, memo } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Trash2, Plus, Save } from 'lucide-react';

interface CompanySettingsProps {
  localCompanyMap: Record<string, string[]>;
  localExpiryRules: Record<string, string>;
  isDirty: boolean;
  onUpdateCompanies: (company: string, brands: string[]) => void;
  onUpdateExpiryRules: (company: string, rule: string) => void;
  onAddCompany: (company: string) => void;
  onRemoveCompany: (company: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanySettings: React.FC<CompanySettingsProps> = memo(({
  localCompanyMap,
  localExpiryRules,
  isDirty,
  onUpdateCompanies,
  onUpdateExpiryRules,
  onAddCompany,
  onRemoveCompany,
  onSave,
  onCancel
}) => {
  const [newCompanyInput, setNewCompanyInput] = useState('');
  const [brandInputs, setBrandInputs] = useState<Record<string, string>>({});
  const [confirmingDeleteCompany, setConfirmingDeleteCompany] = useState<string | null>(null);

  const handleAddCompany = () => {
    if (newCompanyInput.trim()) {
      onAddCompany(newCompanyInput.trim().toUpperCase());
      setNewCompanyInput('');
    }
  };

  const handleRemoveCompany = (company: string) => {
    if (confirmingDeleteCompany !== company) {
      setConfirmingDeleteCompany(company);
      setTimeout(() => setConfirmingDeleteCompany(null), 3000);
      return;
    }
    onRemoveCompany(company);
    setConfirmingDeleteCompany(null);
  };

  const addBrandToCompany = (company: string) => {
    const brandName = (brandInputs[company] || '').trim().toUpperCase();
    if (!brandName) return;
    const currentBrands = localCompanyMap[company] || [];
    if (currentBrands.includes(brandName)) {
      return;
    }
    onUpdateCompanies(company, [...currentBrands, brandName]);
    setBrandInputs(prev => ({ ...prev, [company]: '' }));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-32">
      <Card 
        title="ENTITY REGISTRATION" 
        subtitle="DEFINE NEW SYSTEM DISTRIBUTORS"
        actions={
          isDirty && (
            <div className="flex items-center gap-4">
              <button 
                onClick={onCancel}
                className="h-10 px-6 rounded-xl bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all border border-black/20 font-mono"
              >
                ABORT
              </button>
              <button 
                onClick={onSave}
                className="h-10 px-6 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] border-none italic"
              >
                COMMIT SYNC
              </button>
            </div>
          )
        }
      >
        <div className="flex gap-4 pt-4">
          <input 
            type="text" 
            placeholder="ENTER ENTITY NAME (E.G. OPEL HELLAS)..." 
            value={newCompanyInput} 
            onChange={e => setNewCompanyInput(e.target.value)} 
            className="flex-1 px-6 py-4 bg-slate-950 border border-white/5 rounded-2xl font-black text-sm text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-800" 
          />
          <button 
            onClick={handleAddCompany}
            className="px-8 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-2xl shadow-blue-900/40 italic"
          >
            <Plus size={18} />
            REGISTER
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(localCompanyMap).map(([company, brands]) => (
          <Card 
            key={company} 
            title={company} 
            actions={
              <button 
                onClick={() => handleRemoveCompany(company)} 
                className={`transition-all p-2 rounded-lg hover:bg-red-500/10 ${confirmingDeleteCompany === company ? 'text-red-500 animate-pulse' : 'text-slate-600 hover:text-red-400'}`}
              >
                {confirmingDeleteCompany === company ? <span className="text-[10px] font-black uppercase italic tracking-tighter">CONFIRM PURGE?</span> : <Trash2 size={18} />}
              </button>
            }
          >
            <div className="space-y-6 pt-4">
              <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-slate-950/50 rounded-2xl border border-white/5 shadow-inner">
                {(brands as string[]).map((b, i) => (
                  <Badge 
                    key={i} 
                    variant="neutral" 
                    className="gap-2 bg-blue-600/10 border-blue-500/20 text-blue-300 font-black text-[10px] uppercase tracking-widest pl-3 pr-2 py-1.5 rounded-xl hover:bg-blue-600/20 transition-all border group/badge"
                  >
                    {b}
                    <button 
                      onClick={() => onUpdateCompanies(company, (brands as string[]).filter((_, idx) => idx !== i))} 
                      className="text-blue-500 group-hover/badge:text-red-400 transition-colors bg-white/5 rounded-md w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="p-6 bg-slate-950 rounded-[2rem] border border-white/5 shadow-2xl">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 block italic">PROTOCOL: EXPIRY CALCULATION</label>
                <select 
                  value={localExpiryRules?.[company] || ''} 
                  onChange={(e) => onUpdateExpiryRules(company, e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 px-4 py-3 rounded-xl text-[11px] font-black text-blue-400 uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-950">NO CALCULATION RULE</option>
                  <option value="END_OF_NEXT_MONTH" className="bg-slate-950">EOM + 30D OFFSET</option>
                  <option value="3 months" className="bg-slate-950">QUARTERLY (90D)</option>
                  <option value="6 months" className="bg-slate-950">BI-ANNUAL (180D)</option>
                </select>
              </div>

              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="+ REGISTER BRAND CODE" 
                  value={brandInputs[company] || ''} 
                  onChange={(e) => setBrandInputs(prev => ({ ...prev, [company]: e.target.value.toUpperCase() }))} 
                  className="flex-1 px-5 py-3 bg-slate-950 border border-white/5 rounded-xl text-[11px] font-black text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-800" 
                />
                <button 
                  onClick={() => addBrandToCompany(company)}
                  className="w-12 h-12 bg-white/5 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-white/5 shadow-2xl"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});
