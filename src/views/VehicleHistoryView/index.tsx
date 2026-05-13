/**
 * VehicleHistoryView: Η σελίδα αναζήτησης ιστορικού οχήματος.
 * Συντονίζει την αναζήτηση βάσει VIN, την εμφάνιση των αποτελεσμάτων και των στατιστικών σύνοψης.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  History, 
  ArrowLeft, 
  X,
  Car,
  Search
} from 'lucide-react';
import { useVinSearch } from './useVinSearch';
import { SearchInput } from './SearchInput';
import { SummaryStats } from './SummaryStats';
import { ResultsTimeline } from './ResultsTimeline';

export const VehicleHistoryView: React.FC = () => {
  const navigate = useNavigate();
  const {
    searchVin,
    setSearchVin,
    results,
    isSearching,
    lastSearched,
    handleSearchSubmit,
    handleClear,
    summary
  } = useVinSearch();

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
            onClick={handleClear}
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
        
        <SearchInput 
          searchVin={searchVin}
          setSearchVin={setSearchVin}
          isSearching={isSearching}
          onSubmit={handleSearchSubmit}
        />

        {summary && <SummaryStats summary={summary} />}
      </Card>

      {/* Results Section */}
      {isSearching ? (
        <div className="py-32 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xs font-black text-zinc-400 uppercase tracking-widest italic">Αναζήτηση στο αρχείο...</p>
        </div>
      ) : results.length > 0 ? (
        <ResultsTimeline results={results} />
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
