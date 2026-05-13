/**
 * ActionButtons.tsx: Τα κουμπιά ενεργειών (Payment, PDF, Edit, Delete) πάνω σε κάθε κάρτα εγγύησης.
 */
import React from 'react';
import { FileText, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Entry, GarageSettings } from '@/core/types';
import { UI_MESSAGES } from '@/core/config';
import { PDFService } from '@/services/pdf';

interface ActionButtonsProps {
  entry: Entry;
  readOnly: boolean;
  canDelete: boolean;
  settings: GarageSettings;
  onDelete: (params: { id: string, warrantyId: string }) => void;
  togglePayment: () => void;
  navigate: (path: string) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  entry, 
  readOnly, 
  canDelete, 
  settings, 
  onDelete, 
  togglePayment,
  navigate
}) => {
  return (
    <div className="w-[160px] flex-shrink-0 flex items-start justify-end gap-2 pr-6">
      <button
        type="button"
        disabled={readOnly}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePayment(); }}
        className={`min-w-[65px] px-2 py-2 rounded-lg text-[9px] font-black transition-all border shadow-sm ${
          entry.isPaid 
            ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-100' 
            : 'bg-rose-50 text-rose-500 border-rose-200'
        } hover:scale-105 active:scale-95`}
      >
        {entry.isPaid ? UI_MESSAGES.LABELS.PAID : UI_MESSAGES.LABELS.UNPAID}
      </button>
      
      <div className="flex items-center gap-1 opacity-20 md:opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
        <Button 
          variant="neutral" 
          size="icon" 
          onClick={(e) => { e.stopPropagation(); PDFService.exportSingleEntry(entry, settings); }}
          className="w-7 h-7 rounded-md border-zinc-100 bg-zinc-50/80 hover:bg-zinc-100"
          title="PDF"
        >
          <FileText size={12} />
        </Button>

        {!readOnly && (
          <Button 
            variant="neutral" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); navigate(`/warranty/edit/${entry.id}`); }}
            className="w-7 h-7 rounded-md border-zinc-100 bg-zinc-50/80 hover:bg-zinc-100"
          >
            <Edit3 size={12} />
          </Button>
        )}

        {canDelete && (
          <Button 
            variant="danger" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); onDelete({ id: entry.id, warrantyId: entry.warrantyId }); }}
            className="w-7 h-7 rounded-md shadow-sm"
          >
            <Trash2 size={12} />
          </Button>
        )}
      </div>
    </div>
  );
};
