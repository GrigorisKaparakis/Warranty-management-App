/**
 * VehicleInfoSection.tsx: Ενότητα πληροφοριών οχήματος.
 * Εμφανίζει την εταιρεία, τη μάρκα, το VIN και την ημερομηνία λήξης της εγγύησης.
 */
import React from 'react';
import { Car, Calendar, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Entry } from '../../core/types';

interface VehicleInfoSectionProps {
  entry: Entry;
  canEdit: boolean;
  onOpenExpiryModal: () => void;
  onNavigateToVinHistory: (vin: string) => void;
}

export const VehicleInfoSection: React.FC<VehicleInfoSectionProps> = ({
  entry,
  canEdit,
  onOpenExpiryModal,
  onNavigateToVinHistory
}) => {
  return (
    <Card title="ΣΤΟΙΧΕΙΑ ΟΧΗΜΑΤΟΣ" icon={Car}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-1">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΕΤΑΙΡΕΙΑ / ΜΑΡΚΑ</div>
          <div className="text-lg font-black text-zinc-900 uppercase">{entry.company} / {entry.brand}</div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΑΡΙΘΜΟΣ ΠΛΑΙΣΙΟΥ (VIN)</div>
          <button 
            onClick={() => onNavigateToVinHistory(entry.vin)}
            className="text-lg font-mono font-black text-blue-600 tracking-wider hover:underline transition-all text-left"
          >
            {entry.vin}
          </button>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΗΜΕΡΟΜΗΝΙΑ ΛΗΞΗΣ ΕΓΓΥΗΣΗΣ</div>
          <div className="flex items-center gap-3">
            <div className={`text-lg font-black uppercase ${
              entry.expiryAt && entry.expiryAt < Date.now() ? 'text-rose-600' : 'text-zinc-900'
            }`}>
              {entry.expiryAt ? new Date(entry.expiryAt).toLocaleDateString('el-GR') : 'ΔΕΝ ΕΧΕΙ ΟΡΙΣΤΕΙ'}
            </div>
            {canEdit && (
              <button 
                onClick={onOpenExpiryModal}
                className="p-2 bg-zinc-100 text-zinc-500 rounded-lg hover:bg-zinc-900 hover:text-white transition-all"
                title="Χειροκίνητη Αλλαγή Λήξης"
              >
                <Calendar size={14} />
              </button>
            )}
          </div>
          {entry.expiryAt && entry.expiryAt < Date.now() && (
            <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase tracking-tight">
              <AlertTriangle size={10} />
              Η ΕΓΓΥΗΣΗ ΕΧΕΙ ΛΗΞΕΙ
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
