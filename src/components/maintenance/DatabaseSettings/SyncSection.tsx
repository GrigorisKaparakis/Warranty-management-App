/**
 * SyncSection.tsx: Το τμήμα συγχρονισμού στην κορυφή κάθε μητρώου.
 * Επιτρέπει την έναρξη της διαδικασίας εξαγωγής δεδομένων από τις υπάρχουσες εγγραφές.
 */
import React from 'react';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';

interface SyncSectionProps {
  title: string;
  description: string;
  isMigrating: boolean;
  migrationCount: number;
  onMigrate: () => void;
  icon?: any;
}

export const SyncSection: React.FC<SyncSectionProps> = ({
  title,
  description,
  isMigrating,
  migrationCount,
  onMigrate,
  icon: Icon
}) => {
  return (
    <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
      <div className="relative z-10">
        <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-1 flex items-center gap-2">
          {Icon && <Icon size={16} />}
          {title}
        </h3>
        <p className="text-[10px] font-bold text-indigo-600/70 uppercase max-w-lg italic">
          {description}
        </p>
      </div>
      
      <Button 
        variant={isMigrating ? "secondary" : "primary"}
        onClick={onMigrate}
        disabled={isMigrating}
        icon={isMigrating ? Loader2 : RefreshCcw}
        className={`rounded-2xl px-10 h-14 shadow-lg shadow-indigo-200 transition-all ${isMigrating ? 'animate-pulse' : ''}`}
      >
        {isMigrating ? `ΣΥΓΧΡΟΝΙΣΜΟΣ (${migrationCount})...` : "ΕΝΑΡΞΗ ΣΥΓΧΡΟΝΙΣΜΟΥ"}
      </Button>
    </div>
  );
};
