
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppState } from './src/hooks/useAppState';
import { useStore } from './src/store/useStore';
import { AuthService } from './src/services/firebase/auth';
import { Entry, ViewType } from './src/core/types';
import { DashboardView } from './src/views/Dashboard';
import { ListView } from './src/views/Inventory';
import { VehicleHistoryView } from './src/views/VehicleHistoryView';
import { AiAssistantView } from './src/views/AiChat';
import { Sidebar } from './src/components/layout/Sidebar';
import { WarrantyForm } from './src/components/warranty/WarrantyForm';
import { WarrantyDetailView } from './src/views/WarrantyDetailView';
import { CustomerHistoryView } from './src/views/CustomerHistoryView';
import { NoteBoard } from './src/components/warranty/NoteBoard';
import { UserTable } from './src/components/ui/UserTable';
import { MaintenancePanel } from './src/components/maintenance/MaintenancePanel';
import { NoticeTicker } from './src/components/layout/NoticeTicker';
import { ExpiryTrackerView } from './src/views/ExpiryTrackerView';
import { AuditLogView } from './src/views/AuditLogView';
import { OnboardingView } from './src/views/Onboarding';
import { Upload, FileText } from 'lucide-react';
import { Toaster } from 'sonner';
import { ChangePasswordModal } from './src/components/ui/ChangePasswordModal';
import { APP_DEFAULTS } from './src/core/config';
import { StateManager } from './src/components/core/StateManager';
import { ErrorBoundary } from './src/components/core/ErrorBoundary';

import { formatError } from './src/utils/errorUtils';
import { toast } from './src/utils/toast';

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
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white font-black animate-pulse uppercase tracking-[0.3em]">
          {settings.branding?.appName || APP_DEFAULTS.SPLASH_TEXT}
        </div>
      ) : isAccountDisabled ? (
        /* Disabled Account Screen */
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-10 text-center">
          <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">ΛΟΓΑΡΙΑΣΜΟΣ ΑΠΕΝΕΡΓΟΠΟΙΗΜΕΝΟΣ</h1>
          <p className="text-slate-400 font-bold text-lg max-w-md mb-10 uppercase tracking-widest">Η ΠΡΟΣΒΑΣΗ ΣΑΣ ΕΧΕΙ ΑΠΕΝΕΡΓΟΠΟΙΗΘΕΙ ΑΠΟ ΤΟΝ ΔΙΑΧΕΙΡΙΣΤΗ. ΕΠΙΚΟΙΝΩΝΗΣΤΕ ΜΕ ΤΗΝ ΥΠΟΣΤΗΡΙΞΗ.</p>
          <button 
            onClick={() => AuthService.logout()} 
            className="px-10 py-4 bg-white text-slate-900 font-black rounded-2xl uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            ΑΠΟΣΥΝΔΕΣΗ
          </button>
        </div>
      ) : isOnboardingRequired ? (
        /* Onboarding Mode για νέους Admin */
        <OnboardingView />
      ) : (
        <Routes>
          {/* Public/Login Route */}
          <Route 
            path="/login" 
            element={!user ? (
              <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -ml-64 -mb-64 animate-pulse"></div>

                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-200 relative z-10">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-xl">
                     <span className="text-white font-black italic text-2xl">{logoText}</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tighter text-center mb-10 italic uppercase">{companyName}</h1>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-[0.15em] hover:bg-slate-700 transition-all shadow-lg active:scale-95">{isLoading ? 'ΣΥΝΔΕΣΗ...' : 'ΕΙΣΟΔΟΣ'}</button>
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
                  className="min-h-screen bg-[#F8FAFC] flex font-sans relative"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {/* Drag & Drop Overlay */}
                  {dragActive && (
                    <div className="fixed inset-0 z-[500] bg-blue-600/90 backdrop-blur-sm flex flex-col items-center justify-center p-10 animate-in fade-in duration-200">
                      <div className="w-full max-w-xl border-4 border-dashed border-white/40 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
                          <Upload className="text-blue-600" size={48} />
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-4xl font-black text-white uppercase tracking-tight">DROP PDF TO SCAN</h2>
                          <p className="text-blue-100 font-bold text-lg uppercase tracking-widest">ΑΦΗΣΤΕ ΤΟ ΑΡΧΕΙΟ ΕΔΩ ΓΙΑ ΑΥΤΟΜΑΤΗ ΑΝΑΛΥΣΗ ΑΠΟ ΤΟ AI</p>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-2xl border border-white/20">
                          <FileText className="text-white" size={20} />
                          <span className="text-white font-black text-xs uppercase tracking-widest">ΥΠΟΣΤΗΡΙΖΕΤΑΙ PDF & ΕΙΚΟΝΕΣ</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Global Loading Overlay */}
                  {isLoading && (
                    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md">
                      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                      <p className="text-white font-black text-xs uppercase tracking-[0.3em]">ΕΠΕΞΕΡΓΑΣΙΑ...</p>
                    </div>
                  )}

                  <Sidebar />
                  
                  <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <NoticeTicker />
                    
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                      <ErrorBoundary>
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
                      </ErrorBoundary>
                    </div>
                  </main>

                  {/* Delete Confirmation Modal */}
                  {deletingEntry && (
                    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                      <div className="bg-white rounded-[2.5rem] p-8 max-sm w-full shadow-2xl border border-slate-100 scale-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">ΕΠΙΒΕΒΑΙΩΣΗ ΔΙΑΓΡΑΦΗΣ</h3>
                        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed italic">ΘΕΛΕΤΕ ΝΑ ΔΙΑΓΡΑΨΕΤΕ ΟΡΙΣΤΙΚΑ ΤΗΝ ΕΓΓΥΗΣΗ <strong>{deletingEntry.warrantyId}</strong>;</p>
                        <div className="flex gap-4">
                          <button onClick={() => setDeletingEntry(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-[11px] uppercase rounded-xl hover:bg-slate-200">ΑΚΥΡΩΣΗ</button>
                          <button 
                            onClick={() => handleFinalDelete(deletingEntry)} 
                            className="flex-1 py-3 bg-red-600 text-white font-bold text-[11px] uppercase rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
                          >
                            ΔΙΑΓΡΑΦΗ
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
