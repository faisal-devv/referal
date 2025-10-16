import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Settings,
  Menu,
  X,
  TrendingUp,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import admin components
import AdminLeadsManagement from '../components/Admin/AdminLeadsManagement';
import AdminUsersManagement from '../components/Admin/AdminUsersManagement';
import AdminEarningsManagement from '../components/Admin/EarningsManagement';
import AdminSettings from '../components/Admin/AdminSettings';
import AdminSummary from '../components/Admin/AdminSummary';
import AdminQueriesManagement from '../components/Admin/AdminQueriesManagement';

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('summary');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalUsers: 0,
    totalIncentives: 0,
    pendingLeads: 0,
    activeUsers: 0
  });

  const menuItems = [
    { id: 'summary', label: 'Summary', icon: BarChart3, color: 'text-blue-600' },
    { id: 'leads', label: 'Leads Management', icon: FileText, color: 'text-green-600' },
    { id: 'users', label: 'Users Management', icon: Users, color: 'text-purple-600' },
    { id: 'earnings', label: 'Earnings Management', icon: DollarSign, color: 'text-yellow-600' },
    { id: 'queries', label: 'Queries', icon: FileText, color: 'text-indigo-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' }
  ];

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use mock data since we don't have backend endpoints
      // In production, these would be API calls
      const mockStats = {
        totalLeads: 24,
        totalUsers: 8,
        totalIncentives: 12500.50,
        pendingLeads: 7,
        activeUsers: 6
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'summary':
        return <AdminSummary stats={stats} />;
      case 'leads':
        return <AdminLeadsManagement />;
      case 'users':
        return <AdminUsersManagement />;
      case 'earnings':
        return <AdminEarningsManagement />;
      case 'queries':
        return <AdminQueriesManagement />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminSummary stats={stats} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 bg-blue-700 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation menu */}
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 transition duration-200 ${
                  activeSection === item.id
                    ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-700'
                    : 'text-gray-700'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${
                  activeSection === item.id ? 'text-blue-600' : item.color
                }`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Referus.co Admin v1.0
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {menuItems.find(item => item.id === activeSection)?.label || 'Admin Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your referral platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick stats */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{stats.totalLeads}</div>
                  <div className="text-xs text-gray-500">Total Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{stats.totalUsers}</div>
                  <div className="text-xs text-gray-500">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">${stats.totalIncentives.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Incentives</div>
                </div>
              </div>
              
              {/* Admin badge */}
              <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                <UserCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;