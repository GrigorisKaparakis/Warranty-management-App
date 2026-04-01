
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, Building2, LayoutGrid, Users, Rocket, Sparkles } from 'lucide-react';
import { GarageSettings, StatusConfig } from '../core/types';
import { FirestoreService } from '../services/firebase/db';
import { DEFAULT_MENU, DEFAULT_STATUS_CONFIGS, APP_DEFAULTS, DEFAULT_PERMISSIONS, EntryStatus, ONBOARDING_DEFAULTS } from '../core/config';

import { useAppState } from '../hooks/useAppState';
import { useStore } from '../store/useStore';

/**
 * OnboardingView: Η σελίδα αρχικής ρύθμισης για νέους Admin,
 * επιτρέποντας τη διαμόρφωση των βασικών παραμέτρων του συστήματος.
 */
export const OnboardingView: React.FC = () => {
  // Raw state from useStore
  const settings = useStore(s => s.settings);

  const navigate = useNavigate();
  const onComplete = () => navigate('/dashboard');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Identity
  const [companyName, setCompanyName] = useState(settings.branding?.appName || '');
  const [logoText, setLogoText] = useState(settings.branding?.logoText || '');

  // Step 2: Workflow
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(ONBOARDING_DEFAULTS.INITIAL_STATUSES);
  
  const defaultStatuses = DEFAULT_STATUS_CONFIGS;

  const handleFinish = async () => {
    setLoading(true);
    try {
      const finalStatusConfigs: Record<string, StatusConfig> = {};
      selectedStatuses.forEach(s => {
        finalStatusConfigs[s] = defaultStatuses[s];
      });
      // Always include REJECTED for logic
      if (!finalStatusConfigs[EntryStatus.REJECTED]) finalStatusConfigs[EntryStatus.REJECTED] = defaultStatuses[EntryStatus.REJECTED];

      const updatedSettings = { ...settings };
      
      const finalAppName = companyName || updatedSettings.branding?.appName || APP_DEFAULTS.NAME;
      const finalLogoText = logoText || updatedSettings.branding?.logoText || finalAppName.substring(0, 2).toUpperCase() || APP_DEFAULTS.LOGO;

      updatedSettings.branding = {
        appName: finalAppName,
        logoText: finalLogoText
      };
      
      // Update status configs if they are empty or default
      updatedSettings.statusConfigs = finalStatusConfigs;

      if (!updatedSettings.dashboardConfig?.featuredStatuses) {
        updatedSettings.dashboardConfig = { 
          ...updatedSettings.dashboardConfig,
          featuredStatuses: selectedStatuses.slice(0, 2) 
        };
      }

      await FirestoreService.updateSettings(updatedSettings);
      onComplete();
    } catch (error) {
      console.error("Onboarding failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="glass-dark rounded-[4rem] p-16 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 space-y-12 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-blue-600/10 rounded-[1.5rem] flex items-center justify-center border border-blue-500/20 shadow-xl">
                  <Building2 className="text-blue-400" size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">IDENTITY SETUP</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">STEP 01 <span className="text-slate-700 mx-2">/</span> 02</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ονομασια Συνεργειου</label>
                  <input 
                    type="text"
                    placeholder="π.χ. MOTO SERVICE A.E."
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-lg outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Συντομογραφια Logo (2-4 χαρακτηρες)</label>
                  <input 
                    type="text"
                    placeholder="π.χ. MS"
                    maxLength={4}
                    value={logoText}
                    onChange={e => setLogoText(e.target.value)}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-lg outline-none focus:ring-4 focus:ring-blue-500/5 transition-all uppercase"
                  />
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!companyName}
                className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50"
              >
                Συνεχεια <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="glass-dark rounded-[4rem] p-16 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 space-y-12 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-emerald-600/10 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20 shadow-xl">
                  <LayoutGrid className="text-emerald-400" size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">WORKFLOW ENGINE</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">STEP 02 <span className="text-slate-700 mx-2">/</span> 02</p>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-500 leading-relaxed">
                Επιλέξτε τις καταστάσεις που θέλετε να παρακολουθείτε για κάθε εγγύηση. Μπορείτε να τις αλλάξετε αργότερα.
              </p>

              <div className="grid grid-cols-1 gap-3">
                {Object.entries(defaultStatuses).map(([key, config]: [string, any]) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === EntryStatus.REJECTED) return; // Mandatory
                      setSelectedStatuses(prev => 
                        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                      );
                    }}
                    className={`p-8 rounded-[2rem] border-2 transition-all flex items-center justify-between group shadow-xl ${
                      selectedStatuses.includes(key) || key === EntryStatus.REJECTED
                        ? 'border-blue-600 bg-blue-600/5' 
                        : 'border-white/5 bg-slate-900/40 opacity-40 hover:opacity-100 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-6 h-6 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]" style={{ backgroundColor: config.color }}></div>
                      <span className={`font-black uppercase tracking-[0.2em] text-[13px] transition-colors ${
                         selectedStatuses.includes(key) || key === EntryStatus.REJECTED ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'
                      }`}>{config.label}</span>
                    </div>
                    {(selectedStatuses.includes(key) || key === EntryStatus.REJECTED) && <Check size={24} className="text-blue-400 drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-6">
                <button 
                  onClick={() => setStep(1)}
                  className="px-10 py-6 bg-white/5 text-slate-500 rounded-[2rem] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
                >
                  BACK
                </button>
                <button 
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1 py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/40 border-none"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>REALIZE SYSTEM <Rocket size={24} /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-blue-400/60">
            <Sparkles size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Powered by Warranty H&K Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
