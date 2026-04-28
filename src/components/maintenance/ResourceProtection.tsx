import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase/core';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { Card } from '../ui/Card';
import { ShieldAlert, ShieldCheck, AlertTriangle, Info, Power, Activity } from 'lucide-react';
import { toast } from '../../utils/toast';

interface ResourceProtectionProps {
  activeTab: string;
}

export const ResourceProtection: React.FC<ResourceProtectionProps> = ({ activeTab }) => {
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (activeTab !== 'resource_protection') return;

    // Εδώ χρησιμοποιούμε απευθείας το firestoreOnSnapshot για να αποφύγουμε το monitoring global block
    // Παρόλο που το διορθώσαμε στο monitor.ts, για ασφάλεια στο admin panel χρησιμοποιούμε basic call
    const settingsRef = doc(db, "app_settings", "global");
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setKillSwitchEnabled(!!snapshot.data().killSwitchEnabled);
      }
      setLoading(false);
    }, (error) => {
      console.error("Settings listener error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const handleToggleClick = () => {
    setShowConfirm(true);
  };

  const toggleKillSwitch = async () => {
    setUpdating(true);
    setShowConfirm(false);
    try {
      const settingsRef = doc(db, "app_settings", "global");
      await setDoc(settingsRef, {
        killSwitchEnabled: !killSwitchEnabled,
        updatedAt: serverTimestamp(),
        updatedBy: 'ADMIN'
      }, { merge: true });
      
      toast.success(killSwitchEnabled ? 'Η εφαρμογή ενεργοποιήθηκε' : 'Η εφαρμογή απενεργοποιήθηκε επιτυχώς');
    } catch (error) {
      console.error("Error updating kill-switch:", error);
      toast.error('Σφάλμα: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setUpdating(false);
    }
  };

  if (activeTab !== 'resource_protection') return null;

  return (
    <div className="animate-slide-up space-y-8">
      <Card 
        title="GLOBAL KILL-SWITCH" 
        subtitle="ΕΚΤΑΚΤΗ ΑΠΕΝΕΡΓΟΠΟΙΗΣΗ ΤΩΝ FIREBASE READS"
      >
        <div className="space-y-8">
          <div className={`p-6 rounded-[2rem] border transition-all ${
            killSwitchEnabled 
              ? 'bg-red-50 border-red-200 shadow-xl shadow-red-100' 
              : 'bg-emerald-50 border-emerald-200 shadow-xl shadow-emerald-100'
          }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-3xl ${killSwitchEnabled ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {killSwitchEnabled ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                    ΚΑΤΑΣΤΑΣΗ ΕΦΑΡΜΟΓΗΣ: {killSwitchEnabled ? 'OFFLINE' : 'ONLINE'}
                  </h3>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {killSwitchEnabled 
                      ? 'Η ΕΦΑΡΜΟΓΗ ΕΙΝΑΙ ΚΛΕΙΔΩΜΕΝΗ ΓΙΑ ΟΛΟΥΣ ΤΟΥΣ ΧΡΗΣΤΕΣ' 
                      : 'ΟΛΕΣ ΟΙ ΛΕΙΤΟΥΡΓΙΕΣ ΕΙΝΑΙ ΕΝΕΡΓΕΣ ΚΑΙ ΠΡΟΣΒΑΣΙΜΕΣ'}
                  </p>
                </div>
              </div>

              {!showConfirm ? (
                <button
                  onClick={handleToggleClick}
                  disabled={loading || updating}
                  className={`px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 ${
                    killSwitchEnabled
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                      : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'
                  }`}
                >
                  {updating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Power size={20} />
                  )}
                  <span>{killSwitchEnabled ? 'ACTIVATE SYSTEM' : 'KILL SYSTEM NOW'}</span>
                </button>
              ) : (
                <div className="flex flex-col items-end gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ΕΠΙΒΕΒΑΙΩΣΗ ΕΝΕΡΓΕΙΑΣ;</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-6 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold uppercase text-xs hover:bg-slate-300 transition-colors"
                    >
                      ΑΚΥΡΟ
                    </button>
                    <button
                      onClick={toggleKillSwitch}
                      className={`px-6 py-3 rounded-xl font-bold uppercase text-xs text-white transition-all shadow-lg ${
                        killSwitchEnabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      ΝΑΙ, ΣΥΝΕΧΕΙΑ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Activity size={18} />
                <h4 className="text-xs font-black uppercase tracking-widest">ΤΙ ΚΑΝΕΙ ΑΥΤΟ;</h4>
              </div>
              <ul className="space-y-3">
                {[
                  'Σταματάει όλες τις συνδρομές (onSnapshot)',
                  'Μπλοκάρει όλα τα queries (getDocs)',
                  'Εμφανίζει μήνυμα σφάλματος στους χρήστες',
                  'Προστατεύει από Denial of Wallet επιθέσεις'
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-slate-500 uppercase leading-tight italic">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100 italic">
              <div className="flex items-center gap-3 mb-4 text-amber-600">
                <AlertTriangle size={18} />
                <h4 className="text-xs font-black uppercase tracking-widest">ΠΡΟΣΟΧΗ</h4>
              </div>
              <p className="text-[11px] font-bold text-amber-700 uppercase leading-relaxed">
                ΧΡΗΣΙΜΟΠΟΙΕΙΣΤΕ ΑΥΤΗ ΤΗ ΛΕΙΤΟΥΡΓΙΑ ΜΟΝΟ ΣΕ ΠΕΡΙΠΤΩΣΗ ΕΚΤΑΚΤΗΣ ΑΝΑΓΚΗΣ (Π.Χ. ΥΠΕΡΒΟΛΙΚΗ ΧΡΕΩΣΗ Ή BUG ΠΟΥ ΠΡΟΚΑΛΕΙ INFINITE READ LOOP).
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="ΠΛΗΡΟΦΟΡΙΕΣ ΚΑΤΑΝΑΛΩΣΗΣ" subtitle="ΣΤΑΤΙΣΤΙΚΑ ΧΡΗΣΗΣ ΠΟΡΩΝ (ΥΠΟ ΚΑΤΑΣΚΕΥΗ)">
        <div className="p-12 text-center">
          <div className="p-5 bg-zinc-50 rounded-full w-fit mx-auto mb-6">
            <Info size={32} className="text-zinc-300" />
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-loose">
            Η ΔΥΝΑΤΟΤΗΤΑ ΠΡΟΒΟΛΗΣ LIVE ΣΤΑΤΙΣΤΙΚΩΝ ΚΑΤΑΝΑΛΩΣΗΣ (USAGE LOGS) 
            <br />
            ΘΑ ΕΝΕΡΓΟΠΟΙΗΘΕΙ ΣΕ ΕΠΟΜΕΝΗ ΕΚΔΟΣΗ ΤΗΣ ΕΦΑΡΜΟΓΗΣ V1.3.1.
          </p>
        </div>
      </Card>
    </div>
  );
};
