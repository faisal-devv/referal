import React from 'react';

const StatsCard = ({ title, value, icon: Icon, iconColor = 'text-emerald-400', iconBg = 'bg-emerald-500/10', trend, trendValue, className = '' }) => (
  <div className={`rounded-xl border border-slate-700/50 p-5 ${className}`} style={{ background: '#161b22' }}>
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}>
        <Icon className={`h-4.5 w-4.5 ${iconColor}`} size={18} />
      </div>
    </div>
    <div className="flex items-end gap-2">
      <p className="text-2xl font-bold text-white">{value}</p>
      {trend && trendValue && (
        <span className={`text-xs font-medium mb-0.5 ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend === 'up' ? '+' : '-'}{trendValue}%
        </span>
      )}
    </div>
  </div>
);

export default StatsCard;
