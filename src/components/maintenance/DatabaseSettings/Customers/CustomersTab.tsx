/**
 * CustomersTab.tsx: Διαχείριση του Μητρώου Πελατών.
 * Επιτρέπει την αναζήτηση, επεξεργασία ονομάτων, διαγραφή και συγχρονισμό πελατών από τις εγγραφές.
 */
import React from 'react';
import { Users } from 'lucide-react';
import { useStore } from '../../../../store/useStore';
import { FirestoreService } from '../../../../services/firebase/db';
import { Badge } from '../../../ui/Badge';
import { RegistryTabWrapper } from '../RegistryTabWrapper';
import { EditableCell } from '../EditableCell';
import { CustomerRegistryEntry } from '../../../../core/types';

export const CustomersTab: React.FC = () => {
  const customers = useStore(s => s.customers);
  
  return (
    <RegistryTabWrapper<CustomerRegistryEntry>
      items={customers}
      config={{
        onMigrate: (progress) => FirestoreService.migrateCustomers(progress),
        onUpsert: (_id, data) => FirestoreService.upsertCustomer(data.fullName),
        onDelete: (id) => FirestoreService.deleteCustomer(id),
        searchFields: (c) => `${c.fullName} ${c.phone || ''}`
      }}
      syncProps={{
        title: "ΣΥΓΧΡΟΝΙΣΜΟΣ ΠΕΛΑΤΩΝ",
        description: "ΑΝΑΛΥΣΗ ΟΛΩΝ ΤΩΝ ΕΓΓΡΑΦΩΝ ΚΑΙ ΕΞΑΓΩΓΗ ΜΟΝΑΔΙΚΩΝ ΠΕΛΑΤΩΝ ΒΑΣΕΙ ΟΝΟΜΑΤΟΣ.",
        icon: Users
      }}
      tableProps={{
        title: "ΜΗΤΡΩΟ ΠΕΛΑΤΩΝ",
        searchPlaceholder: "ΑΝΑΖΗΤΗΣΗ ΠΕΛΑΤΗ (ΟΝΟΜΑΤΑ)...",
        headers: [
          { label: 'ΟΝΟΜΑΤΕΠΩΝΥΜΟ', width: 'flex-1' },
          { label: 'ΟΧΗΜΑΤΑ (VINs)', width: 'w-[40%]' },
          { label: 'ΕΝΕΡΓΕΙΕΣ', width: 'w-[150px]', align: 'right' }
        ]
      }}
      getInitialEditData={(c) => ({ fullName: c.fullName })}
      renderCells={(customer, isEditing, editData, setEditData) => (
        <>
          <td className="px-8 py-5 flex-1 min-w-0">
            <EditableCell 
              isEditing={isEditing}
              value={isEditing ? editData.fullName : customer.fullName}
              onChange={(val) => setEditData({ ...editData, fullName: val })}
            />
          </td>
          <td className="px-8 py-5 w-[40%]">
            <div className="flex flex-wrap gap-1.5">
              {(customer.vins || []).map(v => (
                <Badge key={v} variant="neutral" className="font-mono text-[9px] px-2 py-0.5 border-zinc-100 opacity-60">
                  {v}
                </Badge>
              ))}
            </div>
          </td>
        </>
      )}
    />
  );
};
