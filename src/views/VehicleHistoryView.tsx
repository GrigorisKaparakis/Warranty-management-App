
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Entry } from '../core/types';
import { useAppState } from '../hooks/useAppState';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Car, 
  Search, 
  History, 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  ShieldCheck,
  Wrench,
  FileText,
  User,
  Hash,
  X
} from 'lucide-react';

/**
 * VehicleHistoryView: Επιτρέπει την αναζήτηση και προβολή του ιστορικού
 * εγγυήσεων ενός συγκεκριμένου οχήματος βάσει VIN.
 */
export const VehicleHistoryView: React.FC = () => {
  const { vin: urlVin } = useParams<{ vin?: string }>();
  
  // Raw state from useStore
  const initialVin = useStore(s => s.selectedVin);
  const allEntries = useStore(s => s.entries);
  const settings = useStore(s => s.settings);
  const onClearVin = useStore(s => s.setSelectedVin);

  const navigate = useNavigate();
  const [searchVin, setSearchVin] = useState(urlVin || initialVin || '');
  const [results, setResults] = useState<Entry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearched, setLastSearched] = useState('');

  const getStatusConfig = (status: string) => {
    return settings.statusConfigs?.[status] || { label: status, color: '#64748b' };
  };

  const performSearch = (vin: string) => {
    const clean = vin.trim().toUpperCase();
    if (clean.length < 3) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    setLastSearched(clean);
    
    const history = allEntries.filter(e => 
      e.vin.toUpperCase().endsWith(clean)
    ).sort((a, b) => b.createdAt - a.createdAt);
    
    setTimeout(() => {
      setResults(history);
      setIsSearching(false);
    }, 400);
  };

  useEffect(() => {
    const vinToSearch = urlVin || initialVin;
    if (vinToSearch) {
      setSearchVin(vinToSearch);
      performSearch(vinToSearch);
    }
  }, [urlVin, initialVin, allEntries]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVin.trim()) {
      navigate(`/vin-search/${searchVin.trim().toUpperCase()}`);
    } else {
      performSearch(searchVin);
    }
  };

  const summary = useMemo(() => {
    if (results.length === 0) return null;
    const brands = Array.from(new Set(results.map(r => r.brand)));
    const lastVisit = results[0].createdAt;
    const daysSince = Math.floor((Date.now() - lastVisit) / (1000 * 60 * 60 * 24));
    
    return {
      total: results.length,
      brands: brands.join(', '),
      lastVisit: new Date(lastVisit).toLocaleDateString('el-GR'),
      daysSince,
      latestBrand: results[0].brand,
      latestCompany: results[0].company
    };
  }, [results]);

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10 animate-fade-in pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
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
              <History size={14} className="text-blue-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">CHASSIS RECOGNITION UNIT</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">VEHICLE HISTORY</h1>
          </div>
        </div>

        {lastSearched && (
          <button 
            type="button"
            onClick={() => { setResults([]); setSearchVin(''); setLastSearched(''); onClearVin(null); navigate('/vin-search'); }}
            className="h-16 px-10 rounded-[1.5rem] bg-white/5 border border-white/5 font-black text-[10px] tracking-widest text-slate-500 hover:text-white hover:bg-white/10 transition-all shadow-2xl flex items-center gap-3"
          >
            <X size={18} />
            CLEAR SCAN
          </button>
        )}
      </div>

      {/* Search Input Section */}
      <Card className="p-16 rounded-[4rem] border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full -mr-64 -mt-64 blur-[120px] pointer-events-none group-hover:bg-blue-600/10 transition-all" />
        
        <form onSubmit={handleSearchSubmit} className="relative z-10 flex flex-col gap-10">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1 group/input">
              <div className="absolute left-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10 group-focus-within/input:border-blue-500/50 transition-all">
                <Search className="w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="ENTER CHASSIS DIGITS (E.G. 123456)..." 
                value={searchVin}
                onChange={e => setSearchVin(e.target.value.toUpperCase())}
                className="w-full pl-24 pr-10 py-7 bg-slate-900/50 border border-white/5 rounded-[2.5rem] text-2xl font-black text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-700 uppercase tracking-widest"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSearching || searchVin.length < 3}
              className="h-[84px] px-14 rounded-[2.5rem] bg-blue-600 text-white font-black text-xs tracking-[0.3em] uppercase shadow-2xl shadow-blue-900/40 hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-800 disabled:shadow-none border-none"
            >
              {isSearching ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'INVOKE SEARCH'}
            </button>
          </div>
        </form>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-in zoom-in-95 duration-500">
            <div className="p-10 bg-blue-600/5 rounded-[2.5rem] border border-blue-500/10 shadow-2xl group/stat">
              <div className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-[0.3em] group-hover/stat:text-blue-400 transition-colors">TOTAL WARRANTS</div>
              <div className="text-5xl font-black text-white tracking-tighter italic leading-none">{summary.total}</div>
            </div>
            <div className="p-10 bg-white/[0.02] rounded-[2.5rem] border border-white/5 shadow-2xl group/stat">
              <div className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-[0.3em] group-hover/stat:text-blue-400 transition-colors">LAST DEPLOYMENT</div>
              <div className="text-4xl font-black text-white tracking-tighter mb-2 italic leading-none">{summary.lastVisit}</div>
              <div className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest mt-4 bg-blue-500/5 px-4 py-1.5 rounded-full inline-block">EXPIRED {summary.daysSince} DAYS AGO</div>
            </div>
            <div className="p-10 bg-slate-900 rounded-[2.5rem] shadow-[0_0_40px_rgba(37,99,235,0.1)] border border-blue-500/20 group/stat relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl group-hover/stat:bg-blue-500/20 transition-all"></div>
              <div className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-[0.3em] relative z-10">ENTITY DETECTED</div>
              <div className="text-2xl font-black text-white tracking-tighter uppercase italic mb-2 relative z-10">{summary.latestBrand}</div>
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest relative z-10">{summary.latestCompany}</div>
            </div>
          </div>
        )}
      </Card>

      {/* Results Timeline */}
      {isSearching ? (
        <div className="py-32 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xs font-black text-zinc-400 uppercase tracking-widest italic">Αναζήτηση στο αρχείο...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-12 mt-12">
          <div className="flex items-center gap-6 px-10">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-[0.5em] italic">STREAMING RESULTS [{results.length}]</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="relative space-y-12 before:absolute before:inset-0 before:ml-12 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-600/30 before:via-blue-600/10 before:to-transparent">
            {results.map((entry, idx) => {
              const config = getStatusConfig(entry.status);
              return (
                <div key={entry.id} className="relative flex items-start gap-16 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-12 -translate-x-1/2 w-6 h-6 rounded-full border-4 border-slate-950 bg-slate-800 shadow-2xl z-20 group-hover:bg-blue-600 group-hover:border-blue-400 transition-all scale-75 group-hover:scale-110" />
                  
                  {/* Date */}
                  <div className="min-w-[100px] pt-2 text-right">
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 font-mono">
                      {new Date(entry.createdAt).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit' })}
                    </div>
                    <div className="text-2xl font-black text-white tracking-tighter italic leading-none">{new Date(entry.createdAt).getFullYear()}</div>
                  </div>
 
                  {/* Content */}
                  <Link 
                    to={`/warranty/${entry.id}`}
                    className="flex-1 p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 hover:border-blue-500/30 hover:bg-slate-900 shadow-2xl transition-all scale-[0.99] hover:scale-100 group/item"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-[12px] font-black text-slate-100 uppercase tracking-widest">RECORD #{entry.warrantyId}</span>
                          <Badge 
                            variant="neutral"
                            style={{ backgroundColor: `${config.color}15`, color: config.color, boxShadow: `0 0 15px ${config.color}10` }}
                            className="text-[10px] px-3 py-1 border-none font-black uppercase tracking-wider"
                          >
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 group-hover/item:text-slate-200 transition-colors">
                          <User size={18} className="text-slate-600" />
                          <span className="text-lg font-black uppercase tracking-tight italic">{entry.fullName}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right hidden md:block">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{entry.brand}</div>
                          <div className="text-sm font-black text-white uppercase tracking-tighter italic">{entry.company}</div>
                        </div>
                        <div className="w-16 h-16 rounded-[1.2rem] bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 group-hover/item:text-white group-hover/item:bg-blue-600 group-hover/item:border-blue-400 transition-all shadow-2xl">
                          <ChevronRight size={28} />
                        </div>
                      </div>
                    </div>

                    {/* Parts & Notes Preview */}
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                      <div>
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-5">INSTALLED PARTS INDEX</div>
                        <div className="flex flex-wrap gap-3">
                          {entry.parts.map((p, pIdx) => (
                            <div key={p.id || `p-${pIdx}`} className="px-5 py-2.5 bg-black/20 border border-white/5 rounded-2xl shadow-xl transition-all hover:border-blue-500/30">
                              <div className="text-[11px] font-black text-blue-400 uppercase tracking-[0.1em]">{p.code} <span className="text-slate-600 ml-2 font-normal">x{p.quantity}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-5">LOG DATA PERSISTENCE</div>
                        <p className="text-[12px] font-bold text-slate-500 italic leading-relaxed line-clamp-2 bg-white/[0.01] p-5 rounded-2xl border border-white/5">{entry.notes || 'No extended logs found.'}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : lastSearched ? (
        <div className="py-48 text-center glass-dark rounded-[4rem] border border-white/5 shadow-inner">
          <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl relative">
            <div className="absolute inset-0 bg-red-600/5 rounded-full blur-xl animate-pulse"></div>
            <Car size={40} strokeWidth={1.5} className="text-slate-600 relative z-10" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">NO INDEX MATCHES</h3>
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic mb-8">VERIFY CHASSIS DIGITS AND RETRY</p>
        </div>
      ) : (
        <div className="py-48 text-center glass-dark rounded-[4rem] border border-white/5 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-blue-600/5 blur-[80px] rounded-full"></div>
          <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl relative">
            <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-xl"></div>
            <Search size={40} strokeWidth={1.5} className="text-blue-500 relative z-10" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">SYSTEM READY FOR UPLINK</h3>
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic mb-8">ENTER AT LEAST 3 DIGITS TO START RETRIEVAL</p>
        </div>
      )}
    </div>
  );
};
