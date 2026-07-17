import React, { useState, useEffect } from 'react';
import { ArrowRight, ExternalLink, Copy, Check, Shield, Zap, Globe } from 'lucide-react';

export const MigrationScreen: React.FC = () => {
  const newUrl = 'https://warranties-hub.vercel.app';
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(12);
  const [autoRedirectActive, setAutoRedirectActive] = useState(true);

  useEffect(() => {
    if (!autoRedirectActive) return;
    
    if (countdown <= 0) {
      window.location.href = newUrl;
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, autoRedirectActive]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(newUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Upper Brand / Logo */}
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            W
          </div>
          <div>
            <span className="font-mono text-xs font-semibold tracking-wider text-indigo-600 uppercase">
              H&amp;K Warranty Management
            </span>
            <h1 className="text-sm font-bold text-slate-800 leading-none">
              Portal Migration
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Μεταφορά σε εξέλιξη
        </span>
      </div>

      {/* Main Container Card */}
      <div className="max-w-xl mx-auto w-full my-auto py-12">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
          {/* Accent light decoration */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
          
          <div className="flex flex-col items-center text-center">
            {/* Elegant visual icon badge */}
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100 animate-float">
              <Globe className="w-8 h-8" />
            </div>

            <span className="font-mono text-xs font-bold text-indigo-600 tracking-widest uppercase mb-2">
              ΝΕΑ ΔΙΕΥΘΥΝΣΗ ΣΥΣΤΗΜΑΤΟΣ
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
              Μεταφερθήκαμε!
            </h2>
            
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 max-w-md">
              Η πλατφόρμα διαχείρισης εγγυήσεων <strong>WarrantyH&amp;K</strong> έχει μεταφερθεί σε νέα, ταχύτερη και πιο αξιόπιστη υποδομή. Παρακαλούμε ενημερώστε τους σελιδοδείκτες (bookmarks) σας.
            </p>

            {/* Link Box Display */}
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3 group hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-indigo-100/50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-mono text-sm font-semibold text-slate-800 truncate select-all">
                  {newUrl}
                </span>
              </div>
              
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-white text-slate-500 hover:text-slate-800 transition-all border border-transparent hover:border-slate-100 flex-shrink-0"
                title="Αντιγραφή συνδέσμου"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Main CTA Button */}
            <a
              href={newUrl}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-6 rounded-2xl inline-flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <span className="font-semibold">Μετάβαση στη νέα πλατφόρμα</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            {/* Countdown / Auto Redirect Section */}
            {autoRedirectActive ? (
              <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                  Ανακατεύθυνση στη νέα σελίδα σε{' '}
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {countdown}s
                  </span>
                </p>
                <button
                  onClick={() => setAutoRedirectActive(false)}
                  className="mt-2 text-[11px] font-medium text-slate-500 hover:text-indigo-600 underline underline-offset-4 transition-colors"
                >
                  Ακύρωση αυτόματης ανακατεύθυνσης
                </button>
              </div>
            ) : (
              <p className="mt-8 text-xs text-slate-400">
                Η αυτόματη ανακατεύθυνση απενεργοποιήθηκε. Πατήστε το παραπάνω κουμπί για είσοδο.
              </p>
            )}
          </div>
        </div>

        {/* Benefits or Info features below the card */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-white/60 backdrop-blur border border-slate-100 rounded-2xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-800">Ασφαλής Μετάβαση</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Όλα τα δεδομένα σας έχουν μεταφερθεί με ασφάλεια.</p>
            </div>
          </div>
          <div className="p-4 bg-white/60 backdrop-blur border border-slate-100 rounded-2xl flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-800">Αυξημένη Ταχύτητα</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Νέες λειτουργίες και βελτιωμένη ταχύτητα απόκρισης.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-5xl mx-auto w-full text-center border-t border-slate-200/50 pt-6">
        <p className="text-xs text-slate-400 font-mono">
          &copy; {new Date().getFullYear()} H&amp;K Warranty System. All rights reserved.
        </p>
      </div>
    </div>
  );
};
