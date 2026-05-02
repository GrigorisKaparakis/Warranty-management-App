import React, { Suspense, useMemo } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../ui/PageHeader';
import { ChevronRight, Settings, Database, Wrench, Shield, Cpu } from 'lucide-react';

// Lazy load sub-components
const AppSettings = React.lazy(() => import('./AppSettings').then(m => ({ default: m.AppSettings })));
const DashboardSettings = React.lazy(() => import('./DashboardSettings').then(m => ({ default: m.DashboardSettings })));
const DatabaseSettings = React.lazy(() => import('./DatabaseSettings').then(m => ({ default: m.DatabaseSettings })));
const AiEngineSettings = React.lazy(() => import('./AiEngineSettings').then(m => ({ default: m.AiEngineSettings })));
const SecuritySettings = React.lazy(() => import('./SecuritySettings').then(m => ({ default: m.SecuritySettings })));
const RolesSettings = React.lazy(() => import('./RolesSettings').then(m => ({ default: m.RolesSettings })));
const DataToolsSettings = React.lazy(() => import('./DataToolsSettings').then(m => ({ default: m.DataToolsSettings })));
const ResourceProtection = React.lazy(() => import('./ResourceProtection').then(m => ({ default: m.ResourceProtection })));

/**
 * MaintenancePanel: Το κεντρικό πάνελ διαχείρισης του συστήματος (Admin Panel).
 * Οργανώνει τις ρυθμίσεις σε κατηγορίες (Settings, Databases, Tools, AI, Security).
 */
export const MaintenancePanel: React.FC = () => {
  const params = useParams();
  const splat = params['*'] || '';
  const [urlCategory, urlSection] = splat.split('/');
  const category = params.category || urlCategory;
  const section = params.section || urlSection;

  const navigate = useNavigate();

  const sectionToTabMap: Record<string, string> = {
    'brands': 'companies',
    'status': 'status',
    'menu': 'menu',
    'labels': 'app_label',
    'dashboard': 'dashboard',
    'limits': 'app_limits',
    'expirelimits': 'expiry_thresholds',
    'features': 'feature_toggles',
    'parts': 'database',
    'vehicles': 'vehicles',
    'customers': 'customers',
    'expirationupdate': 'dataTools',
    'ai': 'ai_control',
    'rolepermissions': 'permissions',
    'roles': 'roles',
    'protection': 'resource_protection'
  };

  const tabToUrlMap: Record<string, { cat: string, sec: string }> = {
    'companies': { cat: 'settings', sec: 'brands' },
    'status': { cat: 'settings', sec: 'status' },
    'menu': { cat: 'settings', sec: 'menu' },
    'app_label': { cat: 'settings', sec: 'labels' },
    'dashboard': { cat: 'settings', sec: 'dashboard' },
    'app_limits': { cat: 'settings', sec: 'limits' },
    'expiry_thresholds': { cat: 'settings', sec: 'expirelimits' },
    'feature_toggles': { cat: 'settings', sec: 'features' },
    'database': { cat: 'databases', sec: 'parts' },
    'vehicles': { cat: 'databases', sec: 'vehicles' },
    'customers': { cat: 'databases', sec: 'customers' },
    'dataTools': { cat: 'tools', sec: 'expirationupdate' },
    'ai_control': { cat: 'ai', sec: 'ai' },
    'permissions': { cat: 'security', sec: 'rolepermissions' },
    'roles': { cat: 'security', sec: 'roles' },
    'resource_protection': { cat: 'security', sec: 'protection' }
  };

  const activeTab = useMemo(() => {
    if (!section) return 'companies';
    return sectionToTabMap[section] || 'companies';
  }, [section]);

  const setActiveTab = (tabId: string) => {
    const urlInfo = tabToUrlMap[tabId];
    if (urlInfo) {
      navigate(`/maintenance/${urlInfo.cat}/${urlInfo.sec}`);
    }
  };

  const categories = [
    {
      id: 'settings',
      label: 'ΡΥΘΜΙΣΕΙΣ ΕΦΑΡΜΟΓΗΣ',
      icon: Settings,
      items: [
        { id: 'companies', label: 'Εταιρείες & Μάρκες' },
        { id: 'status', label: 'Καταστάσεις' },
        { id: 'menu', label: 'Μενού & Σειρά' },
        { id: 'app_label', label: 'App Labels' },
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'app_limits', label: 'App Limits' },
        { id: 'expiry_thresholds', label: 'Όρια Λήξεων' },
        { id: 'feature_toggles', label: 'Δυνατότητες' },
      ]
    },
    {
      id: 'databases',
      label: 'ΒΑΣΕΙΣ ΔΕΔΟΜΕΝΩΝ',
      icon: Database,
      items: [
        { id: 'database', label: 'Ανταλλακτικά' },
        { id: 'vehicles', label: 'Οχήματα' },
        { id: 'customers', label: 'Πελάτες' },
      ]
    },
    {
      id: 'tools',
      label: 'ΕΡΓΑΛΕΙΑ ΔΕΔΟΜΕΝΩΝ',
      icon: Wrench,
      items: [
        { id: 'dataTools', label: 'Μαζική Ενημέρωση Λήξεων' },
      ]
    },
    {
      id: 'ai',
      label: 'AI ENGINE',
      icon: Cpu,
      items: [
        { id: 'ai_control', label: 'AI Control Center' },
      ]
    },
    {
      id: 'security',
      label: 'ΑΣΦΑΛΕΙΑ',
      icon: Shield,
      items: [
        { id: 'permissions', label: 'Δικαιώματα Ρόλων' },
        { id: 'roles', label: 'Ρόλοι Χρηστών' },
        { id: 'resource_protection', label: 'Προστασία Πόρων' },
      ]
    }
  ];

  if (!category && !splat) {
    return <Navigate to="settings/brands" replace />;
  }

  return (
    <div className="p-8 md:p-12 space-y-10 pb-24">
      <PageHeader 
        title="ΣΥΝΤΗΡΗΣΗ ΣΥΣΤΗΜΑΤΟΣ" 
        subtitle="ADMIN CONTROL PANEL & SYSTEM CONFIGURATION" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-10">
          {categories.map(cat => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2 px-4">
                <cat.icon size={14} className="text-zinc-400" />
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{cat.label}</h4>
              </div>
              <div className="space-y-1">
                {cat.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-bold uppercase transition-all flex items-center justify-between group ${
                      activeTab === item.id 
                        ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-200 translate-x-1' 
                        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={14} className={`transition-all ${activeTab === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center h-96 space-y-4 animate-fade-in">
                  <div className="w-12 h-12 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">ΦΟΡΤΩΣΗ ΕΝΟΤΗΤΑΣ...</p>
                </div>
              }>
                {category === 'settings' && (
                  <>
                    <AppSettings activeTab={activeTab} />
                    <DashboardSettings activeTab={activeTab} />
                  </>
                )}
                {category === 'databases' && <DatabaseSettings activeTab={activeTab} />}
                {category === 'tools' && <DataToolsSettings activeTab={activeTab} />}
                {category === 'ai' && <AiEngineSettings activeTab={activeTab} />}
                {category === 'security' && (
                  <>
                    <SecuritySettings activeTab={activeTab} />
                    <RolesSettings activeTab={activeTab} />
                    <ResourceProtection activeTab={activeTab} />
                  </>
                )}
                
                {!['settings', 'databases', 'tools', 'ai', 'security'].includes(category || '') && category && (
                  <Navigate to="/maintenance/settings/brands" replace />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
