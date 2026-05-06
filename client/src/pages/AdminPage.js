import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  FileText,
  DollarSign,
  Settings,
  Menu,
  X,
  BarChart3,
  MessageSquare,
  ChevronRight,
  Bell,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CurrencySelector from '../components/UI/CurrencySelector';
import axios from 'axios';

import AdminLeadsManagement from '../components/Admin/AdminLeadsManagement';
import AdminUsersManagement from '../components/Admin/AdminUsersManagement';
import AdminEarningsManagement from '../components/Admin/EarningsManagement';
import AdminSettings from '../components/Admin/AdminSettings';
import AdminSummary from '../components/Admin/AdminSummary';
import AdminQueriesManagement from '../components/Admin/AdminQueriesManagement';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const menuItems = [
  { id: 'summary',  label: 'Summary',            icon: BarChart3,     },
  { id: 'leads',    label: 'Leads Management',    icon: FileText,      },
  { id: 'users',    label: 'Users Management',    icon: Users,         },
  { id: 'earnings', label: 'Earnings Management', icon: DollarSign,    },
  { id: 'queries',  label: 'Queries',             icon: MessageSquare, },
  { id: 'settings', label: 'Settings',            icon: Settings,      },
];

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('summary');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalUsers: 0,
    totalIncentives: 0,
    pendingLeads: 0,
    activeUsers: 0
  });

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const [leadsRes, usersRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/leads/admin/all`),
        axios.get(`${API_BASE_URL}/users`),
      ]);

      const leadsBody = leadsRes.status === 'fulfilled' ? leadsRes.value.data : {};
      const usersBody = usersRes.status === 'fulfilled' ? usersRes.value.data : {};
      const leads = Array.isArray(leadsBody) ? leadsBody : (leadsBody.data || []);
      const users = Array.isArray(usersBody) ? usersBody : (usersBody.data || []);

      setStats({
        totalLeads: Array.isArray(leads) ? leads.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalIncentives: 0,
        pendingLeads: Array.isArray(leads) ? leads.filter(l => l.status === 'Pending').length : 0,
        activeUsers: Array.isArray(users) ? users.filter(u => u.isActive).length : 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeItem = menuItems.find(m => m.id === activeSection);

  const renderContent = () => {
    switch (activeSection) {
      case 'summary':  return <AdminSummary stats={stats} />;
      case 'leads':    return <AdminLeadsManagement />;
      case 'users':    return <AdminUsersManagement />;
      case 'earnings': return <AdminEarningsManagement />;
      case 'queries':  return <AdminQueriesManagement />;
      case 'settings': return <AdminSettings />;
      default:         return <AdminSummary stats={stats} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-gray-900 text-white
        transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
              R
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Referus.co</div>
              <div className="text-xs text-gray-400 leading-tight">Admin Panel</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Navigation</p>
          {menuItems.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-all duration-150 ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0 h-5 w-5" />
                <span className="text-sm font-medium flex-1">{label}</span>
                {active && <ChevronRight className="h-4 w-4 opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="flex-shrink-0 p-3 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-800">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                {activeItem?.label || 'Dashboard'}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span>Admin</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-600">{activeItem?.label}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CurrencySelector variant="light" />
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2.5 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                  <p className="text-xs text-blue-600 font-medium leading-tight">Administrator</p>
                </div>
                <ChevronRight className={`hidden sm:block h-3.5 w-3.5 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-90' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/dashboard'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-gray-400" />
                    Go to Dashboard
                  </button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
