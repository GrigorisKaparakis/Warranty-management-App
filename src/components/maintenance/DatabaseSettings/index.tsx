/**
 * DatabaseSettings: Διαχείριση των κεντρικών μητρώων της εφαρμογής.
 * Επιτρέπει συγχρονισμό, αναζήτηση και επεξεργασία Πελατών, Οχημάτων και Ανταλλακτικών.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Car, Package, Database } from 'lucide-react';
import { CustomersTab } from './Customers/CustomersTab';
import { VehiclesTab } from './Vehicles/VehiclesTab';
import { PartsTab } from './Parts/PartsTab';

interface DatabaseSettingsProps {
  activeTab?: string;
}

export const DatabaseSettings: React.FC<DatabaseSettingsProps> = ({ activeTab: propActiveTab }) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'vehicles' | 'database'>(
    (propActiveTab as any) || 'customers'
  );

  // Sync internal state with prop from URL/Sidebar
  React.useEffect(() => {
    if (propActiveTab && (propActiveTab === 'customers' || propActiveTab === 'vehicles' || propActiveTab === 'database')) {
      setActiveTab(propActiveTab as any);
    }
  }, [propActiveTab]);

  const tabs = [
    { id: 'customers', label: 'ΠΕΛΑΤΕΣ', icon: Users },
    { id: 'vehicles', label: 'ΟΧΗΜΑΤΑ', icon: Car },
    { id: 'database', label: 'ΑΝΤΑΛΛΑΚΤΙΚΑ', icon: Package }
  ] as const;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Database size={20} />
            </div>
            <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tighter italic">ΔΙΑΧΕΙΡΙΣΗ ΜΗΤΡΩΩΝ</h2>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase italic tracking-widest leading-relaxed ml-1">
            ΚΕΝΤΡΙΚΗ ΔΙΑΧΕΙΡΙΣΗ ΔΕΔΟΜΕΝΩΝ & ΟΡΓΑΝΩΣΗ REGISTRIES
          </p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {activeTab === 'customers' && <CustomersTab />}
            {activeTab === 'vehicles' && <VehiclesTab />}
            {activeTab === 'database' && <PartsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
