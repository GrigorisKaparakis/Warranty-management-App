
import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppState } from '@/hooks/core/useAppState';
import { useStore } from '@/store/useStore';
import { Toaster } from 'sonner';
import { APP_DEFAULTS } from '@/core/config';
import { StateManager } from '@/components/core/StateManager';
import { UserActivityMonitor } from '@/components/core/UserActivityMonitor';
import { KillSwitchOverlay } from '@/components/maintenance/KillSwitchOverlay';
import { SearchOverlay } from '@/components/navigation/SearchOverlay';
import { LoadingFallback } from '@/components/core/LoadingFallback';
import { SplashScreen } from '@/screens/SplashScreen';
import { DisabledAccountScreen } from '@/screens/DisabledAccountScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { AppLayout } from '@/components/layout/AppLayout';

// Lazy loaded views
const DashboardView = lazy(() => import('@/views/Dashboard').then(m => ({ default: m.DashboardView })));
const ListView = lazy(() => import('@/views/Inventory').then(m => ({ default: m.ListView })));
const VehicleHistoryView = lazy(() => import('@/views/VehicleHistoryView').then(m => ({ default: m.VehicleHistoryView })));
const AiAssistantView = lazy(() => import('@/views/AiChat').then(m => ({ default: m.AiAssistantView })));
const WarrantyForm = lazy(() => import('@/components/warranty/WarrantyForm').then(m => ({ default: m.WarrantyForm })));
const WarrantyDetailView = lazy(() => import('@/views/WarrantyDetail').then(m => ({ default: m.WarrantyDetailView })));
const CustomerHistoryView = lazy(() => import('@/views/CustomerHistoryView').then(m => ({ default: m.CustomerHistoryView })));
const NoteBoard = lazy(() => import('@/components/warranty/NoteBoard').then(m => ({ default: m.NoteBoard })));
const UserTable = lazy(() => import('@/components/maintenance/UserTable').then(m => ({ default: m.UserTable })));
const MaintenancePanel = lazy(() => import('@/components/maintenance/MaintenancePanel').then(m => ({ default: m.MaintenancePanel })));
const ExpiryTrackerView = lazy(() => import('@/views/ExpiryTrackerView').then(m => ({ default: m.ExpiryTrackerView })));
const AuditLogView = lazy(() => import('@/views/AuditLogView').then(m => ({ default: m.AuditLogView })));
const OnboardingView = lazy(() => import('@/views/Onboarding').then(m => ({ default: m.OnboardingView })));

/**
 * App: Το κεντρικό component (Root) της εφαρμογής.
 * Αναλαμβάνει το Authentication routing και το Layout wrapping.
 */
const App: React.FC = () => {
  const { 
    dynamicMenu, isOnboardingRequired,
    canEdit, handleFinalDelete, handleDrag, handleDrop
  } = useAppState();

  const user = useStore(s => s?.user);
  const authLoading = useStore(s => s?.authLoading);
  const isAccountDisabled = useStore(s => s?.isAccountDisabled);
  const branding = useStore(s => s?.settings?.branding);
  const companyName = branding?.appName || APP_DEFAULTS.NAME;
  const logoText = branding?.logoText || APP_DEFAULTS.LOGO;
  const splashText = branding?.appName || APP_DEFAULTS.SPLASH_TEXT;
  const chatEnabled = useStore(s => s?.settings?.chatEnabled !== false);

  useEffect(() => {
    document.title = companyName;
  }, [companyName]);

  const hasAccess = (viewId: string) => {
    if (viewId === 'entry') return canEdit;
    return dynamicMenu.some(m => m.id === viewId);
  };

  return (
    <>
      <SearchOverlay />
      <KillSwitchOverlay />
      <UserActivityMonitor />
      <StateManager />
      <Toaster position="bottom-right" expand={true} richColors />
      
      {authLoading ? (
        <SplashScreen text={splashText} />
      ) : isAccountDisabled ? (
        <DisabledAccountScreen />
      ) : isOnboardingRequired ? (
        <Suspense fallback={<LoadingFallback />}>
          <OnboardingView />
        </Suspense>
      ) : (
        <Routes>
          <Route 
            path="/login" 
            element={!user ? (
              <LoginScreen companyName={companyName} logoText={logoText} />
            ) : <Navigate to="/dashboard" replace />} 
          />

          <Route 
            path="/*" 
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <AppLayout 
                  handleDrag={handleDrag}
                  handleDrop={handleDrop}
                  handleFinalDelete={handleFinalDelete}
                  chatEnabled={chatEnabled}
                >
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={hasAccess('dashboard') ? <DashboardView /> : <Navigate to="/warranty/inventory" replace />} />
                      <Route path="/paid" element={<ListView label="ΠΛΗΡΩΜΕΝΕΣ" />} />
                      <Route path="/rejected" element={<ListView label="ΑΠΟΡΡΙΦΘΕΙΣΕΣ" />} />
                      
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
                      
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Suspense>
                </AppLayout>
              )
            }
          />
        </Routes>
      )}
    </>
  );
};

export default App;
