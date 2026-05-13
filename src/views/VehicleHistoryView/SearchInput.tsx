/**
 * SearchInput.tsx: Το πεδίο αναζήτησης VIN.
 * Επιτρέπει την εισαγωγή του VIN και την έναρξη της αναζήτησης στο ιστορικό.
 */
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface SearchInputProps {
  searchVin: string;
  setSearchVin: (val: string) => void;
  isSearching: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  searchVin,
  setSearchVin,
  isSearching,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="relative z-10">
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
  );
};
