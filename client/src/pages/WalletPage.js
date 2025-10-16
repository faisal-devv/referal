import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Download, 
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const WalletPage = () => {
  const [wallet, setWallet] = useState({
    usd: 0,
    aed: 0,
    euro: 0,
    sar: 0  // Changed from riyal to sar for consistency
  });
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    currency: 'USD',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    iban: '',
    swiftCode: ''
  });

  // Update withdrawal form currency when selected currency changes
  useEffect(() => {
    setWithdrawalForm(prev => ({
      ...prev,
      currency: selectedCurrency
    }));
  }, [selectedCurrency]);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletResponse, withdrawalsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/wallet`),
        axios.get(`${API_BASE_URL}/wallet/withdrawals`)
      ]);
      
      setWallet(walletResponse.data);
      setWithdrawals(withdrawalsResponse.data);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/wallet/withdraw`, withdrawalForm);
      toast.success('Withdrawal request submitted successfully!');
      setShowWithdrawalForm(false);
      setWithdrawalForm({
        amount: '',
        currency: 'USD',
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        iban: '',
        swiftCode: ''
      });
      fetchWalletData();
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' }
  ];

  // Get current balance for selected currency
  const getCurrentBalance = () => {
    const currencyKey = selectedCurrency.toLowerCase();
    return wallet[currencyKey] || 0;
  };

  // Get current currency info
  const getCurrentCurrency = () => {
    return currencies.find(c => c.code === selectedCurrency) || currencies[0];
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
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600 mt-2">
            Manage your earnings and withdrawal requests
          </p>
        </div>

        {/* Wallet Balance Card with Currency Selector */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Currency Selector */}
              <div className="flex items-center gap-4">
                <label htmlFor="currency-select" className="text-sm font-medium text-gray-700">
                  Select Currency:
                </label>
                <div className="relative">
                  <select
                    id="currency-select"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">{getCurrentCurrency().name}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {getCurrentCurrency().symbol}{getCurrentBalance().toFixed(2)}
                  </p>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Request Withdrawal</h2>
                <button
                  onClick={() => setShowWithdrawalForm(!showWithdrawalForm)}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Withdrawal
                </button>
              </div>

              {showWithdrawalForm && (
                <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                  {/* Available Balance Display */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Available Balance:</span>
                      <span className="text-lg font-bold text-blue-900">
                        {getCurrentCurrency().symbol}{getCurrentBalance().toFixed(2)} {withdrawalForm.currency}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount *
                      </label>
                      <input
                        type="number"
                        value={withdrawalForm.amount}
                        onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value})}
                        required
                        min="1"
                        max={getCurrentBalance()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter amount"
                      />
                      {parseFloat(withdrawalForm.amount) > getCurrentBalance() && (
                        <p className="mt-1 text-sm text-red-600">
                          Amount cannot exceed available balance
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency *
                      </label>
                      <select
                        value={withdrawalForm.currency}
                        onChange={(e) => setWithdrawalForm({...withdrawalForm, currency: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {currencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        value={withdrawalForm.accountHolderName}
                        onChange={(e) => setWithdrawalForm({...withdrawalForm, accountHolderName: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter account holder name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        value={withdrawalForm.bankName}
                        onChange={(e) => setWithdrawalForm({...withdrawalForm, bankName: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter bank name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        value={withdrawalForm.accountNumber}
                        onChange={(e) => setWithdrawalForm({...withdrawalForm, accountNumber: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter account number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Routing Number *
                      </label>
                      <input
                        type="text"
                        value={withdrawalForm.routingNumber}
                        onChange={(e) => setWithdrawalForm({...withdrawalForm, routingNumber: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter routing number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IBAN (Optional)
                      </label>
                      <input
                        type="text"
                        value={withdrawalForm.iban}
                        onChange={(e) => setWithdrawalForm({...withdrawalForm, iban: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter IBAN"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SWIFT Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={withdrawalForm.swiftCode}
                        onChange={(e) => setWithdrawalForm({...withdrawalForm, swiftCode: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter SWIFT code"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowWithdrawalForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition duration-200"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Wallet Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Balance</span>
                <span className="font-semibold">
                  ${(wallet.usd + wallet.aed + wallet.euro + wallet.riyal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available for Withdrawal</span>
                <span className="font-semibold text-green-600">
                  ${(wallet.usd + wallet.aed + wallet.euro + wallet.riyal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Withdrawals</span>
                <span className="font-semibold">
                  {withdrawals.filter(w => w.status === 'pending').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Withdrawal History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {withdrawals.length > 0 ? (
              withdrawals.map((withdrawal) => (
                <div key={withdrawal._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {withdrawal.currency} {withdrawal.amount.toLocaleString()}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                          <span className="mr-1">{getStatusIcon(withdrawal.status)}</span>
                          {getStatusText(withdrawal.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Bank:</span> {withdrawal.bankDetails.bankName}
                        </div>
                        <div>
                          <span className="font-medium">Account:</span> {withdrawal.bankDetails.accountNumber}
                        </div>
                        <div>
                          <span className="font-medium">Holder:</span> {withdrawal.bankDetails.accountHolderName}
                        </div>
                        <div>
                          <span className="font-medium">Requested:</span> {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {withdrawal.adminNotes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Admin Note:</span> {withdrawal.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawals yet</h3>
                <p className="text-gray-500">
                  Submit your first withdrawal request to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
