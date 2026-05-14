import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, X, Bot, RefreshCw, MessageSquare, User } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const BotHistoryManagement = () => {
  const [users, setUsers]               = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages]         = useState([]);
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [msgLoading, setMsgLoading]     = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/admin/bot-history`, { headers: headers() });
      setUsers(data);
    } catch (err) {
      console.error('Failed to load bot history users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      setMsgLoading(true);
      setMessages([]);
      const { data } = await axios.get(`${API_BASE_URL}/admin/bot-history/${userId}`, { headers: headers() });
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSelect = (u) => {
    setSelectedUser(u);
    fetchMessages(u._id);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.user.name.toLowerCase().includes(q) ||
      u.user.email.toLowerCase().includes(q) ||
      (u.user.userId || '').toLowerCase().includes(q)
    );
  });

  // Group messages by date for separators
  let lastDate = null;

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">AI Chat History</h2>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} users with conversations</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-colors">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-220px)]">

        {/* Left — user list */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email or user ID…"
                className="w-full pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loading && <p className="text-sm text-gray-500 p-3">Loading…</p>}
            {!loading && filtered.length === 0 && (
              <p className="text-sm text-gray-500 p-3">{search ? 'No users match' : 'No conversations yet'}</p>
            )}
            {filtered.map(u => (
              <button
                key={u._id}
                onClick={() => handleSelect(u)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition duration-150 ${
                  selectedUser?._id === u._id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{u.user.name}</span>
                  {u.user.userId && (
                    <span className="text-xs font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded flex-shrink-0">{u.user.userId}</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 truncate">{u.user.email}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <MessageSquare className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-500">{u.count} messages</span>
                  <span className="text-xs text-slate-400 ml-auto">
                    {new Date(u.lastMessage).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right — chat history */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
            {selectedUser ? (
              <>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedUser.user.name}</p>
                  <p className="text-xs text-gray-400">{selectedUser.user.email}</p>
                </div>
                <span className="ml-auto text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {messages.length} messages
                </span>
              </>
            ) : (
              <p className="text-sm text-gray-500">Select a user to view their AI chat history</p>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {msgLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : !selectedUser ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No user selected</p>
                <p className="text-xs text-slate-400 mt-1">Pick a user from the list to review their chat history</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No messages found</p>
              </div>
            ) : (
              messages.map((msg) => {
                const msgDate = new Date(msg.createdAt).toDateString();
                const showDate = msgDate !== lastDate;
                lastDate = msgDate;
                return (
                  <React.Fragment key={msg._id}>
                    {showDate && (
                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500">
                          {formatDateLabel(msg.createdAt)}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}
                    <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' ? 'bg-indigo-600' : 'bg-white border border-gray-200'
                      }`}>
                        {msg.role === 'user'
                          ? <span className="text-white text-xs font-bold">{(selectedUser.user.name || 'U')[0].toUpperCase()}</span>
                          : <Bot className="h-3.5 w-3.5 text-blue-600" />
                        }
                      </div>
                      <div className={`max-w-sm lg:max-w-lg px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                      }`}>
                        {msg.content}
                        {msg.forwarded && (
                          <p className="text-xs mt-1 text-blue-300">📨 Forwarded to support team</p>
                        )}
                        <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotHistoryManagement;
