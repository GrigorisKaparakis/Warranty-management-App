
/**
 * NoteBoard.tsx: Ο "πίνακας ανακοινώσεων" του συνεργείου.
 * Επιτρέπει την καταγραφή και διαχείριση γενικών σημειώσεων από τους χρήστες.
 */
import React, { useState } from 'react';
import { Note } from '../../core/types';
import { FirestoreService } from '../../services/firebase/db';
import { UI_MESSAGES } from '../../core/config';

import { useAppState } from '../../hooks/useAppState';
import { useStore } from '../../store/useStore';

/**
 * NoteBoard: Ο "πίνακας ανακοινώσεων" του συνεργείου.
 * Απλή καταγραφή κειμένου χωρίς AI ανάλυση.
 */
export const NoteBoard: React.FC = () => {
  const user = useStore(s => s.user);
  const notes = useStore(s => s.notes);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [confirmingDeleteNoteId, setConfirmingDeleteNoteId] = useState<string | null>(null);

  /**
   * Υποβολή νέας σημείωσης.
   */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;
    
    setLoading(true);
    try {
      await FirestoreService.addNote({ 
        userId: user.uid, 
        authorEmail: user.email!, 
        title: newNote.title || UI_MESSAGES.LABELS.NOTES, 
        content: newNote.content, 
        createdAt: Date.now()
      });
      
      setNewNote({ title: '', content: '' }); // Καθαρισμός φόρμας
    } catch (err) { 
      alert("ΣΦΑΛΜΑ ΚΑΤΑ ΤΗΝ ΠΡΟΣΘΗΚΗ ΣΗΜΕΙΩΣΗΣ."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (confirmingDeleteNoteId !== id) {
      setConfirmingDeleteNoteId(id);
      setTimeout(() => setConfirmingDeleteNoteId(null), 3000);
      return;
    }
    await FirestoreService.deleteNote(id);
    setConfirmingDeleteNoteId(null);
  };

  return (
    <div className="p-12 max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic mb-10">{UI_MESSAGES.LABELS.NOTES}</h2>
      
      {/* Φόρμα Προσθήκης */}
      <form onSubmit={handleAdd} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-12 space-y-4">
        <input 
          type="text" 
          placeholder={UI_MESSAGES.LABELS.TITLE} 
          value={newNote.title} 
          onChange={e => setNewNote({...newNote, title: e.target.value})} 
          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" 
        />
        <textarea 
          placeholder={UI_MESSAGES.LABELS.WRITE_NOTE} 
          value={newNote.content} 
          onChange={e => setNewNote({...newNote, content: e.target.value})} 
          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none h-40 focus:ring-2 focus:ring-blue-500" 
          required 
        />
        <button 
          disabled={loading} 
          className="px-10 py-4 bg-amber-500 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 hover:bg-amber-600 transition-all disabled:opacity-50"
        >
          {loading ? `${UI_MESSAGES.LABELS.ADD}...` : UI_MESSAGES.LABELS.ADD_NOTE}
        </button>
      </form>

      {/* Λίστα Σημειώσεων */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {notes.map(note => (
          <div key={note.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="text-[10px] font-black text-amber-500 uppercase mb-2 tracking-wider">{note.authorEmail || 'System'}</div>
            <h4 className="text-sm font-black text-slate-900 uppercase mb-3 leading-tight">{note.title || UI_MESSAGES.LABELS.NO_TITLE}</h4>
            <p className="text-xs font-medium text-slate-600 leading-relaxed italic whitespace-pre-line">"{note.content}"</p>
            
            {/* Κουμπί Διαγραφής: Εμφανίζεται στο hover */}
            <button 
              onClick={() => handleDeleteNote(note.id)} 
              className={`absolute bottom-4 right-4 transition-all ${confirmingDeleteNoteId === note.id ? 'text-red-600 animate-pulse' : 'text-slate-200 opacity-0 group-hover:opacity-100 hover:text-red-500'}`}
            >
              {confirmingDeleteNoteId === note.id ? (
                <span className="text-[9px] font-black uppercase">{UI_MESSAGES.LABELS.CONFIRM_ACTION}</span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        ))}
        {notes.length === 0 && <div className="col-span-full py-20 text-center opacity-20 font-black uppercase tracking-widest">{UI_MESSAGES.LABELS.NO_NOTES}</div>}
      </div>
    </div>
  );
};
