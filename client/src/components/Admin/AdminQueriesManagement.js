import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Search, Filter, X, CheckCircle, Loader2 } from 'lucide-react';
import { queriesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = {
  'New': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Closed': 'bg-gray-100 text-gray-800'
};

const AdminQueriesManagement = () => {
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, []);

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

  const filtered = useMemo(() => {
    return queries.filter(q => {
      const matchesSearch = [q.name, q.email, q.subject, q.message]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [queries, search, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      setUpdating(true);
      await queriesAPI.updateStatus(id, { status });
      toast.success('Status updated');
      await fetchQueries();
      if (selected && selected._id === id) {
        const updated = await queriesAPI.getQuery(id);
        setSelected(updated.data);
      }
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">Loading queries...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, subject, message"
              className="pl-9 pr-3 py-2 border rounded-md w-72"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md py-2 px-2"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map(q => (
              <tr key={q._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{q.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{q.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[q.status]}`}>{q.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    onClick={() => setSelected(q)}
                  >
                    <Eye className="h-4 w-4" /> View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No queries found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <button className="absolute right-3 top-3 text-gray-500 hover:text-gray-700" onClick={() => setSelected(null)}>
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="text-sm text-gray-900">{selected.name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="text-sm text-gray-900">{selected.email}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Subject</div>
                <div className="text-sm text-gray-900">{selected.subject}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Message</div>
                <div className="text-sm text-gray-900 whitespace-pre-wrap">{selected.message}</div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selected.status]}`}>{selected.status}</span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => updateStatus(selected._id, 'In Progress')}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark In Progress'}
                  </button>
                  <button
                    className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => updateStatus(selected._id, 'Resolved')}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <span className="inline-flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-600" /> Resolve</span>
                    )}
                  </button>
                  <button
                    className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => updateStatus(selected._id, 'Closed')}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQueriesManagement;


