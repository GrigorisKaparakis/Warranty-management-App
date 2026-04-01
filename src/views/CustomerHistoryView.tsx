
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  User, 
  Car, 
  FileText, 
  ArrowLeft, 
  Phone, 
  Hash,
  ExternalLink,
  ChevronRight,
  Calendar,
  Clock
} from 'lucide-react';

/**
 * CustomerHistoryView: Εμφανίζει το πλήρες ιστορικό εγγυήσεων και τα οχήματα
 * ενός συγκεκριμένου πελάτη.
 */
export const CustomerHistoryView: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  
  // Raw state from useStore
  const customers = useStore(s => s.customers);
  const entries = useStore(s => s.entries);
  const settings = useStore(s => s.settings);

  const customer = useMemo(() => {
    if (!name) return null;
    const sanitizedName = name.replace(/\n/g, ' ').toLowerCase();
    return customers.find(c => c.fullName.replace(/\n/g, ' ').toLowerCase() === sanitizedName);
  }, [customers, name]);

  const customerEntries = useMemo(() => {
    if (!name) return [];
    const sanitizedName = name.replace(/\n/g, ' ').toLowerCase();
    return entries.filter(e => e.fullName.replace(/\n/g, ' ').toLowerCase() === sanitizedName)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [entries, name]);

  const getStatusConfig = (status: string) => {
    return settings.statusConfigs?.[status] || { label: status, color: '#64748b' };
  };

  if (!name) return null;

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10 animate-fade-in pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="w-16 h-16 flex items-center justify-center bg-white/5 text-slate-500 rounded-[1.5rem] border border-white/5 shadow-2xl hover:bg-white/10 hover:text-white transition-all scale-95 hover:scale-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <User size={14} className="text-blue-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">USER PROFILE DATABASE</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">{name}</h1>
          </div>
        </div>

        {customer?.phone && (
          <div className="flex items-center gap-6 px-10 py-6 bg-blue-600/5 rounded-[2.5rem] border border-blue-500/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-xl relative z-10 transition-transform group-hover:scale-110">
              <Phone size={24} className="text-blue-400" />
            </div>
            <div className="relative z-10">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">CONTACT MOBILE</div>
              <div className="text-2xl font-black text-blue-400 tracking-tight italic font-mono transition-colors group-hover:text-blue-300">{customer.phone}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Stats & Vehicles */}
        <div className="lg:col-span-4 space-y-10">
          {/* Stats Card */}
          <Card className="p-12 rounded-[3.5rem] overflow-hidden group">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
              <Hash size={16} className="text-blue-500" />
              SYSTEM METRICS
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-black/20 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all shadow-xl group/stat">
                <div className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-[0.2em] group-hover/stat:text-blue-400 transition-colors">WARRANTIES</div>
                <div className="text-4xl font-black text-white tracking-tighter italic leading-none">{customerEntries.length}</div>
              </div>
              <div className="p-8 bg-black/20 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all shadow-xl group/stat">
                <div className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-[0.2em] group-hover/stat:text-blue-400 transition-colors">VEHICLES</div>
                <div className="text-4xl font-black text-white tracking-tighter italic leading-none">{customer?.vins?.length || 0}</div>
              </div>
            </div>
          </Card>

          {/* Vehicles Card */}
          <Card className="p-12 rounded-[3.5rem] group">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
              <Car size={16} className="text-blue-500" />
              REGISTERED FLEET
            </h3>
            <div className="space-y-4">
              {customer?.vins && customer.vins.length > 0 ? (
                customer.vins.map(vin => (
                  <Link 
                    key={vin}
                    to={`/vin-search/${vin}`}
                    className="flex items-center justify-between p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] transition-all group/vin"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 group-hover/vin:bg-blue-700 group-hover/vin:border-blue-400 transition-colors shadow-2xl">
                        <Car size={18} className="text-slate-500 group-hover/vin:text-white" />
                      </div>
                      <span className="text-sm font-mono font-black tracking-[0.2em] group-hover/vin:text-white text-slate-200 transition-colors uppercase">{vin}</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-600 group-hover/vin:text-white opacity-0 group-hover/vin:opacity-100 transition-all -translate-x-2 group-hover/vin:translate-x-0" />
                  </Link>
                ))
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
                  <p className="text-[10px] font-black text-zinc-300 uppercase italic tracking-widest">Δεν έχουν καταγραφεί οχήματα.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Warranty History */}
        <div className="lg:col-span-8">
          <Card className="p-12 rounded-[3.5rem] h-full shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-600/10 transition-all"></div>
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12 flex items-center gap-4 relative z-10">
              <FileText size={18} className="text-blue-500" />
              WARRANTY ARCHIVE EVENT STREAM
            </h3>
            
            <div className="space-y-6 relative z-10">
              {customerEntries.length > 0 ? (
                customerEntries.map(entry => {
                  const config = getStatusConfig(entry.status);
                  return (
                    <Link 
                      key={entry.id}
                      to={`/warranty/${entry.id}`}
                      className="flex flex-col md:flex-row md:items-center justify-between p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 hover:border-blue-500/30 hover:bg-slate-900 shadow-2xl transition-all group scale-[0.99] hover:scale-100"
                    >
                      <div className="flex items-center gap-10">
                        <div className="text-center min-w-[100px] border-r border-white/5 pr-10">
                          <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 font-mono">
                            {new Date(entry.createdAt).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit' })}
                          </div>
                          <div className="text-3xl font-black text-white tracking-tighter italic leading-none">{new Date(entry.createdAt).getFullYear()}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-[12px] font-black text-slate-100 uppercase tracking-widest">RECORD #{entry.warrantyId}</span>
                            <Badge 
                              variant="neutral"
                              style={{ backgroundColor: `${config.color}15`, color: config.color, boxShadow: `0 0 15px ${config.color}10` }}
                              className="text-[10px] px-3 py-1 border-none font-black uppercase tracking-wider"
                            >
                              {config.label}
                            </Badge>
                          </div>
                          <div className="text-xl font-black text-white uppercase tracking-tighter italic group-hover:text-blue-400 transition-colors">
                            {entry.brand} 
                            <span className="text-slate-500 font-mono text-[12px] ml-4 tracking-[0.2em] font-normal group-hover:text-slate-300 transition-colors">{entry.vin}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 md:mt-0 flex items-center gap-10">
                        <div className="text-right hidden md:block">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{entry.company}</div>
                          <Badge variant={entry.isPaid ? 'success' : 'danger'} className="text-[10px] px-4 py-1.5 border-none shadow-2xl font-black tracking-widest">
                            {entry.isPaid ? 'PAID - SYSTEM OK' : 'PENDING ACTION'}
                          </Badge>
                        </div>
                        <div className="w-16 h-16 rounded-[1.2rem] bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-blue-600 group-hover:border-blue-400 transition-all shadow-2xl">
                          <ChevronRight size={28} />
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="py-40 text-center glass-dark rounded-[4rem] border border-white/5 shadow-inner">
                  <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
                    <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-xl"></div>
                    <FileText size={40} strokeWidth={1.5} className="text-slate-600 relative z-10" />
                  </div>
                  <p className="text-[12px] font-black text-slate-600 uppercase italic tracking-[0.5em] animate-pulse">NO WARRANTIES INDEXED IN THE ARCHIVE</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
