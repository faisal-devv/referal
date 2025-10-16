import React, { useState, useEffect } from 'react';
import { DollarSign, Save, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersAPI, walletAPI } from '../../services/api';

const AdminEarningsManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [earnings, setEarnings] = useState({
    usd: 0,
    aed: 0,
    euro: 0,
    sar: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.getUsers();
        const fetchedUsers = (res?.data || []).map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          wallet: {
            usd: u.wallet?.usd || 0,
            aed: u.wallet?.aed || 0,
            euro: u.wallet?.euro || 0,
            sar: u.wallet?.sar || 0
          }
        }));
        setUsers(fetchedUsers);
      } catch (err) {
        console.error('Failed to load users:', err);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setEarnings({
      usd: user.wallet?.usd || 0,
      aed: user.wallet?.aed || 0,
      euro: user.wallet?.euro || 0,
      sar: user.wallet?.sar || 0
    });
  };

  const handleEarningsChange = (currency, value) => {
    const numValue = parseFloat(value) || 0;
    setEarnings(prev => ({
      ...prev,
      [currency]: numValue
    }));
  };

  const handleSaveEarnings = async () => {
    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }

    setLoading(true);
    try {
      const updates = [
        { currency: 'USD', amount: Number(earnings.usd) || 0 },
        { currency: 'AED', amount: Number(earnings.aed) || 0 },
        { currency: 'EUR', amount: Number(earnings.euro) || 0 },
        { currency: 'SAR', amount: Number(earnings.sar) || 0 }
      ];

      await Promise.all(
        updates.map(u => walletAPI.updateWalletBalance({
          userId: selectedUser.id,
          currency: u.currency,
          amount: u.amount,
          operation: 'set'
        }))
      );

      // Reflect changes locally
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? {
        ...u,
        wallet: {
          usd: updates[0].amount,
          aed: updates[1].amount,
          euro: updates[2].amount,
          sar: updates[3].amount
        }
      } : u));

      setSelectedUser(prev => prev ? {
        ...prev,
        wallet: {
          usd: updates[0].amount,
          aed: updates[1].amount,
          euro: updates[2].amount,
          sar: updates[3].amount
        }
      } : prev);

      toast.success(`Earnings updated for ${selectedUser.name}`);
    } catch (error) {
      console.error('Error saving earnings:', error);
      toast.error('Failed to save earnings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetEarnings = () => {
    setEarnings({
      usd: 0,
      aed: 0,
      euro: 0,
      sar: 0
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Earnings Management</h2>
            <p className="text-gray-600 mt-1">Manage user earnings and incentives</p>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select User</h3>
          <div className="space-y-2">
            {loading && users.length === 0 && (
              <div className="text-sm text-gray-500">Loading users...</div>
            )}
            {!loading && users.length === 0 && (
              <div className="text-sm text-gray-500">No users found</div>
            )}
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`w-full text-left p-3 rounded-lg border transition duration-200 ${
                  selectedUser?.id === user.id
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Earnings Management */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedUser ? `Earnings for ${selectedUser.name}` : 'Select a user to manage earnings'}
            </h3>
            {selectedUser && (
              <button
                onClick={handleResetEarnings}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {selectedUser ? (
            <div className="space-y-4">
              {/* USD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  USD Earnings
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={earnings.usd}
                    onChange={(e) => handleEarningsChange('usd', e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* AED */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AED Earnings
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">د.إ</span>
                  <input
                    type="number"
                    value={earnings.aed}
                    onChange={(e) => handleEarningsChange('aed', e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* EUR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EUR Earnings
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    value={earnings.euro}
                    onChange={(e) => handleEarningsChange('euro', e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* SAR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SAR Earnings
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">ر.س</span>
                  <input
                    type="number"
                    value={earnings.sar}
                    onChange={(e) => handleEarningsChange('sar', e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Total Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Earnings:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${((earnings.usd || 0) + (earnings.aed || 0) + (earnings.euro || 0) + (earnings.sar || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveEarnings}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  <span>{loading ? 'Saving...' : 'Save Earnings'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a user from the list to manage their earnings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEarningsManagement;
