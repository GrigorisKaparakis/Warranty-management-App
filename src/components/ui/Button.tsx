import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
  loading?: boolean;
}

/**
 * Button: Ένα επαναχρησιμοποιήσιμο component κουμπιού με υποστήριξη για
 * διαφορετικά variants, μεγέθη και loading states.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-black uppercase tracking-[0.1em] transition-all duration-300 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-95';
  
  const variants = {
    primary: 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500 hover:shadow-blue-500/20',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/5',
    outline: 'border border-white/10 text-white hover:bg-white/5',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
    danger: 'bg-red-600 text-white shadow-xl shadow-red-900/40 hover:bg-red-500 hover:shadow-red-500/20',
    neutral: 'bg-slate-800/80 text-white border border-white/10 hover:bg-blue-600 transition-colors shadow-2xl shadow-black/20',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px] gap-2',
    md: 'px-6 py-3.5 text-[11px] gap-2.5',
    lg: 'px-8 py-4 text-[12px] gap-3',
    icon: 'w-12 h-12 p-0 flex items-center justify-center',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props as any}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon && (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />
      )}
      {children}
    </motion.button>
  );
};
