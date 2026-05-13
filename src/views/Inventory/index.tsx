/**
 * InventoryView/index.tsx: Η κεντρική σελίδα διαχείρισης της λίστας εγγυήσεων.
 * Συντονίζει το φιλτράρισμα, την αναζήτηση, τη σελιδοποίηση και τις μαζικές ενέργειες.
 */
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { BulkActionBar } from '../../components/warranty/BulkActionBar';
import { useInventory } from '../../hooks/inventory/useInventory';
import { PageHeader } from '../../components/ui/PageHeader';

// Sub-components
import { SearchAndFilters } from './SearchAndFilters';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { BulkActionsSection } from './BulkActionsSection';

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
    loadMore,
    hasMore,
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
    settings,
    isLoading
  } = useInventory();

  return (
    <div className="p-4 md:p-8 max-w-[98%] mx-auto space-y-10 pb-32">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="flex-1 space-y-8 w-full">
          <PageHeader title={label} subtitle={isLoading ? 'ΑΝΑΚΤΗΣΗ ΔΕΔΟΜΕΝΩΝ...' : `${entries.length} ΕΓΓΡΑΦΕΣ ΒΡΕΘΗΚΑΝ`} />
          
          <SearchAndFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            companyFilter={companyFilter}
            setCompanyFilter={setCompanyFilter}
            allStatusKeys={allStatusKeys}
            getStatusLabel={getStatusLabel}
            companyBrandMap={settings?.companyBrandMap || {}}
            isFiltered={isFiltered}
            clearFilters={clearFilters}
          />
        </div>
        
        <BulkActionsSection 
          isSelectionMode={isSelectionMode}
          setIsSelectionMode={setIsSelectionMode}
          displayDensity={displayDensity}
          handleDensityChange={handleDensityChange}
          entries={entries}
          settings={settings}
        />
      </div>
      
      {/* Table Section */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden min-h-[600px]">
        <div className="overflow-x-auto">
          <div className="min-w-[1400px]">
            <TableHeader 
              isSelectionMode={isSelectionMode}
              selectedIds={selectedIds}
              entries={entries}
              visibleLimit={visibleLimit}
              selectAll={selectAll}
              deselectAll={deselectAll}
              handleSort={handleSort}
              sortConfig={sortConfig}
            />
            
            <TableBody 
              entries={entries}
              visibleLimit={visibleLimit}
              canEdit={canEdit}
              currentView={currentView}
              isSelectionMode={isSelectionMode}
              selectedIds={selectedIds}
              toggleSelection={toggleSelection}
            />
            
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
