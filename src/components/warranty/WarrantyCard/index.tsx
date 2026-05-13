/**
 * WarrantyCard/index.tsx: Η συνοπτική κάρτα προβολής μιας εγγύησης.
 * Συντονίζει τα επιμέρους τμήματα (Status, IDs, Customer, Parts) για την εμφάνιση στην κεντρική λίστα.
 */
import React, { useMemo, memo } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Entry, ViewType } from '@/core/types';
import { calculateExpiryInfo, formatDate } from '@/utils/dateUtils';
import { useWarrantyCard } from '@/hooks/warranty/useWarrantyCard';

// Sub-components
import { StatusBadge } from './StatusBadge';
import { IdSection } from './IdSection';
import { CustomerSection } from './CustomerSection';
import { PartList } from './PartList';
import { ActionButtons } from './ActionButtons';

export const WarrantyCard: React.FC<{ 
  entry: Entry, 
  readOnly?: boolean, 
  currentView?: ViewType,
  isSelectionMode?: boolean,
  isSelected?: boolean,
  onSelect?: (id: string) => void
}> = memo(({ 
  entry, 
  readOnly = false, 
  currentView,
  isSelectionMode = false,
  isSelected = false,
  onSelect
}) => {
  const {
    navigate,
    settings,
    canDelete,
    onDelete,
    onVinClick,
    profile,
    copiedField,
    getStatusConfig,
    copyToClipboard,
    handleStatusChange,
    handleTogglePart,
    togglePayment
  } = useWarrantyCard(entry, readOnly);

  const displayDensity = profile?.displayDensity || 'compact';
  const isExpiryView = currentView === 'expiryTracker';
  
  const density = useMemo(() => ({
    compact: { padding: 'py-4 px-6', minHeight: 'min-h-[80px]', fontSize: 'text-[11px]', titleSize: 'text-[14px]' },
    standard: { padding: 'py-6 px-6', minHeight: 'min-h-[100px]', fontSize: 'text-[12px]', titleSize: 'text-[16px]' },
    large: { padding: 'py-8 px-6', minHeight: 'min-h-[120px]', fontSize: 'text-[14px]', titleSize: 'text-[18px]' }
  }[displayDensity]), [displayDensity]);

  const colWidths = {
    status: isExpiryView ? 'w-[100px]' : 'w-[140px]',
    ids: isExpiryView ? 'w-[140px]' : 'w-[180px]',
    brand: isExpiryView ? 'w-[90px]' : 'w-[140px]',
    customer: isExpiryView ? 'w-[110px]' : 'w-[160px]',
    parts: isExpiryView ? 'w-[150px]' : 'w-[220px]'
  };
  
  const formattedDate = useMemo(() => formatDate(entry.createdAt), [entry.createdAt]);
  const expiryInfo = useMemo(() => calculateExpiryInfo(entry, settings), [entry, settings]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        backgroundColor: isSelected ? 'rgba(239, 246, 255, 0.8)' : 'rgba(250, 250, 250, 0.8)',
        x: 4,
        transition: { duration: 0.2 }
      }}
      onClick={() => isSelectionMode && onSelect?.(entry.id)}
      onDoubleClick={() => !isSelectionMode && navigate(`/warranty/${entry.id}`)}
      className={`group bg-white border-b border-zinc-50 transition-all flex items-start gap-6 ${density.padding} ${density.minHeight} cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div className="w-10 flex justify-center flex-shrink-0">
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            isSelected 
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
              : 'border-zinc-200 bg-white'
          }`}>
            {isSelected && <Check size={14} strokeWidth={4} />}
          </div>
        </div>
      )}

      {/* Status Column */}
      <div className={`${colWidths.status} flex-shrink-0`}>
        <StatusBadge 
          status={entry.status}
          readOnly={readOnly}
          settings={settings}
          getStatusConfig={getStatusConfig}
          handleStatusChange={handleStatusChange}
          fontSize={density.fontSize}
        />
      </div>

      {/* IDs Column */}
      <div className={`${colWidths.ids} flex-shrink-0`}>
        <IdSection 
          warrantyId={entry.warrantyId}
          vin={entry.vin}
          copiedField={copiedField}
          copyToClipboard={copyToClipboard}
          onVinClick={onVinClick}
          titleSize={density.titleSize}
          fontSize={density.fontSize}
        />
      </div>

      {/* Brand Column */}
      <div className={`${colWidths.brand} flex-shrink-0 flex flex-col`}>
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate leading-tight mb-1">{entry.company || '-'}</div>
        <div className={`${density.fontSize} font-black text-zinc-900 uppercase tracking-tight truncate leading-tight`}>{entry.brand}</div>
      </div>

      {/* Date/Customer Column */}
      <div className={`${colWidths.customer} flex-shrink-0`}>
        <CustomerSection 
          fullName={entry.fullName}
          formattedDate={formattedDate}
          expiryInfo={expiryInfo}
          status={entry.status}
          isPaid={entry.isPaid}
          fontSize={density.fontSize}
        />
      </div>

      {/* Parts Column */}
      <div className={`${colWidths.parts} flex-shrink-0 overflow-visible`}>
        <PartList 
          parts={entry.parts}
          readOnly={readOnly}
          handleTogglePart={handleTogglePart}
          fontSize={density.fontSize}
        />
      </div>

      {/* Notes Column */}
      <div className="flex-1 min-w-0 pr-12 pl-6">
        <div className={`${density.fontSize} font-medium text-zinc-500 whitespace-pre-line leading-relaxed transition-all italic`}>
          {entry.notes || '-'}
        </div>
      </div>

      {/* Actions Column */}
      {currentView !== 'expiryTracker' && (
        <ActionButtons 
          entry={entry}
          readOnly={readOnly}
          canDelete={canDelete}
          settings={settings}
          onDelete={onDelete}
          togglePayment={togglePayment}
          navigate={navigate}
        />
      )}
    </motion.div>
  );
});
