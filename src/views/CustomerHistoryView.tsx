
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Button 
            variant="neutral" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="w-14 h-14 rounded-2xl border-zinc-100 bg-white shadow-sm"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User size={12} className="text-blue-600" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΠΡΟΦΙΛ ΠΕΛΑΤΗ</span>
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic">{name}</h1>
          </div>
        </div>

        {customer?.phone && (
          <div className="flex items-center gap-4 px-8 py-4 bg-blue-50/50 rounded-[2rem] border border-blue-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Phone size={18} className="text-blue-600" />
            </div>
            <div>
              <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest">ΤΗΛΕΦΩΝΟ</div>
              <div className="text-lg font-black text-blue-700 tracking-tight">{customer.phone}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Stats & Vehicles */}
        <div className="lg:col-span-4 space-y-10">
          {/* Stats Card */}
          <Card className="p-10 rounded-[3rem]">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Hash size={14} className="text-blue-600" />
              ΣΤΑΤΙΣΤΙΚΑ ΣΤΟΙΧΕΙΑ
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                <div className="text-[9px] font-black text-zinc-400 uppercase mb-2 tracking-widest">ΕΓΓΥΗΣΕΙΣ</div>
                <div className="text-3xl font-black text-zinc-900 tracking-tighter">{customerEntries.length}</div>
              </div>
              <div className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                <div className="text-[9px] font-black text-zinc-400 uppercase mb-2 tracking-widest">ΟΧΗΜΑΤΑ</div>
                <div className="text-3xl font-black text-zinc-900 tracking-tighter">{customer?.vins?.length || 0}</div>
              </div>
            </div>
          </Card>

          {/* Vehicles Card */}
          <Card className="p-10 rounded-[3rem]">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Car size={14} className="text-blue-600" />
              ΟΧΗΜΑΤΑ ΠΕΛΑΤΗ
            </h3>
            <div className="space-y-3">
              {customer?.vins && customer.vins.length > 0 ? (
                customer.vins.map(vin => (
                  <Link 
                    key={vin}
                    to={`/vin-search/${vin}`}
                    className="flex items-center justify-between p-5 bg-zinc-50 rounded-2xl border border-zinc-100 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                        <Car size={14} className="text-zinc-400 group-hover:text-white" />
                      </div>
                      <span className="text-xs font-mono font-black tracking-widest">{vin}</span>
                    </div>
                    <ExternalLink size={14} className="text-zinc-300 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
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
          <Card className="p-10 rounded-[3rem] h-full">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-10 flex items-center gap-2">
              <FileText size={14} className="text-blue-600" />
              ΠΛΗΡΕΣ ΙΣΤΟΡΙΚΟ ΕΓΓΥΗΣΕΩΝ
            </h3>
            
            <div className="space-y-4">
              {customerEntries.length > 0 ? (
                customerEntries.map(entry => {
                  const config = getStatusConfig(entry.status);
                  return (
                    <Link 
                      key={entry.id}
                      to={`/warranty/${entry.id}`}
                      className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:border-zinc-900 hover:bg-white hover:shadow-2xl hover:shadow-zinc-200 transition-all group"
                    >
                      <div className="flex items-center gap-8">
                        <div className="text-center min-w-[70px]">
                          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                            {new Date(entry.createdAt).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit' })}
                          </div>
                          <div className="text-xl font-black text-zinc-900 tracking-tighter">{new Date(entry.createdAt).getFullYear()}</div>
                        </div>
                        <div className="h-12 w-px bg-zinc-200 hidden md:block" />
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tighter">#{entry.warrantyId}</span>
                            <Badge 
                              variant="neutral"
                              style={{ backgroundColor: `${config.color}15`, color: config.color }}
                              className="text-[9px] px-2.5 py-0.5 border-none font-black"
                            >
                              {config.label}
                            </Badge>
                          </div>
                          <div className="text-base font-black text-zinc-900 uppercase tracking-tight">
                            {entry.brand} 
                            <span className="text-zinc-400 font-mono text-[11px] ml-3 tracking-widest">{entry.vin}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 md:mt-0 flex items-center gap-6">
                        <div className="text-right hidden md:block">
                          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{entry.company}</div>
                          <Badge variant={entry.isPaid ? 'success' : 'danger'} className="text-[9px] px-3 py-1 border-none shadow-sm">
                            {entry.isPaid ? 'ΕΞΟΦΛΗΜΕΝΗ' : 'ΕΚΚΡΕΜΕΙ'}
                          </Badge>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-300 group-hover:text-zinc-900 group-hover:border-zinc-900 transition-all">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="py-32 text-center">
                  <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText size={32} strokeWidth={1} className="text-zinc-200" />
                  </div>
                  <p className="text-xs font-black text-zinc-300 uppercase italic tracking-widest">Δεν βρέθηκαν εγγυήσεις για αυτόν τον πελάτη.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
