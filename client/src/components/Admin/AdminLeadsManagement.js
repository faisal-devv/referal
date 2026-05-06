import React, { useState, useEffect } from 'react';
import {
  FileText,
  User,
  Eye,
  Edit2,
  Save,
  Search,
  ChevronDown,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const leadStatuses = [
  'Pending',
  'Contacted',
  'Proposal Submitted',
  'Deal Closed',
  'Client Refused',
];

const statusColors = {
  'Pending':            'bg-yellow-100 text-yellow-800',
  'Contacted':          'bg-blue-100 text-blue-800',
  'Deal Closed':        'bg-green-100 text-green-800',
  'Proposal Submitted': 'bg-indigo-100 text-indigo-800',
  'Client Refused':     'bg-red-100 text-red-800',
};

const AdminLeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const INDUSTRIES = [
    'Construction', 'IT / Software Development', 'Banking & Finance',
    'Real Estate', 'Insurance', 'Other',
  ];

  useEffect(() => { fetchLeads(); }, []);
  useEffect(() => { filterLeads(); }, [leads, searchTerm, statusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/leads`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();

      const transformed = data
        .filter(lead => lead && lead._id)
        .map(lead => ({
          id: lead._id,
          fullName: lead.contactPerson || '',
          companyName: lead.companyName || '',
          email: lead.email || '',
          phone: lead.phone || '',
          industry: lead.category || '',
          hasReference: !!lead.hasReference,
          referencePerson: lead.referencePerson || '',
          status: lead.status || 'Pending',
          value: lead.value || 0,
          currency: lead.currency || 'USD',
          submittedBy: lead.user ? {
            id: lead.user._id,
            name: lead.user.name || 'Unknown',
            email: lead.user.email || ''
          } : { id: '', name: 'Unknown User', email: '' },
          submittedAt: lead.createdAt,
          details: lead.description || ''
        }));

      setLeads(transformed);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        (lead.fullName || '').toLowerCase().includes(term) ||
        (lead.companyName || '').toLowerCase().includes(term) ||
        (lead.submittedBy.name || '').toLowerCase().includes(term) ||
        (lead.industry || '').toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    setUpdatingId(leadId);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/leads/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update lead status');

      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => ({ ...prev, status: newStatus }));
      }
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const openEdit = (lead) => {
    setEditLead(lead);
    setEditForm({
      companyName:     lead.companyName,
      contactPerson:   lead.fullName,
      email:           lead.email,
      phone:           lead.phone,
      category:        lead.industry,
      description:     lead.details,
      hasReference:    lead.hasReference,
      referencePerson: lead.referencePerson,
      value:           lead.value,
      currency:        lead.currency,
      status:          lead.status,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/leads/${editLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editForm)
      });
      if (!response.ok) throw new Error('Failed to save');

      // Update local state with edited values
      const updatedLead = {
        ...editLead,
        companyName:     editForm.companyName,
        fullName:        editForm.contactPerson,
        email:           editForm.email,
        phone:           editForm.phone,
        industry:        editForm.category,
        details:         editForm.description,
        hasReference:    editForm.hasReference,
        referencePerson: editForm.referencePerson,
        value:           Number(editForm.value),
        currency:        editForm.currency,
        status:          editForm.status,
      };
      setLeads(prev => prev.map(l => l.id === editLead.id ? updatedLead : l));
      if (selectedLead?.id === editLead.id) setSelectedLead(updatedLead);
      toast.success('Lead updated successfully');
      setEditLead(null);
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Failed to save lead');
    } finally {
      setSaving(false);
    }
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
        <span className="mt-4 sm:mt-0 text-sm text-gray-500">
          Total: {leads.length} | Filtered: {filteredLeads.length}
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{lead.fullName}</div>
                    <div className="text-sm text-gray-500">{lead.companyName}</div>
                    <div className="text-xs text-gray-400">{lead.email}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {lead.hasReference && lead.referencePerson && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          <User className="h-3 w-3" />
                          {lead.referencePerson}
                        </span>
                      )}
                      {lead.details && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded" title={lead.details}>
                          <FileText className="h-3 w-3" />
                          Notes
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-700">
                          {lead.submittedBy.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.submittedBy.name}</div>
                        <div className="text-xs text-gray-500">{lead.submittedBy.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.industry}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lead.currency} {lead.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedLead(lead); setShowLeadModal(true); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => openEdit(lead)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                      >
                        {leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
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
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No leads have been submitted yet'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Lead Modal */}
      {editLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-900">Edit Lead</h3>
              <button onClick={() => setEditLead(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input type="text" name="companyName" value={editForm.companyName} onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input type="text" name="contactPerson" value={editForm.contactPerson} onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={editForm.email} onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" name="phone" value={editForm.phone} onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select name="category" value={editForm.category} onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input type="number" name="value" min="0" value={editForm.value} onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select name="currency" value={editForm.currency} onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                    {['USD','AED','EUR','SAR'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={editForm.status} onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                  {leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="editHasRef" name="hasReference" checked={editForm.hasReference} onChange={handleEditChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <label htmlFor="editHasRef" className="text-sm text-gray-700">Has a reference person</label>
              </div>
              {editForm.hasReference && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference Person</label>
                  <input type="text" name="referencePerson" value={editForm.referencePerson} onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditLead(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleEditSave} disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium disabled:opacity-50">
                  {saving ? 'Saving…' : <><Save className="h-4 w-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-900">Lead Details</h3>
              <button onClick={() => setShowLeadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Lead info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name',  value: selectedLead.fullName },
                  { label: 'Company',    value: selectedLead.companyName },
                  { label: 'Email',      value: selectedLead.email },
                  { label: 'Phone',      value: selectedLead.phone },
                  { label: 'Industry',   value: selectedLead.industry },
                  { label: 'Value',      value: `${selectedLead.currency} ${selectedLead.value.toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
                    <div className="text-sm text-gray-900">{value || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Reference — always shown */}
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Reference</div>
                {selectedLead.hasReference ? (
                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <User className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-blue-600 font-medium mb-0.5">Reference provided</div>
                      <div className="text-sm font-semibold text-blue-900">
                        {selectedLead.referencePerson || '—'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-400">
                    <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    No reference provided for this lead
                  </div>
                )}
              </div>

              {/* Details / notes — always shown */}
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  What the client is looking for
                </div>
                {selectedLead.details ? (
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                    {selectedLead.details}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3 italic">
                    No additional details were provided.
                  </p>
                )}
              </div>

              {/* Submitted By */}
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Submitted By</div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-700">
                      {selectedLead.submittedBy.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{selectedLead.submittedBy.name}</div>
                    <div className="text-xs text-gray-500">{selectedLead.submittedBy.email}</div>
                    <div className="text-xs text-gray-400 font-mono">{selectedLead.submittedBy.id}</div>
                  </div>
                </div>
              </div>

              {/* Status update section */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="text-sm font-semibold text-gray-700">Update Status</div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500 w-24 flex-shrink-0">Current</div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[selectedLead.status]}`}>
                    {selectedLead.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500 w-24 flex-shrink-0">Change to</div>
                  <select
                    value={selectedLead.status}
                    disabled={updatingId === selectedLead.id}
                    onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  >
                    {leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {updatingId === selectedLead.id && (
                    <span className="text-xs text-gray-400">Saving…</span>
                  )}
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
