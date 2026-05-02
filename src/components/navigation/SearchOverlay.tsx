import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, FileText, User, Car, Clock, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Fuse from 'fuse.js';
import { useNavigate } from 'react-router-dom';

export const SearchOverlay: React.FC = () => {
  const isOpen = useStore(s => s.isSearchOpen);
  const setOpen = useStore(s => s.setSearchOpen);
  const toggleSearch = useStore(s => s.toggleSearch);
  const entries = useStore(s => s.entries);
  const vehicles = useStore(s => s.vehicles);
  const customers = useStore(s => s.customers);
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === '/') {
        // Only trigger if not in an input
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setOpen(true);
        }
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch, setOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Initialize Fuse.js
  const fuseEntries = useMemo(() => new Fuse(entries, {
    keys: ['warrantyId', 'fullName', 'vin', 'brand'],
    threshold: 0.3,
    distance: 100
  }), [entries]);

  const fuseVehicles = useMemo(() => new Fuse(vehicles, {
    keys: ['vin', 'licensePlate', 'brand', 'model'],
    threshold: 0.3
  }), [vehicles]);

  const fuseCustomers = useMemo(() => new Fuse(customers, {
    keys: ['fullName', 'phone', 'email'],
    threshold: 0.3
  }), [customers]);

  // Combined Search Results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const entryResults = fuseEntries.search(query).slice(0, 5).map(r => ({ ...r.item, type: 'ENTRY' as const }));
    const vehicleResults = fuseVehicles.search(query).slice(0, 3).map(r => ({ ...r.item, type: 'VEHICLE' as const }));
    const customerResults = fuseCustomers.search(query).slice(0, 3).map(r => ({ ...r.item, type: 'CUSTOMER' as const }));
    
    return [...entryResults, ...vehicleResults, ...customerResults];
  }, [query, fuseEntries, fuseVehicles, fuseCustomers]);

  // Handle keyboard navigation
  const handleResultKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      const selected = results[selectedIndex];
      handleNavigate(selected);
    }
  };

  const handleNavigate = (item: any) => {
    setOpen(false);
    if (item.type === 'ENTRY') {
      navigate(`/dashboard/entries?id=${item.id}`);
    } else if (item.type === 'VEHICLE') {
      navigate(`/dashboard/registries?tab=vehicles&vin=${item.vin}`);
    } else if (item.type === 'CUSTOMER') {
      navigate(`/dashboard/registries?tab=customers&search=${item.fullName}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[11000] flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10"
          >
            <div className="relative flex items-center p-4 border-b border-slate-800">
              <Search className="w-5 h-5 text-slate-500 mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Αναζήτηση εγγυήσεων, οχημάτων, πελατών..."
                className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleResultKeyDown}
              />
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] text-slate-400 font-mono">
                  ESC
                </span>
                <button 
                  onClick={() => setOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-md text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query === '' ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-slate-300 font-medium mb-1">Γρήγορη Αναζήτηση</h3>
                  <p className="text-slate-500 text-sm">Πληκτρολογήστε VIN, Ονοματεπώνυμο ή Αριθμό Εγγύησης</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((item, index) => (
                    <button
                      key={`${item.type}-${(item as any).id || (item as any).vin}`}
                      onClick={() => handleNavigate(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${
                        index === selectedIndex ? 'bg-blue-600/10 border border-blue-500/20 shadow-lg shadow-blue-500/5' : 'border border-transparent hover:bg-slate-800/50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        item.type === 'ENTRY' ? 'bg-blue-500/10 text-blue-400' :
                        item.type === 'VEHICLE' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {item.type === 'ENTRY' && <FileText size={18} />}
                        {item.type === 'VEHICLE' && <Car size={18} />}
                        {item.type === 'CUSTOMER' && <User size={18} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white truncate">
                            {(item as any).fullName || (item as any).warrantyId || (item as any).licensePlate}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.type === 'ENTRY' ? 'Εγγύηση' : item.type === 'VEHICLE' ? 'Όχημα' : 'Πελάτης'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {item.type === 'ENTRY' ? `${(item as any).brand} • ${(item as any).vin}` :
                           item.type === 'VEHICLE' ? `${(item as any).brand} ${(item as any).model} • ${(item as any).vin}` :
                           `${(item as any).phone} • ${(item as any).email}`}
                        </p>
                      </div>

                      {index === selectedIndex && (
                        <div className="flex items-center gap-1 text-blue-400">
                          <CornerDownLeft size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-slate-500">Δεν βρέθηκαν αποτελέσματα για "{query}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-800/30 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><ArrowRight size={10} /> Πλοήγηση με βέλη</span>
                <span className="flex items-center gap-1"><ArrowRight size={10} /> Enter για άνοιγμα</span>
              </div>
              <div>
                Fuzzy Search Active
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
