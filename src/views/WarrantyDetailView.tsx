import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { useStore } from '../store/useStore';
import { toast } from '../utils/toast';
import { getActionColor } from '../utils/auditUtils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
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
  Calendar
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

  const entry = useMemo(() => entries.find(e => e.id === id), [entries, id]);

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
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(37,99,235,0.2)]" />
      </div>
    );
  }

  const statusConfig = settings.statusConfigs?.[entry.status] || { label: entry.status, color: '#64748b' };

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <Link 
            to="/warranty/inventory" 
            className="w-14 h-14 flex items-center justify-center bg-white/5 text-slate-500 rounded-2xl hover:bg-white/10 hover:text-white transition-all border border-white/5 shadow-2xl"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">RECORD #{entry.warrantyId}</span>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">•</span>
              <Badge 
                variant="primary"
                style={{ backgroundColor: statusConfig.color, boxShadow: `0 0 20px ${statusConfig.color}20` }}
                className="text-white border-none font-black px-4"
              >
                {statusConfig.label}
              </Badge>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">{entry.vin}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {canEdit && (
            <Button 
              onClick={() => navigate(`/warranty/edit/${entry.id}`)}
              icon={Edit3}
              variant="primary"
              className="px-10 py-6 rounded-2xl shadow-2xl shadow-blue-900/20 uppercase font-black tracking-widest"
            >
              EDIT DATA
            </Button>
          )}
          {canDelete && (
            <Button 
              onClick={() => setDeletingEntry(entry)}
              icon={Trash2}
              variant="danger"
              size="icon"
              className="w-14 h-14 rounded-2xl shadow-2xl shadow-red-900/20"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-10">
          <Card title="VEHICLE SPECIFICATIONS" icon={Car}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">COMPANY / BRAND</div>
                <div className="text-2xl font-black text-white uppercase tracking-tighter italic">{entry.company} / {entry.brand}</div>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">VIN CHASSIS</div>
                <button 
                  onClick={() => navigateToVinHistory(entry.vin)}
                  className="text-2xl font-mono font-black text-blue-400 tracking-[0.1em] hover:text-blue-300 transition-all text-left uppercase"
                >
                  {entry.vin}
                </button>
              </div>
            </div>
          </Card>

          <Card title="PARTS RECOGNITION" icon={FileText} noPadding>
            {entry.parts && entry.parts.length > 0 ? (
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr>
                      <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">PART ID</th>
                      <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">DESCRIPTION</th>
                      <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">QTY</th>
                      <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {entry.parts.map((p, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-10 py-6 text-xs font-mono font-black text-blue-400 uppercase tracking-widest group-hover:text-blue-300">{p.code || '-'}</td>
                        <td className="px-10 py-6 text-xs font-bold text-slate-300 uppercase tracking-tight">{p.description}</td>
                        <td className="px-10 py-6 text-xs font-black text-white text-right font-mono">{p.quantity}</td>
                        <td className="px-10 py-6 text-center">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl shadow-xl border ${
                            p.isReady ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}>
                            {p.isReady ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
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
          <Card title="CUSTOMER DATA" icon={User}>
            <div className="p-8 bg-black/20 rounded-[2.5rem] border border-white/5 group hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10"></div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 relative z-10">FULL NAME RECORD</div>
              <Link 
                to={`/customer/${encodeURIComponent(entry.fullName.replace(/\n/g, ' '))}`}
                className="text-xl font-black text-blue-400 uppercase hover:text-blue-300 transition-all block relative z-10 italic tracking-tight"
              >
                {entry.fullName}
              </Link>
            </div>
          </Card>

          <Card title="EVENT TIMELINE" icon={History}>
            <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
              {entryLogs.length > 0 ? (
                entryLogs.map((log, idx) => (
                  <div key={log.id} className="relative pl-10 group">
                    <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-slate-950 shadow-2xl transition-all group-hover:scale-125 bg-slate-800 border-white/10`} />
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 font-mono">
                      {new Date(log.timestamp).toLocaleString('el-GR')}
                    </div>
                    <div className="text-[12px] font-black text-white uppercase tracking-tighter mb-2 italic">
                      {log.action} • {log.userEmail.split('@')[0]}
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter leading-relaxed italic whitespace-pre-wrap bg-white/[0.02] p-4 rounded-2xl border border-white/5 group-hover:text-slate-300 transition-colors">
                      {log.details.split(' | ').map((detail, i) => (
                        <div key={i} className="py-0.5">• {detail}</div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-blue-600 border-4 border-slate-950 shadow-2xl" />
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2 font-mono">INITIALIZATION</div>
                  <div className="text-sm font-black text-white uppercase tracking-tight italic">{new Date(entry.createdAt).toLocaleString('el-GR')}</div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">SYSTEM ORIGIN: {entry.authorEmail?.split('@')[0] || 'SYSTEM'}</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
