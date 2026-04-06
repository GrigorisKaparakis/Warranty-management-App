import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Entry, StatusConfig } from '../core/types';
import { auth, FirestoreService } from '../services/firebase/db';
import { LOG_CONFIG, UI_MESSAGES } from '../core/config';
import { useAppState } from './useAppState';
import { useStore } from '../store/useStore';
import { toast } from '../utils/toast';

import { getCompletionUpdates } from '../utils/warrantyLogic';
import { formatError } from '../utils/errorUtils';

/**
 * useWarrantyCard: Hook για τη διαχείριση της λογικής της κάρτας εγγύησης.
 */
export const useWarrantyCard = (entry: Entry, readOnly: boolean) => {
  const navigate = useNavigate();
  const { 
    currentRole: userRole, canDelete, 
    navigateToVinHistory: onVinClick
  } = useAppState();

  const user = useStore(s => s.user);
  const profile = useStore(s => s.profile);
  const settings = useStore(s => s.settings);
  const onDelete = useStore(s => s.setDeletingEntry);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const getStatusConfig = (status: string): StatusConfig => {
    return settings.statusConfigs?.[status] || 
           { label: status, color: '#64748b', allowedRoles: [] };
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const createLogString = (label: string) => {
    const d = new Date();
    const dateStr = d.toLocaleDateString(LOG_CONFIG.DATE_LOCALE, { day: '2-digit', month: '2-digit', year: '2-digit' });
    const timeStr = d.toLocaleTimeString(LOG_CONFIG.DATE_LOCALE, { hour: '2-digit', minute: '2-digit' });
    const username = auth.currentUser?.email?.split('@')[0] || LOG_CONFIG.FALLBACK_USER;
    return LOG_CONFIG.FORMAT(username, label, dateStr, timeStr);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (readOnly) return;
    const config = getStatusConfig(newStatus);
    if (!config.allowedRoles.includes(userRole)) {
      toast.error(UI_MESSAGES.ERRORS.PERMISSION_DENIED);
      return;
    }
    const logMsg = createLogString(config.label);
    const currentNotes = (entry.notes || '').trim();
    
    let updates: Partial<Entry> = {
      status: newStatus,
      warrantyId: entry.warrantyId,
      notes: currentNotes + (currentNotes ? '\n' : '') + logMsg
    };

    if (newStatus === 'COMPLETED') {
      const completionUpdates = getCompletionUpdates(entry, settings);
      updates = { ...updates, ...completionUpdates };
    }

    try {
      await FirestoreService.updateEntry(entry.id, updates, entry);
    } catch (err) {
      toast.error(formatError(err));
    }
  };

  const handleTogglePart = async (partId: string) => {
    if (readOnly) return;
    const updatedParts = entry.parts.map(p => 
      p.id === partId ? { ...p, isReady: !p.isReady } : p
    );
    try {
      await FirestoreService.updateEntry(entry.id, { parts: updatedParts, warrantyId: entry.warrantyId }, entry);
    } catch (err) {
      toast.error(formatError(err));
    }
  };

  const togglePayment = async () => {
    if (readOnly) return;
    const nextPaidState = !entry.isPaid;
    const logMsg = createLogString(nextPaidState ? UI_MESSAGES.LABELS.PAID : "ΑΝΑΙΡΕΣΗ ΠΛΗΡΩΜΗΣ");
    const currentNotes = (entry.notes || '').trim();
    const updates: Partial<Entry> = { 
      isPaid: nextPaidState,
      warrantyId: entry.warrantyId,
      notes: currentNotes + (currentNotes ? '\n' : '') + logMsg
    };
    try {
      await FirestoreService.updateEntry(entry.id, updates, entry);
    } catch (err) {
      toast.error(formatError(err));
    }
  };

  return {
    navigate,
    settings,
    canDelete,
    onDelete,
    onVinClick,
    user,
    profile,
    copiedField,
    getStatusConfig,
    copyToClipboard,
    handleStatusChange,
    handleTogglePart,
    togglePayment,
    userRole
  };
};
