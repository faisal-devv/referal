import React, { useEffect, useMemo, useState } from 'react';
import {
  Eye, Search, X, CheckCircle, Loader2, MessageSquare,
  ChevronDown, Mail, User, Clock, Tag,
} from 'lucide-react';
import { queriesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  'New':         'bg-indigo-50 text-indigo-700 border border-indigo-100',
  'In Progress': 'bg-amber-50  text-amber-700  border border-amber-100',
  'Resolved':    'bg-green-50  text-green-700  border border-green-100',
  'Closed':      'bg-gray-100  text-gray-600   border border-gray-200',
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-pink-100   text-pink-700',
  'bg-amber-100  text-amber-700',
  'bg-teal-100   text-teal-700',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const AdminQueriesManagement = () => {
  const [loading, setLoading]       = useState(true);
  const [queries, setQueries]       = useState([]);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [selected, setSelected]     = useState(null);
  const [updating, setUpdating]     = useState(false);

  useEffect(() => { fetchQueries(); }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await queriesAPI.getQueries();
      setQueries(res.data || []);
    } catch (err) {
      console.error('Error fetching queries', err);
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => queries.filter(q => {
    const matchSearch = [q.name, q.email, q.subject, q.message]
      .filter(Boolean).some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  }), [queries, search, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      setUpdating(true);
      await queriesAPI.updateStatus(id, { status });
      toast.success('Status updated');
      setQueries(prev => prev.map(q => q._id === id ? { ...q, status } : q));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Queries</h2>
          <p className="text-gray-500 mt-0.5 text-sm">Contact form submissions from users and visitors</p>
        </div>
        <span className="text-sm text-gray-400">
          Total: {queries.length} &nbsp;|&nbsp; Filtered: {filtered.length}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, subject…"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
            className="appearance-none bg-white text-gray-900 border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sender</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(q => (
              <tr key={q._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${avatarColor(q.name)}`}>
                      {initials(q.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{q.name}</div>
                      <div className="text-xs text-gray-400 truncate">{q.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-700 truncate max-w-xs">{q.subject || '—'}</p>
                  {q.message && (
                    <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{q.message}</p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[q.status] || STATUS_COLORS['New']}`}>
                    {q.status || 'New'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(q.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => setSelected(q)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">No queries found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No contact form submissions yet'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColor(selected.name)}`}>
                  {initials(selected.name)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{selected.name}</h3>
                  <p className="text-xs text-gray-400">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Sender</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{selected.name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Email</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{selected.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</span>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[selected.status] || STATUS_COLORS['New']}`}>
                    {selected.status || 'New'}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Submitted</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selected.createdAt)}</p>
                </div>
              </div>

              {selected.subject && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Subject</div>
                  <p className="text-sm font-medium text-gray-900">{selected.subject}</p>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Message</div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>

            {/* Modal actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2">
              <span className="text-xs text-gray-400">Update status</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateStatus(selected._id, 'In Progress')}
                  disabled={updating || selected.status === 'In Progress'}
                  className="px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 transition-colors"
                >
                  {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'In Progress'}
                </button>
                <button
                  onClick={() => updateStatus(selected._id, 'Resolved')}
                  disabled={updating || selected.status === 'Resolved'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-40 transition-colors"
                >
                  {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircle className="h-3.5 w-3.5" />Resolve</>}
                </button>
                <button
                  onClick={() => updateStatus(selected._id, 'Closed')}
                  disabled={updating || selected.status === 'Closed'}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Close'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQueriesManagement;
