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
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      <div className="w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shadow-md">
            <Clock className="text-amber-600" size={24} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Ληγμένες & Λήγουσες Εγγυήσεις</h1>
        </div>

        {expiringEntries.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
            <p className="text-slate-500 font-bold text-lg">Δεν υπάρχουν ληγμένες ή εγγυήσεις που να λήγουν σύντομα.</p>
            <p className="text-slate-400 text-sm mt-2">Όλα είναι εντάξει για την ώρα!</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center gap-4 px-8 py-5 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <div className="w-[110px] text-[10px] font-black text-slate-400 uppercase tracking-widest">ΚΑΤΑΣΤΑΣΗ</div>
              <div className="w-[150px] text-[10px] font-black text-slate-400 uppercase tracking-widest">ΕΓΓΥΗΣΗ / VIN</div>
              <div className="w-[110px] text-[10px] font-black text-slate-400 uppercase tracking-widest">ΕΤΑΙΡΕΙΑ / ΜΑΡΚΑ</div>
              <div className="w-[130px] text-[10px] font-black text-slate-400 uppercase tracking-widest">ΗΜ/ΝΙΑ / ΠΕΛΑΤΗΣ</div>
              <div className="w-[160px] text-[10px] font-black text-slate-400 uppercase tracking-widest">ΑΝΤΑΛΛΑΚΤΙΚΑ</div>
              <div className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">ΠΑΡΑΤΗΡΗΣΕΙΣ</div>
            </div>
            
            {expiringEntries.map(entry => (
              <WarrantyCard
                key={entry.id}
                entry={entry}
                readOnly={false} // Να είναι επεξεργάσιμες οι εγγυήσεις
                currentView="expiryTracker"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
