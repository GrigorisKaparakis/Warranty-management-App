import React from 'react';

interface SplashScreenProps {
  text: string;
}

/**
 * SplashScreen: Εμφανίζεται κατά το αρχικό φόρτωμα του Authentication.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ text }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white font-black animate-pulse uppercase tracking-[0.3em]">
    {text}
  </div>
);
