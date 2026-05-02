import { useMemo } from 'react';
import { Entry, SortKey, SortOrder } from '../core/types';
import { EntryStatus } from '../core/config';
import Fuse from 'fuse.js';

const normalizeGreek = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

interface FilterConfig {
  currentView: string;
  searchQuery: string;
  statusFilter: string;
  companyFilter: string;
  startDate: string;
  endDate: string;
  sortConfig: { key: SortKey; order: SortOrder };
}

export const useFilteredEntries = (entries: Entry[], config: FilterConfig) => {
  const { currentView, searchQuery, statusFilter, companyFilter, startDate, endDate, sortConfig } = config;

  return useMemo(() => {
    // 1. Basic status filtering (View level)
    let result = entries.filter(e => {
      if (currentView === 'paid') return e.isPaid;
      if (currentView === 'rejected') return e.status === EntryStatus.REJECTED;
      if (currentView === 'inventory' || currentView === 'all') return !e.isPaid && e.status !== EntryStatus.REJECTED;
      if (currentView && currentView.toUpperCase() !== 'ALL') return e.status === currentView.toUpperCase();
      return true;
    });

    // 2. Extra attribute filters
    result = result.filter(e => {
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      if (companyFilter !== 'ALL' && e.company !== companyFilter) return false;
      if (startDate && e.createdAt < new Date(startDate).getTime()) return false;
      if (endDate && e.createdAt > new Date(endDate).getTime() + 86400000) return false;
      return true;
    });

    // 3. Fuzzy Search with Fuse.js (if query exists)
    if (searchQuery.trim()) {
      const fuse = new Fuse(result, {
        keys: [
          { name: 'warrantyId', weight: 1 },
          { name: 'vin', weight: 1 },
          { name: 'fullName', weight: 0.8 },
          { name: 'company', weight: 0.5 },
          { name: 'brand', weight: 0.5 },
          { name: 'notes', weight: 0.3 },
          { name: 'parts.code', weight: 1 },
          { name: 'parts.description', weight: 0.7 }
        ],
        threshold: 0.3,
        distance: 100,
        ignoreLocation: true,
        minMatchCharLength: 2,
        useExtendedSearch: true,
        // Custom getter to normalize Greek characters in the data
        getFn: (obj, path) => {
          const value = Fuse.config.getFn(obj, path);
          if (Array.isArray(value)) {
            return value.map(v => typeof v === 'string' ? normalizeGreek(v) : v);
          }
          if (typeof value === 'string') {
            return normalizeGreek(value);
          }
          return value;
        }
      });

      const normQuery = normalizeGreek(searchQuery);
      result = fuse.search(normQuery).map(r => r.item);
    }

    // 4. Sorting
    result.sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [entries, currentView, searchQuery, statusFilter, companyFilter, startDate, endDate, sortConfig]);
};
