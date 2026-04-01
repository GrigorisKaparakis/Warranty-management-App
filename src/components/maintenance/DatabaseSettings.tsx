import React, { useState } from 'react';
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
    <div className="animate-slide-up space-y-8 pb-32">
      {/* Customers Tab Content */}
      {activeTab === 'customers' && (
        <Card 
          title="CUSTOMER REGISTRY" 
          subtitle="MANAGE SYSTEM-WIDE CLIENT DATABASE"
          actions={
            <div className="bg-emerald-600/10 px-6 py-2 rounded-2xl border border-emerald-500/20 text-center shadow-2xl">
              <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">TOTAL NODES</div>
              <div className="text-xl font-black text-white leading-none">{customers.length}</div>
            </div>
          }
        >
          <div className="space-y-8 pt-4">
            <div className="p-8 bg-slate-950 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 group/sync relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl group-hover/sync:bg-emerald-600/10 transition-all"></div>
              <div className="space-y-2 relative z-10">
                <h4 className="text-xs font-black text-white uppercase tracking-widest italic">CUSTOMER NODE SYNCHRONIZATION</h4>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">SCAN WARRANTY HISTORY & INJECT INTO REGISTRY</p>
              </div>
              <button 
                onClick={async () => {
                  setIsMigratingCustomers(true);
                  setMigrationCount(0);
                  try {
                    const total = await FirestoreService.migrateCustomers((count) => setMigrationCount(count));
                    toast.success(`SYNC COMPLETE: ${total} NODES AUTHORIZED.`);
                  } catch (e: any) {
                    toast.error("PROTOCOL FAILURE");
                  } finally {
                    setIsMigratingCustomers(false);
                  }
                }}
                disabled={isMigratingCustomers}
                className="px-8 h-14 bg-emerald-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-none italic disabled:opacity-50 relative z-10"
              >
                {isMigratingCustomers ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    SYNCING ({migrationCount})
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    INITIATE SYNC
                  </>
                )}
              </button>
            </div>

            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="SEARCH CUSTOMER REGISTRY (NAME / IDENTIFIER)..." 
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-slate-950 border border-white/5 rounded-[2rem] font-black outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm text-white placeholder:text-slate-800 uppercase tracking-tighter"
              />
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">ENTITY NAME / ID</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">ASSOCIATED VINs</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-center">UTILIZATION</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-right">COMMAND</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers
                    .filter(c => c.fullName.toLowerCase().includes(customerSearch.toLowerCase()))
                    .map(customer => (
                    <tr key={customer.id} className="group hover:bg-white/[0.03] transition-all">
                      <td className="px-8 py-5">
                        <Link to={`/customer/${encodeURIComponent(customer.fullName.replace(/\n/g, ' '))}`} className="text-[12px] font-black text-blue-400 uppercase tracking-tighter italic hover:text-blue-300 transition-all flex items-center gap-2">
                          <User size={14} />
                          {customer.fullName}
                        </Link>
                        <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest font-mono mt-1">UUID: {customer.id}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-2">
                          {customer.vins?.map(vin => (
                            <span key={vin} className="px-2 py-1 bg-slate-900 border border-white/5 rounded-lg text-[9px] font-black text-slate-500 font-mono tracking-tighter">{vin}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl text-[10px] font-black font-mono">x{customer.useCount || 0}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleDeleteCustomer(customer.id, customer.fullName)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border shadow-2xl opacity-0 group-hover:opacity-100 ${confirmingDeleteCustomerId === customer.id ? 'bg-red-600 border-red-500 text-white shadow-red-900/40' : 'bg-slate-950 border-white/5 text-slate-700 hover:text-red-500 hover:border-red-500/30'}`}
                        >
                          <Trash2 size={18} />
                        </button>
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
          title="VEHICLE REGISTRY" 
          subtitle="MONITOR SYSTEM-WIDE SHIPMENT & ASSET DATABASE"
          actions={
            <div className="bg-indigo-600/10 px-6 py-2 rounded-2xl border border-indigo-500/20 text-center shadow-2xl">
              <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">TOTAL NODES</div>
              <div className="text-xl font-black text-white leading-none">{vehicles.length}</div>
            </div>
          }
        >
          <div className="space-y-8 pt-4">
            <div className="p-8 bg-slate-950 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 group/sync relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl group-hover/sync:bg-indigo-600/10 transition-all"></div>
              <div className="space-y-2 relative z-10">
                <h4 className="text-xs font-black text-white uppercase tracking-widest italic">VEHICLE ASSET SYNCHRONIZATION</h4>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">MAP VIN IDENTIFIERS FROM GLOBAL RECORDS</p>
              </div>
              <button 
                onClick={async () => {
                  setIsMigratingVehicles(true);
                  setMigrationCount(0);
                  try {
                    const total = await FirestoreService.migrateVehicles((count) => setMigrationCount(count));
                    toast.success(`SYNC COMPLETE: ${total} ASSETS INDEXED.`);
                  } catch (e: any) {
                    toast.error("PROTOCOL FAILURE");
                  } finally {
                    setIsMigratingVehicles(false);
                  }
                }}
                disabled={isMigratingVehicles}
                className="px-8 h-14 bg-indigo-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(79,70,229,0.3)] border-none italic disabled:opacity-50 relative z-10"
              >
                {isMigratingVehicles ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    INDEXING ({migrationCount})
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    INITIATE INDEX
                  </>
                )}
              </button>
            </div>

            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="SEARCH VEHICLE ASSETS (VIN / OWNER)..." 
                value={vehicleSearch}
                onChange={e => setVehicleSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-slate-950 border border-white/5 rounded-[2rem] font-black outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm text-white placeholder:text-slate-800 uppercase tracking-tighter"
              />
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">VIN IDENTIFIER</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">BRAND CLASS</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">NODE OWNER</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-center">USAGE</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-right">COMMAND</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vehicles
                    .filter(v => 
                      v.vin.includes(vehicleSearch.toUpperCase()) || 
                      v.ownerName.toUpperCase().includes(vehicleSearch.toUpperCase())
                    )
                    .slice(0, 50)
                    .map(vehicle => (
                    <tr key={vehicle.id} className="group hover:bg-white/[0.03] transition-all">
                      <td className="px-8 py-5">
                        <span className="text-[12px] font-black text-indigo-400 uppercase tracking-tighter font-mono italic flex items-center gap-2">
                          <Car size={14} />
                          {vehicle.vin}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        {editingVehicleId === vehicle.id ? (
                          <input 
                            type="text" 
                            value={vehicleEditData.brand} 
                            onChange={e => setVehicleEditData({ ...vehicleEditData, brand: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-2 bg-slate-950 border border-indigo-500/30 rounded-xl text-[11px] font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all uppercase tracking-widest"
                          />
                        ) : (
                          <span className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest italic">{vehicle.brand || '---'}</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        {editingVehicleId === vehicle.id ? (
                          <input 
                            type="text" 
                            value={vehicleEditData.ownerName} 
                            onChange={e => setVehicleEditData({ ...vehicleEditData, ownerName: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-950 border border-indigo-500/30 rounded-xl text-[11px] font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            autoFocus
                          />
                        ) : (
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter italic">{vehicle.ownerName}</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-3 py-1 bg-slate-900 border border-white/5 text-slate-500 rounded-xl text-[10px] font-black font-mono">x{vehicle.useCount || 0}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {editingVehicleId === vehicle.id ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={async () => {
                              try {
                                await FirestoreService.upsertVehicle(vehicle.vin, vehicleEditData.brand, vehicleEditData.ownerName);
                                setEditingVehicleId(null);
                                toast.success("ASSET PATCHED");
                              } catch (e) { toast.error("IO_ERROR"); }
                            }} className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-2xl hover:bg-blue-500 transition-all"><Check size={18} /></button>
                            <button onClick={() => setEditingVehicleId(null)} className="w-10 h-10 flex items-center justify-center bg-slate-900 text-slate-500 rounded-xl border border-white/5 hover:bg-slate-800 transition-all"><X size={18} /></button>
                          </div>
                        ) : (
                          <button onClick={() => {
                            setEditingVehicleId(vehicle.id);
                            setVehicleEditData({ ownerName: vehicle.ownerName, brand: vehicle.brand || '' });
                          }} className="w-10 h-10 flex items-center justify-center bg-slate-950 border border-white/5 text-slate-700 hover:text-blue-400 hover:border-blue-500/30 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={18} /></button>
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
          title="PARTS REGISTRY" 
          subtitle="MONITOR SYSTEM-WIDE COMPONENT & SKU DATABASE"
          actions={
            <div className="bg-blue-600/10 px-6 py-2 rounded-2xl border border-blue-500/20 text-center shadow-2xl">
              <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">TOTAL NODES</div>
              <div className="text-xl font-black text-white leading-none">{parts.length}</div>
            </div>
          }
        >
          <div className="space-y-8 pt-4">
            <div className="p-8 bg-slate-950 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 group/sync relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl group-hover/sync:bg-blue-600/10 transition-all"></div>
              <div className="space-y-2 relative z-10">
                <h4 className="text-xs font-black text-white uppercase tracking-widest italic">COMPONENT DATA SYNCHRONIZATION</h4>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">EXTRACT SKU CODES FROM WARRANTY STREAM</p>
              </div>
              <button 
                onClick={async () => {
                  setIsMigrating(true);
                  setMigrationCount(0);
                  try {
                    const total = await FirestoreService.migrateParts((count) => setMigrationCount(count));
                    toast.success(`SYNC COMPLETE: ${total} SKUs CACHED.`);
                  } catch (e: any) {
                    toast.error("PROTOCOL FAILURE");
                  } finally {
                    setIsMigrating(false);
                  }
                }}
                disabled={isMigrating}
                className="px-8 h-14 bg-blue-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(37,99,235,0.3)] border-none italic disabled:opacity-50 relative z-10"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    CACHING ({migrationCount})
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    INITIATE CACHE
                  </>
                )}
              </button>
            </div>

            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="SEARCH COMPONENT REGISTRY (CODE / DESCRIPTION)..." 
                value={partSearch}
                onChange={e => setPartSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-slate-950 border border-white/5 rounded-[2rem] font-black outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm text-white placeholder:text-slate-800 uppercase tracking-tighter"
              />
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">SKU / COMPONENT CODE</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">MANUFACTURER</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">SPECIFICATION</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-center">USAGE</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-right">COMMAND</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {parts
                    .filter(p => 
                      p.code.includes(partSearch.toUpperCase()) || 
                      p.description.toUpperCase().includes(partSearch.toUpperCase()) ||
                      (p.brand || '').toUpperCase().includes(partSearch.toUpperCase())
                    )
                    .slice(0, 50)
                    .map(part => (
                    <tr key={part.id} className="group hover:bg-white/[0.03] transition-all">
                      <td className="px-8 py-5">
                        <span className="text-[12px] font-black text-blue-400 uppercase tracking-tighter font-mono italic flex items-center gap-2">
                          <Box size={14} />
                          {part.code}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        {editingPartId === part.id ? (
                          <input 
                            type="text" 
                            value={partEditData.brand} 
                            onChange={e => setPartEditData({ ...partEditData, brand: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-2 bg-slate-950 border border-blue-500/30 rounded-xl text-[11px] font-black text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase tracking-widest"
                          />
                        ) : (
                          <span className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest italic">{part.brand || '---'}</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        {editingPartId === part.id ? (
                          <input 
                            type="text" 
                            value={partEditData.description} 
                            onChange={e => setPartEditData({ ...partEditData, description: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-950 border border-blue-500/30 rounded-xl text-[11px] font-black text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            autoFocus
                          />
                        ) : (
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter italic">{part.description}</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-3 py-1 bg-slate-900 border border-white/5 text-slate-500 rounded-xl text-[10px] font-black font-mono">x{part.useCount || 0}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {editingPartId === part.id ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={async () => {
                              try {
                                await FirestoreService.upsertPart(part.code, partEditData.description, partEditData.brand);
                                setEditingPartId(null);
                                toast.success("SKU PATCHED");
                              } catch (e) { toast.error("IO_ERROR"); }
                            }} className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-2xl hover:bg-blue-500 transition-all"><Check size={18} /></button>
                            <button onClick={() => setEditingPartId(null)} className="w-10 h-10 flex items-center justify-center bg-slate-900 text-slate-500 rounded-xl border border-white/5 hover:bg-slate-800 transition-all"><X size={18} /></button>
                          </div>
                        ) : (
                          <button onClick={() => {
                            setEditingPartId(part.id);
                            setPartEditData({ description: part.description, brand: part.brand || '' });
                          }} className="w-10 h-10 flex items-center justify-center bg-slate-950 border border-white/5 text-slate-700 hover:text-blue-400 hover:border-blue-500/30 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={18} /></button>
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
