import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign, Wallet, FileText, CheckCircle, Clock,
  Plus, Eye, MessageCircle, Home, Building2, CreditCard,
  Wrench, Shield, Send, X, ArrowRight,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCurrency } from '../context/CurrencyContext';
import { useAppTheme } from '../context/AppThemeContext';
import AddLeadForm from '../components/Forms/AddLeadForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const STATUS_STYLE_DARK = {
  'Deal Closed':        'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'Client Refused':     'bg-red-500/15 text-red-400 border-red-500/25',
  'Contacted':          'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'Proposal Submitted': 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  'Pending':            'bg-amber-500/15 text-amber-400 border-amber-500/25',
};
const STATUS_STYLE_LIGHT = {
  'Deal Closed':        'bg-green-100 text-green-700 border-green-200',
  'Client Refused':     'bg-red-100 text-red-700 border-red-200',
  'Contacted':          'bg-blue-100 text-blue-700 border-blue-200',
  'Proposal Submitted': 'bg-violet-100 text-violet-700 border-violet-200',
  'Pending':            'bg-amber-100 text-amber-700 border-amber-200',
};

const INDUSTRIES = [
  { icon: Building2,  title: 'IT / Software Development', commission: '5–10%', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  { icon: Wrench,     title: 'Construction',               commission: '5–10%', color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
  { icon: Home,       title: 'Real Estate',                commission: '1–3%',  color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
  { icon: CreditCard, title: 'Banking & Finance',          commission: '0.5–2%',color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: Shield,     title: 'Insurance',                  commission: '2–8%',  color: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20' },
];

const DashboardPage = () => {
  const { user }  = useAuth();
  const { walletTotal, currencyInfo } = useCurrency();
  const { isDark } = useAppTheme();

  const [activeTab, setActiveTab]                     = useState('dashboard');
  const [walletData, setWalletData]                   = useState({ usd: 0, aed: 0, euro: 0, sar: 0 });
  const [stats, setStats]                             = useState({ totalLeads: 0, activeLeads: 0, successfulDeals: 0, totalEarnings: 0 });
  const [recentLeads, setRecentLeads]                 = useState([]);
  const [loading, setLoading]                         = useState(true);
  const [viewLead, setViewLead]                       = useState(null);
  const [supportMessage, setSupportMessage]           = useState('');
  const [isSupportSubmitting, setIsSupportSubmitting] = useState(false);
  const [supportSubmitted, setSupportSubmitted]       = useState(false);

  // ── Theme tokens ──────────────────────────────────────────────
  const cardBg     = isDark ? '#161b22' : '#ffffff';
  const modalBg    = isDark ? '#0d1117' : '#ffffff';
  const borderCls  = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const divCls     = isDark ? 'divide-slate-700/40'  : 'divide-gray-200';
  const headingCls = isDark ? 'text-white'    : 'text-gray-900';
  const subCls     = isDark ? 'text-slate-400' : 'text-gray-500';
  const mutedCls   = isDark ? 'text-slate-500' : 'text-gray-400';
  const rowHover   = isDark ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50';
  const tableHead  = isDark ? 'text-slate-500' : 'text-gray-400';
  const tableCell  = isDark ? 'text-slate-300' : 'text-gray-700';
  const tableSub   = isDark ? 'text-slate-400' : 'text-gray-500';
  const infoRow    = isDark ? 'bg-slate-800/50' : 'bg-gray-50';
  const infoLabel  = isDark ? 'text-slate-500'  : 'text-gray-500';
  const infoVal    = isDark ? 'text-white'       : 'text-gray-900';
  const tabDef     = isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100';
  const qaLink     = isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  const statusMap  = isDark ? STATUS_STYLE_DARK : STATUS_STYLE_LIGHT;
  const getStatus  = (s) => statusMap[s] || (isDark ? 'bg-slate-500/15 text-slate-400 border-slate-500/25' : 'bg-gray-100 text-gray-600 border-gray-200');

  // Card wrapper using theme tokens
  const DCard = ({ children, className = '', extraBorder = '' }) => (
    <div
      className={`rounded-xl border ${borderCls} ${extraBorder} ${className}`}
      style={{ background: cardBg }}
    >
      {children}
    </div>
  );

  const getCurrentBalance = () => walletTotal(walletData);

  useEffect(() => { fetchDashboardData(); }, []);
  useEffect(() => {
    const refresh = () => fetchDashboardData();
    window.addEventListener('leadSubmitted', refresh);
    window.addEventListener('earningsUpdated', refresh);
    return () => {
      window.removeEventListener('leadSubmitted', refresh);
      window.removeEventListener('earningsUpdated', refresh);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      let leads = [];
      try {
        const r = await fetch(`${API_BASE_URL}/leads`, { headers });
        if (r.ok) leads = await r.json();
      } catch { leads = JSON.parse(localStorage.getItem('userLeads') || '[]'); }

      let wallet = { usd: 0, aed: 0, euro: 0, sar: 0 };
      try {
        const r = await fetch(`${API_BASE_URL}/wallet`, { headers });
        if (r.ok) wallet = await r.json();
      } catch {}

      setWalletData(wallet);
      setStats({
        totalLeads:      leads.length,
        activeLeads:     leads.filter(l => ['Pending', 'Contacted', 'Proposal Submitted'].includes(l.status)).length,
        successfulDeals: leads.filter(l => l.status === 'Deal Closed').length,
        totalEarnings:   (wallet.usd || 0) + (wallet.aed || 0) + (wallet.euro || 0) + (wallet.sar || 0),
      });
      setRecentLeads(leads.slice(0, 6));
    } catch { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return toast.error('Please enter a message');
    setIsSupportSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/queries`, {
        name: user?.name || 'Dashboard User', email: user?.email || '',
        subject: 'Support Request from Dashboard', message: supportMessage,
      });
      setSupportMessage(''); setSupportSubmitted(true);
      toast.success("Message sent. We'll get back to you soon.");
      setTimeout(() => setSupportSubmitted(false), 5000);
    } catch { toast.error('Failed to send message. Please try again.'); }
    finally { setIsSupportSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TABS = [
    { key: 'dashboard',   label: 'Overview' },
    { key: 'my-leads',    label: 'My Leads' },
    ...(user?.role === 'user' ? [
      { key: 'submit-lead', label: 'Submit Lead' },
      { key: 'commissions', label: 'Commissions' },
      { key: 'support',     label: 'Support' },
    ] : []),
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${headingCls}`}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className={`text-sm mt-1 ${subCls}`}>Here is your referral activity overview.</p>
        </div>
        {user?.role === 'user' && (
          <Link to="/add-lead"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Plus size={16} /> Submit a Lead
          </Link>
        )}
      </div>

      {/* Tab bar */}
      <div className={`flex gap-1 p-1 rounded-xl border ${borderCls}`} style={{ background: cardBg }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); if (tab.key === 'dashboard') fetchDashboardData(); }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : tabDef
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Total Leads',    value: stats.totalLeads,      icon: FileText,    bg: 'bg-blue-500/10',    color: 'text-blue-400'    },
              { title: 'Active Leads',   value: stats.activeLeads,     icon: Clock,       bg: 'bg-amber-500/10',   color: 'text-amber-400'   },
              { title: 'Deals Closed',   value: stats.successfulDeals, icon: CheckCircle, bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
              { title: 'Total Earnings', value: `$${stats.totalEarnings.toFixed(2)}`, icon: DollarSign, bg: 'bg-violet-500/10', color: 'text-violet-400' },
            ].map((s, i) => (
              <DCard key={i} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-xs font-medium ${subCls}`}>{s.title}</p>
                  <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                    <s.icon size={15} className={s.color} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${headingCls}`}>{s.value}</p>
              </DCard>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent leads */}
            <DCard className="lg:col-span-2">
              <div className={`flex items-center justify-between px-5 py-4 border-b ${borderCls}`}>
                <h2 className={`text-sm font-semibold ${headingCls}`}>Recent Leads</h2>
                <Link to="/leads" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div className={`divide-y ${divCls}`}>
                {recentLeads.length > 0 ? recentLeads.map(lead => (
                  <div key={lead._id} className={`px-5 py-3.5 flex items-center justify-between ${rowHover} transition-colors`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-medium truncate ${headingCls}`}>{lead.companyName}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getStatus(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                      <p className={`text-xs ${mutedCls}`}>{lead.category} · Submitted {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => setViewLead(lead)}
                      className={`transition-colors ml-3 flex-shrink-0 ${isDark ? 'text-slate-600 hover:text-emerald-400' : 'text-gray-300 hover:text-emerald-500'}`}>
                      <Eye size={15} />
                    </button>
                  </div>
                )) : (
                  <div className="px-5 py-12 text-center">
                    <FileText size={36} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                    <p className={`text-sm font-medium mb-1 ${subCls}`}>No leads yet</p>
                    <p className={`text-xs mb-4 ${mutedCls}`}>Submit your first lead to start earning</p>
                    {user?.role === 'user' && (
                      <Link to="/add-lead"
                        className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                        <Plus size={13} /> Submit Lead
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </DCard>

            {/* Right column */}
            <div className="space-y-4">
              {/* Wallet */}
              <DCard className="p-5">
                <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${headingCls}`}>
                  <Wallet size={15} className="text-emerald-400" /> Wallet Balance
                </h3>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 mb-4">
                  <p className="text-xs text-emerald-400/70 mb-1">{currencyInfo.flag} {currencyInfo.name}</p>
                  <p className={`text-2xl font-bold ${headingCls}`}>{currencyInfo.symbol}{getCurrentBalance().toFixed(2)}</p>
                </div>
                <Link to="/wallet"
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 rounded-lg transition-all duration-200">
                  View Full Wallet <ArrowRight size={14} />
                </Link>
              </DCard>

              {/* Quick actions */}
              <DCard className="p-5">
                <h3 className={`text-sm font-semibold mb-3 ${headingCls}`}>Quick Actions</h3>
                <div className="space-y-1.5">
                  {[
                    { to: '/add-lead', icon: Plus,          label: 'Submit New Lead', highlight: true },
                    { to: '/leads',    icon: Eye,           label: 'View All Leads' },
                    { to: '/wallet',   icon: Wallet,        label: 'Check Wallet' },
                    { to: '/chat',     icon: MessageCircle, label: 'Live Support' },
                  ].map(({ to, icon: Icon, label, highlight }) => (
                    <Link key={to} to={to}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        highlight
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20'
                          : qaLink
                      }`}>
                      <Icon size={15} />
                      {label}
                    </Link>
                  ))}
                </div>
              </DCard>

              {/* Tip */}
              <DCard className="p-4 border-emerald-500/20" extraBorder="">
                <p className="text-xs font-semibold text-emerald-400 mb-1">Pro Tip</p>
                <p className={`text-xs leading-relaxed ${subCls}`}>
                  Include detailed contact info and project requirements to boost your conversion rate.
                </p>
              </DCard>
            </div>
          </div>
        </div>
      )}

      {/* ── MY LEADS ────────────────────────────────────────── */}
      {activeTab === 'my-leads' && (
        <DCard>
          <div className={`px-5 py-4 border-b ${borderCls}`}>
            <h2 className={`text-base font-semibold ${headingCls}`}>My Leads</h2>
            <p className={`text-xs mt-0.5 ${subCls}`}>Track all your submitted leads and their current status.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className={`border-b ${borderCls}`}>
                  {['Full Name', 'Company', 'Industry', 'Date Submitted', 'Status'].map(h => (
                    <th key={h} className={`px-5 py-3 text-left text-xs font-medium uppercase tracking-wider ${tableHead}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${divCls}`}>
                {recentLeads.length > 0 ? recentLeads.map(lead => (
                  <tr key={lead._id} className={`${rowHover} transition-colors`}>
                    <td className={`px-5 py-3.5 text-sm ${tableCell}`}>{lead.contactPerson || 'N/A'}</td>
                    <td className={`px-5 py-3.5 text-sm ${tableCell}`}>{lead.companyName || 'N/A'}</td>
                    <td className={`px-5 py-3.5 text-sm ${tableSub}`}>{lead.category || 'N/A'}</td>
                    <td className={`px-5 py-3.5 text-sm ${tableSub}`}>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatus(lead.status)}`}>
                        {lead.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="px-5 py-14 text-center">
                    <FileText size={36} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                    <p className={`text-sm mb-4 ${subCls}`}>No leads submitted yet</p>
                    <Link to="/add-lead"
                      className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                      <Plus size={14} /> Submit Your First Lead
                    </Link>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </DCard>
      )}

      {/* ── SUBMIT LEAD ─────────────────────────────────────── */}
      {activeTab === 'submit-lead' && (
        <DCard className="p-6 sm:p-8">
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-2 ${headingCls}`}>Submit a Lead</h2>
            <p className={`text-sm ${subCls}`}>Have a potential client in mind? Submit their details and start earning today.</p>
          </div>
          <AddLeadForm />
        </DCard>
      )}

      {/* ── COMMISSIONS ─────────────────────────────────────── */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className={`text-xl font-bold mb-1 ${headingCls}`}>Commission Structure</h2>
            <p className={`text-sm ${subCls}`}>Competitive commissions based on industry and deal value.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDUSTRIES.map(({ icon: Icon, title, commission, color, bg, border }, i) => (
              <DCard key={i} className={`p-5 border ${border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${headingCls}`}>{title}</p>
                    <p className={`text-sm font-bold ${color}`}>{commission} Commission</p>
                  </div>
                </div>
                <Link to="/contact"
                  className={`flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold rounded-lg ${bg} ${color} border ${border} hover:opacity-80 transition-opacity`}>
                  Ask about rates <ArrowRight size={11} />
                </Link>
              </DCard>
            ))}
          </div>
        </div>
      )}

      {/* ── SUPPORT ─────────────────────────────────────────── */}
      {activeTab === 'support' && (
        <DCard className="p-6 sm:p-8 max-w-2xl">
          <h2 className={`text-xl font-bold mb-2 ${headingCls}`}>Contact Support</h2>
          <p className={`text-sm mb-6 ${subCls}`}>Send us a message and we will get back to you within 24 hours.</p>

          {supportSubmitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
              <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-400 font-semibold mb-1">Message sent successfully!</p>
              <p className={`text-sm mb-4 ${subCls}`}>Our team will respond within 24 hours.</p>
              <button onClick={() => setSupportSubmitted(false)} className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Your Message</label>
                <textarea
                  value={supportMessage}
                  onChange={e => setSupportMessage(e.target.value)}
                  rows={6}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none ${
                    isDark
                      ? 'border-slate-700 bg-slate-800/60 text-white placeholder-slate-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Describe your question or issue in detail..."
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className={`text-xs space-y-1 ${mutedCls}`}>
                  <p>Response time: within 24 hours</p>
                  <p>Email: contact@referus.co</p>
                </div>
                <button type="submit" disabled={isSupportSubmitting || !supportMessage.trim()}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                  {isSupportSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={15} />}
                  {isSupportSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </DCard>
      )}

      {/* Lead detail modal */}
      {viewLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-2xl border ${borderCls} shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}
            style={{ background: modalBg }}
          >
            <div className={`sticky top-0 border-b ${borderCls} px-6 py-4 flex items-center justify-between rounded-t-2xl`} style={{ background: modalBg }}>
              <h3 className={`text-base font-bold ${headingCls}`}>Lead Details</h3>
              <button onClick={() => setViewLead(null)} className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-2.5">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatus(viewLead.status)}`}>
                {viewLead.status}
              </span>
              {[
                { label: 'Company',   value: viewLead.companyName },
                { label: 'Contact',   value: viewLead.contactPerson },
                { label: 'Email',     value: viewLead.email },
                { label: 'Phone',     value: viewLead.phone },
                { label: 'Industry',  value: viewLead.category },
                { label: 'Submitted', value: new Date(viewLead.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label} className={`rounded-lg p-3 ${infoRow}`}>
                  <p className={`text-xs font-medium mb-0.5 ${infoLabel}`}>{label}</p>
                  <p className={`text-sm ${infoVal}`}>{value || 'N/A'}</p>
                </div>
              ))}
              {viewLead.description && (
                <div className={`rounded-lg p-3 ${infoRow}`}>
                  <p className={`text-xs font-medium mb-0.5 ${infoLabel}`}>Notes</p>
                  <p className={`text-sm ${infoVal}`}>{viewLead.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
