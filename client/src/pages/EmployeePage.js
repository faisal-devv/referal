import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  MessageCircle, 
  Menu,
  X,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Send,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import employee components
import EmployeeLeadsView from '../components/Employee/EmployeeLeadsView';
import EmployeeMessages from '../components/Employee/EmployeeMessages';
import EmployeeProfile from '../components/Employee/EmployeeProfile';

const EmployeePage = () => {
  const [activeSection, setActiveSection] = useState('leads');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    pendingLeads: 0,
    unreadMessages: 0,
    leadsUpdatedToday: 0
  });

  const menuItems = [
    { id: 'leads', label: 'Leads Management', icon: FileText, color: 'text-green-600' },
    { id: 'messages', label: 'Client Messages', icon: MessageCircle, color: 'text-blue-600' },
    { id: 'profile', label: 'My Profile', icon: User, color: 'text-purple-600' }
  ];

  useEffect(() => {
    fetchEmployeeStats();
  }, []);

  const fetchEmployeeStats = async () => {
    try {
      setLoading(true);
      
      // Mock data - in production, this would be API calls
      const mockStats = {
        totalLeads: 24,
        pendingLeads: 7,
        unreadMessages: 3,
        leadsUpdatedToday: 5
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      toast.error('Failed to load employee statistics');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'leads':
        return <EmployeeLeadsView />;
      case 'messages':
        return <EmployeeMessages />;
      case 'profile':
        return <EmployeeProfile />;
      default:
        return <EmployeeLeadsView />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee dashboard...</p>
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
        <div className="flex items-center justify-between h-16 px-6 bg-green-700 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold">Employee Panel</span>
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
                    ? 'bg-green-50 border-r-4 border-green-600 text-green-700'
                    : 'text-gray-700'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${
                  activeSection === item.id ? 'text-green-600' : item.color
                }`} />
                <span className="font-medium">{item.label}</span>
                {item.id === 'messages' && stats.unreadMessages > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {stats.unreadMessages}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Employee Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Employee Access</div>
              <div className="text-xs text-gray-500">Limited permissions</div>
            </div>
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
                  {menuItems.find(item => item.id === activeSection)?.label || 'Employee Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">
                  Manage leads and client communications
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
                  <div className="text-lg font-bold text-orange-600">{stats.pendingLeads}</div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{stats.unreadMessages}</div>
                  <div className="text-xs text-gray-500">Unread</div>
                </div>
              </div>
              
              {/* Employee badge */}
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Employee</span>
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

export default EmployeePage;
