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
    neutral: 'bg-zinc-100 text-zinc-600',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    primary: 'bg-zinc-900 text-white',
    danger: 'bg-rose-50 text-rose-700',
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
};
