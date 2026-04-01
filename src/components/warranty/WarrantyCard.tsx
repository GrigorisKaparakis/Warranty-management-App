/**
 * WarrantyCard.tsx: Κάρτα εμφάνισης μεμονωμένης εγγύησης.
 * Εμφανίζει τα βασικά στοιχεία (ID, VIN, Πελάτης, Ανταλλακτικά) και επιτρέπει γρήγορες ενέργειες.
 */

import React, { useMemo, memo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Entry, ViewType } from '../../core/types';
import { UI_MESSAGES } from '../../core/config';
import { PDFService } from '../../services/pdf';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { calculateExpiryInfo } from '../../utils/dateUtils';
import { useWarrantyCard } from '../../hooks/useWarrantyCard';
import { 
  Copy, 
  Check, 
  FileText, 
  Edit3, 
  Trash2, 
  Calendar, 
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';

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
  
  // Density-based styles
  const density = useMemo(() => ({
    compact: { padding: 'py-4 px-6', minHeight: 'min-h-[80px]', fontSize: 'text-[11px]', titleSize: 'text-[14px]' },
    standard: { padding: 'py-6 px-6', minHeight: 'min-h-[100px]', fontSize: 'text-[12px]', titleSize: 'text-[16px]' },
    large: { padding: 'py-8 px-6', minHeight: 'min-h-[120px]', fontSize: 'text-[14px]', titleSize: 'text-[18px]' }
  }[displayDensity]), [displayDensity]);

  const colWidths = {
    status: isExpiryView ? 'w-[110px]' : 'w-[140px]',
    ids: isExpiryView ? 'w-[150px]' : 'w-[180px]',
    brand: isExpiryView ? 'w-[110px]' : 'w-[140px]',
    customer: isExpiryView ? 'w-[130px]' : 'w-[160px]',
    parts: isExpiryView ? 'w-[160px]' : 'w-[220px]'
  };
  
  const currentConfig = getStatusConfig(entry.status);
  const formattedDate = new Date(entry.createdAt).toLocaleDateString('el-GR');
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
        {!readOnly ? (
          <div className="relative">
            <select 
              value={entry.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{ 
                backgroundColor: `${currentConfig.color}10`, 
                color: currentConfig.color,
                borderColor: `${currentConfig.color}20`
              }}
              className={`w-full ${density.fontSize} font-black px-4 py-2.5 rounded-xl border cursor-pointer outline-none transition-all appearance-none text-center shadow-sm hover:shadow-md`}
            >
              {(settings.statusOrder || Object.keys(settings.statusConfigs || {})).map(s => {
                const conf = getStatusConfig(s);
                if (!settings.statusConfigs?.[s]) return null;
                return <option key={s} value={s}>{conf.label}</option>;
              })}
            </select>
          </div>
        ) : (
          <Badge 
            variant="neutral"
            style={{ backgroundColor: `${currentConfig.color}15`, color: currentConfig.color }}
            className="w-full justify-center py-2.5 border-none"
          >
            {currentConfig.label}
          </Badge>
        )}
      </div>

      {/* IDs Column */}
      <div className={`${colWidths.ids} flex-shrink-0 space-y-2`}>
        <div className="flex items-center gap-2 group/id">
          <span className={`${density.titleSize} font-black text-zinc-900 tracking-tighter uppercase leading-none`}>
            {entry.warrantyId}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); copyToClipboard(entry.warrantyId, 'wid'); }} 
            className="opacity-0 group-hover/id:opacity-100 transition-all p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400"
          >
            {copiedField === 'wid' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>
        </div>
        <div className="flex items-center gap-2 group/vin">
          <button 
            onClick={(e) => { e.stopPropagation(); onVinClick?.(entry.vin); }}
            className={`inline-block bg-zinc-100 text-zinc-500 font-mono ${density.fontSize} px-2.5 py-1 rounded-lg leading-none uppercase font-black border border-zinc-200 shadow-sm hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all`}
          >
            {entry.vin}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); copyToClipboard(entry.vin, 'vin'); }} 
            className="opacity-0 group-hover/vin:opacity-100 transition-all p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400"
          >
            {copiedField === 'vin' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Brand Column */}
      <div className={`${colWidths.brand} flex-shrink-0`}>
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{entry.company || '-'}</div>
        <div className={`${density.fontSize} font-black text-zinc-900 uppercase tracking-tight`}>{entry.brand}</div>
      </div>

      {/* Date/Customer Column */}
      <div className={`${colWidths.customer} flex-shrink-0 space-y-2 relative`}>
        <div className="flex items-center gap-2 text-zinc-400">
          <Calendar size={12} />
          <span className={`${density.fontSize} font-bold`}>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <UserIcon size={12} className="text-zinc-400" />
          <Link 
            to={`/customer/${encodeURIComponent(entry.fullName.replace(/\n/g, ' '))}`}
            onClick={(e) => e.stopPropagation()}
            className={`${density.fontSize} font-black truncate uppercase tracking-tight text-blue-600 hover:underline decoration-2 underline-offset-4`}
          >
            {entry.fullName || '-'}
          </Link>
        </div>
        {expiryInfo && entry.status !== 'REJECTED' && !entry.isPaid && (
          <div className="mt-2">
            <Badge variant={expiryInfo.variant} className="text-[9px] px-2 py-0.5 border-none shadow-sm">
              {expiryInfo.text}
            </Badge>
          </div>
        )}
      </div>

      {/* Parts Column */}
      <div className={`${colWidths.parts} flex-shrink-0`}>
        <div className="flex flex-wrap gap-2">
          {entry.parts.length > 0 ? entry.parts.map((part, index) => (
            <button
              key={part.id || `part-${index}`}
              disabled={readOnly}
              onClick={(e) => { e.stopPropagation(); handleTogglePart(part.id); }}
              className={`px-3 py-1.5 rounded-xl ${density.fontSize} font-black shadow-sm border transition-all active:scale-95 flex flex-col items-start ${
                part.isReady 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                  : 'bg-amber-50 border-amber-100 text-amber-700'
              }`}
              title={`${part.description || UI_MESSAGES.LABELS.NO_DESCRIPTION} (X${part.quantity})`}
            >
              <div className="flex items-center gap-1.5">
                <span>{part.code}</span>
                <span className="opacity-40 text-[9px]">x{part.quantity}</span>
                {part.isReady && <CheckCircle2 size={10} />}
              </div>
              {part.description && (
                <span className="text-[8px] opacity-50 mt-0.5 truncate max-w-[100px] font-bold uppercase">
                  {part.description}
                </span>
              )}
            </button>
          )) : (
            <span className="text-[10px] text-zinc-300 italic font-black uppercase tracking-widest">{UI_MESSAGES.LABELS.NO_PARTS}</span>
          )}
        </div>
      </div>

      {/* Notes Column */}
      <div className="flex-1 min-w-0 px-4">
        <div className={`${density.fontSize} font-medium text-zinc-600 whitespace-pre-line leading-relaxed transition-all`}>
          {entry.notes || '-'}
        </div>
      </div>

      {/* Actions Column */}
      {currentView !== 'expiryTracker' && (
        <div className="w-[160px] flex-shrink-0 flex items-start justify-end gap-3 pl-4 border-l border-zinc-50 pt-1">
          <button
            type="button"
            disabled={readOnly}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePayment(); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border shadow-sm ${
              entry.isPaid 
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-100' 
                : 'bg-rose-50 text-rose-500 border-rose-100'
            }`}
          >
            {entry.isPaid ? UI_MESSAGES.LABELS.PAID : UI_MESSAGES.LABELS.UNPAID}
          </button>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <Button 
              variant="neutral" 
              size="icon" 
              onClick={(e) => { e.stopPropagation(); PDFService.exportSingleEntry(entry, settings); }}
              className="w-9 h-9 rounded-xl border-zinc-100"
              title="PDF"
            >
              <FileText size={14} />
            </Button>

            {!readOnly && (
              <Button 
                variant="neutral" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); navigate(`/warranty/edit/${entry.id}`); }}
                className="w-9 h-9 rounded-xl border-zinc-100"
              >
                <Edit3 size={14} />
              </Button>
            )}

            {canDelete && (
              <Button 
                variant="danger" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); onDelete({ id: entry.id, warrantyId: entry.warrantyId }); }}
                className="w-9 h-9 rounded-xl"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
});
