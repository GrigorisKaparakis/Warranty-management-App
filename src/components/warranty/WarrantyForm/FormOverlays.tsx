/**
 * FormOverlays.tsx: Επικαλύψεις (Overlays) για την κατάσταση φόρτωσης και σφαλμάτων της φόρμας.
 */
import React from 'react';
import { UI_MESSAGES, VALIDATION_RULES } from '@/core/config';

interface FormOverlaysProps {
  isLoading: boolean;
  scanStatus: string;
  pendingSave: any;
  setPendingSave: (val: any) => void;
  executeSave: (data: any) => void;
}

export const FormOverlays: React.FC<FormOverlaysProps> = ({ 
  isLoading, 
  scanStatus, 
  pendingSave, 
  setPendingSave, 
  executeSave 
}) => {
  return (
    <>
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
              <button 
                type="button"
                onClick={() => setPendingSave(null)} 
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-[11px] uppercase rounded-xl"
              >
                {UI_MESSAGES.LABELS.FIX}
              </button>
              <button 
                type="button"
                onClick={() => { executeSave(pendingSave); setPendingSave(null); }} 
                className="flex-1 py-3 bg-blue-600 text-white font-bold text-[11px] uppercase rounded-xl shadow-lg"
              >
                {UI_MESSAGES.LABELS.CONTINUE}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
