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
    settings, editingEntry, setEditingEntry, setAiExtractedData, navigate
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
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-dark rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-white/10 text-center">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">{UI_MESSAGES.LABELS.VIN_WARNING}</h3>
            <p className="text-[11px] font-bold text-slate-400 mb-8 leading-relaxed uppercase tracking-widest italic">
              Το VIN έχει <span className="text-blue-400 font-black">{pendingSave.vin.length}</span> χαρακτήρες (αντί για {VALIDATION_RULES.VIN_LENGTH}). {UI_MESSAGES.LABELS.CONTINUE}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setPendingSave(null)} 
                className="flex-1 py-4 bg-white/5 text-slate-400 font-black text-[10px] uppercase rounded-2xl hover:bg-white/10 transition-all tracking-widest"
              >
                {UI_MESSAGES.LABELS.FIX}
              </button>
              <button 
                onClick={() => { executeSave(pendingSave); setPendingSave(null); }} 
                className="flex-1 py-4 bg-blue-600 text-white font-black text-[10px] uppercase rounded-2xl shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all tracking-widest"
              >
                {UI_MESSAGES.LABELS.CONTINUE}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & AI Scan */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">
            {editingEntry ? UI_MESSAGES.LABELS.EDIT : UI_MESSAGES.LABELS.NEW_ENTRY}
          </h2>
          <div className="h-1.5 w-24 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
        </div>
        {!editingEntry && (
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className="group relative px-8 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase rounded-2xl shadow-xl shadow-indigo-900/20 tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
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

      <form onSubmit={handleSave} className="space-y-10">
        {/* Warranty Info */}
        <div className="glass-dark p-10 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 grid grid-cols-1 md:grid-cols-2 gap-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/0 via-blue-600/50 to-blue-600/0"></div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{UI_MESSAGES.LABELS.WARRANTY_ID}</label>
            <input type="text" value={formData.warrantyId} onChange={e => setFormData({...formData, warrantyId: e.target.value.toUpperCase()})} className="w-full px-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl font-bold text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all placeholder:text-slate-700" required />
          </div>
          
          <div className="space-y-2 relative">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{UI_MESSAGES.LABELS.VIN_CHASSIS}</label>
              {vinHistory.length > 0 && (
                <button type="button" onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all group">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                  <span className="text-[9px] font-black uppercase tracking-wider">{UI_MESSAGES.LABELS.HISTORY} ({vinHistory.length})</span>
                </button>
              )}
            </div>
            <input 
              type="text" 
              value={formData.vin} 
              onChange={e => setFormData({...formData, vin: e.target.value.toUpperCase().replace(/\s/g, '')})} 
              className={`w-full px-6 py-4 bg-slate-900/60 border font-mono text-white rounded-2xl font-bold outline-none transition-all ${formData.vin.length > 0 && formData.vin.length !== VALIDATION_RULES.VIN_LENGTH ? 'border-amber-500/40 ring-4 ring-amber-500/5' : 'border-white/5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30'}`} 
              required 
            />
            
            {showHistory && vinHistory.length > 0 && (
              <VinHistoryPopup history={vinHistory} onClose={() => setShowHistory(false)} />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{UI_MESSAGES.LABELS.COMPANY}</label>
            <select 
              value={formData.company} 
              onChange={e => {
                const newCompany = e.target.value;
                const currentBrand = formData.brand;
                const validBrands = settings.companyBrandMap[newCompany] || [];
                const shouldClearBrand = currentBrand && !validBrands.includes(currentBrand);
                setFormData({
                  ...formData, 
                  company: newCompany, 
                  brand: shouldClearBrand ? '' : currentBrand
                });
              }} 
              className="w-full px-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none" 
              required
            >
              <option value="">{UI_MESSAGES.LABELS.SELECT_OPTION}</option>
              {Object.keys(settings.companyBrandMap || {}).map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{UI_MESSAGES.LABELS.BRAND_MODEL}</label>
            {formData.company && settings.companyBrandMap[formData.company]?.length > 0 ? (
              <select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none" required>
                <option value="">{UI_MESSAGES.LABELS.SELECT_OPTION}</option>
                {settings.companyBrandMap[formData.company].map(b => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
              </select>
            ) : (
              <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value.toUpperCase()})} className="w-full px-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all" required />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{UI_MESSAGES.LABELS.CUSTOMER}</label>
            <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{UI_MESSAGES.LABELS.ENTRY_DATE}</label>
            <input 
              type="date" 
              value={formData.createdAt} 
              onChange={e => setFormData({...formData, createdAt: e.target.value})} 
              className="w-full px-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{UI_MESSAGES.LABELS.STATUS}</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as EntryStatus})} className="w-full px-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none">
              {allStatusKeys.map(s => <option key={s} value={s} className="bg-slate-900">{getStatusLabel(s)}</option>)}
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
        <div className="glass-dark p-10 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">{UI_MESSAGES.LABELS.NOTES_SECTION}</h3>
          <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder={UI_MESSAGES.LABELS.NOTES_PLACEHOLDER} className="w-full px-8 py-6 bg-slate-900/60 border border-white/5 rounded-2xl font-medium text-slate-100 outline-none h-48 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all resize-none placeholder:text-slate-700" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-6 pb-20">
          <button 
            type="button" 
            onClick={() => { setEditingEntry(null); setAiExtractedData(null); navigate('/warranty/inventory'); }} 
            className="flex-1 py-5 bg-white/5 text-slate-400 font-black text-[10px] uppercase rounded-[2rem] hover:bg-white/10 hover:text-white transition-all tracking-widest"
          >
            {UI_MESSAGES.LABELS.CANCEL}
          </button>
          <button 
            type="submit" 
            className="flex-[2] py-5 bg-blue-600 text-white font-black text-[10px] uppercase rounded-[2rem] shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all tracking-widest overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            {UI_MESSAGES.LABELS.SAVE}
          </button>
        </div>
      </form>
    </div>
  );
};
