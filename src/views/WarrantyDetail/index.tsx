/**
 * WarrantyDetailView: Αναλυτική προβολή όλων των στοιχείων μιας εγγύησης.
 * Συντονίζει την εμφάνιση των οχημάτων, ανταλλακτικών, πελατών και του ιστορικού αλλαγών (Audit History).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppState } from '../../hooks/core/useAppState';
import { useStore } from '../../store/useStore';
import { toast } from '../../utils/toast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FirestoreService } from '../../services/firebase/db';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2
} from 'lucide-react';

// Sub-components
import { VehicleInfoSection } from './VehicleInfoSection';
import { PartsTable } from './PartsTable';
import { CustomerCard } from './CustomerCard';
import { AuditHistoryTimeline } from './AuditHistoryTimeline';
import { ExpiryModal } from './ExpiryModal';

export const WarrantyDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const entries = useStore(s => s.entries);
  const auditLogs = useStore(s => s.auditLogs);
  const settings = useStore(s => s.settings);
  const setDeletingEntry = useStore(s => s.setDeletingEntry);

  const { 
    canEdit, 
    canDelete, 
    navigateToVinHistory
  } = useAppState();

  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [isUpdatingExpiry, setIsUpdatingExpiry] = useState(false);

  const entry = useMemo(() => entries.find(e => e.id === id), [entries, id]);

  useEffect(() => {
    if (entry?.expiryAt) {
      setNewExpiryDate(new Date(entry.expiryAt).toISOString().split('T')[0]);
    }
  }, [entry]);

  const handleUpdateExpiry = async (overrideDate?: string) => {
    if (!entry) return;
    
    const dateToUse = overrideDate !== undefined ? overrideDate : newExpiryDate;
    setIsUpdatingExpiry(true);
    try {
      const expiryTimestamp = dateToUse ? new Date(dateToUse).getTime() : null;
      await FirestoreService.updateEntry(entry.id, { expiryAt: expiryTimestamp }, entry);
      toast.success(expiryTimestamp ? "Η ΗΜΕΡΟΜΗΝΙΑ ΛΗΞΗΣ ΕΝΗΜΕΡΩΘΗΚΕ ΕΠΙΤΥΧΩΣ." : "Η ΗΜΕΡΟΜΗΝΙΑ ΛΗΞΗΣ ΑΦΑΙΡΕΘΗΚΕ.");
      setIsExpiryModalOpen(false);
    } catch (error) {
      console.error("Failed to update expiry:", error);
      toast.error("ΣΦΑΛΜΑ ΚΑΤΑ ΤΗΝ ΕΝΗΜΕΡΩΣΗ ΤΗΣ ΛΗΞΗΣ.");
    } finally {
      setIsUpdatingExpiry(false);
    }
  };

  const entryLogs = useMemo(() => 
    auditLogs.filter(log => log.targetId === id).sort((a, b) => b.timestamp - a.timestamp),
    [auditLogs, id]
  );

  useEffect(() => {
    if (!entry && entries.length > 0) {
      toast.error("Η ΕΓΓΥΗΣΗ ΔΕΝ ΒΡΕΘΗΚΕ.");
      navigate('/warranty/inventory');
    }
  }, [entry, entries, navigate]);

  if (!entry) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusConfig = settings.statusConfigs?.[entry.status] || { label: entry.status, color: '#64748b' };

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link 
            to="/warranty/inventory" 
            className="w-12 h-12 flex items-center justify-center bg-zinc-100 text-zinc-400 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΕΓΓΥΗΣΗ #{entry.warrantyId}</span>
              <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">•</span>
              <Badge 
                variant="primary"
                style={{ backgroundColor: statusConfig.color }}
                className="text-white border-none"
              >
                {statusConfig.label}
              </Badge>
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic">{entry.vin}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canEdit && (
            <Button 
              onClick={() => navigate(`/warranty/edit/${entry.id}`)}
              icon={Edit3}
              variant="primary"
              className="px-8 shadow-xl shadow-blue-100"
            >
              ΕΠΕΞΕΡΓΑΣΙΑ
            </Button>
          )}
          {canDelete && (
            <Button 
              onClick={() => setDeletingEntry(entry)}
              icon={Trash2}
              variant="danger"
              size="icon"
              className="w-12 h-12"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-10">
          <VehicleInfoSection 
            entry={entry}
            canEdit={canEdit}
            onOpenExpiryModal={() => setIsExpiryModalOpen(true)}
            onNavigateToVinHistory={navigateToVinHistory}
          />
          <PartsTable entry={entry} />
        </div>

        <div className="space-y-10 lg:sticky lg:top-8 self-start">
          <CustomerCard entry={entry} />
          <AuditHistoryTimeline entry={entry} entryLogs={entryLogs} />
        </div>
      </div>

      <ExpiryModal 
        isOpen={isExpiryModalOpen}
        onClose={() => setIsExpiryModalOpen(false)}
        newExpiryDate={newExpiryDate}
        setNewExpiryDate={setNewExpiryDate}
        onUpdateExpiry={handleUpdateExpiry}
        isUpdatingExpiry={isUpdatingExpiry}
      />
    </div>
  );
};

