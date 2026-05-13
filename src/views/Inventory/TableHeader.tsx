/**
 * TableHeader.tsx: Η κεφαλίδα του πίνακα εγγυήσεων.
 * Περιλαμβάνει τους τίτλους των στηλών, τη δυνατότητα ταξινόμησης και τη μαζική επιλογή.
 */
import React from 'react';
import { ArrowUpDown, CheckSquare, Square } from 'lucide-react';
import { Entry } from '../../core/types';

interface TableHeaderProps {
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  entries: Entry[];
  visibleLimit: number;
  selectAll: () => void;
  deselectAll: () => void;
  handleSort: (key: any) => void;
  sortConfig: { key: string; order: 'asc' | 'desc' };
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  isSelectionMode,
  selectedIds,
  entries,
  visibleLimit,
  selectAll,
  deselectAll,
  handleSort,
  sortConfig
}) => {
  const isAllSelected = selectedIds.size === entries.slice(0, visibleLimit).length && entries.length > 0;

  return (
    <div className="flex items-start gap-6 px-6 py-6 border-b border-zinc-100 bg-zinc-50/50 sticky top-0 z-10">
      {isSelectionMode && (
        <div className="w-10 flex justify-center flex-shrink-0">
          <button 
            onClick={isAllSelected ? deselectAll : selectAll}
            className="text-zinc-400 hover:text-blue-600 transition-colors"
          >
            {isAllSelected ? <CheckSquare size={18} /> : <Square size={18} />}
          </button>
        </div>
      )}
      <div className="w-[140px] text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">ΚΑΤΑΣΤΑΣΗ</div>
      <button 
        className="w-[180px] text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 hover:text-zinc-900 transition-colors"
        onClick={() => handleSort('warrantyId')}
      >
        ΕΓΓΥΗΣΗ / VIN <ArrowUpDown size={12} className={sortConfig.key === 'warrantyId' ? 'text-blue-600' : 'opacity-20'} />
      </button>
      <button 
        className="w-[140px] text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 hover:text-zinc-900 transition-colors"
        onClick={() => handleSort('brand')}
      >
        ΕΤΑΙΡΕΙΑ / ΜΑΡΚΑ <ArrowUpDown size={12} className={sortConfig.key === 'brand' ? 'text-blue-600' : 'opacity-20'} />
      </button>
      <button 
        className="w-[160px] text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 hover:text-zinc-900 transition-colors"
        onClick={() => handleSort('createdAt')}
      >
        ΗΜ/ΝΙΑ / ΠΕΛΑΤΗΣ <ArrowUpDown size={12} className={sortConfig.key === 'createdAt' ? 'text-blue-600' : 'opacity-20'} />
      </button>
      <div className="w-[220px] text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΑΝΤΑΛΛΑΚΤΙΚΑ</div>
      <div className="flex-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΠΑΡΑΤΗΡΗΣΕΙΣ</div>
      <div className="w-[160px] text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest pr-6">ΕΝΕΡΓΕΙΕΣ</div>
    </div>
  );
};
