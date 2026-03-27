import React, { useState } from 'react';
import { AuditEntry } from '../core/types';
import { useAppState } from '../hooks/useAppState';
import { useStore } from '../store/useStore';
import { toast } from '../utils/toast';
import { FirestoreService } from '../services/firebase/db';
import { getActionColor } from '../utils/auditUtils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { History, RotateCcw, AlertTriangle, Search, Filter } from 'lucide-react';

/**
 * DiffViewer: Εμφανίζει τις διαφορές μεταξύ παλαιών και νέων δεδομένων
 * για μια καταχώρηση στο Audit Log.
 */
const DiffViewer: React.FC<{ oldData: any, newData: any }> = ({ oldData, newData }) => {
  const allKeys = Array.from(new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]))
    .filter(k => k !== 'createdAt' && k !== 'userId' && k !== 'id' && !k.startsWith('_'));

  const renderValue = (val: any) => {
    if (Array.isArray(val)) return `[${val.length} ΑΝΤΙΚΕΙΜΕΝΑ]`;
    if (typeof val === 'boolean') return val ? 'ΝΑΙ' : 'ΟΧΙ';
    return String(val || '-');
  };

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 mt-4 font-mono text-[10px] space-y-2 animate-slide-up">
      <div className="grid grid-cols-3 gap-4 border-b border-zinc-800 pb-2 mb-2 opacity-50 uppercase font-bold tracking-widest">
        <span>ΠΕΔΙΟ</span>
        <span>ΠΡΙΝ</span>
        <span>ΜΕΤΑ</span>
      </div>
      {allKeys.map(key => {
        const oldVal = oldData?.[key];
        const newVal = newData?.[key];
        const isDifferent = JSON.stringify(oldVal) !== JSON.stringify(newVal);
        if (!isDifferent) return null;
        return (
          <div key={key} className="grid grid-cols-3 gap-4 py-1 border-b border-zinc-800/50 last:border-0">
            <span className="text-zinc-500 font-bold">{key.toUpperCase()}</span>
            <span className="text-rose-400 break-all">{renderValue(oldVal)}</span>
            <span className="text-emerald-400 break-all">{renderValue(newVal)}</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * AuditLogView: Σελίδα προβολής του ιστορικού αλλαγών (Audit Log).
 * Πλέον είναι αυτόνομη σελίδα με δυνατότητα φιλτραρίσματος και επαναφοράς.
 */
export const AuditLogView: React.FC = () => {
  // Raw state from useStore
  const auditLogs = useStore(s => s?.auditLogs);
  
  // Logic from useAppState
  const { 
    // showToast is now from useStore
  } = useAppState();

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<AuditEntry | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetWarrantyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

  const handleRestore = async () => {
    if (!pendingRestore) return;
    setIsRestoring(true);
    try {
      await FirestoreService.restoreEntry(pendingRestore);
      toast.success("Η ΕΠΑΝΑΦΟΡΑ ΟΛΟΚΛΗΡΩΘΗΚΕ ΕΠΙΤΥΧΩΣ!");
      setPendingRestore(null);
    } catch (e: any) {
      toast.error("ΣΦΑΛΜΑ ΚΑΤΑ ΤΗΝ ΕΠΑΝΑΦΟΡΑ.");
    } finally {
      setIsRestoring(false);
    }
  };

  const actions = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'ERROR'];

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <PageHeader title="ΙΣΤΟΡΙΚΟ ΑΛΛΑΓΩΝ" subtitle="ΠΛΗΡΗΣ ΚΑΤΑΓΡΑΦΗ ΕΝΕΡΓΕΙΩΝ & ΕΠΑΝΑΦΟΡΑ ΔΕΔΟΜΕΝΩΝ" />
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="ΑΝΑΖΗΤΗΣΗ..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div className="relative sm:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <select 
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none"
            >
              {actions.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Card title="LOG ENTRIES" icon={History}>
        <div className="space-y-4">
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <div key={log.id} className="flex flex-col p-5 bg-zinc-50 rounded-[2rem] border border-zinc-100 hover:border-blue-200 transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="text-[10px] font-black text-zinc-400 w-32 shrink-0 tracking-widest">
                    {new Date(log.timestamp).toLocaleString('el-GR')}
                  </div>
                  <div className="w-28 shrink-0">
                    <Badge variant={getActionColor(log.action) as any} className="w-full justify-center shadow-sm">
                      {log.action}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-[11px] font-black text-zinc-900 uppercase truncate">{log.userEmail}</div>
                      <span className="text-zinc-300">•</span>
                      <div className="text-[11px] font-black text-blue-600 uppercase">{log.targetWarrantyId}</div>
                    </div>
                    <div className="text-[10px] font-bold text-zinc-500 italic uppercase tracking-tighter whitespace-pre-wrap leading-relaxed">
                      {log.details.split(' | ').map((detail, i) => (
                        <div key={i} className="py-0.5">• {detail}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-4 lg:mt-0">
                    {log.oldData && (
                      <Button 
                        variant="neutral" 
                        size="sm" 
                        onClick={() => setSelectedLogId(selectedLogId === log.id ? null : log.id)}
                        className="rounded-xl"
                      >
                        {selectedLogId === log.id ? 'ΚΛΕΙΣΙΜΟ' : 'ΣΥΓΚΡΙΣΗ'}
                      </Button>
                    )}
                    {(log.action === 'UPDATE' || log.action === 'DELETE') && log.oldData && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        icon={RotateCcw}
                        onClick={() => setPendingRestore(log)}
                        className="rounded-xl shadow-lg shadow-blue-100"
                      >
                        ΕΠΑΝΑΦΟΡΑ
                      </Button>
                    )}
                  </div>
                </div>
                {selectedLogId === log.id && <DiffViewer oldData={log.oldData} newData={log.newData} />}
              </div>
            ))
          ) : (
            <div className="p-20 text-center border-2 border-dashed border-zinc-100 rounded-[3rem]">
              <p className="text-[10px] font-black text-zinc-300 uppercase italic tracking-[0.3em]">ΔΕΝ ΒΡΕΘΗΚΑΝ ΕΓΓΡΑΦΕΣ ΙΣΤΟΡΙΚΟΥ</p>
            </div>
          )}
        </div>
      </Card>

      {/* Restore Confirmation Overlay */}
      {pendingRestore && (
        <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-zinc-100 p-12 max-w-xl w-full space-y-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 shadow-inner">
                <AlertTriangle size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight italic">ΕΠΙΒΕΒΑΙΩΣΗ ΕΠΑΝΑΦΟΡΑΣ</h3>
                <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest italic">ΠΡΟΚΕΙΤΑΙ ΝΑ ΑΝΑΙΡΕΣΕΤΕ ΜΙΑ ΑΛΛΑΓΗ ΣΤΟ ΣΥΣΤΗΜΑ</p>
              </div>
            </div>

            <div className="p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100 space-y-5">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <span>ΕΝΕΡΓΕΙΑ</span>
                <span className="text-zinc-900">{pendingRestore.action}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <span>ΧΡΗΣΤΗΣ</span>
                <span className="text-zinc-900">{pendingRestore.userEmail}</span>
              </div>
              <div className="pt-5 border-t border-zinc-200">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">ΛΕΠΤΟΜΕΡΕΙΕΣ</div>
                <div className="text-xs font-bold text-zinc-600 italic leading-relaxed uppercase tracking-tighter">"{pendingRestore.details}"</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="neutral" className="flex-1 py-4 rounded-2xl" onClick={() => setPendingRestore(null)}>ΑΚΥΡΩΣΗ</Button>
              <Button 
                variant="primary" 
                className="flex-1 py-4 rounded-2xl shadow-xl shadow-blue-100" 
                onClick={handleRestore}
                loading={isRestoring}
                icon={RotateCcw}
              >
                ΕΠΙΒΕΒΑΙΩΣΗ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
