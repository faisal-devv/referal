import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Menu, X, LogOut, Wallet, ChevronDown } from 'lucide-react';
import AuthModal from '../Auth/AuthModal';
import CurrencySelector from '../UI/CurrencySelector';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen]       = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [defaultToRegister, setDefaultToRegister] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { currency, walletTotal, format } = useCurrency();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleAuthClick = () => {
    setDefaultToRegister(false);
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleGetStartedClick = () => {
    setDefaultToRegister(true);
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home',         to: '/' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'About',        to: '/about' },
    { label: 'FAQ',          to: '/faq' },
    { label: 'Contact',      to: '/contact' },
  ];

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Referus.co</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/become-a-partner"
                className="text-emerald-400 hover:text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 text-sm font-semibold px-3.5 py-1.5 rounded-lg transition-colors duration-150"
              >
                Become a Partner
              </Link>
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <CurrencySelector variant="dark" />

                  <Link
                    to="/wallet"
                    className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>{format(walletTotal(user?.wallet || {}), currency)}</span>
                  </Link>

                  {/* User dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                      className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {user?.profileImage
                          ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                          : <span className="text-xs font-semibold text-emerald-400">
                              {(user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                        }
                      </div>
                      <span className="max-w-[120px] truncate">{user?.name}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
                        <Link to="/dashboard" onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors">
                          Dashboard
                        </Link>
                        <Link to="/profile" onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors">
                          Profile
                        </Link>
                        <Link to="/leads" onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors">
                          My Leads
                        </Link>
                        <Link to="/wallet" onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors">
                          Wallet
                        </Link>
                        {(user?.role === 'admin' || user?.role === 'superadmin') && (
                          <Link to="/admin" onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors">
                            Admin Panel
                          </Link>
                        )}
                        <div className="my-1 border-t border-slate-700" />
                        <button onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700/60 transition-colors">
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAuthClick}
                    className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleGetStartedClick}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    Get Started Free
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pb-4 pt-2 space-y-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2.5 text-slate-400 hover:text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                {link.label}
              </Link>
            ))}
            <Link to="/become-a-partner" onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2.5 text-emerald-400 hover:text-emerald-300 text-sm font-semibold rounded-lg border border-emerald-500/40 hover:border-emerald-400 transition-colors">
              Become a Partner
            </Link>

            <div className="border-t border-slate-800 pt-3 mt-2">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <p className="px-3 py-1 text-xs text-slate-500 uppercase tracking-wider">Account</p>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2.5 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2.5 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800 transition-colors">
                    Profile
                  </Link>
                  <Link to="/leads" onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2.5 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800 transition-colors">
                    My Leads
                  </Link>
                  <Link to="/wallet" onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2.5 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800 transition-colors">
                    Wallet
                  </Link>
                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2.5 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800 transition-colors">
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-red-400 text-sm rounded-lg hover:bg-slate-800 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button onClick={handleAuthClick}
                    className="block w-full text-left px-3 py-2.5 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800 transition-colors">
                    Sign In
                  </button>
                  <button onClick={handleGetStartedClick}
                    className="block w-full text-center px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors">
                    Get Started Free
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultToRegister={defaultToRegister}
      />
    </>
  );
};

export default Header;
