import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ children, variant = 'primary', size = 'medium', loading = false, disabled = false, className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-lg shadow-emerald-500/20',
    secondary: 'bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500 border border-slate-600',
    outline:   'border border-slate-600 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 focus:ring-emerald-500',
    danger:    'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 focus:ring-red-500',
    success:   'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500',
    ghost:     'text-slate-400 hover:text-white hover:bg-slate-800 focus:ring-slate-500',
  };
  const sizes = { small: 'px-3 py-1.5 text-xs', medium: 'px-4 py-2 text-sm', large: 'px-6 py-3 text-base' };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
