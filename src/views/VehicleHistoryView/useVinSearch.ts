import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Entry } from '../../core/types';

/**
 * useVinSearch: Hook for managing VIN search logic, results, and summary.
 */
export const useVinSearch = () => {
  const { vin: urlVin } = useParams<{ vin?: string }>();
  
  const initialVin = useStore(s => s.selectedVin);
  const allEntries = useStore(s => s.entries);
  const onClearVinStore = useStore(s => s.setSelectedVin);

  const navigate = useNavigate();
  const [searchVin, setSearchVin] = useState(urlVin || initialVin || '');
  const [results, setResults] = useState<Entry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearched, setLastSearched] = useState('');

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

  const handleClear = () => {
    setResults([]);
    setSearchVin('');
    setLastSearched('');
    onClearVinStore(null);
    navigate('/vin-search');
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

  return {
    searchVin,
    setSearchVin,
    results,
    isSearching,
    lastSearched,
    handleSearchSubmit,
    handleClear,
    summary
  };
};
