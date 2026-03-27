
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[3rem] p-12 shadow-2xl space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Building2 className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Ταυτοτητα Επιχειρησης</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Βημα 1 απο 2</p>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[3rem] p-12 shadow-2xl space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <LayoutGrid className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Ροη Εργασιας</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Βημα 2 απο 2</p>
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
                    className={`p-6 rounded-[1.5rem] border-2 transition-all flex items-center justify-between ${
                      selectedStatuses.includes(key) || key === EntryStatus.REJECTED
                        ? 'border-slate-900 bg-slate-50' 
                        : 'border-slate-100 bg-white opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.color }}></div>
                      <span className="font-black text-slate-900 uppercase tracking-tight">{config.label}</span>
                    </div>
                    {(selectedStatuses.includes(key) || key === EntryStatus.REJECTED) && <Check size={20} className="text-slate-900" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-8 py-6 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Πισω
                </button>
                <button 
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1 py-6 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  {loading ? 'ΔΗΜΙΟΥΡΓΙΑ...' : (
                    <>Εκκινηση Εφαρμογης <Rocket size={20} /></>
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
