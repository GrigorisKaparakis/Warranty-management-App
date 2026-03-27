
import { useNavigate } from 'react-router-dom';
import { Entry, ViewType } from '../core/types';
import { useStore } from '../store/useStore';

/**
 * useAppNavigation: Hook για τη διαχείριση της πλοήγησης και των φίλτρων.
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const setListFilters = useStore(s => s?.setListFilters);
  const setSelectedVin = useStore(s => s?.setSelectedVin);
  const setEditingEntry = useStore(s => s?.setEditingEntry);

  const navigateWithFilters = (view: ViewType, status: string = 'ALL', company: string = 'ALL') => {
    setListFilters({ status, company });
    let path = '/dashboard';
    if (view === 'all') path = '/warranty/inventory';
    else if (view === 'paid') path = '/paid';
    else if (view === 'rejected') path = '/rejected';
    else if (view === 'entry') path = '/warranty/new';
    else if (view === 'maintenance') path = '/maintenance';
    else if (view === 'expiryTracker' as any) path = '/expiry-tracker';
    else if (view === 'auditLog') path = '/auditLog';
    else path = `/warranty/view/${view}`;
    
    navigate(path);
  };

  const navigateToVinHistory = (vin: string) => {
    setSelectedVin(vin);
    navigate(`/vin-search/${vin}`);
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
    navigate(`/warranty/edit/${entry.id}`);
  };

  return {
    navigateWithFilters,
    navigateToVinHistory,
    handleEdit
  };
};
