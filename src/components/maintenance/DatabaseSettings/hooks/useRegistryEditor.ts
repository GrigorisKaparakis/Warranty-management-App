import { useState, useMemo } from 'react';
import { toast } from '../../../../utils/toast';

interface RegistryEditorConfig<T> {
  onMigrate: (onProgress: (count: number) => void) => Promise<number>;
  onUpsert: (id: string, data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  searchFields: (item: T) => string;
}

export function useRegistryEditor<T extends { id: string }>(
  items: T[], 
  config: RegistryEditorConfig<T>
) {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationCount, setMigrationCount] = useState(0);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter(item => config.searchFields(item).toLowerCase().includes(s));
  }, [items, search, config]);

  const handleMigrate = async () => {
    setIsMigrating(true);
    setMigrationCount(0);
    try {
      const total = await config.onMigrate((count) => setMigrationCount(count));
      toast.success(`ΟΛΟΚΛΗΡΩΘΗΚΕ! ${total} ΕΓΓΡΑΦΕΣ ΣΥΓΧΡΟΝΙΣΤΗΚΑΝ.`);
    } catch (e: any) {
      console.error(e);
      toast.error("ΣΦΑΛΜΑ ΚΑΤΑ ΤΟ ΣΥΓΧΡΟΝΙΣΜΟ");
    } finally {
      setIsMigrating(false);
    }
  };

  const handleEdit = (id: string, currentData: any) => {
    setEditingId(id);
    setEditData(currentData);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleSave = async (id: string) => {
    try {
      await config.onUpsert(id, editData);
      setEditingId(null);
      setEditData(null);
      toast.success("Η ΕΓΓΡΑΦΗ ΕΝΗΜΕΡΩΘΗΚΕ!");
    } catch (e) {
      toast.error("ΑΠΟΤΥΧΙΑ ΑΠΟΘΗΚΕΥΣΗΣ");
    }
  };

  const handleDelete = async (id: string) => {
    if (!config.onDelete) return;
    try {
      await config.onDelete(id);
      toast.success("Η ΕΓΓΡΑΦΗ ΔΙΑΓΡΑΦΗΚΕ");
    } catch (e) {
      toast.error("ΑΠΟΤΥΧΙΑ ΔΙΑΓΡΑΦΗΣ");
    }
  };

  return {
    search, setSearch,
    isMigrating, migrationCount,
    handleMigrate,
    editingId, editData, setEditData,
    handleEdit, handleCancel, handleSave, handleDelete,
    filteredItems
  };
}
