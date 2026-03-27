/**
 * WarrantyForm.tsx: Φόρμα δημιουργίας και επεξεργασίας εγγύησης.
 * Περιλαμβάνει πεδία για VIN, Πελάτη, Ανταλλακτικά και υποστηρίζει AI Scanning.
 */

import React, { useRef, useMemo } from 'react';
import { EntryStatus, VALIDATION_RULES, UI_MESSAGES } from '../../core/config';
import { useStore } from '../../store/useStore';
import { useWarrantyForm } from '../../hooks/useWarrantyForm';
import { PartSection } from './PartSection';
import { VinHistoryPopup } from './VinHistoryPopup';

export const WarrantyForm: React.FC = () => {
  const { 
    formData, setFormData,
    formParts, setFormParts,
    isLoading, scanStatus,
    vinHistory, showHistory, setShowHistory,
    pendingSave, setPendingSave,
    handleScanPDF, handleSave, executeSave,
    settings, editingEntry, setEditingEntry, setInitialAiData, navigate
  } = useWarrantyForm();

  const partsRegistry = useStore(s => s.parts);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allStatusKeys = useMemo(() => {
    if (settings.statusOrder && settings.statusOrder.length > 0) {
      return settings.statusOrder.filter(key => settings.statusConfigs?.[key]);
    }
    return Object.keys(settings.statusConfigs || {});
  }, [settings.statusConfigs, settings.statusOrder]);

  const getStatusLabel = (status: string) => settings.statusConfigs?.[status]?.label || status;

  return (
    <div className="p-12 max-w-5xl mx-auto pb-20 animate-in fade-in duration-500 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-white font-black text-xs uppercase tracking-[0.3em]">{scanStatus || UI_MESSAGES.LABELS.PROCESSING}</p>
        </div>
      )}

      {/* VIN Confirmation Dialog */}
      {pendingSave && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{UI_MESSAGES.LABELS.VIN_WARNING}</h3>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed italic">
              Το VIN έχει <span className="text-blue-600 font-black">{pendingSave.vin.length}</span> χαρακτήρες (αντί για {VALIDATION_RULES.VIN_LENGTH}). {UI_MESSAGES.LABELS.CONTINUE}
            </p>
            <div className="flex gap-4">
              <button onClick={() => setPendingSave(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-[11px] uppercase rounded-xl">{UI_MESSAGES.LABELS.FIX}</button>
              <button onClick={() => { executeSave(pendingSave); setPendingSave(null); }} className="flex-1 py-3 bg-blue-600 text-white font-bold text-[11px] uppercase rounded-xl shadow-lg">{UI_MESSAGES.LABELS.CONTINUE}</button>
            </div>
          </div>
        </div>
      )}

      {/* Header & AI Scan */}
      <div className="flex justify-between items-end mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{editingEntry ? UI_MESSAGES.LABELS.EDIT : UI_MESSAGES.LABELS.NEW_ENTRY}</h2>
        {!editingEntry && (
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className="px-6 py-3 bg-indigo-600 text-white font-black text-[10px] uppercase rounded-xl shadow-lg tracking-widest hover:bg-indigo-700 transition-all"
          >
            {UI_MESSAGES.LABELS.AI_SCAN}
          </button>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => e.target.files?.[0] && handleScanPDF(e.target.files[0])} 
          className="hidden" 
          accept=".pdf,image/*" 
        />
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Warranty Info */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{UI_MESSAGES.LABELS.WARRANTY_ID}</label>
            <input type="text" value={formData.warrantyId} onChange={e => setFormData({...formData, warrantyId: e.target.value.toUpperCase()})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          
          <div className="space-y-1 relative">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{UI_MESSAGES.LABELS.VIN_CHASSIS}</label>
              {vinHistory.length > 0 && (
                <button type="button" onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100 hover:bg-amber-100 transition-all">
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

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{UI_MESSAGES.LABELS.COMPANY}</label>
            <select value={formData.company} onChange={e => setFormData({...formData, company: e.target.value, brand: ''})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" required>
              <option value="">{UI_MESSAGES.LABELS.SELECT_OPTION}</option>
              {Object.keys(settings.companyBrandMap || {}).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{UI_MESSAGES.LABELS.BRAND_MODEL}</label>
            {formData.company && settings.companyBrandMap[formData.company]?.length > 0 ? (
              <select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" required>
                <option value="">{UI_MESSAGES.LABELS.SELECT_OPTION}</option>
                {settings.companyBrandMap[formData.company].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            ) : (
              <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value.toUpperCase()})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" required />
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{UI_MESSAGES.LABELS.CUSTOMER}</label>
            <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" required />
          </div>
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
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{UI_MESSAGES.LABELS.STATUS}</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as EntryStatus})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none">
              {allStatusKeys.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
            </select>
          </div>
        </div>

        {/* Parts Section */}
        <PartSection 
          parts={formParts} 
          setParts={setFormParts} 
          partsRegistry={partsRegistry} 
          brand={formData.brand} 
        />

        {/* Notes Section */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">{UI_MESSAGES.LABELS.NOTES_SECTION}</h3>
          <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder={UI_MESSAGES.LABELS.NOTES_PLACEHOLDER} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none h-32 focus:ring-2 focus:ring-blue-500 transition-all resize-none" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pb-12">
          <button type="button" onClick={() => { setEditingEntry(null); setInitialAiData(null); navigate('/warranty/inventory'); }} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black text-[11px] uppercase rounded-2xl">{UI_MESSAGES.LABELS.CANCEL}</button>
          <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-black text-[11px] uppercase rounded-2xl shadow-xl hover:bg-blue-700 transition-all">{UI_MESSAGES.LABELS.SAVE}</button>
        </div>
      </form>
    </div>
  );
};
