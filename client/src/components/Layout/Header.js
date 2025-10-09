import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, LogOut, Wallet, MessageCircle } from 'lucide-react';
import AuthModal from '../Auth/AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [defaultToRegister, setDefaultToRegister] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleAuthClick = () => {
    setDefaultToRegister(false); // Default to login
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleGetStartedClick = () => {
    setDefaultToRegister(true); // Default to register
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };


  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
                  <span className="text-xl font-bold text-gray-900">Referus.co</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-700 transition duration-200">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-700 transition duration-200">
                About
              </Link>
              <Link to="/how-it-works" className="text-gray-700 hover:text-blue-700 transition duration-200">
                How It Works
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-700 transition duration-200">
                Contact
              </Link>
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <Wallet className="h-4 w-4" />
                    <span>
                      ${user?.wallet?.usd?.toFixed(2) || '0.00'} USD
                    </span>
                  </div>
                  
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition duration-200">
                      <User className="h-5 w-5" />
                      <span>{user?.name}</span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/leads"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Leads
                      </Link>
                      <Link
                        to="/wallet"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Wallet
                      </Link>
                      <Link
                        to="/chat"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <MessageCircle className="inline h-4 w-4 mr-2" />
                        Chat
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleAuthClick}
                    className="text-gray-700 hover:text-blue-700 transition duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleGetStartedClick}
                    className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition duration-200"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-primary-600 transition duration-200"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                <Link
                  to="/"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-700 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-700 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/how-it-works"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-700 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  to="/contact"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-700 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                
                {isAuthenticated ? (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Welcome, {user?.name}
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-700 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/leads"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-700 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Leads
                    </Link>
                    <Link
                      to="/wallet"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-700 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Wallet
                    </Link>
                    <Link
                      to="/chat"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-700 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Chat
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-700 transition duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-700 transition duration-200"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={handleAuthClick}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-700 transition duration-200"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={handleGetStartedClick}
                      className="block w-full text-left px-3 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition duration-200 mt-2"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
