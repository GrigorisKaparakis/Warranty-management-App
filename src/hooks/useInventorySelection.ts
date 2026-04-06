import { useState, useCallback, useEffect } from 'react';
import { Entry } from '../core/types';
import { FirestoreService } from '../services/firebase/db';
import { UI_MESSAGES } from '../core/config';
import { toast } from '../utils/toast';
import { formatError } from '../utils/errorUtils';

export const useInventorySelection = (filteredEntries: Entry[], visibleLimit: number, currentView: string) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [isSelectionMode, currentView]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) newSelected.delete(id);
      else newSelected.add(id);
      return newSelected;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = filteredEntries.slice(0, visibleLimit).map(e => e.id);
    setSelectedIds(new Set(allIds));
  }, [filteredEntries, visibleLimit]);

  const deselectAll = useCallback(() => setSelectedIds(new Set()), []);

  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.size === 0) return;
    try {
      await FirestoreService.updateEntriesBatch(Array.from(selectedIds), { status });
      toast.success(UI_MESSAGES.SUCCESS.BATCH_UPDATED(selectedIds.size));
      setIsSelectionMode(false);
    } catch (e) {
      toast.error(formatError(e));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(UI_MESSAGES.CONFIRMATIONS.DELETE_BATCH(selectedIds.size))) return;
    
    try {
      await FirestoreService.deleteEntriesBatch(Array.from(selectedIds));
      toast.success(UI_MESSAGES.SUCCESS.BATCH_DELETED(selectedIds.size));
      setIsSelectionMode(false);
    } catch (e) {
      toast.error(formatError(e));
    }
  };

  return {
    isSelectionMode,
    setIsSelectionMode,
    selectedIds,
    toggleSelection,
    selectAll,
    deselectAll,
    handleBulkStatusChange,
    handleBulkDelete
  };
};
