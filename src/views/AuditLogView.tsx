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
    <div className="bg-black/40 rounded-[2rem] p-8 mt-6 font-mono text-[10px] space-y-3 animate-slide-up border border-white/5">
      <div className="grid grid-cols-3 gap-6 border-b border-white/10 pb-4 mb-4 text-slate-500 uppercase font-black tracking-[0.3em]">
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
          <div key={key} className="grid grid-cols-3 gap-6 py-2 border-b border-white/5 last:border-0 group">
            <span className="text-slate-500 font-black group-hover:text-blue-400 transition-colors uppercase tracking-widest">{key}</span>
            <span className="text-rose-400 break-all bg-rose-500/5 px-2 py-1 rounded-lg">{renderValue(oldVal)}</span>
            <span className="text-emerald-400 break-all bg-emerald-500/5 px-2 py-1 rounded-lg">{renderValue(newVal)}</span>
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
        
        <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-blue-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="ΑΝΑΖΗΤΗΣΗ ΣΤΟ ΙΣΤΟΡΙΚΟ..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-900/60 border border-white/5 rounded-[1.5rem] text-[11px] font-black text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-700 uppercase tracking-widest"
            />
          </div>
          <div className="relative sm:w-60 group">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-amber-400 transition-colors" size={18} />
            <select 
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-900/60 border border-white/5 rounded-[1.5rem] text-[11px] font-black text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none uppercase tracking-widest"
            >
              {actions.map(a => (
                <option key={a} value={a} className="bg-slate-900">{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Card title="EVENT STREAM" icon={History}>
        <div className="space-y-6">
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <div key={log.id} className="flex flex-col p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 hover:border-blue-500/20 transition-all group relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/0 group-hover:bg-blue-600 transition-all"></div>
                <div className="flex flex-col lg:flex-row lg:items-center gap-10 relative z-10">
                  <div className="text-[10px] font-black text-slate-500 w-40 shrink-0 tracking-[0.2em] uppercase">
                    {new Date(log.timestamp).toLocaleString('el-GR')}
                  </div>
                  <div className="w-32 shrink-0">
                    <Badge variant={getActionColor(log.action) as any} className="w-full justify-center shadow-xl font-black">
                      {log.action}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="text-[12px] font-black text-white uppercase tracking-tighter truncate">{log.userEmail}</div>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                      <div className="text-[12px] font-black text-blue-400 uppercase tracking-widest">{log.targetWarrantyId}</div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 italic uppercase tracking-tighter whitespace-pre-wrap leading-relaxed group-hover:text-slate-300 transition-colors">
                      {log.details.split(' | ').map((detail, i) => (
                        <div key={i} className="py-1 flex items-center gap-2">
                           <span className="w-1 h-1 rounded-full bg-blue-500/30"></span>
                           {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 mt-6 lg:mt-0">
                    {log.oldData && (
                      <button 
                        onClick={() => setSelectedLogId(selectedLogId === log.id ? null : log.id)}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          selectedLogId === log.id ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {selectedLogId === log.id ? 'HIDE DIFF' : 'VIEW DIFF'}
                      </button>
                    )}
                    {(log.action === 'UPDATE' || log.action === 'DELETE') && log.oldData && (
                      <button 
                        onClick={() => setPendingRestore(log)}
                        className="px-6 py-3 bg-blue-600 text-white font-black text-[10px] uppercase rounded-xl tracking-widest shadow-xl shadow-blue-950/20 hover:bg-blue-500 transition-all flex items-center gap-2"
                      >
                        <RotateCcw size={14} /> RESTORE
                      </button>
                    )}
                  </div>
                </div>
                {selectedLogId === log.id && <DiffViewer oldData={log.oldData} newData={log.newData} />}
              </div>
            ))
          ) : (
            <div className="p-32 text-center border-2 border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
              <p className="text-[12px] font-black text-slate-700 uppercase italic tracking-[0.5em] animate-pulse">ΔΕΝ ΒΡΕΘΗΚΑΝ ΕΓΓΡΑΦΕΣ ΙΣΤΟΡΙΚΟΥ</p>
            </div>
          )}
        </div>
      </Card>

      {/* Restore Confirmation Overlay */}
      {pendingRestore && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass-dark rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 p-12 max-w-xl w-full space-y-10 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center text-amber-500 shadow-inner border border-amber-500/20">
                <AlertTriangle size={40} strokeWidth={2.5} className="drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight italic leading-tight">SYSTEM RESTORE</h3>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic mt-1">ΑΝΑΙΡΕΣΗ ΕΝΕΡΓΕΙΑΣ ΣΤΟ OS</p>
              </div>
            </div>

            <div className="p-10 bg-white/[0.02] rounded-[2.5rem] border border-white/5 space-y-8 shadow-inner">
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.2em]">
                <span className="text-slate-500">ΕΝΕΡΓΕΙΑ</span>
                <span className="text-blue-400">{pendingRestore.action}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.2em]">
                <span className="text-slate-500">ΧΡΗΣΤΗΣ</span>
                <span className="text-white truncate max-w-[200px]">{pendingRestore.userEmail}</span>
              </div>
              <div className="pt-8 border-t border-white/5">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4">LOG DETAILS</div>
                <div className="text-[13px] font-bold text-slate-300 italic leading-relaxed uppercase tracking-tighter bg-black/20 p-6 rounded-2xl border border-white/5">
                  "{pendingRestore.details}"
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <button 
                className="flex-1 py-5 rounded-[2rem] bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all border border-white/5" 
                onClick={() => setPendingRestore(null)}
              >
                BACK
              </button>
              <button 
                className="flex-[2] py-5 rounded-[2rem] bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all flex items-center justify-center gap-3" 
                onClick={handleRestore}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <RotateCcw size={16} /> 
                    CONFIRM RESTORE
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
