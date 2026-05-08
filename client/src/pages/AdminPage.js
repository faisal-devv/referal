import React, { useState, useEffect, useRef } from 'react';
import {
  Users, FileText, DollarSign, Settings, Menu, X,
  BarChart3, MessageSquare, ChevronRight, LogOut,
  LayoutDashboard, Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CurrencySelector from '../components/UI/CurrencySelector';
import axios from 'axios';

import AdminLeadsManagement    from '../components/Admin/AdminLeadsManagement';
import AdminUsersManagement    from '../components/Admin/AdminUsersManagement';
import AdminEarningsManagement from '../components/Admin/EarningsManagement';
import AdminSettings           from '../components/Admin/AdminSettings';
import NotificationBell        from '../components/Common/NotificationBell';
import AdminSummary           from '../components/Admin/AdminSummary';
import AdminQueriesManagement from '../components/Admin/AdminQueriesManagement';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const NAV = [
  { id: 'summary',  label: 'Overview',            icon: BarChart3,     },
  { id: 'leads',    label: 'Leads',               icon: FileText,      },
  { id: 'users',    label: 'Users',               icon: Users,         },
  { id: 'earnings', label: 'Earnings',            icon: DollarSign,    },
  { id: 'queries',  label: 'Queries',             icon: MessageSquare, },
  { id: 'settings', label: 'Settings',            icon: Settings,      },
];

/* ── Sidebar ──────────────────────────────────────────────────────── */
const Sidebar = ({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen, user, logout }) => {
  const initials = (user?.name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-30 flex flex-col w-60
        transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ background: '#0F172A' }}>

        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 flex-shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}>
              R
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-white">Referus.co</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Admin Panel</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">Main Menu</p>
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                  active
                    ? 'text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
                style={active ? { background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)' } : {}}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 transition-transform duration-150 ${active ? '' : 'group-hover:scale-110'}`} />
                <span className="text-sm font-medium flex-1">{label}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-white/60" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="flex-shrink-0 p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-slate-800/50">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-indigo-600 shadow-sm">
              {user?.profileImage
                ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                : <span className="text-xs font-bold text-white">{initials}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate leading-tight">{user?.name || 'Admin'}</p>
              <p className="text-[11px] text-slate-500 truncate leading-tight">{user?.email || ''}</p>
            </div>
            <button onClick={logout} title="Sign out"
              className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-slate-700/50">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

/* ── AdminPage ────────────────────────────────────────────────────── */
const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('summary');
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);
  const [loading, setLoading]             = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0, totalUsers: 0, totalIncentives: 0,
    pendingLeads: 0, activeUsers: 0,
  });
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { fetchAdminStats(); }, []);

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
        totalLeads:      Array.isArray(leads) ? leads.length : 0,
        totalUsers:      Array.isArray(users) ? users.length : 0,
        totalIncentives: 0,
        pendingLeads:    Array.isArray(leads) ? leads.filter(l => l.status === 'Pending').length : 0,
        activeUsers:     Array.isArray(users) ? users.filter(u => u.isActive).length : 0,
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeItem  = NAV.find(m => m.id === activeSection);
  const initials    = (user?.name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const renderContent = () => {
    switch (activeSection) {
      case 'summary':  return <AdminSummary stats={stats} onNavigate={setActiveSection} />;
      case 'leads':    return <AdminLeadsManagement />;
      case 'users':    return <AdminUsersManagement />;
      case 'earnings': return <AdminEarningsManagement />;
      case 'queries':  return <AdminQueriesManagement />;
      case 'settings': return <AdminSettings />;
      default:         return <AdminSummary stats={stats} onNavigate={setActiveSection} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">

      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        logout={logout}
      />

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5 flex-shrink-0" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">{activeItem?.label || 'Overview'}</h1>
              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                <span>Admin</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-indigo-600 font-medium">{activeItem?.label}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CurrencySelector variant="light" />

            <button
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </button>

            <NotificationBell theme="light" />

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-indigo-600 shadow-sm">
                  {user?.profileImage
                    ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    : <span className="text-xs font-bold text-white">{initials}</span>
                  }
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                  <p className="text-[11px] font-medium leading-tight" style={{ color: '#6366F1' }}>Administrator</p>
                </div>
                <ChevronRight className={`hidden sm:block h-3.5 w-3.5 text-gray-300 transition-transform ${userMenuOpen ? 'rotate-90' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-indigo-600 flex-shrink-0">
                      {user?.profileImage
                        ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                        : <span className="text-xs font-bold text-white">{initials}</span>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="py-1 px-1.5">
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/dashboard'); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-400" />
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/'); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                    >
                      <Home className="h-4 w-4 text-gray-400" />
                      Go to Home
                    </button>
                  </div>
                  <div className="border-t border-gray-100 py-1 px-1.5">
                    <button
                      onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
