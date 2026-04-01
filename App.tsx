
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppState } from './src/hooks/useAppState';
import { useStore } from './src/store/useStore';
import { AuthService } from './src/services/firebase/auth';
import { Entry, ViewType } from './src/core/types';

// Static imports for layout and critical components
import { Sidebar } from './src/components/layout/Sidebar';
import { NoticeTicker } from './src/components/layout/NoticeTicker';
import { Toaster } from 'sonner';
import { ChangePasswordModal } from './src/components/ui/ChangePasswordModal';
import { APP_DEFAULTS } from './src/core/config';
import { StateManager } from './src/components/core/StateManager';
import { ErrorBoundary } from './src/components/core/ErrorBoundary';
import { formatError } from './src/utils/errorUtils';
import { toast } from './src/utils/toast';
import { Upload, FileText, Loader2, Trash2 } from 'lucide-react';

// Lazy loaded views
const DashboardView = lazy(() => import('./src/views/Dashboard').then(m => ({ default: m.DashboardView })));
const ListView = lazy(() => import('./src/views/Inventory').then(m => ({ default: m.ListView })));
const VehicleHistoryView = lazy(() => import('./src/views/VehicleHistoryView').then(m => ({ default: m.VehicleHistoryView })));
const AiAssistantView = lazy(() => import('./src/views/AiChat').then(m => ({ default: m.AiAssistantView })));
const WarrantyForm = lazy(() => import('./src/components/warranty/WarrantyForm').then(m => ({ default: m.WarrantyForm })));
const WarrantyDetailView = lazy(() => import('./src/views/WarrantyDetailView').then(m => ({ default: m.WarrantyDetailView })));
const CustomerHistoryView = lazy(() => import('./src/views/CustomerHistoryView').then(m => ({ default: m.CustomerHistoryView })));
const NoteBoard = lazy(() => import('./src/components/warranty/NoteBoard').then(m => ({ default: m.NoteBoard })));
const UserTable = lazy(() => import('./src/components/ui/UserTable').then(m => ({ default: m.UserTable })));
const MaintenancePanel = lazy(() => import('./src/components/maintenance/MaintenancePanel').then(m => ({ default: m.MaintenancePanel })));
const ExpiryTrackerView = lazy(() => import('./src/views/ExpiryTrackerView').then(m => ({ default: m.ExpiryTrackerView })));
const AuditLogView = lazy(() => import('./src/views/AuditLogView').then(m => ({ default: m.AuditLogView })));
const OnboardingView = lazy(() => import('./src/views/Onboarding').then(m => ({ default: m.OnboardingView })));

/**
 * LoadingFallback: Εμφανίζεται κατά τη διάρκεια φόρτωσης των lazy components.
 */
const LoadingFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-20 animate-in fade-in duration-500">
    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">ΦΟΡΤΩΣΗ ΣΕΛΙΔΑΣ...</p>
  </div>
);

/**
 * App: Το κεντρικό component (Root) της εφαρμογής.
 * Αναλαμβάνει το Layout, το Authentication flow και το Global Feedback (Toasts/Modals).
 */
