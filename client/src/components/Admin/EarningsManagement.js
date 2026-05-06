import React, { useState, useEffect, useMemo } from 'react';
import { Save, Users, RefreshCw, Search, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersAPI, walletAPI } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';

// Wallet currency → DB key mapping
const WALLET_MAP = { USD: 'usd', AED: 'aed', EUR: 'euro', SAR: 'sar' };

const AdminEarningsManagement = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const { currency, currencyInfo, walletTotal, format, rates } = useCurrency();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [search, users]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.getUsers();
        const body = res?.data;
        const userList = Array.isArray(body) ? body : (body?.data || []);
        const fetched = userList.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          wallet: {
            usd: u.wallet?.usd || 0,
            aed: u.wallet?.aed || 0,
            euro: u.wallet?.euro || 0,
            sar: u.wallet?.sar || 0,
          },
        }));
        setUsers(fetched);
      } catch {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // When a user is selected, pre-fill the field with their current balance in the selected currency
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    const total = walletTotal(user.wallet);
    setAmount(total.toFixed(2));
  };

  // When currency changes, re-convert the current amount to the new currency
  useEffect(() => {
    if (selectedUser) {
      const total = walletTotal(selectedUser.wallet);
      setAmount(total.toFixed(2));
    }
  }, [currency]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!selectedUser) { toast.error('Please select a user first'); return; }
    const entered = parseFloat(amount) || 0;

    // Determine which wallet field to update
    // If selected currency maps to a wallet field, store directly; otherwise convert to USD
    const walletKey = WALLET_MAP[currency];
    const storeCurrency = walletKey ? currency : 'USD';
    const storeKey = walletKey || 'usd';

    const inUSD = entered / (rates[currency] || 1);
    const storeVal = parseFloat((inUSD * (rates[storeCurrency] || 1)).toFixed(2));

    setLoading(true);
    try {
      await walletAPI.updateWalletBalance({
        userId: selectedUser.id,
        currency: storeCurrency,
        amount: storeVal,
        operation: 'set',
      });

      // Update local state
      const updatedWallet = { ...selectedUser.wallet, [storeKey]: storeVal };
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, wallet: updatedWallet } : u));
      setSelectedUser(prev => ({ ...prev, wallet: updatedWallet }));

      toast.success(`Earnings updated for ${selectedUser.name}`);
    } catch {
      toast.error('Failed to save earnings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 130px)' }}>
      {/* User list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-0">
        <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Select User</h3>
            <p className="text-xs text-gray-400">{filteredUsers.length} / {users.length} users</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading && users.length === 0 && <p className="text-sm text-gray-500 p-3">Loading users...</p>}
          {!loading && filteredUsers.length === 0 && (
            <p className="text-sm text-gray-500 p-3">{search ? 'No users match your search' : 'No users found'}</p>
          )}
          {filteredUsers.map(user => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border transition duration-150 ${
                selectedUser?.id === user.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-400">{user.email}</div>
              <div className="text-xs text-gray-500 mt-0.5">{format(walletTotal(user.wallet), currency)} total</div>
            </button>
          ))}
        </div>
      </div>

      {/* Earnings editor */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-800">
            {selectedUser ? `Earnings — ${selectedUser.name}` : 'Select a user to manage earnings'}
          </h3>
          {selectedUser && (
            <button
              onClick={() => setAmount('0')}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!isSuperAdmin ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                <Lock className="h-7 w-7 text-amber-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Super Admin access required</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Only Super Admins can modify user earnings. Contact your Super Admin to make changes.
              </p>
            </div>
          ) : selectedUser ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currency} Earnings
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium select-none">
                    {currencyInfo.symbol}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    onFocus={e => e.target.select()}
                    onBlur={e => {
                      const v = parseFloat(e.target.value);
                      setAmount(isNaN(v) ? '0.00' : v.toFixed(2));
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {!WALLET_MAP[currency] && (
                  <p className="text-xs text-amber-600 mt-1.5">
                    {currency} is not a wallet currency — amount will be converted and stored in USD.
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">Total after save</span>
                <span className="text-sm font-semibold text-gray-900">
                  {format(parseFloat(amount) || 0, currency)}
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {loading ? 'Saving...' : 'Save Earnings'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Select a user from the list to manage their earnings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEarningsManagement;
