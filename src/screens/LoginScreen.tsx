import React, { useState } from 'react';
import { AuthService } from '../services/firebase/auth';
import { toast } from '../utils/toast';
import { formatError } from '../utils/errorUtils';

interface LoginScreenProps {
  companyName: string;
  logoText: string;
}

/**
 * LoginScreen: Η σελίδα σύνδεσης του χρήστη.
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({ companyName, logoText }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await AuthService.login(email, password);
    } catch (err: any) {
      toast.error(formatError(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -ml-64 -mb-64 animate-pulse"></div>

      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-200 relative z-10">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-xl">
           <span className="text-white font-black italic text-2xl">{logoText}</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter text-center mb-10 italic uppercase">{companyName}</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <button className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-[0.15em] hover:bg-slate-700 transition-all shadow-lg active:scale-95">
            {isLoggingIn ? 'ΣΥΝΔΕΣΗ...' : 'ΕΙΣΟΔΟΣ'}
          </button>
        </form>
      </div>
    </div>
  );
};
