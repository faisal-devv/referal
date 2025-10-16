import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  MessageCircle,
  Home,
  Building2,
  CreditCard,
  Wrench,
  ChevronDown,
  Send
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AddLeadForm from '../components/Forms/AddLeadForm';
import ContactForm from '../components/Forms/ContactForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSupportSubmitting, setIsSupportSubmitting] = useState(false);
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  const handleContactUsClick = () => {
    // Show contact form modal
    setShowContactModal(true);
  };

  console.log(user);

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSupportSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/xkgqvjkw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'support_message',
          name: user?.name || 'Dashboard User',
          email: user?.email || 'user@example.com',
          message: supportMessage,
          subject: 'Support Request from Dashboard',
          notificationEmail: 'shoaibfm1988@gmail.com',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
      });

      if (response.ok) {
        setSupportMessage('');
        setSupportSubmitted(true);
        toast.success('✅ Your message has been sent. We\'ll get back to you soon.');
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSupportSubmitted(false);
        }, 5000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting support message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSupportSubmitting(false);
    }
  };
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    successfulDeals: 0,
    totalEarnings: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Currency data and helper functions
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' }
  ];

  // Get current balance for selected currency
  const getCurrentBalance = () => {
    const currencyKey = selectedCurrency.toLowerCase();
    return user?.wallet?.[currencyKey] || 0;
  };

  // Get current currency info
  const getCurrentCurrency = () => {
    return currencies.find(c => c.code === selectedCurrency) || currencies[0];
  };

  // Industries data for Home Info tab
  const industries = [
    {
      icon: <Building2 className="h-12 w-12" />,
      title: "IT Services Leads",
      description: "Software development, cloud solutions, cybersecurity, and tech consulting",
      color: "bg-blue-500",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <CreditCard className="h-12 w-12" />,
      title: "Banking & Finance Leads",
      description: "Financial services, loans, investment products, and banking solutions",
      color: "bg-green-500",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <Home className="h-12 w-12" />,
      title: "Real Estate Leads",
      description: "Property sales, rentals, commercial real estate, and property management",
      color: "bg-purple-500",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <Wrench className="h-12 w-12" />,
      title: "Construction Leads",
      description: "Building projects, infrastructure, renovations, and construction services",
      color: "bg-orange-500",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen for storage changes to refresh leads when new ones are added
  useEffect(() => {
    const handleStorageChange = () => {
      fetchDashboardData();
    };

    const handleEarningsUpdate = () => {
      fetchDashboardData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    window.addEventListener('leadSubmitted', handleStorageChange);
    window.addEventListener('earningsUpdated', handleEarningsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('leadSubmitted', handleStorageChange);
      window.removeEventListener('earningsUpdated', handleEarningsUpdate);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch leads from API first
      let apiLeads = [];
      try {
        const response = await fetch(`${API_BASE_URL}/leads`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          apiLeads = await response.json();
        }
      } catch (error) {
        console.log('API fetch failed, falling back to localStorage:', error);
      }

      // Use API leads if available, otherwise fall back to localStorage
      const localLeads = JSON.parse(localStorage.getItem('userLeads') || '[]');
      const leads = apiLeads.length > 0 ? apiLeads : localLeads;
      
      // Load wallet data from localStorage or default to zero
      const walletData = JSON.parse(localStorage.getItem(`wallet_${user?.email}`) || '{}');
      const wallet = {
        usd: walletData.usd || 0,
        aed: walletData.aed || 0,
        euro: walletData.euro || 0,
        sar: walletData.sar || 0
      };

      // Calculate stats
      const totalLeads = leads.length;
      const activeLeads = leads.filter(lead => 
        ['Pending', 'Contacted', 'Proposal Submitted'].includes(lead.status)
      ).length;
      const successfulDeals = leads.filter(lead => lead.status === 'Deal Closed').length;
      // Calculate total earnings with proper number handling
      const totalEarnings = (wallet.usd || 0) + (wallet.aed || 0) + (wallet.euro || 0) + (wallet.sar || 0);

      setStats({
        totalLeads,
        activeLeads,
        successfulDeals,
        totalEarnings
      });

      // Get recent leads (last 5)
      setRecentLeads(leads.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Deal Closed':
        return 'text-green-600 bg-green-100';
      case 'Client Refused':
        return 'text-red-600 bg-red-100';
      case 'Contacted':
        return 'text-blue-600 bg-blue-100';
      case 'Proposal Submitted':
        return 'text-purple-600 bg-purple-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your referral activity
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('dashboard')
                  fetchDashboardData();
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('my-leads')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-leads'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Leads
              </button>
              {user?.role === 'user' && (
                <>
                <button
                  onClick={() => setActiveTab('submit-lead')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'submit-lead'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Submit Lead
                </button>
                <button
                  onClick={() => setActiveTab('home-info')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'home-info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Home Info
                </button>
                <button
                  onClick={() => setActiveTab('support')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'support'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Support
                </button></>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeLeads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Successful Deals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successfulDeals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${isNaN(stats.totalEarnings) ? '0.00' : user.wallet?.usd?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Leads */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
                  <a
                    href="/leads"
                    className="text-blue-700 hover:text-blue-800 text-sm font-medium"
                  >
                    View all
                  </a>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead) => (
                    <div key={lead._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-sm font-medium text-gray-900">
                              {lead.companyName}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                              {getStatusText(lead.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {lead.category} • {lead.currency === 'USD' && '$'}
                            {lead.currency === 'EUR' && '€'}
                            {lead.currency === 'AED' && 'د.إ '}
                            {lead.currency === 'SAR' && 'ر.س '}
                            {lead.value?.toLocaleString() || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted {new Date(lead.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-gray-600">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No leads yet</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Start earning by submitting your first lead
                    </p>
                    {user?.role === 'user' && (
                      <button
                        onClick={() => setActiveTab('submit-lead')}
                        className="inline-flex items-center px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-md hover:bg-blue-800"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Submit Lead
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('submit-lead')}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
                >
                  <Plus className="h-4 w-4 mr-3" />
                  Submit New Lead
                </button>
                <a
                  href="/leads"
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
                >
                  <Eye className="h-4 w-4 mr-3" />
                  View All Leads
                </a>
                <a
                  href="/wallet"
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
                >
                  <DollarSign className="h-4 w-4 mr-3" />
                  Check Wallet
                </a>
                <button
                  onClick={() => setActiveTab('support')}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
                >
                  <MessageCircle className="h-4 w-4 mr-3" />
                  Contact Support
                </button>
              </div>
            </div>

            {/* Wallet Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Balance</h3>
              
              {/* Currency Selector */}
              <div className="mb-4">
                <label htmlFor="dashboard-currency-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Currency:
                </label>
                <div className="relative">
                  <select
                    id="dashboard-currency-select"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 w-full"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Balance Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">{getCurrentCurrency().name}</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {getCurrentCurrency().symbol}{getCurrentBalance().toFixed(2)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <a
                href="/wallet"
                className="block w-full text-center px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition duration-200"
              >
                View Full Wallet
              </a>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-blue-700">
                Include detailed contact information and specific project requirements 
                to increase your lead conversion rate.
              </p>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Submit Lead Tab */}
        {activeTab === 'submit-lead' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Submit a Lead
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Have a potential client in mind? Submit their details and start earning referral rewards today.
              </p>
            </div>
            <AddLeadForm />
          </div>
        )}

        {/* My Leads Tab */}
        {activeTab === 'my-leads' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                My Leads
              </h2>
              <p className="text-xl text-gray-600">
                Track all your submitted leads and their current status.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentLeads.length > 0 ? (
                    recentLeads.map((lead, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {lead.fullName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.companyName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.industry || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FileText className="h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads submitted yet</h3>
                          <p className="text-gray-500 mb-4">
                            Start earning by submitting your first lead
                          </p>
                          <button
                            onClick={() => setActiveTab('submit-lead')}
                            className="inline-flex items-center px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-md hover:bg-blue-800"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Submit Your First Lead
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Home Info Tab */}
        {activeTab === 'home-info' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-8 text-white">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Welcome to Referus.co
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed mb-8">
                  Connect businesses with opportunities and earn commissions for successful referrals. 
                  Join thousands of professionals already earning with Referus.co.
                </p>
              </div>
            </div>

            {/* Industries Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Industries We Serve
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Submit leads across multiple high-value industries and maximize your earning potential
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {industries.map((industry, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition duration-200 group"
                  >
                    {/* Service Image */}
                    <div className="relative h-48 overflow-hidden rounded-lg mb-4">
                      <img
                        src={industry.image}
                        alt={industry.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {industry.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {industry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commission Details Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Commission Structure
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Earn competitive commissions based on industry and project value
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* IT / Software Development */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">IT / Software Development</h3>
                      <p className="text-lg font-semibold text-blue-600">5–10% Commission</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Earn 5–10% commission on the total amount of the project successfully closed.
                  </p>
                  <button
                    onClick={handleContactUsClick}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                  >
                    For more info, contact us
                  </button>
                </div>

                {/* Construction */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                      <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Construction</h3>
                      <p className="text-lg font-semibold text-orange-600">5–10% Commission</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Earn 5–10% commission on the labor cost of the project. Commission will not be calculated on material costs.
                  </p>
                  <button
                    onClick={handleContactUsClick}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-200 font-medium"
                  >
                    For more info, contact us
                  </button>
                </div>

                {/* Real Estate */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                      <Home className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Real Estate</h3>
                      <p className="text-lg font-semibold text-purple-600">1–3% Commission</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Earn 1–3% commission on property transactions successfully closed.
                  </p>
                  <button
                    onClick={handleContactUsClick}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200 font-medium"
                  >
                    For more info, contact us
                  </button>
                </div>

                {/* Banking & Finance */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Banking & Finance</h3>
                      <p className="text-lg font-semibold text-green-600">0.5–2% Commission</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Earn 0.5–2% commission depending on the financial product sold.
                  </p>
                  <button
                    onClick={handleContactUsClick}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
                  >
                    For more info, contact us
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Contact Support
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Have a question or need help? Send us a message and we'll get back to you as soon as possible.
              </p>
            </div>

            {supportSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center animate-fade-in">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ Your message has been sent. We'll get back to you soon.
                </h3>
                <p className="text-green-600">
                  Thank you for contacting us. Our support team will respond within 24 hours.
                </p>
                <button
                  onClick={() => setSupportSubmitted(false)}
                  className="mt-4 text-blue-700 text-sm font-medium hover:text-blue-800"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-6">
                <div>
                  <label htmlFor="support-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    id="support-message"
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
                    placeholder="Please describe your question or issue in detail..."
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Please provide as much detail as possible to help us assist you better.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSupportSubmitting || !supportMessage.trim()}
                  >
                    {isSupportSubmitting ? (
                      <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Send className="h-5 w-5 mr-2" />
                    )}
                    <span>{isSupportSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Support Information */}
            <div className="mt-12 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Need Immediate Help?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Response Time:</span> Within 24 hours
                </div>
                <div>
                  <span className="font-medium">Business Hours:</span> Monday - Friday, 9 AM - 6 PM EST
                </div>
                <div>
                  <span className="font-medium">Email:</span> contact@referus.co
                </div>
                <div>
                  <span className="font-medium">Priority:</span> All messages are treated with high priority
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <ContactForm 
            isModal={true} 
            onClose={() => setShowContactModal(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
