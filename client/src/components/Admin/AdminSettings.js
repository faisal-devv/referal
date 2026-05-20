import React, { useState, useEffect } from 'react';
import {
  Save, RefreshCw, Shield, DollarSign,
  Building2, CreditCard, Home, Wrench,
  Percent, Mail, Globe, UserPlus, Wallet, Loader, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const DEFAULT_RATES = {
  'IT / Software Development': { min: 5,   max: 10 },
  'Banking & Finance':         { min: 0.5, max: 2  },
  'Real Estate':               { min: 1,   max: 3  },
  'Construction':              { min: 5,   max: 10 },
  'Insurance':                 { min: 2,   max: 8  },
};

const industryMeta = {
  'IT / Software Development': { icon: Building2, color: 'bg-blue-100 text-blue-700'   },
  'Banking & Finance':         { icon: CreditCard, color: 'bg-green-100 text-green-700' },
  'Real Estate':               { icon: Home,       color: 'bg-purple-100 text-purple-700' },
  'Construction':              { icon: Wrench,     color: 'bg-orange-100 text-orange-700' },
  'Insurance':                 { icon: Shield,     color: 'bg-teal-100 text-teal-700'   },
};

const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const AdminSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);

  // form state
  const [supportEmail,             setSupportEmail]             = useState('contact@referus.co');
  const [supportResponseHours,     setSupportResponseHours]     = useState(24);
  const [allowRegistration,        setAllowRegistration]        = useState(true);
  const [minWithdrawalUSD,         setMinWithdrawalUSD]         = useState(10);
  const [withdrawalProcessingDays, setWithdrawalProcessingDays] = useState('3-5');
  const [commissionRates,          setCommissionRates]          = useState(DEFAULT_RATES);

  // ── Load from API ──────────────────────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/settings`, { headers: authHeader() });
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setSupportEmail(data.supportEmail ?? 'contact@referus.co');
        setSupportResponseHours(data.supportResponseHours ?? 24);
        setAllowRegistration(data.allowRegistration ?? true);
        setMinWithdrawalUSD(data.minWithdrawalUSD ?? 10);
        setWithdrawalProcessingDays(data.withdrawalProcessingDays ?? '3-5');
        if (data.commissionRates && Object.keys(data.commissionRates).length) {
          setCommissionRates({ ...DEFAULT_RATES, ...data.commissionRates });
        }
      } catch (err) {
        console.error(err);
        toast.error('Could not load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ── Save to API ────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({
          supportEmail,
          supportResponseHours: Number(supportResponseHours),
          allowRegistration,
          minWithdrawalUSD: Number(minWithdrawalUSD),
          withdrawalProcessingDays,
          commissionRates,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Settings saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetRates = () => {
    if (window.confirm('Reset all commission rates to defaults?')) {
      setCommissionRates({ ...DEFAULT_RATES });
      toast.success('Commission rates reset');
    }
  };

  const handleCommissionChange = (industry, bound, value) => {
    setCommissionRates(prev => ({
      ...prev,
      [industry]: { ...prev[industry], [bound]: parseFloat(value) || 0 }
    }));
  };

  // ── Layout helpers ─────────────────────────────────────────────
  const Section = ({ icon: Icon, title, description, children }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-start gap-3">
        <Icon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  if (user?.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
          <Lock className="h-7 w-7 text-amber-600" />
        </div>
        <p className="text-sm font-semibold text-gray-700">Super Admin access required</p>
        <p className="text-xs text-gray-400 max-w-xs text-center">
          Only Super Admins can manage platform settings.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-1">Manage platform configuration</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            onClick={handleResetRates}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Rates
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving
              ? <Loader className="h-4 w-4 mr-2 animate-spin" />
              : <Save className="h-4 w-4 mr-2" />
            }
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* ── 1. Platform Contact ────────────────────────────────── */}
      <Section
        icon={Globe}
        title="Platform Contact"
        description="Contact details shown in the footer, chatbot, and support pages"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="contact@referus.co"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Displayed in footer, chatbot escalations, and FAQ</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Response Time (hours)</label>
            <input
              type="number"
              min="1"
              value={supportResponseHours}
              onChange={e => setSupportResponseHours(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">Shown to users as expected reply time</p>
          </div>
        </div>
      </Section>

      {/* ── 2. Registration ───────────────────────────────────── */}
      <Section
        icon={UserPlus}
        title="User Registration"
        description="Control whether new users can create accounts"
      >
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900">Allow new registrations</p>
            <p className="text-xs text-gray-500 mt-0.5">
              When disabled, the sign-up form will show a message directing users to contact support
            </p>
          </div>
          <button
            onClick={() => setAllowRegistration(v => !v)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              allowRegistration ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                allowRegistration ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className={`mt-3 text-sm font-medium ${allowRegistration ? 'text-green-600' : 'text-red-600'}`}>
          {allowRegistration ? '✓ Registrations are open' : '✗ Registrations are currently disabled'}
        </p>
      </Section>

      {/* ── 3. Withdrawal Settings ────────────────────────────── */}
      <Section
        icon={Wallet}
        title="Withdrawal Settings"
        description="Control minimum withdrawal amount and processing time shown to users"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Withdrawal (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
              <input
                type="number"
                min="1"
                step="1"
                value={minWithdrawalUSD}
                onChange={e => setMinWithdrawalUSD(e.target.value)}
                className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Users cannot withdraw below this amount</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time</label>
            <input
              type="text"
              value={withdrawalProcessingDays}
              onChange={e => setWithdrawalProcessingDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. 3-5"
            />
            <p className="mt-1 text-xs text-gray-500">Business days shown to users (e.g. "3-5")</p>
          </div>
        </div>
      </Section>

      {/* ── 4. Commission Rates ───────────────────────────────── */}
      <Section
        icon={DollarSign}
        title="Commission Rates"
        description="Min and max percentage paid to referrers per industry when a deal closes"
      >
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-4 pb-2">
          <div className="col-span-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Industry</div>
          <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Rate</div>
          <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Rate</div>
          <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Range</div>
        </div>

        <div className="space-y-2">
          {Object.entries(commissionRates).map(([industry, rates]) => {
            const meta = industryMeta[industry];
            const Icon = meta?.icon || DollarSign;
            return (
              <div key={industry} className="grid grid-cols-12 gap-4 items-center bg-gray-50 rounded-lg px-4 py-3">
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta?.color || 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{industry}</span>
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <input
                      type="number" min="0" max="100" step="0.5"
                      value={rates.min}
                      onChange={e => handleCommissionChange(industry, 'min', e.target.value)}
                      className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <input
                      type="number" min="0" max="100" step="0.5"
                      value={rates.max}
                      onChange={e => handleCommissionChange(industry, 'max', e.target.value)}
                      className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="col-span-1">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${meta?.color || 'bg-gray-100 text-gray-600'}`}>
                    {rates.min}–{rates.max}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Bottom save */}
      <div className="flex justify-end pb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving
            ? <Loader className="h-5 w-5 mr-2 animate-spin" />
            : <Save className="h-5 w-5 mr-2" />
          }
          {saving ? 'Saving…' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
