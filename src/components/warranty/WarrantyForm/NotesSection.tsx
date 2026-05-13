/**
 * NotesSection.tsx: Πεδίο προσθήκης σημειώσεων στη φόρμα εγγύησης.
 */
import React from 'react';
import { UI_MESSAGES } from '@/core/config';

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ notes, setNotes }) => {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">{UI_MESSAGES.LABELS.NOTES_SECTION}</h3>
      <textarea 
        value={notes} 
        onChange={e => setNotes(e.target.value)} 
        placeholder={UI_MESSAGES.LABELS.NOTES_PLACEHOLDER} 
        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none h-32 focus:ring-2 focus:ring-blue-500 transition-all resize-none" 
      />
    </div>
  );
};
