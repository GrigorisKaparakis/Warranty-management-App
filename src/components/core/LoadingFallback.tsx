import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingFallback: Εμφανίζεται κατά τη διάρκεια φόρτωσης των lazy components.
 */
export const LoadingFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-20 animate-in fade-in duration-500">
    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">ΦΟΡΤΩΣΗ ΣΕΛΙΔΑΣ...</p>
  </div>
);
