import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  CheckCircle,
  Search,
  X,
  FileText,
  ShieldCheck,
  Ban
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usersAPI, leadsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const roleBadge = (role) => {
  if (role === 'superadmin') return 'bg-amber-100 text-amber-800';
  if (role === 'admin') return 'bg-purple-100 text-purple-800';
  return 'bg-blue-100 text-blue-800';
};

const AdminUsersManagement = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [savingRole, setSavingRole] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { filterUsers(); }, [users, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, leadsRes] = await Promise.all([
        usersAPI.getUsers(),
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
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.id.toLowerCase().includes(term)
      );
    }
    if (statusFilter === 'active') filtered = filtered.filter(u => u.isActive);
    else if (statusFilter === 'inactive') filtered = filtered.filter(u => !u.isActive);
    else if (statusFilter === 'admin') filtered = filtered.filter(u => u.role === 'admin');
    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId, currentlyActive) => {
    setTogglingStatus(true);
    try {
      await usersAPI.updateUserStatus(userId, { isActive: !currentlyActive });

      const updated = (u) => u.id === userId ? { ...u, isActive: !currentlyActive } : u;
      setUsers(prev => prev.map(updated));
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => ({ ...prev, isActive: !currentlyActive }));
      }
      toast.success(`User ${currentlyActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setTogglingStatus(false);
    }
  };

  const changeUserRole = async (userId, newRole) => {
    setSavingRole(true);
    try {
      await usersAPI.updateUserRole(userId, { role: newRole });
      const updated = (u) => u.id === userId ? { ...u, role: newRole } : u;
      setUsers(prev => prev.map(updated));
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => ({ ...prev, role: newRole }));
      }
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setSavingRole(false);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleBadge(user.role)}`}>
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
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>{user.totalLeads} leads</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{user.successfulLeads} successful</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.totalLeads > 0 ? Math.round((user.successfulLeads / user.totalLeads) * 100) : 0}% rate
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${user.totalEarnings.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewUserDetails(user)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          user.isActive
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {user.isActive
                          ? <><Ban className="h-3.5 w-3.5" /> Deactivate</>
                          : <><ShieldCheck className="h-3.5 w-3.5" /> Activate</>
                        }
                      </button>
                    </div>
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
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No users have been registered yet'}
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-blue-700">{selectedUser.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h4>
                  <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">User ID</div>
                  <div className="text-sm font-mono text-gray-900 break-all">{selectedUser.id}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">Joined</div>
                  <div className="text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">Status</div>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">Role</div>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${roleBadge(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {/* Edit controls */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">Edit Account</h4>

                {/* Role change — superadmin only */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 w-20 flex-shrink-0">Role</label>
                  {isSuperAdmin ? (
                    <>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => changeUserRole(selectedUser.id, e.target.value)}
                        disabled={savingRole}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                      {savingRole && <span className="text-xs text-gray-400">Saving…</span>}
                    </>
                  ) : (
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${roleBadge(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  )}
                </div>

                {/* Status toggle */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 w-20 flex-shrink-0">Status</label>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => toggleUserStatus(selectedUser.id, selectedUser.isActive)}
                    disabled={togglingStatus}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                      selectedUser.isActive
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    }`}
                  >
                    {selectedUser.isActive
                      ? <><Ban className="h-4 w-4" /> Deactivate</>
                      : <><ShieldCheck className="h-4 w-4" /> Activate</>
                    }
                  </button>
                  {togglingStatus && <span className="text-xs text-gray-400">Saving…</span>}
                </div>
              </div>

              {/* Activity Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Activity Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{selectedUser.totalLeads}</div>
                    <div className="text-xs text-gray-500">Total Leads</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{selectedUser.successfulLeads}</div>
                    <div className="text-xs text-gray-500">Successful</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {selectedUser.totalLeads > 0 ? Math.round((selectedUser.successfulLeads / selectedUser.totalLeads) * 100) : 0}%
                    </div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">${selectedUser.totalEarnings.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Total Earnings</div>
                  </div>
                </div>
              </div>

              {/* Wallet Balance */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Wallet Balance</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'USD', value: `$${selectedUser.wallet.usd.toFixed(2)}` },
                    { label: 'AED', value: `AED ${selectedUser.wallet.aed.toFixed(2)}` },
                    { label: 'EUR', value: `EUR ${selectedUser.wallet.euro.toFixed(2)}` },
                    { label: 'SAR', value: `SAR ${selectedUser.wallet.sar.toFixed(2)}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">{label}</div>
                      <div className="text-sm font-bold text-gray-900">{value}</div>
                    </div>
                  ))}
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