const App: React.FC = () => {
  // Ανάκτηση όλου του απαραίτητου logic από το custom hook
  const { 
    dynamicMenu, isOnboardingRequired,
    canEdit, handleFinalDelete, handleDrag, handleDrop
  } = useAppState();

  const user = useStore(s => s?.user);
  const authLoading = useStore(s => s?.authLoading);
  const isAccountDisabled = useStore(s => s?.isAccountDisabled);
  const isLoading = useStore(s => s?.isLoading);
  const setIsLoading = useStore(s => s?.setIsLoading);
  const settings = useStore(s => s?.settings);
  const deletingEntry = useStore(s => s?.deletingEntry);
  const setDeletingEntry = useStore(s => s?.setDeletingEntry);
  const dragActive = useStore(s => s?.dragActive);
  const isChangePasswordModalOpen = useStore(s => s?.isChangePasswordModalOpen);
  const setIsChangePasswordModalOpen = useStore(s => s?.setIsChangePasswordModalOpen);

  // Τοπικό state για τη διαχείριση φορμών 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /**
   * handleLogin: Διαδικασία ταυτοποίησης με αναλυτικό feedback σφάλματος.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await AuthService.login(email, password);
    } catch (err: any) {
      toast.error(formatError(err));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * hasAccess: Έλεγχος αν ο τρέχων ρόλος επιτρέπει την προβολή μιας συγκεκριμένης σελίδας.
   */
  const hasAccess = (viewId: string) => {
    if (viewId === 'entry') return canEdit;
    return dynamicMenu.some(m => m.id === viewId);
  };

  const companyName = settings.branding?.appName || APP_DEFAULTS.NAME;
  const logoText = settings.branding?.logoText || APP_DEFAULTS.LOGO;

  // Ενημέρωση του τίτλου της σελίδας δυναμικά
  useEffect(() => {
    document.title = companyName;
  }, [companyName]);

  // Κεντρικό Rendering
  return (
    <>
      <StateManager />
      <Toaster position="bottom-right" expand={true} richColors />
      
      {/* Splash Screen κατά το αρχικό φόρτωμα */}
      {authLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-black animate-pulse uppercase tracking-[0.5em] italic">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-blue-600/10 rounded-[2rem] flex items-center justify-center border border-blue-500/20 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
               <span className="text-blue-400 italic text-3xl">{logoText}</span>
            </div>
            <span className="text-blue-500/40 text-[10px] tracking-[1em] font-black">{settings.branding?.appName || APP_DEFAULTS.SPLASH_TEXT}</span>
          </div>
        </div>
      ) : isAccountDisabled ? (
        /* Disabled Account Screen */
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-600/5 blur-[120px] rounded-full"></div>
          <div className="w-24 h-24 bg-red-600/10 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl border border-red-500/20 relative z-10">
            <svg className="w-12 h-12 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 relative z-10 italic">ACCESS TERMINATED</h1>
          <p className="text-slate-500 font-bold text-lg max-w-lg mb-12 uppercase tracking-[0.2em] leading-relaxed relative z-10 italic">YOUR ACCOUNT HAS BEEN DECOMMISSIONED BY THE SYSTEM ADMINISTRATOR.</p>
          <button 
            onClick={() => AuthService.logout()} 
            className="px-12 py-5 bg-white/5 text-white font-black rounded-[2rem] border border-white/5 uppercase tracking-widest hover:bg-white/10 transition-all relative z-10 shadow-2xl"
          >
            TERMINATE SESSION
          </button>
        </div>
      ) : isOnboardingRequired ? (
        /* Onboarding Mode για νέους Admin */
        <Suspense fallback={<LoadingFallback />}>
          <OnboardingView />
        </Suspense>
      ) : (
        <Routes>
          {/* Public/Login Route */}
          <Route 
            path="/login" 
            element={!user ? (
              <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] -mr-96 -mt-96 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px] -ml-96 -mb-96 animate-pulse"></div>

                <div className="max-w-md w-full glass-dark rounded-[4rem] p-16 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 relative z-10 space-y-12">
                  <div className="w-24 h-24 bg-blue-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                     <span className="text-white font-black italic text-3xl">{logoText}</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter text-center mb-2 italic uppercase">{companyName}</h1>
                    <p className="text-[10px] font-black text-slate-500 text-center uppercase tracking-[0.4em]">AUTHENTICATION GATEWAY</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">CREDENTIALS</label>
                       <input type="email" placeholder="EMAIL ADDRESS" className="w-full px-8 py-5 rounded-[2rem] bg-slate-900/50 border border-white/5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 text-white font-black tracking-widest placeholder:text-slate-800 transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">SECURITY KEY</label>
                       <input type="password" placeholder="PASSWORD" className="w-full px-8 py-5 rounded-[2rem] bg-slate-900/50 border border-white/5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 text-white font-black tracking-widest placeholder:text-slate-800 transition-all" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] italic hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/40 active:scale-95 border-none mt-4">
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                      ) : 'AUTHORIZE ACCESS'}
                    </button>
                  </form>
                </div>
              </div>
            ) : <Navigate to="/dashboard" replace />} 
          />

          {/* Protected Routes Wrapper */}
          <Route 
            path="/*" 
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <div 
                  className="min-h-screen bg-slate-950 flex font-sans relative"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {/* Drag & Drop Overlay */}
                  {dragActive && (
                    <div className="fixed inset-0 z-[500] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-10 animate-in fade-in duration-300">
                      <div className="w-full max-w-2xl border-4 border-dashed border-blue-500/20 rounded-[4rem] p-24 flex flex-col items-center justify-center text-center space-y-12 bg-blue-600/5 shadow-[0_0_100px_rgba(37,99,235,0.1)]">
                        <div className="w-28 h-28 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] animate-bounce border-4 border-white/20">
                          <Upload className="text-white" size={56} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-6">
                          <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">DATA UPLINK READY</h2>
                          <p className="text-blue-400 font-black text-lg uppercase tracking-[0.3em] italic">DROP PDF / IMAGE FOR AI SYNTAX EXTRACTION</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Global Loading Overlay */}
                  {isLoading && (
                    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xl">
                      <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_40px_rgba(37,99,235,0.2)]"></div>
                      <p className="text-white font-black text-[10px] uppercase tracking-[0.5em] italic animate-pulse">PROCESSING DATA STREAM</p>
                    </div>
                  )}

                  <Sidebar />
                  
                  <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <NoticeTicker />
                    
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={hasAccess('dashboard') ? <DashboardView /> : <Navigate to="/warranty/inventory" replace />} />
                            <Route path="/paid" element={<ListView label="ΠΛΗΡΩΜΕΝΕΣ" />} />
                            <Route path="/rejected" element={<ListView label="ΑΠΟΡΡΙΦΘΕΙΣΕΣ" />} />
                            
                            {/* Warranty Group */}
                            <Route path="/warranty">
                              <Route path="inventory" element={<ListView label="ΕΓΓΥΗΣΕΙΣ" />} />
                              <Route path="new" element={hasAccess('entry') ? <WarrantyForm /> : <Navigate to="/dashboard" replace />} />
                              <Route path="edit/:id" element={hasAccess('entry') ? <WarrantyForm /> : <Navigate to="/dashboard" replace />} />
                              <Route path=":id" element={<WarrantyDetailView />} />
                              <Route path="view/:view" element={<ListView label="ΦΙΛΤΡΑΡΙΣΜΕΝΗ ΠΡΟΒΟΛΗ" />} />
                            </Route>

                            <Route path="/vin-search" element={hasAccess('vinSearch') ? <VehicleHistoryView /> : <Navigate to="/dashboard" replace />} />
                            <Route path="/vin-search/:vin" element={hasAccess('vinSearch') ? <VehicleHistoryView /> : <Navigate to="/dashboard" replace />} />
                            <Route path="/customer/:name" element={<CustomerHistoryView />} />
                            <Route path="/ai-assistant" element={hasAccess('aiAssistant') ? <AiAssistantView /> : <Navigate to="/dashboard" replace />} />
                            <Route path="/notes" element={hasAccess('notes') ? <NoteBoard /> : <Navigate to="/dashboard" replace />} />
                            <Route path="/users" element={hasAccess('users') ? <UserTable /> : <Navigate to="/dashboard" replace />} />
                            <Route path="/maintenance/*" element={hasAccess('maintenance') ? <MaintenancePanel /> : <Navigate to="/dashboard" replace />} />
                            <Route path="/expiry-tracker" element={hasAccess('expiryTracker') ? <ExpiryTrackerView /> : <Navigate to="/dashboard" replace />} />
                            <Route path="/auditLog" element={hasAccess('auditLog') ? <AuditLogView /> : <Navigate to="/dashboard" replace />} />
                            
                            {/* Fallback for unknown paths */}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                          </Routes>
                        </Suspense>
                      </ErrorBoundary>
                    </div>
                  </main>

                  {/* Delete Confirmation Modal */}
                  {deletingEntry && (
                    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 animate-in fade-in duration-300">
                      <div className="glass-dark rounded-[4rem] p-16 max-w-xl w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 scale-100 animate-in zoom-in-95 duration-300 space-y-12">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20 shadow-xl">
                              <Trash2 size={32} />
                           </div>
                           <div>
                              <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">PURGE RECORD</h3>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">DANGER: IRREVERSIBLE ACTION</p>
                           </div>
                        </div>
                        
                        <div className="p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5">
                           <p className="text-base font-black text-slate-300 leading-relaxed italic uppercase tracking-tighter">CONFIRM DELETION OF WARRANTY ID <span className="text-white underline decoration-red-500/50 underline-offset-8">{deletingEntry.warrantyId}</span>?</p>
                        </div>

                        <div className="flex gap-6">
                          <button 
                            onClick={() => setDeletingEntry(null)} 
                            className="flex-1 py-5 bg-white/5 text-slate-500 font-black text-[11px] uppercase rounded-[1.5rem] border border-white/5 hover:text-white hover:bg-white/10 transition-all font-mono tracking-widest"
                          >
                            ABORT
                          </button>
                          <button 
                            onClick={() => handleFinalDelete(deletingEntry)} 
                            className="flex-[2] py-5 bg-red-600 text-white font-black text-[11px] uppercase rounded-[1.5rem] shadow-2xl shadow-red-900/40 hover:bg-red-500 transition-all italic tracking-widest border-none"
                          >
                            EXECUTE PURGE
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <ChangePasswordModal 
                    isOpen={isChangePasswordModalOpen} 
                    onClose={() => setIsChangePasswordModalOpen(false)} 
                  />
                </div>
              )
            }
          />
        </Routes>
      )}
    </>
  );
};

export default App;
