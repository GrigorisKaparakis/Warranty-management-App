import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'danger';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Badge: Ένα μικρό component ετικέτας για την εμφάνιση καταστάσεων ή κατηγοριών.
 */
export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral',
  className = '',
  style
}) => {
  const variants = {
    neutral: 'bg-white/5 text-slate-400 border border-white/5',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/10',
    error: 'bg-red-500/10 text-red-400 border border-red-500/10',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/10',
    primary: 'bg-blue-600 text-white shadow-lg shadow-blue-900/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/10',
  };

  return (
    <span 
      className={`inline-flex items-center px-4 py-1 rounded-[10px] text-[9px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
};
