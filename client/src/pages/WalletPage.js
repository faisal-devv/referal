import React, { useState, useEffect } from 'react';
import {
  DollarSign, CreditCard, Plus,
  Clock, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCurrency } from '../context/CurrencyContext';
import { useAppTheme } from '../context/AppThemeContext';
import { friendlyError } from '../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'EUR', name: 'Euro' },
  { code: 'SAR', name: 'Saudi Riyal' },
];

const WalletPage = () => {
  const { isDark } = useAppTheme();
  const { currency, format, walletTotal, currencyInfo } = useCurrency();

  const [wallet, setWallet] = useState({ usd: 0, aed: 0, euro: 0, sar: 0 });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minWithdrawal, setMinWithdrawal] = useState(10);
  const [processingDays, setProcessingDays] = useState('3-5');
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '', currency: 'USD',
    accountHolderName: '', bankName: '',
    accountNumber: '', routingNumber: '',
    iban: '', swiftCode: '',
  });

  const cardBg    = isDark ? '#161b22' : '#ffffff';
  const borderCls = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const divCls    = isDark ? 'divide-slate-700/50'  : 'divide-gray-200';
  const headingCls = isDark ? 'text-white'    : 'text-gray-900';
  const subCls     = isDark ? 'text-slate-400' : 'text-gray-500';

  const inputCls = isDark
    ? 'w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm'
    : 'w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

  const selectCls = isDark
    ? 'w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm'
    : 'w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

  const labelCls = isDark ? 'block text-xs font-medium text-slate-400 mb-1.5' : 'block text-xs font-medium text-gray-600 mb-1.5';

  useEffect(() => {
    fetchWalletData();
    fetch(`${API_BASE_URL}/admin/settings/public`)
      .then(r => r.json())
      .then(d => {
        if (d.minWithdrawalUSD) setMinWithdrawal(d.minWithdrawalUSD);
        if (d.withdrawalProcessingDays) setProcessingDays(d.withdrawalProcessingDays);
      })
      .catch(() => {});
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, withdrawalsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/wallet`),
        axios.get(`${API_BASE_URL}/wallet/withdrawals`),
      ]);
      setWallet(walletRes.data);
      setWithdrawals(withdrawalsRes.data);
    } catch {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/wallet/withdraw`, withdrawalForm);
      toast.success('Withdrawal request submitted!');
      setShowWithdrawalForm(false);
      setWithdrawalForm({ amount: '', currency: 'USD', accountHolderName: '', bankName: '', accountNumber: '', routingNumber: '', iban: '', swiftCode: '' });
      fetchWalletData();
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const getStatusCfg = (status) => {
    const dark = {
      processed: { cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', icon: <CheckCircle className="h-3.5 w-3.5" /> },
      approved:  { cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', icon: <CheckCircle className="h-3.5 w-3.5" /> },
      rejected:  { cls: 'bg-red-500/15 text-red-400 border border-red-500/25',             icon: <XCircle className="h-3.5 w-3.5" /> },
      pending:   { cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',       icon: <Clock className="h-3.5 w-3.5" /> },
    };
    const light = {
      processed: { cls: 'bg-green-100 text-green-700',   icon: <CheckCircle className="h-3.5 w-3.5" /> },
      approved:  { cls: 'bg-green-100 text-green-700',   icon: <CheckCircle className="h-3.5 w-3.5" /> },
      rejected:  { cls: 'bg-red-100 text-red-700',       icon: <XCircle className="h-3.5 w-3.5" /> },
      pending:   { cls: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3.5 w-3.5" /> },
    };
    const map = isDark ? dark : light;
    return map[status] || { cls: isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600', icon: <AlertCircle className="h-3.5 w-3.5" /> };
  };

  const balance = walletTotal(wallet);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  const FormField = ({ label, children }) => (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${headingCls}`}>Wallet</h1>
        <p className={`text-sm mt-1 ${subCls}`}>Manage your earnings and withdrawal requests</p>
      </div>

      {/* Balance Card */}
      <div className={`rounded-xl border ${borderCls} p-6 mb-6`} style={{ background: cardBg }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className={`text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              Displaying in {currencyInfo.flag} {currencyInfo.code}
              <span className="ml-1 opacity-60">(change in top bar)</span>
            </p>
            <p className={`text-3xl font-bold ${headingCls}`}>{format(balance, currency)}</p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{currencyInfo.name} balance</p>
          </div>
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
            <DollarSign className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Withdrawal Form Card */}
        <div className={`lg:col-span-2 rounded-xl border ${borderCls} p-6`} style={{ background: cardBg }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-base font-semibold ${headingCls}`}>Request Withdrawal</h2>
            <button
              onClick={() => setShowWithdrawalForm(v => !v)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-3.5 w-3.5" /> New Withdrawal
            </button>
          </div>

          {!showWithdrawalForm && (
            <div className={`text-center py-8 ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
              <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click "New Withdrawal" to request a payout</p>
            </div>
          )}

          {showWithdrawalForm && (
            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div className={`rounded-lg p-3 text-xs ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Available Balance:</span>
                  <span className="font-bold text-sm">{format(balance, currency)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Amount *">
                  <input
                    type="number" value={withdrawalForm.amount}
                    onChange={(e) => setWithdrawalForm(f => ({ ...f, amount: e.target.value }))}
                    required min={minWithdrawal} max={balance}
                    className={inputCls} placeholder={`Min $${minWithdrawal} USD`}
                  />
                  {parseFloat(withdrawalForm.amount) > 0 && parseFloat(withdrawalForm.amount) < minWithdrawal && (
                    <p className="mt-1 text-xs text-red-400">Minimum withdrawal is ${minWithdrawal} USD</p>
                  )}
                  {parseFloat(withdrawalForm.amount) > balance && (
                    <p className="mt-1 text-xs text-red-400">Amount cannot exceed available balance</p>
                  )}
                </FormField>
                <FormField label="Currency *">
                  <select value={withdrawalForm.currency} onChange={(e) => setWithdrawalForm(f => ({ ...f, currency: e.target.value }))} className={selectCls}>
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Account Holder Name *">
                  <input type="text" value={withdrawalForm.accountHolderName} onChange={(e) => setWithdrawalForm(f => ({ ...f, accountHolderName: e.target.value }))} required className={inputCls} placeholder="Enter account holder name" />
                </FormField>
                <FormField label="Bank Name *">
                  <input type="text" value={withdrawalForm.bankName} onChange={(e) => setWithdrawalForm(f => ({ ...f, bankName: e.target.value }))} required className={inputCls} placeholder="Enter bank name" />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Account Number *">
                  <input type="text" value={withdrawalForm.accountNumber} onChange={(e) => setWithdrawalForm(f => ({ ...f, accountNumber: e.target.value }))} required className={inputCls} placeholder="Enter account number" />
                </FormField>
                <FormField label="Routing Number *">
                  <input type="text" value={withdrawalForm.routingNumber} onChange={(e) => setWithdrawalForm(f => ({ ...f, routingNumber: e.target.value }))} required className={inputCls} placeholder="Enter routing number" />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="IBAN (Optional)">
                  <input type="text" value={withdrawalForm.iban} onChange={(e) => setWithdrawalForm(f => ({ ...f, iban: e.target.value }))} className={inputCls} placeholder="Enter IBAN" />
                </FormField>
                <FormField label="SWIFT Code (Optional)">
                  <input type="text" value={withdrawalForm.swiftCode} onChange={(e) => setWithdrawalForm(f => ({ ...f, swiftCode: e.target.value }))} className={inputCls} placeholder="Enter SWIFT code" />
                </FormField>
              </div>

              <p className={`text-xs pt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Minimum withdrawal: ${minWithdrawal} USD. Processed within {processingDays} business days.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalForm(false)}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isDark ? 'border border-slate-700 text-slate-300 hover:bg-slate-800' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Wallet Summary */}
        <div className={`rounded-xl border ${borderCls} p-6`} style={{ background: cardBg }}>
          <h3 className={`text-base font-semibold mb-4 ${headingCls}`}>Wallet Summary</h3>
          <div className={`divide-y ${divCls}`}>
            {[
              { label: 'Total Balance',            value: format(balance, currency), cls: headingCls },
              { label: 'Available for Withdrawal', value: format(balance, currency), cls: 'text-emerald-400' },
              { label: 'Pending Withdrawals',      value: withdrawals.filter(w => w.status === 'pending').length, cls: headingCls },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between items-center py-3">
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{label}</span>
                <span className={`text-sm font-semibold ${cls}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Withdrawal History */}
      <div className={`rounded-xl border overflow-hidden ${borderCls}`} style={{ background: cardBg }}>
        <div className={`px-6 py-4 border-b ${borderCls}`}>
          <h2 className={`text-base font-semibold ${headingCls}`}>Withdrawal History</h2>
        </div>
        <div className={`divide-y ${divCls}`}>
          {withdrawals.length > 0 ? (
            withdrawals.map((w) => {
              const cfg = getStatusCfg(w.status);
              return (
                <div key={w._id} className="p-5">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <h3 className={`text-base font-bold ${headingCls}`}>
                      {w.currency} {w.amount.toLocaleString()}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                      {cfg.icon}
                      {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                    </span>
                  </div>
                  <div className={`grid grid-cols-2 gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    <span><span className={`font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Bank:</span> {w.bankDetails.bankName}</span>
                    <span><span className={`font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Account:</span> {w.bankDetails.accountNumber}</span>
                    <span><span className={`font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Holder:</span> {w.bankDetails.accountHolderName}</span>
                    <span><span className={`font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Requested:</span> {new Date(w.createdAt).toLocaleDateString()}</span>
                  </div>
                  {w.adminNotes && (
                    <div className={`mt-3 rounded-lg p-3 text-xs ${isDark ? 'bg-slate-800/60 text-slate-400' : 'bg-gray-50 text-gray-600'}`}>
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Admin Note:</span> {w.adminNotes}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <CreditCard className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
              <h3 className={`text-base font-semibold mb-1 ${headingCls}`}>No withdrawals yet</h3>
              <p className={`text-sm ${subCls}`}>Submit your first withdrawal request to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
