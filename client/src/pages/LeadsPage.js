import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Eye, Edit2, Building2,
  CheckCircle, Clock, XCircle, AlertCircle, X, Save,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useAppTheme } from '../context/AppThemeContext';
import { friendlyError } from '../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const INDUSTRIES = [
  'Construction',
  'IT / Software Development',
  'Banking & Finance',
  'Real Estate',
  'Insurance',
  'Other',
];

const STATUSES = ['Pending', 'Contacted', 'Proposal Submitted', 'Deal Closed', 'Client Refused'];

const STATUS_DARK = {
  'Deal Closed':        { cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  'Client Refused':     { cls: 'bg-red-500/15 text-red-400 border border-red-500/25',             icon: <XCircle className="h-3.5 w-3.5" /> },
  'Contacted':          { cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',          icon: <AlertCircle className="h-3.5 w-3.5" /> },
  'Proposal Submitted': { cls: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',    icon: <Clock className="h-3.5 w-3.5" /> },
  'Pending':            { cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',       icon: <Clock className="h-3.5 w-3.5" /> },
};

const STATUS_LIGHT = {
  'Deal Closed':        { cls: 'bg-green-100 text-green-700',   icon: <CheckCircle className="h-3.5 w-3.5" /> },
  'Client Refused':     { cls: 'bg-red-100 text-red-700',       icon: <XCircle className="h-3.5 w-3.5" /> },
  'Contacted':          { cls: 'bg-blue-100 text-blue-700',     icon: <AlertCircle className="h-3.5 w-3.5" /> },
  'Proposal Submitted': { cls: 'bg-purple-100 text-purple-700', icon: <Clock className="h-3.5 w-3.5" /> },
  'Pending':            { cls: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3.5 w-3.5" /> },
};

const CAT_DARK = {
  'IT / Software Development': 'bg-blue-500/10 text-blue-400',
  'Banking & Finance':         'bg-emerald-500/10 text-emerald-400',
  'Real Estate':               'bg-violet-500/10 text-violet-400',
  'Construction':              'bg-orange-500/10 text-orange-400',
  'Insurance':                 'bg-teal-500/10 text-teal-400',
};

const CAT_LIGHT = {
  'IT / Software Development': 'bg-blue-100 text-blue-700',
  'Banking & Finance':         'bg-green-100 text-green-700',
  'Real Estate':               'bg-purple-100 text-purple-700',
  'Construction':              'bg-orange-100 text-orange-700',
  'Insurance':                 'bg-teal-100 text-teal-700',
};

const LeadsPage = () => {
  const { isDark } = useAppTheme();
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [viewLead, setViewLead] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const cardBg  = isDark ? '#161b22' : '#ffffff';
  const modalBg = isDark ? '#0d1117' : '#ffffff';
  const statusMap = isDark ? STATUS_DARK : STATUS_LIGHT;
  const catMap    = isDark ? CAT_DARK    : CAT_LIGHT;

  const inputCls = isDark
    ? 'w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm'
    : 'w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

  const selectCls = isDark
    ? 'w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm'
    : 'w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

  const labelCls  = isDark ? 'block text-xs font-medium text-slate-400 mb-1.5' : 'block text-xs font-medium text-gray-600 mb-1.5';
  const headingCls = isDark ? 'text-white' : 'text-gray-900';
  const subCls     = isDark ? 'text-slate-400' : 'text-gray-500';
  const borderCls  = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const dividerCls = isDark ? 'divide-slate-700/50' : 'divide-gray-200';
  const rowHoverCls = isDark ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50';

  const StatusBadge = ({ status }) => {
    const cfg = statusMap[status] || { cls: isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600', icon: <Clock className="h-3.5 w-3.5" /> };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
        {cfg.icon}{status || 'Unknown'}
      </span>
    );
  };

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
    } catch {
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
      companyName:     lead.companyName || '',
      contactPerson:   lead.contactPerson || '',
      email:           lead.email || '',
      phone:           lead.phone || '',
      category:        lead.category || '',
      description:     lead.description || '',
      hasReference:    !!lead.hasReference,
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
      toast.error(friendlyError(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  const ModalWrapper = ({ onClose, title, children }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl border ${borderCls} shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto`} style={{ background: modalBg }}>
        <div className={`sticky top-0 border-b ${borderCls} px-6 py-4 flex items-center justify-between rounded-t-2xl`} style={{ background: modalBg }}>
          <h3 className={`text-base font-bold ${headingCls}`}>{title}</h3>
          <button onClick={onClose} className={isDark ? 'text-slate-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-3">{children}</div>
      </div>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className={`rounded-lg p-3 ${isDark ? 'bg-slate-800/60' : 'bg-gray-50'}`}>
      <div className={`text-xs font-medium mb-0.5 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{label}</div>
      <div className={`text-sm ${headingCls}`}>{value || 'N/A'}</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${headingCls}`}>My Leads</h1>
          <p className={`text-sm mt-1 ${subCls}`}>Track and manage your referral leads</p>
        </div>
        <button
          onClick={() => navigate('/add-lead')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" /> Submit Lead
        </button>
      </div>

      {/* Filters */}
      <div className={`rounded-xl border ${borderCls} p-5 mb-5`} style={{ background: cardBg }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Search</label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={inputCls.replace('px-3', 'pl-9 pr-3')}
                placeholder="Search leads..."
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
              <option value="all">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectCls}>
              <option value="all">All Categories</option>
              {INDUSTRIES.filter(i => i !== 'Other').map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCategoryFilter('all'); }}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className={`rounded-xl border overflow-hidden ${borderCls}`} style={{ background: cardBg }}>
        {filteredLeads.length > 0 ? (
          <div className={`divide-y ${dividerCls}`}>
            {filteredLeads.map((lead) => (
              <div key={lead._id} className={`p-5 transition-colors ${rowHoverCls}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h3 className={`text-sm font-semibold ${headingCls}`}>{lead.companyName}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${catMap[lead.category] || (isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600')}`}>
                        {lead.category}
                      </span>
                      <StatusBadge status={lead.status} />
                    </div>
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-1.5 text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      <span><span className="font-medium">Contact:</span> {lead.contactPerson}</span>
                      <span><span className="font-medium">Email:</span> {lead.email}</span>
                      <span><span className="font-medium">Phone:</span> {lead.phone}</span>
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                      Submitted {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                    {lead.description && (
                      <p className={`mt-1.5 text-xs line-clamp-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{lead.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setViewLead(lead)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    {lead.status === 'Pending' && (
                      <button
                        onClick={() => openEdit(lead)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          isDark ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
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
            <Building2 className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
            <h3 className={`text-base font-semibold mb-1 ${headingCls}`}>
              {leads.length === 0 ? 'No leads yet' : 'No leads match your filters'}
            </h3>
            <p className={`text-sm mb-5 ${subCls}`}>
              {leads.length === 0 ? 'Start earning by submitting your first lead' : 'Try adjusting your search criteria'}
            </p>
            {leads.length === 0 && (
              <button
                onClick={() => navigate('/add-lead')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" /> Submit Your First Lead
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Lead Modal */}
      {viewLead && (
        <ModalWrapper onClose={() => setViewLead(null)} title="Lead Details">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${catMap[viewLead.category] || (isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600')}`}>
              {viewLead.category}
            </span>
            <StatusBadge status={viewLead.status} />
          </div>
          <InfoRow label="Company"   value={viewLead.companyName} />
          <InfoRow label="Contact"   value={viewLead.contactPerson} />
          <InfoRow label="Email"     value={viewLead.email} />
          <InfoRow label="Phone"     value={viewLead.phone} />
          <InfoRow label="Submitted" value={new Date(viewLead.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} />
          {viewLead.hasReference && viewLead.referencePerson && (
            <InfoRow label="Reference Person" value={viewLead.referencePerson} />
          )}
          {viewLead.description && <InfoRow label="Notes" value={viewLead.description} />}
          {viewLead.status === 'Pending' && (
            <button
              onClick={() => { setViewLead(null); openEdit(viewLead); }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Edit2 className="h-4 w-4" /> Edit This Lead
            </button>
          )}
        </ModalWrapper>
      )}

      {/* Edit Lead Modal */}
      {editLead && (
        <ModalWrapper onClose={() => setEditLead(null)} title="Edit Lead">
          <div className={`rounded-lg px-3 py-2 text-xs ${isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'}`}>
            Only <strong>Pending</strong> leads can be edited. Changes will be reviewed by our team.
          </div>

          {[
            { label: 'Company Name',    name: 'companyName',   type: 'text'  },
            { label: 'Contact Person',  name: 'contactPerson', type: 'text'  },
            { label: 'Email',           name: 'email',         type: 'email' },
            { label: 'Phone',           name: 'phone',         type: 'tel'   },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className={labelCls}>{label}</label>
              <input type={type} name={name} value={editForm[name] || ''} onChange={handleEditChange} className={inputCls} />
            </div>
          ))}

          <div>
            <label className={labelCls}>Industry</label>
            <select name="category" value={editForm.category} onChange={handleEditChange} className={selectCls}>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox" id="hasReference" name="hasReference"
              checked={editForm.hasReference} onChange={handleEditChange}
              className="h-4 w-4 rounded accent-emerald-500"
            />
            <label htmlFor="hasReference" className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Mention a reference for this lead
            </label>
          </div>
          {editForm.hasReference && (
            <div>
              <label className={labelCls}>Reference Person</label>
              <input type="text" name="referencePerson" value={editForm.referencePerson} onChange={handleEditChange} className={inputCls} placeholder="Enter reference person's name" />
            </div>
          )}

          <div>
            <label className={labelCls}>Notes / Details</label>
            <textarea
              name="description" value={editForm.description}
              onChange={handleEditChange} rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Any additional details..."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setEditLead(null)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'border border-slate-700 text-slate-300 hover:bg-slate-800' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
            </button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default LeadsPage;
