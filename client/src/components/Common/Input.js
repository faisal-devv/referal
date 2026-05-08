import React from 'react';
import { AlertCircle } from 'lucide-react';

const Input = ({ label, error, icon: Icon, className = '', ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-slate-500" />
        </div>
      )}
      <input
        className={`block w-full ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
          error ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
        }`}
        {...props}
      />
    </div>
    {error && (
      <div className="flex items-center gap-1.5 text-xs text-red-400">
        <AlertCircle className="h-3.5 w-3.5" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

export default Input;
