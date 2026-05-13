/**
 * BasicInfoSection.tsx: Τα βασικά στοιχεία της εγγύησης (IDs, Πελάτης, Ημερομηνία).
 */
import React from 'react';
import { VALIDATION_RULES, UI_MESSAGES } from '@/core/config';
import { GarageSettings } from '@/core/types';
import { VinHistoryPopup } from '../VinHistoryPopup';

interface BasicInfoSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  settings: GarageSettings;
  vinHistory: any[];
  showHistory: boolean;
  setShowHistory: (val: boolean) => void;
  allStatusKeys: string[];
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  setFormData,
  settings,
  vinHistory,
  showHistory,
  setShowHistory,
  allStatusKeys
}) => {
  const getStatusLabel = (status: string) => settings.statusConfigs?.[status]?.label || status;

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 relative">
      {/* Warranty ID */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{UI_MESSAGES.LABELS.WARRANTY_ID}</label>
        <input 
          type="text" 
          value={formData.warrantyId} 
          onChange={e => setFormData({...formData, warrantyId: e.target.value.toUpperCase()})} 
          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
          required 
        />
      </div>
      
      {/* VIN */}
      <div className="space-y-1 relative">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{UI_MESSAGES.LABELS.VIN_CHASSIS}</label>
          {vinHistory.length > 0 && (
            <button 
              type="button" 
              onClick={() => setShowHistory(!showHistory)} 
              className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100 hover:bg-amber-100 transition-all"
            >
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black uppercase italic">{UI_MESSAGES.LABELS.HISTORY} ({vinHistory.length})</span>
            </button>
          )}
        </div>
        <input 
          type="text" 
          value={formData.vin} 
          onChange={e => setFormData({...formData, vin: e.target.value.toUpperCase().replace(/\s/g, '')})} 
          className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none transition-all ${formData.vin.length > 0 && formData.vin.length !== VALIDATION_RULES.VIN_LENGTH ? 'border-amber-300 ring-4 ring-amber-50' : 'border-slate-200'}`} 
          required 
        />
        
        {showHistory && vinHistory.length > 0 && (
          <VinHistoryPopup history={vinHistory} onClose={() => setShowHistory(false)} />
        )}
      </div>

      {/* Company */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{UI_MESSAGES.LABELS.COMPANY}</label>
        <select 
          value={formData.company} 
          onChange={e => {
            const newCompany = e.target.value;
            const currentBrand = formData.brand;
            const validBrands = settings.companyBrandMap?.[newCompany] || [];
            const shouldClearBrand = currentBrand && !validBrands.includes(currentBrand);
            setFormData({
              ...formData, 
              company: newCompany, 
              brand: shouldClearBrand ? '' : currentBrand
            });
          }} 
          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" 
          required
        >
          <option value="">{UI_MESSAGES.LABELS.SELECT_OPTION}</option>
          {Object.keys(settings.companyBrandMap || {}).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Brand */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{UI_MESSAGES.LABELS.BRAND_MODEL}</label>
        {formData.company && settings.companyBrandMap?.[formData.company]?.length > 0 ? (
          <select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" required>
            <option value="">{UI_MESSAGES.LABELS.SELECT_OPTION}</option>
            {settings.companyBrandMap[formData.company].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        ) : (
          <input 
            type="text" 
            value={formData.brand} 
            onChange={e => setFormData({...formData, brand: e.target.value.toUpperCase()})} 
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" 
            required 
          />
        )}
      </div>

      {/* Customer */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{UI_MESSAGES.LABELS.CUSTOMER}</label>
        <input 
          type="text" 
          value={formData.fullName} 
          onChange={e => setFormData({...formData, fullName: e.target.value})} 
          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" 
          required 
        />
      </div>

      {/* Date */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{UI_MESSAGES.LABELS.ENTRY_DATE}</label>
        <input 
          type="date" 
          value={formData.createdAt} 
          onChange={e => setFormData({...formData, createdAt: e.target.value})} 
          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" 
          required 
        />
      </div>

      {/* Status */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{UI_MESSAGES.LABELS.STATUS}</label>
        <select 
          value={formData.status} 
          onChange={e => setFormData({...formData, status: e.target.value as any})} 
          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
        >
          {allStatusKeys.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
        </select>
      </div>
    </div>
  );
};
