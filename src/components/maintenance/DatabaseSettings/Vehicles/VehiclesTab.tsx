/**
 * VehiclesTab.tsx: Διαχείριση του Μητρώου Οχημάτων.
 * Παρέχει δυνατότητα αναζήτησης, επεξεργασίας, διαγραφής και συγχρονισμού των VINs.
 */
import React from 'react';
import { Car } from 'lucide-react';
import { useStore } from '../../../../store/useStore';
import { FirestoreService } from '../../../../services/firebase/db';
import { Badge } from '../../../ui/Badge';
import { RegistryTabWrapper } from '../RegistryTabWrapper';
import { EditableCell } from '../EditableCell';
import { VehicleRegistryEntry } from '../../../../core/types';

export const VehiclesTab: React.FC = () => {
  const vehicles = useStore(s => s.vehicles);
  
  return (
    <RegistryTabWrapper<VehicleRegistryEntry>
      items={vehicles}
      config={{
        onMigrate: (progress) => FirestoreService.migrateVehicles(progress),
        onUpsert: (id, data) => FirestoreService.upsertVehicle(id, data.brand, data.ownerName),
        onDelete: (id) => FirestoreService.deleteVehicle(id),
        searchFields: (v) => `${v.vin} ${v.brand} ${v.ownerName}`
      }}
      syncProps={{
        title: "ΣΥΓΧΡΟΝΙΣΜΟΣ ΟΧΗΜΑΤΩΝ",
        description: "ΑΝΑΛΥΣΗ ΟΛΩΝ ΤΩΝ ΕΓΓΡΑΦΩΝ ΓΙΑ ΤΗ ΔΗΜΙΟΥΡΓΙΑ ΚΕΝΤΡΙΚΟΥ ΜΗΤΡΩΟΥ ΟΧΗΜΑΤΩΝ (VINS).",
        icon: Car
      }}
      tableProps={{
        title: "ΜΗΤΡΩΟ ΟΧΗΜΑΤΩΝ",
        searchPlaceholder: "ΑΝΑΖΗΤΗΣΗ VIN, ΜΑΡΚΑ Η ΠΕΛΑΤΗ...",
        headers: [
          { label: 'VIN (CHASSIS)', width: 'w-[180px]' },
          { label: 'ΜΑΡΚΑ', width: 'w-[150px]' },
          { label: 'ΤΕΛΕΥΤΑΙΟΣ ΙΔΙΟΚΤΗΤΗΣ', width: 'flex-1' },
          { label: 'ΕΝΕΡΓΕΙΕΣ', width: 'w-[100px]', align: 'right' }
        ]
      }}
      getInitialEditData={(v) => ({ ownerName: v.ownerName, brand: v.brand || '' })}
      saveIdField="vin"
      renderCells={(vehicle, isEditing, editData, setEditData) => (
        <>
          <td className="px-8 py-5 w-[180px] font-mono text-[11px] font-black text-indigo-600 tracking-wider">
            {vehicle.vin}
          </td>
          <td className="px-8 py-5 w-[150px]">
            {isEditing ? (
              <EditableCell 
                isEditing={isEditing}
                value={editData.brand}
                onChange={(val) => setEditData({ ...editData, brand: val })}
              />
            ) : (
              <Badge variant="info" className="text-[9px] px-2.5 py-1 border-blue-100 bg-blue-50 text-blue-700 font-black">
                {vehicle.brand || '---'}
              </Badge>
            )}
          </td>
          <td className="px-8 py-5 flex-1">
            <EditableCell 
              isEditing={isEditing}
              value={isEditing ? editData.ownerName : (vehicle.ownerName || 'ΑΝΩΝΥΜΟΣ')}
              onChange={(val) => setEditData({ ...editData, ownerName: val })}
              placeholder="ΟΝΟΜΑ ΙΔΙΟΚΤΗΤΗ"
            />
          </td>
        </>
      )}
    />
  );
};
