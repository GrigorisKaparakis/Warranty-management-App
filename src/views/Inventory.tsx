import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WarrantyCard } from '../components/warranty/WarrantyCard';
import { BulkActionBar } from '../components/warranty/BulkActionBar';
import { PDFService } from '../services/pdf';
import { useInventory } from '../hooks/useInventory';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { 
  Search, 
  Download, 
  ChevronDown, 
  X, 
  Calendar,
  LayoutGrid,
  List as ListIcon,
  Maximize2,
  ArrowUpDown,
  CheckSquare,
  Square
} from 'lucide-react';

/**
 * ListView: Εμφανίζει μια λίστα εγγυήσεων με δυνατότητα φιλτραρίσματος,
 * αναζήτησης και μαζικών ενεργειών.
 */
export const ListView: React.FC<{ label: string }> = ({ label }) => {
  const {
    currentView,
    entries,
    visibleLimit,
    pageSize,
    setVisibleLimit,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    companyFilter,
    setCompanyFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    sortConfig,
    handleSort,
    isSelectionMode,
    setIsSelectionMode,
    selectedIds,
    toggleSelection,
    selectAll,
    deselectAll,
    handleBulkStatusChange,
    handleBulkPaymentChange,
    handleBulkDelete,
    clearFilters,
    isFiltered,
    displayDensity,
    handleDensityChange,
    allStatusKeys,
    getStatusLabel,
    canEdit,
    settings
  } = useInventory();

  return (
    <div className="p-4 md:p-8 max-w-[98%] mx-auto space-y-10 pb-32">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="flex-1 space-y-8 w-full">
          <PageHeader title={label} subtitle={`${entries.length} ΕΓΓΡΑΦΕΣ ΒΡΕΘΗΚΑΝ`} />
          
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[320px] group">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="ΑΝΑΖΗΤΗΣΗ ΣΕ ΟΛΑ ΤΑ ΠΕΔΙΑ..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="w-full pl-14 pr-6 py-4 bg-slate-900/60 border border-white/5 rounded-[1.5rem] text-[11px] font-bold outline-none shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-600 text-white" 
              />
            </div>
            
            {/* Date Range */}
            <div className="flex items-center gap-3 bg-slate-900/60 border border-white/5 rounded-[1.5rem] px-6 py-2 shadow-sm">
               <Calendar size={14} className="text-slate-500" />
               <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-[10px] font-bold outline-none bg-transparent uppercase text-white" />
               <span className="text-white/10">—</span>
               <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-[10px] font-bold outline-none bg-transparent uppercase text-white" />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-6 py-4 bg-slate-900/60 border border-white/5 rounded-[1.5rem] text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer hover:bg-slate-800 transition-all appearance-none text-white">
                <option value="ALL">ΚΑΤΑΣΤΑΣΗ: ΟΛΕΣ</option>
                {allStatusKeys.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
              </select>

              <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="px-6 py-4 bg-slate-900/60 border border-white/5 rounded-[1.5rem] text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer hover:bg-slate-800 transition-all appearance-none text-white">
                <option value="ALL">ΕΤΑΙΡΕΙΑ: ΟΛΕΣ</option>
                {Object.keys(settings?.companyBrandMap || {}).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {isFiltered && (
              <Button variant="neutral" onClick={clearFilters} icon={X} className="rounded-[1.5rem] px-6">
                ΚΑΘΑΡΙΣΜΟΣ
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-900/60 border border-white/5 rounded-2xl p-1.5 shadow-sm">
            <button
              onClick={() => setIsSelectionMode(!isSelectionMode)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isSelectionMode 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-500 hover:bg-slate-800'
              }`}
              title="ΜΑΖΙΚΗ ΕΠΙΛΟΓΗ"
            >
              <CheckSquare size={16} />
            </button>
            <div className="w-px h-6 bg-white/5 mx-1" />
            {[
              { id: 'compact', icon: LayoutGrid },
              { id: 'standard', icon: ListIcon },
              { id: 'large', icon: Maximize2 }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => handleDensityChange(d.id as any)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  displayDensity === d.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-500 hover:bg-slate-800'
                }`}
              >
                <d.icon size={16} />
              </button>
            ))}
          </div>

          <Button 
            variant="neutral" 
            onClick={() => PDFService.exportEntryList(entries, settings)}
            icon={Download}
            className="rounded-2xl h-14 px-8 border-white/5 bg-slate-900/60 text-white hover:bg-slate-800"
          >
            EXPORT PDF
          </Button>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="bg-slate-950/40 rounded-[3rem] shadow-2xl shadow-black/20 border border-white/5 overflow-hidden min-h-[600px] backdrop-blur-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[1400px]">
            {/* Table Header */}
            <div className="flex items-center gap-6 px-6 py-6 border-b border-white/5 bg-slate-900/50 sticky top-0 z-10">
              {isSelectionMode && (
                <div className="w-10 flex justify-center flex-shrink-0">
                  <button 
                    onClick={selectedIds.size === entries.slice(0, visibleLimit).length ? deselectAll : selectAll}
                    className="text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    {selectedIds.size === entries.slice(0, visibleLimit).length ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </div>
              )}
              <div className="w-[140px] text-[10px] font-black text-slate-500 uppercase tracking-widest">ΚΑΤΑΣΤΑΣΗ</div>
              <button 
                className="w-[180px] text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
                onClick={() => handleSort('warrantyId')}
              >
                ΕΓΓΥΗΣΗ / VIN <ArrowUpDown size={12} className={sortConfig.key === 'warrantyId' ? 'text-blue-400' : 'opacity-20'} />
              </button>
              <button 
                className="w-[140px] text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
                onClick={() => handleSort('brand')}
              >
                ΕΤΑΙΡΕΙΑ / ΜΑΡΚΑ <ArrowUpDown size={12} className={sortConfig.key === 'brand' ? 'text-blue-400' : 'opacity-20'} />
              </button>
              <button 
                className="w-[160px] text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                ΗΜ/ΝΙΑ / ΠΕΛΑΤΗΣ <ArrowUpDown size={12} className={sortConfig.key === 'createdAt' ? 'text-blue-400' : 'opacity-20'} />
              </button>
              <div className="w-[220px] text-[10px] font-black text-slate-500 uppercase tracking-widest">ΑΝΤΑΛΛΑΚΤΙΚΑ</div>
              <div className="flex-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">ΠΑΡΑΤΗΡΗΣΕΙΣ</div>
              <div className="w-[160px] text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pr-6">ΕΝΕΡΓΕΙΕΣ</div>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {entries.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-40 flex flex-col items-center justify-center text-zinc-300"
                  >
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                      <Search size={32} strokeWidth={1} className="opacity-20" />
                    </div>
                    <div className="font-black uppercase tracking-[0.2em] text-xs italic">ΔΕΝ ΒΡΕΘΗΚΑΝ ΑΠΟΤΕΛΕΣΜΑΤΑ</div>
                  </motion.div>
                ) : (
                  entries.slice(0, visibleLimit).map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                    >
                      <WarrantyCard 
                        entry={entry} 
                        readOnly={!canEdit} 
                        currentView={currentView as any}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedIds.has(entry.id)}
                        onSelect={toggleSelection}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
            
            {entries.length > visibleLimit && (
              <button 
                onClick={() => setVisibleLimit(prev => prev + pageSize)} 
                className="w-full py-12 text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] hover:bg-blue-50 transition-all border-t border-zinc-100 bg-white active:bg-blue-100 flex items-center justify-center gap-3 group"
              >
                <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
                ΠΡΟΒΟΛΗ ΠΕΡΙΣΣΟΤΕΡΩΝ (+{entries.length - visibleLimit})
              </button>
            )}
          </div>
        </div>
      </div>

      <BulkActionBar 
        selectedCount={selectedIds.size}
        allStatusKeys={allStatusKeys}
        getStatusLabel={getStatusLabel}
        onStatusChange={handleBulkStatusChange}
        onPaymentChange={handleBulkPaymentChange}
        onDelete={handleBulkDelete}
        onClose={() => setIsSelectionMode(false)}
      />
    </div>
  );
};
