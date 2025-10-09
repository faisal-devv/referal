import React from 'react';
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';

const AdminSummary = ({ stats }) => {
  const summaryCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Incentives',
      value: `$${stats.totalIncentives.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Pending Leads',
      value: stats.pendingLeads,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      change: '-5%',
      changeType: 'negative'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'lead',
      message: 'New lead submitted by John Doe',
      time: '2 minutes ago',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'user',
      message: 'New user registration: Jane Smith',
      time: '15 minutes ago',
      icon: Users,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'earnings',
      message: 'Earnings updated for Mike Johnson',
      time: '1 hour ago',
      icon: DollarSign,
      color: 'text-yellow-600'
    },
    {
      id: 4,
      type: 'lead',
      message: 'Lead status updated to "Deal Closed"',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  const leadStatusDistribution = [
    { status: 'Pending', count: 7, color: 'bg-yellow-500' },
    { status: 'Contact Initiated', count: 5, color: 'bg-blue-500' },
    { status: 'Discussion in Progress', count: 4, color: 'bg-purple-500' },
    { status: 'Proposal Sent', count: 3, color: 'bg-indigo-500' },
    { status: 'Deal Closed', count: 3, color: 'bg-green-500' },
    { status: 'Client Refused', count: 2, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h2>
            <p className="text-blue-100">
              Monitor and manage your referral platform with comprehensive insights and controls.
            </p>
          </div>
          <div className="hidden md:block">
            <BarChart3 className="h-16 w-16 text-blue-300" />
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs font-medium ${
                      card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lead Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lead Status Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {leadStatusDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 ${item.color} rounded-full`}
                        style={{ width: `${(item.count / Math.max(...leadStatusDistribution.map(i => i.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
              <FileText className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">Review New Leads</span>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
              <DollarSign className="h-5 w-5 text-yellow-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">Update Earnings</span>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
              <Users className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;
