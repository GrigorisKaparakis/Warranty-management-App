
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
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">{UI_MESSAGES.LABELS.PARTS}</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 relative">
        <div className="relative">
          <input 
            type="text" 
            placeholder={UI_MESSAGES.LABELS.CODE} 
            value={tempPart.code} 
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onChange={e => setTempPart({...tempPart, code: e.target.value.toUpperCase()})} 
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500" 
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 z-[120] mb-2 bg-white border border-slate-100 rounded-xl shadow-2xl p-2 animate-in slide-in-from-bottom-2">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  type="button"
                  onClick={() => { setTempPart({ ...tempPart, code: s.code, description: s.description }); setShowSuggestions(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="text-[10px] font-black text-blue-600 uppercase">{s.code}</div>
                  <div className="text-[11px] font-bold text-slate-500">{s.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <input type="text" placeholder={UI_MESSAGES.LABELS.DESCRIPTION} value={tempPart.description} onChange={e => setTempPart({...tempPart, description: e.target.value})} className="px-5 py-3 bg-slate-50 border rounded-xl font-bold text-xs outline-none" />
        <input type="number" value={tempPart.quantity} onChange={e => setTempPart({...tempPart, quantity: parseInt(e.target.value) || 1})} className="px-5 py-3 bg-slate-50 border rounded-xl font-bold text-xs outline-none" />
        <button type="button" onClick={handleAddOrUpdate} className="bg-slate-800 text-white font-black text-[10px] uppercase rounded-xl tracking-widest hover:bg-blue-600 transition-all">
          {editingIndex !== null ? UI_MESSAGES.LABELS.UPDATE : UI_MESSAGES.LABELS.ADD}
        </button>
      </div>
      <div className="space-y-2">
        {parts.map((p, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl group hover:border-blue-200">
            <div className="flex items-center gap-4 text-xs font-bold uppercase">
              <span className="text-blue-600 font-black">{p.code}</span>
              <span className="text-slate-600">{p.description}</span>
              <span className="text-slate-400">x{p.quantity}</span>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button type="button" onClick={() => { setEditingIndex(i); setTempPart(p as any); }} className="p-2 text-blue-500 bg-white border rounded-lg shadow-sm">✎</button>
              <button type="button" onClick={() => setParts(parts.filter((_, idx) => idx !== i))} className="p-2 text-red-500 bg-white border rounded-lg shadow-sm">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
