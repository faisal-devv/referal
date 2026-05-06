import React from 'react';
import {
  FileText,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Activity
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, subtitle }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={`h-6 w-6 ${iconColor}`} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const AdminSummary = ({ stats }) => {
  const cards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: FileText,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      subtitle: `${stats.pendingLeads} pending review`,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      subtitle: `${stats.activeUsers} active`,
    },
    {
      title: 'Total Incentives',
      value: `$${Number(stats.totalIncentives).toLocaleString()}`,
      icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      subtitle: 'Across all currencies',
    },
    {
      title: 'Pending Leads',
      value: stats.pendingLeads,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      subtitle: 'Awaiting action',
    },
  ];

  const statusDistribution = [
    { status: 'Pending',            color: 'bg-amber-400',   pct: stats.totalLeads ? Math.round((stats.pendingLeads / stats.totalLeads) * 100) : 0 },
    { status: 'Contacted',          color: 'bg-blue-400',    pct: 20 },
    { status: 'Proposal Submitted', color: 'bg-violet-400',  pct: 15 },
    { status: 'Deal Closed',        color: 'bg-emerald-500', pct: 12 },
    { status: 'Client Refused',     color: 'bg-red-400',     pct: 8  },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Welcome back to Admin Dashboard</h2>
            <p className="text-blue-100 text-sm">
              Monitor and manage your referral platform with comprehensive insights.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-6 text-center">
            <div className="bg-white bg-opacity-10 rounded-xl px-5 py-3">
              <p className="text-2xl font-bold">{stats.totalLeads}</p>
              <p className="text-xs text-blue-200 mt-0.5">Total Leads</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl px-5 py-3">
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs text-blue-200 mt-0.5">Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead status distribution */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Lead Status Distribution</h3>
            <Activity className="h-4 w-4 text-gray-400" />
          </div>
          <div className="p-6 space-y-4">
            {statusDistribution.map(({ status, color, pct }, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
                    <span className="text-sm text-gray-700">{status}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Quick Actions</h3>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="p-6 grid grid-cols-1 gap-3">
            {[
              { icon: FileText,   label: 'Review Pending Leads',   sub: `${stats.pendingLeads} leads need attention`, color: 'text-blue-600',   bg: 'bg-blue-50'   },
              { icon: DollarSign, label: 'Manage Earnings',         sub: 'Update wallet balances',                    color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Users,      label: 'Manage Users',            sub: `${stats.totalUsers} registered users`,      color: 'text-violet-600',  bg: 'bg-violet-50'  },
              { icon: AlertCircle,label: 'View Queries',            sub: 'Check contact form submissions',            color: 'text-amber-600',   bg: 'bg-amber-50'   },
            ].map(({ icon: Icon, label, sub, color, bg }, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-default">
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4.5 w-4.5 ${color} h-5 w-5`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;
