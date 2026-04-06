import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { useStore } from '../store/useStore';
import { toast } from '../utils/toast';
import { getActionColor } from '../utils/auditUtils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { FirestoreService } from '../services/firebase/db';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Car, 
  User, 
  FileText, 
  History,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle
} from 'lucide-react';

/**
 * WarrantyDetailView: Αναλυτική προβολή όλων των στοιχείων μιας εγγύησης,
 * συμπεριλαμβανομένων των ανταλλακτικών, των σημειώσεων και της κατάστασης πληρωμής.
 */
export const WarrantyDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Raw state from useStore
  const entries = useStore(s => s.entries);
  const auditLogs = useStore(s => s.auditLogs);
  const settings = useStore(s => s.settings);
  const setDeletingEntry = useStore(s => s.setEditingEntry); // Note: setDeletingEntry was mapped to setEditingEntry in useAppState

  // Logic from useAppState
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
          <Card title="ΣΤΟΙΧΕΙΑ ΟΧΗΜΑΤΟΣ" icon={Car}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΕΤΑΙΡΕΙΑ / ΜΑΡΚΑ</div>
                <div className="text-lg font-black text-zinc-900 uppercase">{entry.company} / {entry.brand}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΑΡΙΘΜΟΣ ΠΛΑΙΣΙΟΥ (VIN)</div>
                <button 
                  onClick={() => navigateToVinHistory(entry.vin)}
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
                      onClick={() => setIsExpiryModalOpen(true)}
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

          <Card title="ΑΝΤΑΛΛΑΚΤΙΚΑ" icon={FileText} noPadding>
            {entry.parts && entry.parts.length > 0 ? (
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-100">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ΚΩΔΙΚΟΣ</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ΠΕΡΙΓΡΑΦΗ</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">ΠΟΣΟΤΗΤΑ</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {entry.parts.map((p, i) => (
                      <tr key={i} className="hover:bg-zinc-50/30 transition-colors">
                        <td className="px-8 py-5 text-xs font-mono font-black text-blue-600 uppercase">{p.code || '-'}</td>
                        <td className="px-8 py-5 text-xs font-bold text-zinc-700 uppercase">{p.description}</td>
                        <td className="px-8 py-5 text-xs font-black text-zinc-900 text-right">{p.quantity}</td>
                        <td className="px-8 py-5 text-center">
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl shadow-sm border ${
                            p.isReady ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {p.isReady ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center">
                <p className="text-xs font-black text-zinc-300 uppercase italic tracking-widest">ΔΕΝ ΥΠΑΡΧΟΥΝ ΚΑΤΑΓΕΓΡΑΜΜΕΝΑ ΑΝΤΑΛΛΑΚΤΙΚΑ.</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-10 lg:sticky lg:top-8 self-start">
          <Card title="ΣΤΟΙΧΕΙΑ ΠΕΛΑΤΗ" icon={User}>
            <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-blue-200 transition-all">
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">ΟΝΟΜΑΤΕΠΩΝΥΜΟ</div>
              <Link 
                to={`/customer/${encodeURIComponent(entry.fullName.replace(/\n/g, ' '))}`}
                className="text-base font-black text-blue-600 uppercase hover:underline block"
              >
                {entry.fullName}
              </Link>
            </div>
          </Card>

          <Card title="ΙΣΤΟΡΙΚΟ" icon={History}>
            <div className="space-y-8 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
              {entryLogs.length > 0 ? (
                entryLogs.map((log, idx) => (
                  <div key={log.id} className="relative pl-8 group">
                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-125 bg-${getActionColor(log.action)}-500`} />
                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">
                      {new Date(log.timestamp).toLocaleString('el-GR')}
                    </div>
                    <div className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter mb-1">
                      {log.action} • {log.userEmail.split('@')[0]}
                    </div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter leading-relaxed italic whitespace-pre-wrap">
                      {log.details.split(' | ').map((detail, i) => (
                        <div key={i} className="py-0.5">• {detail}</div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-md" />
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">ΔΗΜΙΟΥΡΓΙΑ</div>
                  <div className="text-xs font-bold text-zinc-900 uppercase">{new Date(entry.createdAt).toLocaleString('el-GR')}</div>
                  <div className="text-[10px] font-bold text-zinc-400 italic uppercase tracking-tighter mt-0.5">ΑΠΟ: {entry.authorEmail?.split('@')[0] || 'SYSTEM'}</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Expiry Override Modal */}
      {isExpiryModalOpen && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-zinc-100 scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-2 italic">ΧΕΙΡΟΚΙΝΗΤΗ ΑΛΛΑΓΗ ΛΗΞΗΣ</h3>
            <p className="text-xs font-bold text-zinc-500 mb-8 leading-relaxed italic uppercase tracking-tight">
              Χρησιμοποιήστε αυτή την επιλογή μόνο για εξαιρέσεις. Η αλλαγή θα καταγραφεί στο ιστορικό.
            </p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">ΝΕΑ ΗΜΕΡΟΜΗΝΙΑ ΛΗΞΗΣ</label>
                <input 
                  type="date" 
                  className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-black text-zinc-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  disabled={isUpdatingExpiry}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  onClick={() => {
                    setNewExpiryDate('');
                    handleUpdateExpiry('');
                  }}
                  variant="secondary"
                  className="flex-1 text-rose-600 hover:bg-rose-50"
                  disabled={isUpdatingExpiry}
                >
                  ΚΑΘΑΡΙΣΜΟΣ
                </Button>
                <Button 
                  onClick={() => setIsExpiryModalOpen(false)}
                  variant="secondary"
                  className="flex-1"
                  disabled={isUpdatingExpiry}
                >
                  ΑΚΥΡΩΣΗ
                </Button>
                <Button 
                  onClick={() => handleUpdateExpiry()}
                  variant="primary"
                  className="flex-1 shadow-lg shadow-blue-100"
                  disabled={isUpdatingExpiry}
                >
                  {isUpdatingExpiry ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'ΕΝΗΜΕΡΩΣΗ'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
