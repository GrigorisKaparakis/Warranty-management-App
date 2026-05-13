/**
 * IdSection.tsx: Εμφάνιση Warranty ID και VIN με δυνατότητα αντιγραφής και αναζήτησης ιστορικού.
 */
import React from 'react';
import { Copy, Check } from 'lucide-react';

interface IdSectionProps {
  warrantyId: string;
  vin: string;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
  onVinClick?: (vin: string) => void;
  titleSize: string;
  fontSize: string;
}

export const IdSection: React.FC<IdSectionProps> = ({ 
  warrantyId, 
  vin, 
  copiedField, 
  copyToClipboard, 
  onVinClick,
  titleSize,
  fontSize
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 group/id">
        <span className={`${titleSize} font-black text-zinc-900 tracking-tighter uppercase leading-none`}>
          {warrantyId}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); copyToClipboard(warrantyId, 'wid'); }} 
          className="opacity-0 group-hover/id:opacity-100 transition-all p-1 hover:bg-zinc-100 rounded-lg text-zinc-400"
        >
          {copiedField === 'wid' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
        </button>
      </div>
      <div className="flex items-center gap-2 group/vin">
        <button 
          onClick={(e) => { e.stopPropagation(); onVinClick?.(vin); }}
          className={`inline-block bg-zinc-100 text-zinc-500 font-mono ${fontSize} px-2 py-0.5 rounded-lg leading-none uppercase font-black border border-zinc-200 shadow-sm hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all`}
        >
          {vin}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); copyToClipboard(vin, 'vin'); }} 
          className="opacity-0 group-hover/vin:opacity-100 transition-all p-1 hover:bg-zinc-100 rounded-lg text-zinc-400"
        >
          {copiedField === 'vin' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
};
