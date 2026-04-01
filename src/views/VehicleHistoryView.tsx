
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
              <History size={12} className="text-blue-600" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΑΝΑΖΗΤΗΣΗ ΙΣΤΟΡΙΚΟΥ</span>
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic">ΙΣΤΟΡΙΚΟ ΟΧΗΜΑΤΟΣ</h1>
          </div>
        </div>

        {lastSearched && (
          <Button 
            variant="neutral" 
            onClick={() => { setResults([]); setSearchVin(''); setLastSearched(''); onClearVin(null); navigate('/vin-search'); }}
            className="h-14 px-8 rounded-2xl border-zinc-100 bg-white shadow-sm font-black text-[10px] tracking-widest text-zinc-400 hover:text-zinc-900"
          >
            <X size={14} className="mr-2" />
            ΚΑΘΑΡΙΣΜΟΣ
          </Button>
        )}
      </div>

      {/* Search Input Section */}
      <Card className="p-10 rounded-[3rem] border-zinc-100 shadow-2xl shadow-zinc-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <form onSubmit={handleSearchSubmit} className="relative z-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300" />
              <input 
                type="text" 
                placeholder="Εισάγετε τα τελευταία ψηφία του VIN (π.χ. 123456)..." 
                value={searchVin}
                onChange={e => setSearchVin(e.target.value.toUpperCase())}
                className="w-full pl-16 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-xl font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-300 uppercase tracking-widest"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSearching || searchVin.length < 3}
              className="h-[76px] px-12 rounded-[2rem] bg-zinc-900 text-white font-black text-xs tracking-widest uppercase shadow-xl hover:shadow-zinc-200 active:scale-95 transition-all"
            >
              {isSearching ? 'ΑΝΑΖΗΤΗΣΗ...' : 'ΑΝΑΖΗΤΗΣΗ'}
            </Button>
          </div>
        </form>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 animate-fade-in">
            <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
              <div className="text-[9px] font-black text-blue-400 uppercase mb-2 tracking-widest">ΣΥΝΟΛΟ ΕΓΓΥΗΣΕΩΝ</div>
              <div className="text-3xl font-black text-blue-700 tracking-tighter">{summary.total}</div>
            </div>
            <div className="p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100">
              <div className="text-[9px] font-black text-zinc-400 uppercase mb-2 tracking-widest">ΤΕΛΕΥΤΑΙΑ ΕΠΙΣΚΕΨΗ</div>
              <div className="text-3xl font-black text-zinc-900 tracking-tighter">{summary.lastVisit}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight mt-1">Πριν από {summary.daysSince} ημέρες</div>
            </div>
            <div className="p-8 bg-zinc-900 rounded-[2rem] shadow-xl text-white">
              <div className="text-[9px] font-black text-zinc-500 uppercase mb-2 tracking-widest">ΟΧΗΜΑ</div>
              <div className="text-xl font-black tracking-tighter uppercase italic mb-1">{summary.latestBrand}</div>
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{summary.latestCompany}</div>
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
        <div className="space-y-10">
          <div className="flex items-center gap-4 px-6">
            <div className="h-px flex-1 bg-zinc-100" />
            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">ΑΠΟΤΕΛΕΣΜΑΤΑ ({results.length})</span>
            <div className="h-px flex-1 bg-zinc-100" />
          </div>

          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-10 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-zinc-100 before:via-zinc-100 before:to-transparent">
            {results.map((entry, idx) => {
              const config = getStatusConfig(entry.status);
              return (
                <div key={entry.id} className="relative flex items-start gap-12 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-10 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white bg-blue-600 shadow-sm z-10 group-hover:scale-150 transition-transform" />
                  
                  {/* Date */}
                  <div className="min-w-[80px] pt-1 text-right">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                      {new Date(entry.createdAt).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit' })}
                    </div>
                    <div className="text-lg font-black text-zinc-900 tracking-tighter">{new Date(entry.createdAt).getFullYear()}</div>
                  </div>

                  {/* Content */}
                  <Link 
                    to={`/warranty/${entry.id}`}
                    className="flex-1 p-8 bg-white rounded-[2.5rem] border border-zinc-100 hover:border-zinc-900 hover:shadow-2xl hover:shadow-zinc-200 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tighter">#{entry.warrantyId}</span>
                          <Badge 
                            variant="neutral"
                            style={{ backgroundColor: `${config.color}15`, color: config.color }}
                            className="text-[9px] px-2.5 py-0.5 border-none font-black"
                          >
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-600">
                          <User size={14} className="text-zinc-400" />
                          <span className="text-sm font-black uppercase tracking-tight">{entry.fullName}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                          <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{entry.brand}</div>
                          <div className="text-xs font-black text-zinc-900 uppercase tracking-tight">{entry.company}</div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 group-hover:text-zinc-900 group-hover:border-zinc-900 transition-all">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>

                    {/* Parts & Notes Preview */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-50">
                      <div>
                        <div className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-4">ΑΝΤΑΛΛΑΚΤΙΚΑ</div>
                        <div className="flex flex-wrap gap-2">
                          {entry.parts.map((p, pIdx) => (
                            <div key={p.id || `p-${pIdx}`} className="px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-xl">
                              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{p.code} <span className="text-zinc-400 ml-1">x{p.quantity}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-4">ΠΑΡΑΤΗΡΗΣΕΙΣ</div>
                        <p className="text-[11px] font-medium text-zinc-500 italic leading-relaxed line-clamp-2">{entry.notes || 'Δεν υπάρχουν σημειώσεις.'}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : lastSearched ? (
        <div className="py-32 text-center">
          <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car size={32} strokeWidth={1} className="text-zinc-200" />
          </div>
          <h3 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter mb-2">ΔΕΝ ΒΡΕΘΗΚΑΝ ΑΠΟΤΕΛΕΣΜΑΤΑ</h3>
          <p className="text-xs font-black text-zinc-300 uppercase tracking-widest italic">Δοκιμάστε με διαφορετικά ψηφία VIN.</p>
        </div>
      ) : (
        <div className="py-32 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} strokeWidth={1} className="text-blue-200" />
          </div>
          <h3 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter mb-2">ΕΤΟΙΜΟ ΓΙΑ ΑΝΑΖΗΤΗΣΗ</h3>
          <p className="text-xs font-black text-zinc-300 uppercase tracking-widest italic">Εισάγετε τουλάχιστον 3 ψηφία για να ξεκινήσετε.</p>
        </div>
      )}
    </div>
  );
};
