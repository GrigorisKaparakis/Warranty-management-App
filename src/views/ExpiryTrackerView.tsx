import React from 'react';
import { Entry, GarageSettings, ViewType, UserRole } from '../core/types';
import { WarrantyCard } from '../components/warranty/WarrantyCard';
import { Clock } from 'lucide-react';

import { useAppState } from '../hooks/useAppState';

/**
 * ExpiryTrackerView: Παρακολουθεί τις εγγυήσεις που πλησιάζουν στη λήξη τους
 * και επιτρέπει την οργάνωση των επόμενων ενεργειών.
 */
export const ExpiryTrackerView: React.FC = () => {
  const { expiringEntries } = useAppState();
  return (
    <div className="flex-1 p-8 md:p-12 overflow-y-auto animate-fade-in pb-32">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex items-center gap-8 group">
          <div className="w-16 h-16 bg-blue-600/10 rounded-[1.5rem] flex items-center justify-center border border-blue-500/20 shadow-[0_0_40px_rgba(37,99,235,0.1)] group-hover:bg-blue-600/20 transition-all scale-95 group-hover:scale-100">
            <Clock className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">TEMPORAL MONITORING UNIT</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">EXPIRY TRACKER</h1>
          </div>
        </div>

        {expiringEntries.length === 0 ? (
          <div className="glass-dark rounded-[4rem] border border-white/5 shadow-inner p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-blue-600/5 blur-[80px] rounded-full"></div>
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl relative">
              <Clock size={40} strokeWidth={1.5} className="text-slate-600 relative z-10" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">NO EXPIRATIONS DETECTED</h3>
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-relaxed">ALL SYSTEMS OPERATIONAL. NO CRITICAL ACTION REQUIRED AT THIS TIME.</p>
          </div>
        ) : (
          <div className="glass-dark rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>
            
            {/* Table Header */}
            <div className="flex items-center gap-8 px-12 py-8 border-b border-white/5 bg-white/[0.02] sticky top-0 z-10">
              <div className="w-[110px] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">STATUS</div>
              <div className="w-[150px] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">WARRANT / VIN</div>
              <div className="w-[110px] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">ENTITY / BRAND</div>
              <div className="w-[130px] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">PHASE / CLIENT</div>
              <div className="w-[160px] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">PARTS INDEX</div>
              <div className="flex-1 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">PERSISTED LOGS</div>
            </div>
            
            <div className="divide-y divide-white/5">
              {expiringEntries.map(entry => (
                <WarrantyCard
                  key={entry.id}
                  entry={entry}
                  readOnly={false}
                  currentView="expiryTracker"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
