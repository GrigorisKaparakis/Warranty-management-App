/**
 * WarrantyForm/index.tsx: Η κεντρική φόρμα δημιουργίας και επεξεργασίας εγγύησης.
 * Συντονίζει τα επιμέρους τμήματα (Στοιχεία, Ανταλλακτικά, Σημειώσεις).
 */
import React, { useRef, useMemo } from 'react';
import { UI_MESSAGES } from '@/core/config';
import { useStore } from '@/store/useStore';
import { useWarrantyForm } from '@/hooks/warranty/useWarrantyForm';

// Sub-components
import { PartSection } from './PartSection';
import { FormOverlays } from './FormOverlays';
import { BasicInfoSection } from './BasicInfoSection';
import { NotesSection } from './NotesSection';

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

  return (
    <div className="p-12 max-w-5xl mx-auto pb-20 animate-in fade-in duration-500 relative">
      <FormOverlays 
        isLoading={isLoading}
        scanStatus={scanStatus}
        pendingSave={pendingSave}
        setPendingSave={setPendingSave}
        executeSave={executeSave}
      />

      {/* Header & AI Scan */}
      <div className="flex justify-between items-end mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
          {editingEntry ? UI_MESSAGES.LABELS.EDIT : UI_MESSAGES.LABELS.NEW_ENTRY}
        </h2>
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
        <BasicInfoSection 
          formData={formData}
          setFormData={setFormData}
          settings={settings}
          vinHistory={vinHistory}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          allStatusKeys={allStatusKeys}
        />

        <PartSection 
          parts={formParts} 
          setParts={setFormParts} 
          partsRegistry={partsRegistry} 
          brand={formData.brand} 
        />

        <NotesSection 
          notes={formData.notes}
          setNotes={(notes) => setFormData({ ...formData, notes })}
        />

        {/* Action Buttons */}
        <div className="flex gap-4 pb-12">
          <button 
            type="button" 
            onClick={() => { setEditingEntry(null); setAiExtractedData(null); navigate('/warranty/inventory'); }} 
            className="flex-1 py-4 bg-slate-100 text-slate-600 font-black text-[11px] uppercase rounded-2xl"
          >
            {UI_MESSAGES.LABELS.CANCEL}
          </button>
          <button 
            type="submit" 
            className="flex-[2] py-4 bg-blue-600 text-white font-black text-[11px] uppercase rounded-2xl shadow-xl hover:bg-blue-700 transition-all"
          >
            {UI_MESSAGES.LABELS.SAVE}
          </button>
        </div>
      </form>
    </div>
  );
};
