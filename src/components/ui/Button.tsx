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
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-zinc-800 focus:ring-black',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus:ring-zinc-500',
    outline: 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-500',
    ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:ring-zinc-500',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500',
    neutral: 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 focus:ring-zinc-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    icon: 'w-10 h-10 p-0 flex items-center justify-center',
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
