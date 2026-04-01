
/**
 * PartSection.tsx: Διαχείριση της λίστας ανταλλακτικών μέσα στη φόρμα εγγύησης.
 * Επιτρέπει την προσθήκη, επεξεργασία και διαγραφή ανταλλακτικών, με υποστήριξη suggestions.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { Part, PartRegistryEntry } from '../../core/types';
import { UI_MESSAGES, PERFORMANCE_CONFIG } from '../../core/config';

interface PartSectionProps {
  parts: Omit<Part, 'id'>[];
  setParts: (parts: Omit<Part, 'id'>[]) => void;
  partsRegistry: PartRegistryEntry[];
  brand: string;
}

export const PartSection: React.FC<PartSectionProps> = ({ parts, setParts, partsRegistry, brand }) => {
  const [tempPart, setTempPart] = useState({ code: '', description: '', quantity: 1, isReady: false });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(tempPart.code);
    }, PERFORMANCE_CONFIG.DEBOUNCE.PART_SUGGESTIONS);
    return () => clearTimeout(timer);
  }, [tempPart.code]);

  const knownParts = useMemo(() => {
    const map = new Map<string, string>();
    partsRegistry.forEach(p => {
      if (p.code && p.description) map.set(p.code.toUpperCase().trim(), p.description.trim());
    });
    return map;
  }, [partsRegistry]);

  const suggestions = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) return [];
    const search = debouncedSearch.toUpperCase().trim();
    return Array.from(knownParts.entries())
      .filter(([code]) => code.includes(search))
      .slice(0, 5)
      .map(([code, description]) => ({ code, description }));
  }, [debouncedSearch, knownParts]);

  const handleAddOrUpdate = () => {
    if (!tempPart.code.trim()) return;
    const clean = { ...tempPart, code: tempPart.code.toUpperCase() };
    if (editingIndex !== null) {
      const up = [...parts]; up[editingIndex] = clean; setParts(up); setEditingIndex(null);
    } else { setParts([...parts, clean]); }
    setTempPart({ code: '', description: '', quantity: 1, isReady: false });
    setShowSuggestions(false);
  };

  return (
    <div className="glass-dark p-10 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">{UI_MESSAGES.LABELS.PARTS}</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 relative">
        <div className="relative">
          <input 
            type="text" 
            placeholder={UI_MESSAGES.LABELS.CODE} 
            value={tempPart.code} 
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onChange={e => setTempPart({...tempPart, code: e.target.value.toUpperCase()})} 
            className="w-full px-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl font-bold text-white text-[11px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-700" 
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 z-[120] mb-3 bg-slate-900 border border-white/10 rounded-[1.5rem] shadow-2xl p-2 animate-in slide-in-from-bottom-2 backdrop-blur-xl">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  type="button"
                  onClick={() => { setTempPart({ ...tempPart, code: s.code, description: s.description }); setShowSuggestions(false); }}
                  className="w-full text-left px-5 py-4 hover:bg-white/5 rounded-xl transition-colors border-b border-white/5 last:border-0 group"
                >
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-wider group-hover:text-blue-300 transition-colors">{s.code}</div>
                  <div className="text-[11px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors">{s.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <input type="text" placeholder={UI_MESSAGES.LABELS.DESCRIPTION} value={tempPart.description} onChange={e => setTempPart({...tempPart, description: e.target.value})} className="px-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl font-bold text-white text-[11px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-700" />
        <input type="number" value={tempPart.quantity} onChange={e => setTempPart({...tempPart, quantity: parseInt(e.target.value) || 1})} className="px-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl font-bold text-white text-[11px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all" />
        <button type="button" onClick={handleAddOrUpdate} className="bg-blue-600 text-white font-black text-[10px] uppercase rounded-2xl tracking-widest shadow-xl shadow-blue-900/20 hover:bg-blue-500 transition-all">
          {editingIndex !== null ? UI_MESSAGES.LABELS.UPDATE : UI_MESSAGES.LABELS.ADD}
        </button>
      </div>
      <div className="space-y-3">
        {parts.map((p, i) => (
          <div key={i} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-all backdrop-blur-sm">
            <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-tight">
              <span className="text-blue-400 font-black tracking-widest">{p.code}</span>
              <span className="text-slate-300 truncate max-w-[150px] md:max-w-[400px]">{p.description}</span>
              <span className="text-slate-500 font-black">X{p.quantity}</span>
            </div>
            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
              <button type="button" onClick={() => { setEditingIndex(i); setTempPart(p as any); }} className="w-10 h-10 flex items-center justify-center text-blue-400 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-xl">✎</button>
              <button type="button" onClick={() => setParts(parts.filter((_, idx) => idx !== i))} className="w-10 h-10 flex items-center justify-center text-red-400 bg-white/5 border border-white/10 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-xl">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
