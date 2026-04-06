
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole, ViewType, MenuItem, GarageSettings } from '../../core/types';
import { AuthService } from '../../services/firebase/auth';
import { APP_DEFAULTS } from '../../core/config';
import { APP_VERSION } from '../../version';

import { useAppState } from '../../hooks/useAppState';
import { useStore } from '../../store/useStore';

/**
 * Sidebar: Το πλευρικό μενού της εφαρμογής.
 * Υποστηρίζει "Mobile-First" σχεδίαση με drawer και overlay.
 */
export const Sidebar: React.FC = () => {
  const { 
    currentRole, 
    dynamicMenu,
    profile
  } = useAppState();

  const userName = profile?.email ? profile.email.split('@')[0].toUpperCase() : '';

  const isLive = useStore(s => s?.isLive);
  const settings = useStore(s => s?.settings);
  const setListFilters = useStore(s => s?.setListFilters);
  const setSelectedVin = useStore(s => s?.setSelectedVin);
  const setEditingEntry = useStore(s => s?.setEditingEntry);
  const setIsChangePasswordModalOpen = useStore(s => s?.setIsChangePasswordModalOpen);

  const [isOpen, setIsOpen] = useState(false); // State για το mobile μενού

  const companyName = settings.branding?.appName || APP_DEFAULTS.NAME;
  const logoText = settings.branding?.logoText || APP_DEFAULTS.LOGO;

  /**
   * Διαχείριση κλικ σε στοιχείο του μενού για καθαρισμό states.
   */
  const handleNavClick = (id: ViewType) => {
    if (id === 'entry') setEditingEntry(null); 
    setListFilters({ status: 'ALL', company: 'ALL' }); 
    setSelectedVin(null);
    setIsOpen(false); 
  };

  /**
   * Μετατροπή του ViewType σε URL path.
   */
  const getPath = (id: string) => {
    switch (id) {
      case 'dashboard': return '/dashboard';
      case 'entry': return '/warranty/new';
      case 'vinSearch': return '/vin-search';
      case 'aiAssistant': return '/ai-assistant';
      case 'notes': return '/notes';
      case 'users': return '/users';
      case 'maintenance': return '/maintenance';
      case 'expiryTracker': return '/expiry-tracker';
      case 'warrantyPayments': return '/warranty-payments';
      case 'all': return '/warranty/inventory';
      case 'paid': return '/paid';
      case 'rejected': return '/rejected';
      case 'auditLog': return '/auditLog';
      default: return `/warranty/view/${id}`;
    }
  };

  return (
    <>
      {/* Mobile Toggle Button: Εμφανίζεται μόνο σε μικρές οθόνες */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[250] w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          )}
        </svg>
      </button>

      {/* Overlay: Σκουραίνει την οθόνη όταν το μενού είναι ανοιχτό στο κινητό */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[190] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Κύριο Σώμα Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-[200]
        w-[280px] bg-[#0F172A] flex-shrink-0 flex flex-col h-screen 
        border-r border-slate-800 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & User Info */}
        <div className="p-8 border-b border-slate-800/50 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white italic text-lg shadow-lg">{logoText}</div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-tighter leading-none">{companyName}</h1>
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                  {userName ? `${userName} (${currentRole})` : currentRole}
                </span>
                {isLive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
              </div>
              <span className="text-[8px] font-medium text-slate-600 uppercase tracking-widest block mt-0.5">v{APP_VERSION}</span>
            </div>
          </div>
        </div>
        
        {/* Navigation Items: Παράγονται δυναμικά */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide">
          {dynamicMenu.map(item => (
            <NavLink 
              key={item.id} 
              to={getPath(item.id)}
              onClick={() => handleNavClick(item.id as ViewType)} 
              className={({ isActive }) => `
                w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all
                ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-6 border-t border-slate-800/50 bg-slate-900/50 space-y-2">
          <button onClick={() => setIsChangePasswordModalOpen(true)} className="w-full py-2.5 bg-slate-800 text-slate-400 font-bold text-[10px] uppercase rounded-lg hover:text-blue-400 tracking-widest transition-all">ΑΛΛΑΓΗ ΚΩΔΙΚΟΥ</button>
          <button onClick={() => AuthService.logout()} className="w-full py-2.5 bg-slate-800 text-slate-400 font-bold text-[10px] uppercase rounded-lg hover:text-red-400 tracking-widest transition-all">ΑΠΟΣΥΝΔΕΣΗ</button>
        </div>
      </aside>
    </>
  );
};
