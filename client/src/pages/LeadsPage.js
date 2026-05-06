import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Eye, Edit2, Building2,
  CheckCircle, Clock, XCircle, AlertCircle, ArrowLeft, X, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import LeadForm from '../components/Leads/LeadForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const INDUSTRIES = [
  'Construction',
  'IT / Software Development',
  'Banking & Finance',
  'Real Estate',
  'Insurance',
  'Other',
];

const statusConfig = {
  'Deal Closed':        { color: 'text-green-600 bg-green-100',   icon: <CheckCircle className="h-3.5 w-3.5" /> },
  'Client Refused':     { color: 'text-red-600 bg-red-100',       icon: <XCircle className="h-3.5 w-3.5" /> },
  'Contacted':          { color: 'text-blue-600 bg-blue-100',     icon: <AlertCircle className="h-3.5 w-3.5" /> },
  'Proposal Submitted': { color: 'text-purple-600 bg-purple-100', icon: <Clock className="h-3.5 w-3.5" /> },
  'Pending':            { color: 'text-yellow-600 bg-yellow-100', icon: <Clock className="h-3.5 w-3.5" /> },
};

const categoryConfig = {
  'IT / Software Development': 'bg-blue-100 text-blue-600',
  'Banking & Finance':         'bg-green-100 text-green-600',
  'Real Estate':               'bg-purple-100 text-purple-600',
  'Construction':              'bg-orange-100 text-orange-600',
  'Insurance':                 'bg-teal-100 text-teal-600',
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { color: 'text-gray-600 bg-gray-100', icon: <Clock className="h-3.5 w-3.5" /> };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.icon}{status || 'Unknown'}
    </span>
  );
};

const LeadsPage = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [viewLead, setViewLead] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchLeads(); }, []);

  useEffect(() => {
    const refresh = () => fetchLeads();
    window.addEventListener('storage', refresh);
    window.addEventListener('leadSubmitted', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('leadSubmitted', refresh);
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { filterLeads(); }, [leads, searchTerm, statusFilter, categoryFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/leads`);
      setLeads(response.data);
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
      filtered = filtered.filter(l =>
        l.companyName?.toLowerCase().includes(term) ||
        l.contactPerson?.toLowerCase().includes(term) ||
        l.email?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(l => l.status === statusFilter);
    if (categoryFilter !== 'all') filtered = filtered.filter(l => l.category === categoryFilter);
    setFilteredLeads(filtered);
  };

  const openEdit = (lead) => {
    setEditLead(lead);
    setEditForm({
      companyName:    lead.companyName || '',
      contactPerson:  lead.contactPerson || '',
      email:          lead.email || '',
      phone:          lead.phone || '',
      category:       lead.category || '',
      description:    lead.description || '',
      hasReference:   !!lead.hasReference,
      referencePerson: lead.referencePerson || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/leads/${editLead._id}`, editForm);
      setLeads(prev => prev.map(l => l._id === editLead._id ? res.data : l));
      toast.success('Lead updated successfully');
      setEditLead(null);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update lead';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
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
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-3">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Leads</h1>
              <p className="text-gray-600 mt-2">Track and manage your referral leads</p>
            </div>
            <button
              onClick={() => setShowLeadForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition duration-200"
            >
              <Plus className="h-5 w-5 mr-2" /> Submit Lead
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search leads..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Contacted">Contacted</option>
                <option value="Proposal Submitted">Proposal Submitted</option>
                <option value="Deal Closed">Deal Closed</option>
                <option value="Client Refused">Client Refused</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Categories</option>
                {INDUSTRIES.filter(i => i !== 'Other').map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredLeads.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <div key={lead._id} className="p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{lead.companyName}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryConfig[lead.category] || 'bg-gray-100 text-gray-600'}`}>
                          {lead.category}
                        </span>
                        <StatusBadge status={lead.status} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                        <span><span className="font-medium">Contact:</span> {lead.contactPerson}</span>
                        <span><span className="font-medium">Email:</span> {lead.email}</span>
                        <span><span className="font-medium">Phone:</span> {lead.phone}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Submitted: {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                      {lead.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{lead.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setViewLead(lead)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      {lead.status === 'Pending' && (
                        <button
                          onClick={() => openEdit(lead)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {leads.length === 0 ? 'No leads yet' : 'No leads match your filters'}
              </h3>
              <p className="text-gray-500 mb-6">
                {leads.length === 0 ? 'Start earning by submitting your first lead' : 'Try adjusting your search criteria'}
              </p>
              {leads.length === 0 && (
                <button onClick={() => setShowLeadForm(true)} className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition duration-200">
                  <Plus className="h-5 w-5 mr-2" /> Submit Your First Lead
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit Lead Modal */}
      {showLeadForm && (
        <LeadForm onClose={() => setShowLeadForm(false)} onSuccess={() => { setShowLeadForm(false); fetchLeads(); }} />
      )}

      {/* View Lead Modal */}
      {viewLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-900">Lead Details</h3>
              <button onClick={() => setViewLead(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryConfig[viewLead.category] || 'bg-gray-100 text-gray-600'}`}>
                  {viewLead.category}
                </span>
                <StatusBadge status={viewLead.status} />
              </div>
              {[
                { label: 'Company',  value: viewLead.companyName },
                { label: 'Contact',  value: viewLead.contactPerson },
                { label: 'Email',    value: viewLead.email },
                { label: 'Phone',    value: viewLead.phone },
                { label: 'Submitted', value: new Date(viewLead.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-0.5">{label}</div>
                  <div className="text-sm text-gray-900">{value || '—'}</div>
                </div>
              ))}
              {viewLead.hasReference && viewLead.referencePerson && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-0.5">Reference Person</div>
                  <div className="text-sm text-gray-900">{viewLead.referencePerson}</div>
                </div>
              )}
              {viewLead.description && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-0.5">Notes</div>
                  <div className="text-sm text-gray-900">{viewLead.description}</div>
                </div>
              )}
              {viewLead.status === 'Pending' && (
                <button
                  onClick={() => { setViewLead(null); openEdit(viewLead); }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
                >
                  <Edit2 className="h-4 w-4" /> Edit This Lead
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-900">Edit Lead</h3>
              <button onClick={() => setEditLead(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700">
                Only <strong>Pending</strong> leads can be edited. Changes will be reviewed by our team.
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text" name="companyName" value={editForm.companyName}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text" name="contactPerson" value={editForm.contactPerson}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" name="email" value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel" name="phone" value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  name="category" value={editForm.category}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              {/* Has Reference */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox" id="hasReference" name="hasReference"
                  checked={editForm.hasReference} onChange={handleEditChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="hasReference" className="text-sm text-gray-700">Mention a reference for this lead</label>
              </div>
              {editForm.hasReference && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference Person</label>
                  <input
                    type="text" name="referencePerson" value={editForm.referencePerson}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter reference person's name"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Details</label>
                <textarea
                  name="description" value={editForm.description}
                  onChange={handleEditChange} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  placeholder="Any additional details about this lead…"
                />
              </div>

              {/* Save / Cancel */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditLead(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving…' : <><Save className="h-4 w-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
