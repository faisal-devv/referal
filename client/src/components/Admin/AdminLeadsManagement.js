import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  DollarSign,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  ChevronDown,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const AdminLeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const leadStatuses = [
    'Pending',
    'Contacted',
    'Deal Closed',
    'Proposal Submitted',
    'Client Refused'
  ];

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Contacted': 'bg-blue-100 text-blue-800',
    'Deal Closed': 'bg-green-100 text-green-800',
    'Proposal Submitted': 'bg-indigo-100 text-indigo-800',
    'Client Refused': 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/admin/leads`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      
      // Transform the data to match the expected format
      const transformedLeads = data.map(lead => ({
        id: lead._id,
        fullName: lead.contactPerson,
        companyName: lead.companyName,
        email: lead.email,
        phone: lead.phone,
        industry: lead.category,
        hasReference: !!lead.hasReference,
        referencePerson: lead.referencePerson || '',
        status: lead.status,
        value: lead.value || 0,
        currency: lead.currency || 'USD',
        submittedBy: {
          id: lead.user._id,
          name: lead.user.name,
          email: lead.user.email
        },
        submittedAt: lead.createdAt,
        details: lead.description
      }));
      
      setLeads(transformedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/leads/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      // Update local state
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
      
      toast.success('Lead status updated successfully');
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
    }
  };

  const viewLeadDetails = (lead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  const formatDate = (dateString) => {
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
          <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
          <p className="text-gray-600 mt-1">Manage all submitted leads from users</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            Total: {leads.length} leads | Filtered: {filteredLeads.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                {leadStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.fullName}</div>
                      <div className="text-sm text-gray-500">{lead.companyName}</div>
                      <div className="text-xs text-gray-400">{lead.email}</div>
                      {lead.hasReference && lead.referencePerson && (
                        <div className="text-xs text-gray-500 mt-1">Ref: {lead.referencePerson}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.submittedBy.name}</div>
                        <div className="text-xs text-gray-500">ID: {lead.submittedBy.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.industry}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {lead.currency} {lead.value.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => viewLeadDetails(lead)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        const newStatus = prompt('Enter new status:', lead.status);
                        if (newStatus && leadStatuses.includes(newStatus)) {
                          updateLeadStatus(lead.id, newStatus);
                        }
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No leads have been submitted yet'}
            </p>
          </div>
        )}
      </div>

      {/* Lead Details Modal */}
      {showLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Lead Details</h3>
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Lead Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-sm text-gray-900">{selectedLead.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <p className="text-sm text-gray-900">{selectedLead.companyName}</p>
                  </div>
                  {selectedLead.hasReference && selectedLead.referencePerson && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference Person</label>
                      <p className="text-sm text-gray-900">{selectedLead.referencePerson}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{selectedLead.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-sm text-gray-900">{selectedLead.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <p className="text-sm text-gray-900">{selectedLead.industry}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <p className="text-sm text-gray-900">{selectedLead.currency} {selectedLead.value.toLocaleString()}</p>
                  </div>
                </div>

                {/* Submitted By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submitted By</label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedLead.submittedBy.name}</p>
                      <p className="text-xs text-gray-500">ID: {selectedLead.submittedBy.id}</p>
                      <p className="text-xs text-gray-500">{selectedLead.submittedBy.email}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lead Details</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedLead.details}
                  </p>
                </div>

                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[selectedLead.status]}`}>
                      {selectedLead.status}
                    </span>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {leadStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
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

export default AdminLeadsManagement;
