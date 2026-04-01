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
    <div className="space-y-6">
      <Card 
        title="ΠΡΟΣΘΗΚΗ ΕΤΑΙΡΕΙΑΣ" 
        subtitle="ΟΡΙΣΤΕ ΝΕΟΥΣ ΔΙΑΝΟΜΕΙΣ"
        actions={
          isDirty && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onCancel}>ΑΚΥΡΩΣΗ</Button>
              <Button variant="primary" size="sm" icon={Save} onClick={onSave}>ΑΠΟΘΗΚΕΥΣΗ</Button>
            </div>
          )
        }
      >
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="ΟΝΟΜΑ ΕΤΑΙΡΕΙΑΣ..." 
            value={newCompanyInput} 
            onChange={e => setNewCompanyInput(e.target.value)} 
            className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl font-bold outline-none text-sm" 
          />
          <Button onClick={handleAddCompany} icon={Plus}>ΠΡΟΣΘΗΚΗ</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(localCompanyMap).map(([company, brands]) => (
          <Card 
            key={company} 
            title={company} 
            actions={
              <button 
                onClick={() => handleRemoveCompany(company)} 
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
                    <button onClick={() => onUpdateCompanies(company, (brands as string[]).filter((_, idx) => idx !== i))} className="hover:text-red-500">×</button>
                  </Badge>
                ))}
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">ΚΑΝΟΝΑΣ ΛΗΞΗΣ</label>
                <select 
                  value={localExpiryRules?.[company] || ''} 
                  onChange={(e) => onUpdateExpiryRules(company, e.target.value)}
                  className="w-full bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold outline-none"
                >
                  <option value="">ΧΩΡΙΣ ΚΑΝΟΝΑ</option>
                  <option value="END_OF_NEXT_MONTH">ΤΕΛΟΣ ΕΠΟΜΕΝΟΥ ΜΗΝΑ</option>
                  <option value="3 months">3 ΜΗΝΕΣ</option>
                  <option value="6 months">6 ΜΗΝΕΣ</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="+ ΜΑΡΚΑ" 
                  value={brandInputs[company] || ''} 
                  onChange={(e) => setBrandInputs(prev => ({ ...prev, [company]: e.target.value.toUpperCase() }))} 
                  className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold outline-none focus:bg-white" 
                />
                <Button size="sm" onClick={() => addBrandToCompany(company)} icon={Plus} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});
