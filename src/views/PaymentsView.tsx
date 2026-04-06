import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { useAppState } from '../hooks/useAppState';
import { FirestoreService } from '../services/firebase/db';
import { toast } from '../utils/toast';
import { formatError } from '../utils/errorUtils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Filter,
  ArrowUpDown,
  Calendar,
  User,
  Car
} from 'lucide-react';

/**
 * PaymentsView: Ξεχωριστό μενού για τη διαχείριση των πληρωμών.
 * Εμφανίζει όλες τις εγγυήσεις και επιτρέπει το γρήγορο φιλτράρισμα και την αλλαγή κατάστασης πληρωμής.
 */
export const PaymentsView: React.FC = () => {
  const entries = useStore(s => s.entries);
  const settings = useStore(s => s.settings);
  const { isAdmin } = useAppState();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.vin.toLowerCase().includes(q) || 
        e.fullName.toLowerCase().includes(q) || 
        e.warrantyId.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filter === 'PAID') result = result.filter(e => e.isPaid);
    if (filter === 'UNPAID') result = result.filter(e => !e.isPaid);

    // Sort
    result.sort((a, b) => {
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [entries, searchQuery, filter, sortOrder]);

  const handleTogglePayment = async (entry: any) => {
    if (!isAdmin) {
      toast.error("ΔΕΝ ΕΧΕΤΕ ΔΙΚΑΙΩΜΑΤΑ ΓΙΑ ΑΥΤΗ ΤΗΝ ΕΝΕΡΓΕΙΑ.");
      return;
    }

    const nextState = !entry.isPaid;
    try {
      await FirestoreService.updateEntry(entry.id, { 
        isPaid: nextState,
        warrantyId: entry.warrantyId 
      }, entry);
      toast.success(nextState ? "Η ΠΛΗΡΩΜΗ ΚΑΤΑΧΩΡΗΘΗΚΕ." : "Η ΠΛΗΡΩΜΗ ΑΝΑΙΡΕΘΗΚΕ.");
    } catch (err) {
      toast.error(formatError(err));
    }
  };

  const stats = useMemo(() => {
    const total = entries.length;
    const paid = entries.filter(e => e.isPaid).length;
    const unpaid = total - paid;
    const percent = total > 0 ? Math.round((paid / total) * 100) : 0;
    return { total, paid, unpaid, percent };
  }, [entries]);

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <PageHeader title="ΠΛΗΡΩΜΕΣ" subtitle="ΔΙΑΧΕΙΡΙΣΗ ΚΑΙ ΕΠΟΠΤΕΙΑ ΠΛΗΡΩΜΩΝ ΔΙΑΝΟΜΕΩΝ" />
        
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">ΠΟΣΟΣΤΟ ΕΞΟΦΛΗΣΗΣ</span>
              <span className="text-lg font-black text-emerald-600">{stats.percent}%</span>
            </div>
            <div className="w-px h-8 bg-zinc-100" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">ΕΚΚΡΕΜΕΙΣ</span>
              <span className="text-lg font-black text-rose-600">{stats.unpaid}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[300px] group">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <input 
            type="text" 
            placeholder="ΑΝΑΖΗΤΗΣΗ VIN, ΟΝΟΜΑ, ID..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full pl-14 pr-6 py-4 bg-white border border-zinc-100 rounded-2xl text-[11px] font-bold outline-none shadow-sm focus:ring-4 focus:ring-zinc-50 focus:border-zinc-200 transition-all" 
          />
        </div>

        <div className="flex gap-2">
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value as any)}
            className="px-6 py-4 bg-white border border-zinc-100 rounded-2xl text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer hover:bg-zinc-50 transition-all appearance-none"
          >
            <option value="ALL">ΟΛΕΣ</option>
            <option value="PAID">ΠΛΗΡΩΜΕΝΕΣ</option>
            <option value="UNPAID">ΑΠΛΗΡΩΤΕΣ</option>
          </select>

          <button 
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-6 py-4 bg-white border border-zinc-100 rounded-2xl text-[10px] font-black uppercase outline-none shadow-sm hover:bg-zinc-50 transition-all flex items-center gap-2"
          >
            <ArrowUpDown size={14} />
            {sortOrder === 'desc' ? 'ΝΕΟΤΕΡΑ' : 'ΠΑΛΑΙΟΤΕΡΑ'}
          </button>
        </div>
      </div>

      {/* Payments List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredEntries.map((entry, idx) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.02 }}
              className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6 group"
            >
              <div className="flex items-center gap-6 flex-1 w-full">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${entry.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {entry.isPaid ? <CheckCircle2 size={24} /> : <CreditCard size={24} />}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">ΕΓΓΥΗΣΗ / VIN</div>
                    <div className="text-xs font-black text-zinc-900 uppercase">#{entry.warrantyId}</div>
                    <div className="text-[10px] font-mono font-bold text-blue-600">{entry.vin}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">ΠΕΛΑΤΗΣ</div>
                    <div className="text-xs font-black text-zinc-900 uppercase truncate max-w-[150px]">{entry.fullName}</div>
                    <div className="text-[9px] font-bold text-zinc-400 uppercase">{entry.company}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">ΗΜΕΡΟΜΗΝΙΑ</div>
                    <div className="text-xs font-black text-zinc-900 uppercase">{new Date(entry.createdAt).toLocaleDateString('el-GR')}</div>
                    <div className="text-[9px] font-bold text-zinc-400 uppercase">{new Date(entry.createdAt).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">STATUS</div>
                    <Badge 
                      variant="primary" 
                      style={{ backgroundColor: settings.statusConfigs?.[entry.status]?.color || '#64748b' }}
                      className="text-[9px] px-2 py-0.5"
                    >
                      {settings.statusConfigs?.[entry.status]?.label || entry.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                <div className="flex flex-col items-end mr-4">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">ΚΑΤΑΣΤΑΣΗ</span>
                  <span className={`text-[11px] font-black uppercase ${entry.isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {entry.isPaid ? 'ΠΛΗΡΩΜΕΝΗ' : 'ΕΚΚΡΕΜΕΙ'}
                  </span>
                </div>
                
                <Button 
                  onClick={() => handleTogglePayment(entry)}
                  variant={entry.isPaid ? "secondary" : "primary"}
                  className={`h-12 px-8 rounded-xl ${entry.isPaid ? 'text-rose-600 hover:bg-rose-50' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
                >
                  {entry.isPaid ? 'ΑΝΑΙΡΕΣΗ' : 'ΕΞΟΦΛΗΣΗ'}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredEntries.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-zinc-300 bg-white rounded-[3rem] border border-zinc-100 border-dashed">
            <CreditCard size={48} strokeWidth={1} className="opacity-20 mb-6" />
            <div className="font-black uppercase tracking-[0.2em] text-xs italic">ΔΕΝ ΒΡΕΘΗΚΑΝ ΕΓΓΡΑΦΕΣ</div>
          </div>
        )}
      </div>
    </div>
  );
};
