import React from 'react';
import { Sidebar } from './Sidebar';
import { NoticeTicker } from './NoticeTicker';
import { ChatBox } from '../ChatBox';
import { ChangePasswordModal } from '../ui/ChangePasswordModal';
import { LoadingOverlay, DragDropOverlay, DeleteConfirmationModal } from '../core/AppOverlays';
import { ErrorBoundary } from '../core/ErrorBoundary';
import { useStore } from '../../store/useStore';
import { toast } from '../../utils/toast';

interface AppLayoutProps {
  children: React.ReactNode;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFinalDelete: (entry: { id: string; warrantyId: string } | null) => Promise<void>;
  chatEnabled: boolean;
}

/**
 * AppLayout: Το κεντρικό κέλυφος της εφαρμογής μετά το Login.
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  handleDrag, 
  handleDrop, 
  handleFinalDelete,
  chatEnabled 
}) => {
  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] flex font-sans relative"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={(e) => {
        if (useStore.getState().editingEntry) {
          toast.error("Δεν είναι δυνατή η σάρωση όσο επεξεργάζεστε μια εγγύηση.");
          return;
        }
        handleDrop(e);
      }}
    >
      <DragDropOverlay />
      <LoadingOverlay />

      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <NoticeTicker />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>

      <DeleteConfirmationModal onConfirm={handleFinalDelete} />
      <ChangePasswordModal />
      {chatEnabled && <ChatBox />}
    </div>
  );
};
