import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { AppThemeProvider } from '../../context/AppThemeContext';
import {
  LayoutDashboard, FileText, Plus, Wallet, MessageCircle,
  LogOut, Menu, X, ChevronDown, User, HelpCircle, Sun, Moon,
} from 'lucide-react';
import CurrencySelector from '../UI/CurrencySelector';
import NotificationBell from '../Common/NotificationBell';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads',     icon: FileText,         label: 'My Leads'  },
  { to: '/wallet',    icon: Wallet,           label: 'Wallet'    },
  { to: '/chat',      icon: MessageCircle,    label: 'Chat'      },
  { to: '/profile',   icon: User,             label: 'Profile'   },
];

const AppLayoutInner = ({ children, isDark, toggleTheme }) => {
  const { user, logout } = useAuth();
  const { currency, walletTotal, format } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  // ── Theme tokens ──────────────────────────────────────────────
  const chrome     = isDark ? '#0d1117' : '#ffffff';
  const chromeBdr  = isDark ? 'border-slate-800/80' : 'border-gray-200';
  const navDefault = isDark
    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  const navBottom  = isDark
    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  const logoText   = isDark ? 'text-white' : 'text-gray-900';
  const pageTitle  = isDark ? 'text-slate-300' : 'text-gray-600';
  const hamburger  = isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900';
  const walletLink = isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700';
  const userBtn    = isDark ? 'text-slate-300 hover:text-white' : 'text-gray-700 hover:text-gray-900';
  const userAvatar = isDark
    ? 'bg-emerald-500/20 border-emerald-500/30'
    : 'bg-emerald-100 border-emerald-200';
  const dropdownItem = isDark
    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100';
  const toggleBtn  = isDark
    ? 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800'
    : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100';
  const submitLeadBtn = isActive('/add-lead')
    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
    : isDark
      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/25'
      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-200';
  const sectionDivider = isDark ? 'border-slate-800' : 'border-gray-200';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-2.5 px-5 py-5 border-b ${sectionDivider}`}>
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className={`font-bold text-lg tracking-tight ${logoText}`}>Referus.co</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive(to)
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : navDefault
            }`}
          >
            <Icon className={`flex-shrink-0 ${isActive(to) ? 'text-emerald-400' : ''}`} size={18} />
            {label}
            {isActive(to) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </Link>
        ))}

        <Link
          to="/add-lead"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mt-2 ${submitLeadBtn}`}
        >
          <Plus size={18} className="flex-shrink-0" />
          Submit a Lead
        </Link>
      </nav>

      <div className={`px-3 pb-4 border-t ${sectionDivider} pt-4 space-y-0.5`}>
        <Link
          to="/faq"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${navBottom}`}
        >
          <HelpCircle size={18} />
          Help &amp; FAQ
        </Link>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-gray-600 hover:text-red-500 hover:bg-gray-100'
          }`}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: isDark ? '#080d18' : '#f1f5f9' }}>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col w-56 flex-shrink-0 fixed top-0 left-0 h-screen border-r ${chromeBdr} z-30`}
        style={{ background: chrome }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className={`relative w-64 flex flex-col border-r ${chromeBdr} z-10`} style={{ background: chrome }}>
            <button onClick={() => setSidebarOpen(false)} className={`absolute top-4 right-4 ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-56 min-w-0">

        {/* Top bar */}
        <header className={`sticky top-0 z-20 flex items-center gap-4 px-4 sm:px-6 h-14 border-b ${chromeBdr}`} style={{ background: chrome }}>

          <button onClick={() => setSidebarOpen(true)} className={`lg:hidden transition-colors flex-shrink-0 ${hamburger}`}>
            <Menu size={20} />
          </button>

          <span className={`text-sm font-medium hidden sm:block ${pageTitle}`}>
            {NAV.find(n => n.to === location.pathname)?.label ?? 'Referus.co'}
          </span>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <CurrencySelector variant={isDark ? 'dark' : 'light'} />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150 ${toggleBtn}`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <NotificationBell theme={isDark ? 'dark' : 'light'} />

            <Link to="/wallet" className={`hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors ${walletLink}`}>
              <Wallet size={15} />
              {format(walletTotal(user?.wallet || {}), currency)}
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                className={`flex items-center gap-2 transition-colors text-sm ${userBtn}`}
              >
                <div className={`w-7 h-7 rounded-full border overflow-hidden flex items-center justify-center ${userAvatar}`}>
                  {user?.profileImage
                    ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    : <span className="text-xs font-semibold text-emerald-400">
                        {(user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                  }
                </div>
                <span className="hidden sm:block max-w-[100px] truncate font-medium">{user?.name}</span>
                <ChevronDown size={14} className={`hidden sm:block ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              </button>

              {userMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-2xl py-1 z-50 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}
                  style={{ background: chrome }}
                >
                  <div className={`px-4 py-2 border-b ${isDark ? 'border-slate-700/50' : 'border-gray-200'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Signed in as</p>
                    <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                  </div>
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                    className={`block px-4 py-2.5 text-sm transition-colors ${dropdownItem}`}>
                    Profile
                  </Link>
                  <Link to="/" onClick={() => setUserMenuOpen(false)}
                    className={`block px-4 py-2.5 text-sm transition-colors ${dropdownItem}`}>
                    Home
                  </Link>
                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                      className={`block px-4 py-2.5 text-sm transition-colors ${dropdownItem}`}>
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className={`flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      isDark ? 'text-red-400 hover:text-red-300 hover:bg-slate-800' : 'text-red-500 hover:text-red-600 hover:bg-gray-100'
                    }`}>
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppLayout = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const toggle = () => setIsDark(d => !d);

  return (
    <AppThemeProvider isDark={isDark} toggle={toggle}>
      <AppLayoutInner isDark={isDark} toggleTheme={toggle}>
        {children}
      </AppLayoutInner>
    </AppThemeProvider>
  );
};

export default AppLayout;
