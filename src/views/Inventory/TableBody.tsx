/**
 * TableBody.tsx: Το κυρίως σώμα της λίστας των εγγυήσεων.
 * Διαχειρίζεται την εμφάνιση των Warranty Cards με εφέ κίνησης και το empty state.
 */
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Virtuoso } from 'react-virtuoso';
import { Search } from 'lucide-react';
import { WarrantyCard } from '../../components/warranty/WarrantyCard';
import { Entry } from '../../core/types';

interface TableBodyProps {
  entries: Entry[];
  visibleLimit: number;
  canEdit: boolean;
  currentView: string;
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
}

export const TableBody: React.FC<TableBodyProps> = ({
  entries,
  visibleLimit,
  canEdit,
  currentView,
  isSelectionMode,
  selectedIds,
  toggleSelection
}) => {
  if (entries.length === 0) {
    return (
      <div className="py-40 flex flex-col items-center justify-center text-zinc-300">
        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
          <Search size={32} strokeWidth={1} className="opacity-20" />
        </div>
        <div className="font-black uppercase tracking-[0.2em] text-xs italic">ΔΕΝ ΒΡΕΘΗΚΑΝ ΑΠΟΤΕΛΕΣΜΑΤΑ</div>
      </div>
    );
  }

  const visibleEntries = entries.slice(0, visibleLimit);

  // Note: Standard map with motion for animations. 
  // Virtuoso is better for huge lists, but requires fixed heights or careful config.
  // We'll stick to the current implementation for consistency with animations, 
  // or use Virtuoso if the list is extremely large.
  
  return (
    <div className="divide-y divide-zinc-50">
      <AnimatePresence mode="popLayout">
        {visibleEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.3 }}
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
        ))}
      </AnimatePresence>
    </div>
  );
};
