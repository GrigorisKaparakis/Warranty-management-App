/**
 * PartList.tsx: Η λίστα των ανταλλακτικών στην κάρτα εγγύησης.
 */
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Part } from '@/core/types';
import { UI_MESSAGES } from '@/core/config';

interface PartListProps {
  parts: Part[];
  readOnly: boolean;
  handleTogglePart: (partId: string) => void;
  fontSize: string;
}

export const PartList: React.FC<PartListProps> = ({ 
  parts, 
  readOnly, 
  handleTogglePart,
  fontSize
}) => {
  if (parts.length === 0) {
    return <span className="text-[10px] text-zinc-300 italic font-black uppercase tracking-widest">{UI_MESSAGES.LABELS.NO_PARTS}</span>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {parts.map((part, index) => (
        <button
          key={part.id || `part-${index}`}
          disabled={readOnly}
          onClick={(e) => { e.stopPropagation(); handleTogglePart(part.id); }}
          className={`w-full text-left px-3 py-1.5 rounded-xl border transition-all active:scale-[0.98] flex flex-col gap-0.5 ${
            part.isReady 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-amber-50 border-amber-100 text-amber-800'
          } hover:shadow-md group/part`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <span className={`${fontSize} font-black tracking-tight`}>{part.code}</span>
              <span className="opacity-40 text-[9px] font-black">x{part.quantity}</span>
            </div>
            {part.isReady && <CheckCircle2 size={12} className="text-emerald-500" />}
          </div>
          {part.description && (
            <div className="text-[9px] font-bold uppercase opacity-60 leading-tight">
              {part.description}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
