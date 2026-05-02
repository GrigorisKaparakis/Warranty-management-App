import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FirestoreService } from '../../services/firebase/db';
import { useStore } from '../../store/useStore';
import { toast } from '../../utils/toast';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Search, RefreshCw, Edit2, Check, X, Trash2, User, Car, Box } from 'lucide-react';

interface DatabaseSettingsProps {
  activeTab: string;
}

/**
 * DatabaseSettings: Διαχειρίζεται τα "Registry" της εφαρμογής (Ανταλλακτικά, Οχήματα, Πελάτες).
 * Περιλαμβάνει εργαλεία συγχρονισμού από το ιστορικό εγγυήσεων.
 */
export const DatabaseSettings: React.FC<DatabaseSettingsProps> = ({ activeTab }) => {
  const parts = useStore(s => s?.parts);
  const vehicles = useStore(s => s?.vehicles);
  const customers = useStore(s => s?.customers);
  
  const [isMigrating, setIsMigrating] = useState(false);
  const [isMigratingVehicles, setIsMigratingVehicles] = useState(false);
  const [isMigratingCustomers, setIsMigratingCustomers] = useState(false);
  const [migrationCount, setMigrationCount] = useState(0);

  // BUG-018: Reset count when tab changes to avoid seeing old progress
  useEffect(() => {
    setMigrationCount(0);
  }, [activeTab]);
  
  const [partSearch, setPartSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [partEditData, setPartEditData] = useState({ description: '', brand: '' });
  
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleEditData, setVehicleEditData] = useState({ ownerName: '', brand: '' });
  
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [customerEditData, setCustomerEditData] = useState({ phone: '' });
  const [confirmingDeleteCustomerId, setConfirmingDeleteCustomerId] = useState<string | null>(null);

  if (activeTab !== 'database' && activeTab !== 'vehicles' && activeTab !== 'customers') return null;

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (confirmingDeleteCustomerId !== id) {
      setConfirmingDeleteCustomerId(id);
      setTimeout(() => setConfirmingDeleteCustomerId(null), 3000);
      return;
    }
    await FirestoreService.deleteCustomer(id);
    setConfirmingDeleteCustomerId(null);
    toast.success(`Ο ΠΕΛΑΤΗΣ ${name} ΔΙΑΓΡΑΦΗΚΕ`);
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Customers Tab Content */}
      {activeTab === 'customers' && (
        <Card 
          title="ΒΑΣΗ ΠΕΛΑΤΩΝ" 
          subtitle="ΔΙΑΧΕΙΡΙΣΗ ΤΩΝ ΠΕΛΑΤΩΝ ΠΟΥ ΕΧΟΥΝ ΚΑΤΑΓΡΑΦΕΙ"
          actions={
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-center">
              <div className="text-[9px] font-bold text-emerald-400 uppercase">ΣΥΝΟΛΟ</div>
              <div className="text-xl font-bold text-emerald-600 leading-none">{customers.length}</div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-900 uppercase">ΣΥΓΧΡΟΝΙΣΜΟΣ ΠΕΛΑΤΩΝ</h4>
                <p className="text-[10px] font-medium text-zinc-500 italic uppercase">ΣΚΑΝΑΡΙΣΜΑ ΕΓΓΥΗΣΕΩΝ ΚΑΙ ΕΝΗΜΕΡΩΣΗ REGISTRY</p>
              </div>
              <Button 
                onClick={async () => {
                  setIsMigratingCustomers(true);
                  setMigrationCount(0);
                  try {
                    const total = await FirestoreService.migrateCustomers((count) => setMigrationCount(count));
                    toast.success(`ΟΛΟΚΛΗΡΩΘΗΚΕ! ${total} ΠΕΛΑΤΕΣ.`);
                  } catch (e: any) {
                    toast.error("ΣΦΑΛΜΑ");
                  } finally {
                    setIsMigratingCustomers(false);
                  }
                }}
                loading={isMigratingCustomers}
                icon={RefreshCw}
                variant="primary"
              >
                {isMigratingCustomers ? `ΣΥΓΧΡΟΝΙΣΜΟΣ (${migrationCount})` : 'ΕΝΑΡΞΗ ΣΥΓΧΡΟΝΙΣΜΟΥ'}
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="ΑΝΑΖΗΤΗΣΗ ΠΕΛΑΤΗ (ΟΝΟΜΑ)..." 
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:bg-white transition-all text-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                    <th className="pb-4 pl-4">ΟΝΟΜΑΤΕΠΩΝΥΜΟ</th>
                    <th className="pb-4">ΟΧΗΜΑΤΑ (VINs)</th>
                    <th className="pb-4">ΧΡΗΣΕΙΣ</th>
                    <th className="pb-4 text-right pr-4">ΕΝΕΡΓΕΙΕΣ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {customers
                    .filter(c => c.fullName.toLowerCase().includes(customerSearch.toLowerCase()))
                    .map(customer => (
                    <tr key={customer.id} className="group hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 pl-4">
                        <Link to={`/customer/${encodeURIComponent(customer.fullName.replace(/\n/g, ' '))}`} className="text-xs font-bold text-blue-600 uppercase hover:underline flex items-center gap-2">
                          <User size={12} />
                          {customer.fullName}
                        </Link>
                        <div className="text-[9px] font-bold text-zinc-400 uppercase">ID: {customer.id}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {customer.vins?.map((vin, vIdx) => (
                            <Badge key={`${vin}-${vIdx}`} variant="neutral" className="text-[9px]">{vin}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="info">{customer.useCount || 0}</Badge>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Button 
                            variant={confirmingDeleteCustomerId === customer.id ? "danger" : "neutral"} 
                            size="sm" 
                            icon={Trash2}
                            onClick={() => handleDeleteCustomer(customer.id, customer.fullName)}
                          >
                            {confirmingDeleteCustomerId === customer.id && <span className="text-[9px] ml-2">ΕΠΙΒΕΒΑΙΩΣΗ;</span>}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Vehicles Tab Content */}
      {activeTab === 'vehicles' && (
        <Card 
          title="ΔΙΑΧΕΙΡΙΣΗ ΟΧΗΜΑΤΩΝ" 
          subtitle="ΠΡΟΒΟΛΗ ΚΑΙ ΕΠΕΞΕΡΓΑΣΙΑ ΤΗΣ ΒΑΣΗΣ ΟΧΗΜΑΤΩΝ"
          actions={
            <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 text-center">
              <div className="text-[9px] font-bold text-indigo-400 uppercase">ΣΥΝΟΛΟ</div>
              <div className="text-xl font-bold text-indigo-600 leading-none">{vehicles.length}</div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-900 uppercase">ΣΥΓΧΡΟΝΙΣΜΟΣ ΟΧΗΜΑΤΩΝ</h4>
                <p className="text-[10px] font-medium text-zinc-500 italic uppercase">ΣΚΑΝΑΡΙΣΜΑ ΕΓΓΥΗΣΕΩΝ ΚΑΙ ΕΝΗΜΕΡΩΣΗ REGISTRY</p>
              </div>
              <Button 
                onClick={async () => {
                  setIsMigratingVehicles(true);
                  setMigrationCount(0);
                  try {
                    const total = await FirestoreService.migrateVehicles((count) => setMigrationCount(count));
                    toast.success(`ΟΛΟΚΛΗΡΩΘΗΚΕ! ${total} ΟΧΗΜΑΤΑ.`);
                  } catch (e: any) {
                    toast.error("ΣΦΑΛΜΑ");
                  } finally {
                    setIsMigratingVehicles(false);
                  }
                }}
                loading={isMigratingVehicles}
                icon={RefreshCw}
                variant="primary"
              >
                {isMigratingVehicles ? `ΣΥΓΧΡΟΝΙΣΜΟΣ (${migrationCount})` : 'ΕΝΑΡΞΗ ΣΥΓΧΡΟΝΙΣΜΟΥ'}
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="ΑΝΑΖΗΤΗΣΗ VIN Η ΙΔΙΟΚΤΗΤΗ..." 
                value={vehicleSearch}
                onChange={e => setVehicleSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:bg-white transition-all text-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                    <th className="px-6 py-4">VIN</th>
                    <th className="px-6 py-4">ΜΑΡΚΑ</th>
                    <th className="px-6 py-4">ΙΔΙΟΚΤΗΤΗΣ</th>
                    <th className="px-6 py-4 text-center">ΧΡΗΣΕΙΣ</th>
                    <th className="px-6 py-4 text-right">ΕΝΕΡΓΕΙΕΣ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {vehicles
                    .filter(v => 
                      v.vin.includes(vehicleSearch.toUpperCase()) || 
                      v.ownerName.toUpperCase().includes(vehicleSearch.toUpperCase())
                    )
                    .slice(0, 50)
                    .map(vehicle => (
                    <tr key={vehicle.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-bold text-indigo-600 uppercase flex items-center gap-2">
                          <Car size={12} />
                          {vehicle.vin}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {editingVehicleId === vehicle.id ? (
                          <input 
                            type="text" 
                            value={vehicleEditData.brand} 
                            onChange={e => setVehicleEditData({ ...vehicleEditData, brand: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-[11px] font-bold outline-none"
                          />
                        ) : (
                          <Badge variant="info">{vehicle.brand || '---'}</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingVehicleId === vehicle.id ? (
                          <input 
                            type="text" 
                            value={vehicleEditData.ownerName} 
                            onChange={e => setVehicleEditData({ ...vehicleEditData, ownerName: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-[11px] font-bold outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="text-[11px] font-bold text-zinc-600">{vehicle.ownerName}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="neutral">x{vehicle.useCount || 0}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingVehicleId === vehicle.id ? (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="primary" icon={Check} onClick={async () => {
                              try {
                                await FirestoreService.upsertVehicle(vehicle.vin, vehicleEditData.brand, vehicleEditData.ownerName);
                                setEditingVehicleId(null);
                                toast.success("ΕΝΗΜΕΡΩΘΗΚΕ!");
                              } catch (e) { toast.error("ΣΦΑΛΜΑ"); }
                            }} />
                            <Button size="sm" variant="neutral" icon={X} onClick={() => setEditingVehicleId(null)} />
                          </div>
                        ) : (
                          <Button size="sm" variant="neutral" icon={Edit2} onClick={() => {
                            setEditingVehicleId(vehicle.id);
                            setVehicleEditData({ ownerName: vehicle.ownerName, brand: vehicle.brand || '' });
                          }} className="opacity-0 group-hover:opacity-100" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Parts Tab Content */}
      {activeTab === 'database' && (
        <Card 
          title="ΔΙΑΧΕΙΡΙΣΗ ΑΝΤΑΛΛΑΚΤΙΚΩΝ" 
          subtitle="ΠΡΟΒΟΛΗ ΚΑΙ ΕΠΕΞΕΡΓΑΣΙΑ ΤΗΣ ΒΑΣΗΣ ΑΝΤΑΛΛΑΚΤΙΚΩΝ"
          actions={
            <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-center">
              <div className="text-[9px] font-bold text-blue-400 uppercase">ΣΥΝΟΛΟ</div>
              <div className="text-xl font-bold text-blue-600 leading-none">{parts.length}</div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-900 uppercase">ΣΥΓΧΡΟΝΙΣΜΟΣ ΑΝΤΑΛΛΑΚΤΙΚΩΝ</h4>
                <p className="text-[10px] font-medium text-zinc-500 italic uppercase">ΤΡΑΒΗΞΤΕ ΚΩΔΙΚΟΥΣ ΑΠΟ ΤΟ ΙΣΤΟΡΙΚΟ ΕΓΓΥΗΣΕΩΝ</p>
              </div>
              <Button 
                onClick={async () => {
                  setIsMigrating(true);
                  setMigrationCount(0);
                  try {
                    const total = await FirestoreService.migrateParts((count) => setMigrationCount(count));
                    toast.success(`ΟΛΟΚΛΗΡΩΘΗΚΕ! ${total} ΑΝΤΑΛΛΑΚΤΙΚΑ.`);
                  } catch (e: any) {
                    toast.error("ΣΦΑΛΜΑ");
                  } finally {
                    setIsMigrating(false);
                  }
                }}
                loading={isMigrating}
                icon={RefreshCw}
                variant="primary"
              >
                {isMigrating ? `ΕΠΕΞΕΡΓΑΣΙΑ (${migrationCount})` : 'ΕΝΑΡΞΗ ΣΥΓΧΡΟΝΙΣΜΟΥ'}
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="ΑΝΑΖΗΤΗΣΗ ΚΩΔΙΚΟΥ Η ΠΕΡΙΓΡΑΦΗΣ..." 
                value={partSearch}
                onChange={e => setPartSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:bg-white transition-all text-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                    <th className="px-6 py-4">ΚΩΔΙΚΟΣ</th>
                    <th className="px-6 py-4">ΜΑΡΚΑ</th>
                    <th className="px-6 py-4">ΠΕΡΙΓΡΑΦΗ</th>
                    <th className="px-6 py-4 text-center">ΧΡΗΣΕΙΣ</th>
                    <th className="px-6 py-4 text-right">ΕΝΕΡΓΕΙΕΣ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {parts
                    .filter(p => 
                      p.code.includes(partSearch.toUpperCase()) || 
                      p.description.toUpperCase().includes(partSearch.toUpperCase()) ||
                      (p.brand || '').toUpperCase().includes(partSearch.toUpperCase())
                    )
                    .slice(0, 50)
                    .map(part => (
                    <tr key={part.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-bold text-blue-600 uppercase flex items-center gap-2">
                          <Box size={12} />
                          {part.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {editingPartId === part.id ? (
                          <input 
                            type="text" 
                            value={partEditData.brand} 
                            onChange={e => setPartEditData({ ...partEditData, brand: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-[11px] font-bold outline-none"
                          />
                        ) : (
                          <Badge variant="info">{part.brand || '---'}</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingPartId === part.id ? (
                          <input 
                            type="text" 
                            value={partEditData.description} 
                            onChange={e => setPartEditData({ ...partEditData, description: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-[11px] font-bold outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="text-[11px] font-bold text-zinc-600">{part.description}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="neutral">x{part.useCount || 0}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingPartId === part.id ? (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="primary" icon={Check} onClick={async () => {
                              try {
                                await FirestoreService.upsertPart(part.code, partEditData.description, partEditData.brand);
                                setEditingPartId(null);
                                toast.success("ΕΝΗΜΕΡΩΘΗΚΕ!");
                              } catch (e) { toast.error("ΣΦΑΛΜΑ"); }
                            }} />
                            <Button size="sm" variant="neutral" icon={X} onClick={() => setEditingPartId(null)} />
                          </div>
                        ) : (
                          <Button size="sm" variant="neutral" icon={Edit2} onClick={() => {
                            setEditingPartId(part.id);
                            setPartEditData({ description: part.description, brand: part.brand || '' });
                          }} className="opacity-0 group-hover:opacity-100" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
