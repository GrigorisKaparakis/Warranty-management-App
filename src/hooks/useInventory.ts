import { useMemo, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FirestoreService } from '../services/firebase/db';
import { UI_LIMITS, UI_MESSAGES, PERFORMANCE_CONFIG } from '../core/config';
import { useAppState } from './useAppState';
import { useStore } from '../store/useStore';
import { toast } from '../utils/toast';
import { useFilteredEntries } from './useFilteredEntries';
import { useDebounce } from './useDebounce';
import { useInventorySelection } from './useInventorySelection';
import { useInventoryFilters } from './useInventoryFilters';

/**
 * useInventory: Hook για τη διαχείριση της λογικής της λίστας εγγυήσεων.
 */
export const useInventory = () => {
  const { view: viewParam } = useParams<{ view: string }>();
  const location = useLocation();
  
  const currentView = useMemo(() => {
    if (viewParam) return viewParam;
    if (location.pathname === '/paid') return 'paid';
    if (location.pathname === '/rejected') return 'rejected';
    if (location.pathname === '/warranty/inventory') return 'inventory';
    return 'all';
  }, [viewParam, location.pathname]);

  const { canEdit } = useAppState();
  const user = useStore(s => s?.user);
  const profile = useStore(s => s?.profile);
  const entries = useStore(s => s?.entries);
  const isLoading = useStore(s => s?.isLoading);
  const settings = useStore(s => s?.settings);
  const listFilters = useStore(s => s?.listFilters);

  const displayDensity = profile?.displayDensity || 'compact';

  const handleDensityChange = async (density: 'compact' | 'standard' | 'large') => {
    if (!user?.uid) return;
    try {
      await FirestoreService.updateUserPreference(user.uid, { displayDensity: density });
      toast.success(UI_MESSAGES.SUCCESS.DENSITY_CHANGED);
    } catch (e) {
      toast.error(UI_MESSAGES.ERRORS.GENERAL);
    }
  };

  const pageSize = settings.limits?.inventoryPageSize || UI_LIMITS.INVENTORY_PAGE_SIZE;
  const [visibleLimit, setVisibleLimit] = useState(pageSize);

  const {
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    companyFilter, setCompanyFilter,
    startDate, setStartDate,
    endDate, setEndDate,
    sortConfig,
    clearFilters, isFiltered,
    handleSort
  } = useInventoryFilters(listFilters);

  const searchDelay = settings.limits?.inventorySearchDelay || PERFORMANCE_CONFIG.DEBOUNCE.INVENTORY_SEARCH;
  const debouncedSearchQuery = useDebounce(searchQuery, searchDelay);

  useEffect(() => {
    setVisibleLimit(pageSize);
  }, [pageSize]);

  const filteredAndSortedEntries = useFilteredEntries(entries, {
    currentView, searchQuery: debouncedSearchQuery, statusFilter, companyFilter, startDate, endDate, sortConfig
  });

  const lastDoc = useStore(s => s?.lastDoc);
  const setLastDoc = useStore(s => s?.setLastDoc);
  const setEntries = useStore(s => s?.setEntries);
  const setIsLoading = useStore(s => s?.setIsLoading);

  const loadMoreFromNetwork = async () => {
    if (!lastDoc || isLoading) return;
    
    setIsLoading(true);
    try {
      const { entries: newEntries, lastDoc: newLast } = await FirestoreService.getEntries(pageSize, lastDoc);
      if (newEntries.length > 0) {
        // Αποφυγή διπλότυπων (αν και το startAfter θα έπρεπε να το χειρίζεται)
        const currentIds = new Set(entries.map(e => e.id));
        const uniqueNew = newEntries.filter(e => !currentIds.has(e.id));
        setEntries([...entries, ...uniqueNew]);
      }
      setLastDoc(newLast);
    } catch (e) {
      console.error("Load more error:", e);
      toast.error("ΣΦΑΛΜΑ ΚΑΤΑ ΤΗ ΦΟΡΤΩΣΗ ΠΕΡΙΣΣΟΤΕΡΩΝ ΔΕΔΟΜΕΝΩΝ");
    } finally {
      setIsLoading(false);
    }
  };

  const selection = useInventorySelection(filteredAndSortedEntries, visibleLimit, currentView);

  const allStatusKeys = useMemo(() => {
    if (settings.statusOrder && settings.statusOrder.length > 0) {
      return settings.statusOrder.filter(key => settings.statusConfigs?.[key]);
    }
    return Object.keys(settings.statusConfigs || {}).sort((a, b) => {
      const labelA = settings.statusConfigs?.[a]?.label || a;
      const labelB = settings.statusConfigs?.[b]?.label || b;
      return labelA.localeCompare(labelB, 'el');
    });
  }, [settings.statusConfigs, settings.statusOrder]);

  const getStatusLabel = (status: string) => settings.statusConfigs?.[status]?.label || status;

  return {
    currentView,
    entries: filteredAndSortedEntries,
    isLoading,
    visibleLimit,
    pageSize,
    setVisibleLimit,
    loadMore: loadMoreFromNetwork,
    hasMore: !!lastDoc,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    companyFilter,
    setCompanyFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    sortConfig,
    handleSort,
    ...selection,
    clearFilters,
    isFiltered,
    displayDensity,
    handleDensityChange,
    allStatusKeys,
    getStatusLabel,
    canEdit,
    settings
  };
};

