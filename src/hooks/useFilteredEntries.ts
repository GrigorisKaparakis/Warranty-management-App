
import { useMemo } from 'react';
import { Entry, SortKey, SortOrder } from '../core/types';
import { EntryStatus } from '../core/config';

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
    const normQuery = normalizeGreek(searchQuery);

    let result = entries.filter(e => {
      if (currentView === 'warrantyPayments') return e.status === EntryStatus.COMPLETED;
      if (currentView === 'paid') return e.isPaid;
      if (currentView === 'rejected') return e.status === EntryStatus.REJECTED;
      if (currentView === 'inventory' || currentView === 'all') return !e.isPaid && e.status !== EntryStatus.REJECTED;
      if (currentView && currentView.toUpperCase() !== 'ALL') return e.status === currentView.toUpperCase();
      return true;
    });

    // Special case for warrantyPayments: Default empty if no filters
    if (currentView === 'warrantyPayments' && companyFilter === 'ALL' && !startDate && !endDate) {
      return [];
    }

    result = result.filter(e => {
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      if (companyFilter !== 'ALL' && e.company !== companyFilter) return false;
      if (startDate && e.createdAt < new Date(startDate).getTime()) return false;
      if (endDate && e.createdAt > new Date(endDate).getTime() + 86400000) return false;
      
      if (!normQuery) return true;
      const searchableText = [
        e.warrantyId, e.vin, e.fullName, e.company, e.brand, e.notes,
        ...(e.parts?.map(p => `${p.code} ${p.description}`) || [])
      ].join(' ');
      return normalizeGreek(searchableText).includes(normQuery);
    });

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
