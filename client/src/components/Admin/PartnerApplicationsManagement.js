import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users2, Search, X, ExternalLink,
  Building2, Globe, Phone, Mail, MapPin, Calendar,
  User, Briefcase, Linkedin, CheckCircle, Clock,
  XCircle, Eye, RefreshCw,
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: 'text-amber-600  bg-amber-50  border-amber-200',  icon: Clock        },
  reviewed: { label: 'Reviewed', color: 'text-blue-600   bg-blue-50   border-blue-200',   icon: Eye          },
  approved: { label: 'Approved', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-red-600    bg-red-50    border-red-200',    icon: XCircle      },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value, href }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="h-4 w-4 text-slate-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
      {href
        ? <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 mt-0.5 truncate">
            {value} <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        : <p className="text-sm text-slate-800 font-medium mt-0.5">{value || '—'}</p>
      }
    </div>
  </div>
);

/* ── Detail Modal ───────────────────────────────────────────────────── */
const DetailModal = ({ app, onClose, onStatusChange, updating }) => {
  if (!app) return null;

  const actions = Object.entries(STATUS_CONFIG)
    .filter(([s]) => s !== app.status)
    .map(([s, cfg]) => ({ status: s, ...cfg }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{app.companyName}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{app.city}, {app.country}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={app.status} />
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Section 1 */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Company Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Building2} label="Industry" value={app.industryService} />
              <InfoRow icon={Globe} label="Website" value={app.websiteUrl} href={app.websiteUrl} />
              <InfoRow icon={Phone} label="Company Phone" value={app.companyPhone} />
              <InfoRow icon={Calendar} label="Year Established" value={app.yearEstablished} />
              <InfoRow icon={User} label="Company Size" value={app.companySize || 'Not specified'} />
              <InfoRow icon={MapPin} label="Location" value={`${app.city}, ${app.country}`} />
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Contact Person</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={User} label="Full Name" value={app.contactFullName} />
              <InfoRow icon={Briefcase} label="Designation" value={app.designation} />
              <InfoRow icon={Mail} label="Email" value={app.contactEmail} href={`mailto:${app.contactEmail}`} />
              <InfoRow icon={Phone} label="Business Phone" value={app.businessPhone || 'Not provided'} />
              {app.linkedIn && (
                <InfoRow icon={Linkedin} label="LinkedIn" value="View Profile" href={app.linkedIn} />
              )}
            </div>
          </div>

          {/* Interested Industries */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Interested Industries</p>
            <div className="flex flex-wrap gap-2">
              {(app.interestedIndustries || []).map(ind => (
                <span key={ind} className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
                  {ind}
                </span>
              ))}
            </div>
          </div>

          {/* Applied date */}
          <p className="text-xs text-slate-400">
            Applied {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Status actions */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {actions.map(({ status, label, color }) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(app._id, status)}
                  disabled={updating}
                  className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-all disabled:opacity-50 ${color}`}
                >
                  {updating ? 'Updating…' : `Mark as ${label}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────────────── */
const PartnerApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected]         = useState(null);
  const [updating, setUpdating]         = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/partners/applications`, { headers });
      setApplications(data);
    } catch (err) {
      console.error('Error fetching partner applications:', err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleStatusChange = async (id, status) => {
    try {
      setUpdating(true);
      const { data } = await axios.put(`${API_BASE_URL}/partners/applications/${id}/status`, { status }, { headers });
      setApplications(prev => prev.map(a => a._id === id ? data : a));
      if (selected?._id === id) setSelected(data);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = applications.filter(a => {
    const q = search.toLowerCase();
    const matchesSearch =
      a.companyName.toLowerCase().includes(q) ||
      a.contactFullName.toLowerCase().includes(q) ||
      a.contactEmail.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.industryService.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Partner Applications</h2>
          <p className="text-sm text-slate-500 mt-0.5">{applications.length} total applications</p>
        </div>
        <button onClick={fetchApplications}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-colors">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {[['all', 'All', applications.length], ...Object.entries(STATUS_CONFIG).map(([s, cfg]) => [s, cfg.label, counts[s] || 0])].map(([val, label, count]) => (
          <button key={val} onClick={() => setStatusFilter(val)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
              statusFilter === val
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}>
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by company, contact, email, industry…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-white"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No applications found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Industry</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Interests</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Applied</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(app => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{app.companyName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{app.city}, {app.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{app.contactFullName}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">{app.contactEmail}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{app.industryService}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(app.interestedIndustries || []).slice(0, 2).map(i => (
                          <span key={i} className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{i}</span>
                        ))}
                        {app.interestedIndustries?.length > 2 && (
                          <span className="text-xs text-slate-400">+{app.interestedIndustries.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-xs text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => setSelected(app)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DetailModal
        app={selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
        updating={updating}
      />
    </div>
  );
};

export default PartnerApplicationsManagement;
