import { useState, useEffect, useMemo } from 'react';
import { SortKey, SortOrder } from '../core/types';
import { SORT_CONFIG } from '../core/config';

export const useInventoryFilters = (initialFilters: { status: string, company: string }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilters.status);
  const [companyFilter, setCompanyFilter] = useState(initialFilters.company);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: SortKey, order: SortOrder}>(SORT_CONFIG.INVENTORY);

  useEffect(() => {
    setStatusFilter(initialFilters.status);
    setCompanyFilter(initialFilters.company);
  }, [initialFilters.status, initialFilters.company]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCompanyFilter('ALL');
    setStartDate('');
    setEndDate('');
    setSortConfig(SORT_CONFIG.INVENTORY);
  };

  const isFiltered = useMemo(() => 
    !!(searchQuery || statusFilter !== 'ALL' || companyFilter !== 'ALL' || startDate || endDate),
    [searchQuery, statusFilter, companyFilter, startDate, endDate]
  );

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  return {
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    companyFilter, setCompanyFilter,
    startDate, setStartDate,
    endDate, setEndDate,
    sortConfig, setSortConfig,
    clearFilters, isFiltered,
    handleSort
  };
};
