/**
 * SearchAndFilters.tsx: Η μπάρα αναζήτησης και τα φίλτρα του Inventory.
 * Περιλαμβάνει πεδία για κείμενο, ημερομηνίες, κατάσταση και εταιρεία.
 */
import React from 'react';
import { Search, Calendar, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  companyFilter: string;
  setCompanyFilter: (val: string) => void;
  allStatusKeys: string[];
  getStatusLabel: (key: string) => string;
  companyBrandMap: Record<string, string[]>;
  isFiltered: boolean;
  clearFilters: () => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  statusFilter,
  setStatusFilter,
  companyFilter,
  setCompanyFilter,
  allStatusKeys,
  getStatusLabel,
  companyBrandMap,
  isFiltered,
  clearFilters
}) => {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[320px] group">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
        <input 
          type="text" 
          placeholder="ΑΝΑΖΗΤΗΣΗ ΣΕ ΟΛΑ ΤΑ ΠΕΔΙΑ..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          className="w-full pl-14 pr-6 py-4 bg-white border border-zinc-100 rounded-[1.5rem] text-[11px] font-bold outline-none shadow-sm focus:ring-4 focus:ring-zinc-50 focus:border-zinc-200 transition-all placeholder:text-zinc-300" 
        />
      </div>
      
      {/* Date Range */}
      <div className="flex items-center gap-3 bg-white border border-zinc-100 rounded-[1.5rem] px-6 py-2 shadow-sm">
         <Calendar size={14} className="text-zinc-400" />
         <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-[10px] font-bold outline-none bg-transparent uppercase" />
         <span className="text-zinc-300">—</span>
         <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-[10px] font-bold outline-none bg-transparent uppercase" />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-6 py-4 bg-white border border-zinc-100 rounded-[1.5rem] text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer hover:bg-zinc-50 transition-all appearance-none">
          <option value="ALL">ΚΑΤΑΣΤΑΣΗ: ΟΛΕΣ</option>
          {allStatusKeys.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
        </select>

        <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="px-6 py-4 bg-white border border-zinc-100 rounded-[1.5rem] text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer hover:bg-zinc-50 transition-all appearance-none">
          <option value="ALL">ΕΤΑΙΡΕΙΑ: ΟΛΕΣ</option>
          {Object.keys(companyBrandMap || {}).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isFiltered && (
        <Button variant="neutral" onClick={clearFilters} icon={X} className="rounded-[1.5rem] px-6">
          ΚΑΘΑΡΙΣΜΟΣ
        </Button>
      )}
    </div>
  );
};
