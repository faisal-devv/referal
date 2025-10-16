import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  Calendar, 
  DollarSign,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Search,
  Filter,
  X,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usersAPI, leadsAPI } from '../../services/api';

const AdminUsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch users and all leads (admin) to compute simple per-user stats
      const [usersRes, leadsRes] = await Promise.all([
        usersAPI.getUsers(),
        // If leads fetch fails (permissions, etc.), continue with empty list
        leadsAPI.getAllLeads().catch(() => ({ data: [] }))
      ]);

      const leads = Array.isArray(leadsRes?.data) ? leadsRes.data : [];

      const mappedUsers = (usersRes?.data || []).map((u) => {
        const userLeads = leads.filter((l) => {
          const leadUserId = typeof l.user === 'object' && l.user !== null ? l.user._id : l.user;
          return leadUserId?.toString() === u._id?.toString();
        });
        const successfulLeads = userLeads.filter((l) => l.status === 'Deal Closed').length;
        const totalEarnings = userLeads.reduce((sum, l) => sum + (Number(l.commission) || 0), 0);

        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          isActive: u.isActive,
          createdAt: u.createdAt,
          // Backend doesn't currently track lastLogin; fall back to createdAt
          lastLogin: u.createdAt,
          totalLeads: userLeads.length,
          successfulLeads,
          totalEarnings,
          wallet: {
            usd: u.wallet?.usd || 0,
            aed: u.wallet?.aed || 0,
            euro: u.wallet?.euro || 0,
            sar: u.wallet?.sar || 0
          }
        };
      });

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(user => user.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(user => !user.isActive);
    } else if (statusFilter === 'admin') {
      filtered = filtered.filter(user => user.role === 'admin');
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      await usersAPI.updateUserStatus(userId, { isActive: !user.isActive });

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, isActive: !user.isActive } : u
        )
      );

      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-gray-600 mt-1">Manage all registered users and their accounts</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            Total: {users.length} users | Active: {users.filter(u => u.isActive).length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="inactive">Inactive Users</option>
            <option value="admin">Admin Users</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>{user.totalLeads} leads</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Joined: {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{user.successfulLeads} successful</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.totalLeads > 0 ? Math.round((user.successfulLeads / user.totalLeads) * 100) : 0}% success rate
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${user.totalEarnings.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => viewUserDetails(user)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      title={user.isActive ? 'Deactivate User' : 'Activate User'}
                    >
                      {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No users have been registered yet'}
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joined</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Activity Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{selectedUser.totalLeads}</div>
                      <div className="text-xs text-gray-500">Total Leads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{selectedUser.successfulLeads}</div>
                      <div className="text-xs text-gray-500">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {selectedUser.totalLeads > 0 ? Math.round((selectedUser.successfulLeads / selectedUser.totalLeads) * 100) : 0}%
                      </div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">${selectedUser.totalEarnings.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Total Earnings</div>
                    </div>
                  </div>
                </div>

                {/* Wallet Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Wallet Balance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-500">USD</div>
                      <div className="text-sm font-bold">${selectedUser.wallet.usd.toLocaleString()}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-500">AED</div>
                      <div className="text-sm font-bold">د.إ {selectedUser.wallet.aed.toLocaleString()}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-500">EUR</div>
                      <div className="text-sm font-bold">€{selectedUser.wallet.euro.toLocaleString()}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-500">SAR</div>
                      <div className="text-sm font-bold">ر.س {selectedUser.wallet.sar.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersManagement;
