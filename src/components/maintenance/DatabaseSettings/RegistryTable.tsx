/**
 * RegistryTable.tsx: Ο πίνακας προβολής των δεδομένων ενός μητρώου.
 * Περιλαμβάνει την αναζήτηση, τον τίτλο και τη δομή των στηλών.
 */
import React from 'react';
import { Search, Database } from 'lucide-react';

interface RegistryTableProps {
  title: string;
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder: string;
  headers: { label: string; width?: string; align?: 'left' | 'center' | 'right' }[];
  itemCount: number;
  children: React.ReactNode;
}

export const RegistryTable: React.FC<RegistryTableProps> = ({
  title,
  search,
  onSearchChange,
  searchPlaceholder,
  headers,
  itemCount,
  children
}) => {
  return (
    <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50/30">
        <div>
          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em] mb-1">{title}</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase italic tracking-widest">{itemCount} ΕΓΓΡΑΦΕΣ ΣΤΟ ΜΗΤΡΩΟ</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 bg-zinc-50/10">
              {headers.map((h, i) => (
                <th key={i} className={`pb-4 pt-6 ${h.width || ''} px-8 ${h.align === 'right' ? 'text-right' : h.align === 'center' ? 'text-center' : ''}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {itemCount === 0 ? (
              <tr>
                <td colSpan={headers.length} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center opacity-20 grayscale">
                    <Database size={48} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-4 italic">ΔΕΝ ΒΡΕΘΗΚΑΝ ΔΕΔΟΜΕΝΑ</p>
                  </div>
                </td>
              </tr>
            ) : children}
          </tbody>
        </table>
      </div>
    </div>
  );
};
