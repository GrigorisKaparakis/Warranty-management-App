/**
 * BulkActionsSection.tsx: Ενότητα μαζικών ενεργειών και ρυθμίσεων προβολής.
 * Επιτρέπει την ενεργοποίηση της μαζικής επιλογής, την αλλαγή πυκνότητας προβολής και την εξαγωγή PDF.
 */
import React from 'react';
import { CheckSquare, LayoutGrid, List as ListIcon, Maximize2, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PDFService } from '../../services/pdf';
import { Entry } from '../../core/types';

interface BulkActionsSectionProps {
  isSelectionMode: boolean;
  setIsSelectionMode: (val: boolean) => void;
  displayDensity: 'compact' | 'standard' | 'large';
  handleDensityChange: (val: 'compact' | 'standard' | 'large') => void;
  entries: Entry[];
  settings: any;
}

export const BulkActionsSection: React.FC<BulkActionsSectionProps> = ({
  isSelectionMode,
  setIsSelectionMode,
  displayDensity,
  handleDensityChange,
  entries,
  settings
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1 bg-white border border-zinc-100 rounded-2xl p-1.5 shadow-sm">
        <button
          onClick={() => setIsSelectionMode(!isSelectionMode)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isSelectionMode 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-zinc-400 hover:bg-zinc-50'
          }`}
          title="ΜΑΖΙΚΗ ΕΠΙΛΟΓΗ"
        >
          <CheckSquare size={16} />
        </button>
        <div className="w-px h-6 bg-zinc-100 mx-1" />
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
                ? 'bg-zinc-900 text-white shadow-lg' 
                : 'text-zinc-400 hover:bg-zinc-50'
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
        className="rounded-2xl h-14 px-8 border-zinc-100"
      >
        EXPORT PDF
      </Button>
    </div>
  );
};
