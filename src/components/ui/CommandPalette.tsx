import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, X, ArrowRight } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useNavigate } from 'react-router-dom';

/**
 * CommandPalette: Global search and quick-action interface.
 */
export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { entries } = useInventory();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = query 
    ? entries.filter(e => 
        e.warrantyId.toLowerCase().includes(query.toLowerCase()) ||
        e.vin.toLowerCase().includes(query.toLowerCase()) ||
        e.fullName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-slate-500 hover:text-white transition-all text-sm group"
      >
        <Search size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">Search...</span>
        <kbd className="hidden md:flex ml-10 h-5 w-5 items-center justify-center rounded border border-white/10 bg-white/5 text-[10px] font-medium text-slate-400">
          K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5">
                <Search className="text-blue-400" size={20} />
                <input 
                  autoFocus
                  placeholder="SEARCH WARRANTY, VIN, OR CUSTOMER..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white font-black text-sm uppercase placeholder:text-slate-600"
                />
                <button onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                {results.length > 0 ? (
                  <div className="space-y-2">
                    {results.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => {
                          navigate(`/warranty/${entry.id}`);
                          setIsOpen(false);
                          setQuery('');
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-xs">
                            {entry.brand[0]}
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{entry.warrantyId}</div>
                            <div className="text-sm font-black text-white uppercase">{entry.fullName}</div>
                          </div>
                        </div>
                        <ArrowRight className="opacity-0 group-hover:opacity-100 transition-all text-blue-400" size={16} />
                      </button>
                    ))}
                  </div>
                ) : query ? (
                  <div className="py-12 text-center">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">No results found matching "{query}"</p>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Start typing to search the database...</p>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-4">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest"><span className="text-blue-400">↑↓</span> NAVIGATE</span>
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest"><span className="text-blue-400">ESC</span> CLOSE</span>
                </div>
                <div className="flex items-center gap-1">
                   <Command size={10} className="text-slate-500" />
                   <span className="text-[9px] font-black text-slate-500 tracking-widest">WARRANTY H&K OS</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
