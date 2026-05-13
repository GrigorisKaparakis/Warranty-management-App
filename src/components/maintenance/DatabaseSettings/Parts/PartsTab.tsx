/**
 * PartsTab.tsx: Διαχείριση του Μητρώου Ανταλλακτικών.
 * Παρέχει λειτουργίες αναζήτησης, επεξεργασίας περιγραφών, διαγραφής και μαζικού συγχρονισμού.
 */
import React from 'react';
import { Package } from 'lucide-react';
import { useStore } from '../../../../store/useStore';
import { FirestoreService } from '../../../../services/firebase/db';
import { Badge } from '../../../ui/Badge';
import { RegistryTabWrapper } from '../RegistryTabWrapper';
import { EditableCell } from '../EditableCell';
import { PartRegistryEntry } from '../../../../core/types';

export const PartsTab: React.FC = () => {
  const parts = useStore(s => s.parts);
  
  return (
    <RegistryTabWrapper<PartRegistryEntry>
      items={parts}
      config={{
        onMigrate: (progress) => FirestoreService.migrateParts(progress),
        onUpsert: (id, data) => FirestoreService.upsertPart(id, data.description, data.brand),
        onDelete: (id) => FirestoreService.deletePart(id),
        searchFields: (p) => `${p.code} ${p.description} ${p.brand}`
      }}
      syncProps={{
        title: "ΣΥΓΧΡΟΝΙΣΜΟΣ ΑΝΤΑΛΛΑΚΤΙΚΩΝ",
        description: "ΑΝΑΛΥΣΗ ΟΛΩΝ ΤΩΝ ΑΝΤΑΛΛΑΚΤΙΚΩΝ ΑΠΟ ΤΙΣ ΕΓΓΡΑΦΕΣ ΓΙΑ ΤΗ ΔΗΜΙΟΥΡΓΙΑ ΚΕΝΤΡΙΚΟΥ ΚΑΤΑΛΟΓΟΥ.",
        icon: Package
      }}
      tableProps={{
        title: "ΚΑΤΑΛΟΓΟΣ ΑΝΤΑΛΛΑΚΤΙΚΩΝ",
        searchPlaceholder: "ΑΝΑΖΗΤΗΣΗ ΚΩΔΙΚΟΥ Η ΠΕΡΙΓΡΑΦΗΣ...",
        headers: [
          { label: 'ΚΩΔΙΚΟΣ', width: 'w-[180px]' },
          { label: 'ΜΑΡΚΑ / BRAND', width: 'w-[150px]' },
          { label: 'ΠΕΡΙΓΡΑΦΗ', width: 'flex-1' },
          { label: 'ΕΝΕΡΓΕΙΕΣ', width: 'w-[100px]', align: 'right' }
        ]
      }}
      getInitialEditData={(p) => ({ description: p.description, brand: p.brand || '' })}
      saveIdField="code"
      renderCells={(part, isEditing, editData, setEditData) => (
        <>
          <td className="px-8 py-5 w-[180px] font-mono text-[11px] font-black text-blue-600 uppercase">
            {part.code}
          </td>
          <td className="px-8 py-5 w-[150px]">
            {isEditing ? (
              <EditableCell 
                isEditing={isEditing}
                value={editData.brand}
                onChange={(val) => setEditData({ ...editData, brand: val })}
              />
            ) : (
              <Badge variant="neutral" className="text-[9px] px-2.5 py-1 border-zinc-100 bg-zinc-50 text-zinc-600 font-black">
                {part.brand || '---'}
              </Badge>
            )}
          </td>
          <td className="px-8 py-5 flex-1">
            <EditableCell 
              isEditing={isEditing}
              value={isEditing ? editData.description : part.description}
              onChange={(val) => setEditData({ ...editData, description: val })}
            />
          </td>
        </>
      )}
    />
  );
};
