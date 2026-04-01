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
    'parts': 'database',
    'vehicles': 'vehicles',
    'customers': 'customers',
    'expirationupdate': 'dataTools',
    'ai': 'ai_control',
    'rolepermissions': 'permissions',
    'roles': 'roles'
  };

  const tabToUrlMap: Record<string, { cat: string, sec: string }> = {
    'companies': { cat: 'settings', sec: 'brands' },
    'status': { cat: 'settings', sec: 'status' },
    'menu': { cat: 'settings', sec: 'menu' },
    'app_label': { cat: 'settings', sec: 'labels' },
    'dashboard': { cat: 'settings', sec: 'dashboard' },
    'app_limits': { cat: 'settings', sec: 'limits' },
    'expiry_thresholds': { cat: 'settings', sec: 'expirelimits' },
    'database': { cat: 'databases', sec: 'parts' },
    'vehicles': { cat: 'databases', sec: 'vehicles' },
    'customers': { cat: 'databases', sec: 'customers' },
    'dataTools': { cat: 'tools', sec: 'expirationupdate' },
    'ai_control': { cat: 'ai', sec: 'ai' },
    'permissions': { cat: 'security', sec: 'rolepermissions' },
    'roles': { cat: 'security', sec: 'roles' }
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
      ]
    }
  ];

  if (!category && !splat) {
    return <Navigate to="settings/brands" replace />;
  }

  return (
    <div className="p-8 md:p-12 space-y-12 pb-32 animate-fade-in">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">SYSTEM CORE PROTOCOLS</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">MAINTENANCE PANEL</h1>
        <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mt-2 italic">ADMIN CONTROL CENTER & CONFIGURATION SYNC</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-10">
          {categories.map(cat => (
            <div key={cat.id} className="space-y-6">
              <div className="flex items-center gap-3 px-5">
                <cat.icon size={16} className="text-blue-500/50" />
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] italic">{cat.label}</h4>
              </div>
              <div className="space-y-1">
                {cat.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-6 py-4 rounded-[1.2rem] text-[11px] font-black uppercase transition-all flex items-center justify-between group/btn border border-transparent ${
                      activeTab === item.id 
                        ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] translate-x-2 border-blue-400/50' 
                        : 'text-slate-500 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="tracking-widest italic">{item.label}</span>
                    <ChevronRight size={16} className={`transition-all ${activeTab === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0'}`} />
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
                <div className="flex flex-col items-center justify-center h-96 space-y-8 animate-fade-in glass-dark rounded-[4rem] border border-white/5">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(37,99,235,0.2)]"></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic animate-pulse">UPLINKING MODULE CONTENT</p>
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
