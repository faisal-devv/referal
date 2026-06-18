import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Search, X, Bot, RefreshCw, MessageSquare, User, Send, ShieldCheck, Plus } from 'lucide-react';

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

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const BotHistoryManagement = () => {
  const [users, setUsers]               = useState([]);   // users with bot history
  const [allUsers, setAllUsers]         = useState([]);   // all platform users (for new chat)
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages]         = useState([]);
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [msgLoading, setMsgLoading]     = useState(false);
  const [reply, setReply]               = useState('');
  const [sending, setSending]           = useState(false);
  const [togglingBot, setTogglingBot]   = useState(false);

  // New-chat mode
  const [newChatMode, setNewChatMode]   = useState(false);
  const [newSearch, setNewSearch]       = useState('');
  const [allUsersLoading, setAllUsersLoading] = useState(false);

  const bottomRef  = useRef(null);
  const pollRef    = useRef(null);
  const replyRef   = useRef(null);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pollMessages = useCallback(async (userId) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/admin/bot-history/${userId}`, { headers: authHeaders() });
      setMessages(data);
      // If last message is from user, mark unread in the list (admin is viewing, so keep as read)
    } catch {}
  }, []);

  // Separately poll the user list to catch new messages from non-selected users
  useEffect(() => {
    const listPoll = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/admin/bot-history`, { headers: authHeaders() });
        setUsers(prev => data.map(fresh => {
          const existing = prev.find(p => p._id === fresh._id);
          // Preserve 'read' state if admin already opened it and no newer message came in
          if (existing && existing.lastMessageRole === 'read' && existing.lastMessage === fresh.lastMessage) {
            return { ...fresh, lastMessageRole: 'read' };
          }
          return fresh;
        }));
      } catch {}
    }, 20000);
    return () => clearInterval(listPoll);
  }, []);

  useEffect(() => {
    if (!selectedUser) { clearInterval(pollRef.current); return; }
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => pollMessages(selectedUser._id), 10000);
    return () => clearInterval(pollRef.current);
  }, [selectedUser, pollMessages]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/admin/bot-history`, { headers: authHeaders() });
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    if (allUsers.length > 0) return; // already loaded
    try {
      setAllUsersLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/users`, { headers: authHeaders() });
      const list = Array.isArray(data) ? data : (data?.data || []);
      setAllUsers(list.filter(u => u.role === 'user'));
    } catch (err) {
      console.error('Failed to load all users', err);
    } finally {
      setAllUsersLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      setMsgLoading(true);
      setMessages([]);
      const { data } = await axios.get(`${API_BASE_URL}/admin/bot-history/${userId}`, { headers: authHeaders() });
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSelect = (u) => {
    // Mark as read by clearing the unread flag
    setUsers(prev => prev.map(x => x._id === u._id ? { ...x, lastMessageRole: 'read' } : x));
    setSelectedUser(u);
    fetchMessages(u._id);
    setReply('');
    setNewChatMode(false);
  };

  // Start a new admin-initiated chat with any user
  const startNewChat = async (platformUser) => {
    // Pause bot by default for admin-initiated chats
    await axios.put(`${API_BASE_URL}/admin/bot-history/${platformUser._id}/bot-pause`, {}, { headers: authHeaders() });

    // Build a user entry compatible with the existing selectedUser shape
    const userEntry = {
      _id: platformUser._id,
      user: {
        _id: platformUser._id,
        name: platformUser.name,
        email: platformUser.email,
        userId: platformUser.userId || '',
        botPaused: true,
      },
      count: 0,
      lastMessage: new Date().toISOString(),
    };

    // Add to list if not already there
    setUsers(prev => {
      const exists = prev.some(u => u._id === platformUser._id);
      return exists ? prev : [userEntry, ...prev];
    });

    setSelectedUser(userEntry);
    fetchMessages(platformUser._id);
    setReply('');
    setNewChatMode(false);
    setNewSearch('');
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedUser) return;
    try {
      setSending(true);
      const { data } = await axios.post(
        `${API_BASE_URL}/admin/bot-history/${selectedUser._id}/reply`,
        { content: reply.trim() },
        { headers: authHeaders() }
      );
      setMessages(prev => [...prev, data]);
      setReply('');
      if (replyRef.current) replyRef.current.style.height = '38px';
      // Mark as read and update count
      setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, count: u.count + 1, lastMessageRole: 'read' } : u));
    } catch (err) {
      console.error('Failed to send reply', err);
    } finally {
      setSending(false);
    }
  };

  const toggleBot = async () => {
    if (!selectedUser) return;
    try {
      setTogglingBot(true);
      const { data } = await axios.put(
        `${API_BASE_URL}/admin/bot-history/${selectedUser._id}/bot-toggle`,
        {},
        { headers: authHeaders() }
      );
      setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, user: { ...u.user, botPaused: data.botPaused } } : u));
      setSelectedUser(prev => ({ ...prev, user: { ...prev.user, botPaused: data.botPaused } }));
    } catch (err) {
      console.error('Failed to toggle bot', err);
    } finally {
      setTogglingBot(false);
    }
  };

  const filteredConvos = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.user.name.toLowerCase().includes(q) ||
      u.user.email.toLowerCase().includes(q) ||
      (u.user.userId || '').toLowerCase().includes(q)
    );
  });

  const filteredAllUsers = allUsers.filter(u => {
    const q = newSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.userId || '').toLowerCase().includes(q)
    );
  });

  // IDs already in conversation list (to label them)
  const existingIds = new Set(users.map(u => u._id));

  let lastDate = null;

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">AI Chat History</h2>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} conversations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNewChatMode(true);
              setNewSearch('');
              fetchAllUsers();
            }}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
          <button onClick={fetchUsers} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-220px)]">

        {/* Left — conversations list */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations…"
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
            {!loading && filteredConvos.length === 0 && (
              <p className="text-sm text-gray-500 p-3">{search ? 'No conversations match' : 'No conversations yet'}</p>
            )}
            {filteredConvos.map(u => {
              const hasUnread = u.lastMessageRole === 'user' && u.user.botPaused;
              return (
                <button
                  key={u._id}
                  onClick={() => handleSelect(u)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition duration-150 ${
                    selectedUser?._id === u._id && !newChatMode
                      ? 'border-indigo-500 bg-indigo-50'
                      : hasUnread
                        ? 'border-red-200 bg-red-50 hover:border-red-300'
                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Unread pulsing dot */}
                    {hasUnread && (
                      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                    )}
                    <span className={`text-sm font-medium truncate ${hasUnread ? 'text-gray-900 font-semibold' : 'text-gray-900'}`}>{u.user.name}</span>
                    {u.user.userId && (
                      <span className="text-xs font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded flex-shrink-0">{u.user.userId}</span>
                    )}
                    {u.user.botPaused && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex-shrink-0">Bot Off</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{u.user.email}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MessageSquare className={`h-3 w-3 ${hasUnread ? 'text-red-400' : 'text-slate-400'}`} />
                    <span className="text-xs text-slate-500">{u.count} messages</span>
                    {hasUnread && <span className="text-xs font-semibold text-red-500 ml-1">Awaiting reply</span>}
                    <span className="text-xs text-slate-400 ml-auto">
                      {new Date(u.lastMessage).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">

          {/* ── NEW CHAT MODE ── */}
          {newChatMode ? (
            <>
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Plus className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Start New Chat</p>
                  <p className="text-xs text-gray-400">Bot will be automatically turned off</p>
                </div>
                <button onClick={() => setNewChatMode(false)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-100 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    autoFocus
                    type="text"
                    value={newSearch}
                    onChange={e => setNewSearch(e.target.value)}
                    placeholder="Search users by name, email or user ID…"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {allUsersLoading && <p className="text-sm text-gray-500 p-3">Loading users…</p>}
                {!allUsersLoading && filteredAllUsers.length === 0 && (
                  <p className="text-sm text-gray-500 p-3">{newSearch ? 'No users match' : 'No users found'}</p>
                )}
                {filteredAllUsers.map(u => {
                  const hasConvo = existingIds.has(u._id);
                  return (
                    <button
                      key={u._id}
                      onClick={() => startNewChat(u)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-transparent hover:border-indigo-200 hover:bg-indigo-50 transition duration-150 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                          <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600">{u.name[0].toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{u.name}</span>
                            {u.userId && <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{u.userId}</span>}
                            {hasConvo && <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Has history</span>}
                          </div>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                        <span className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          Start chat →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>

          ) : (
            /* ── CHAT VIEW MODE ── */
            <>
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                {selectedUser ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{selectedUser.user.name}</p>
                      <p className="text-xs text-gray-400">{selectedUser.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span className="text-xs font-medium text-gray-500">AI Bot</span>
                      <button
                        onClick={toggleBot}
                        disabled={togglingBot}
                        title={selectedUser.user.botPaused ? 'Bot is OFF — click to enable' : 'Bot is ON — click to disable'}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                          selectedUser.user.botPaused ? 'bg-gray-300' : 'bg-emerald-500'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          selectedUser.user.botPaused ? 'translate-x-1' : 'translate-x-6'
                        }`} />
                      </button>
                      <span className={`text-xs font-semibold ${selectedUser.user.botPaused ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {selectedUser.user.botPaused ? 'OFF' : 'ON'}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Select a conversation or start a new one</p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {msgLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : !selectedUser ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Bot className="h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-500">No conversation selected</p>
                    <p className="text-xs text-slate-400 mt-1">Pick from the list or click <strong>New Chat</strong> to message any user</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-500">No messages yet</p>
                    <p className="text-xs text-slate-400 mt-1">Send the first message below</p>
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
                            msg.role === 'user' ? 'bg-indigo-600' : msg.isAdminReply ? 'bg-emerald-600' : 'bg-white border border-gray-200'
                          }`}>
                            {msg.role === 'user'
                              ? <span className="text-white text-xs font-bold">{(selectedUser.user.name || 'U')[0].toUpperCase()}</span>
                              : msg.isAdminReply
                                ? <ShieldCheck className="h-3.5 w-3.5 text-white" />
                                : <Bot className="h-3.5 w-3.5 text-blue-600" />
                            }
                          </div>
                          <div className={`max-w-sm lg:max-w-lg px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-br-sm'
                              : msg.isAdminReply
                                ? 'bg-emerald-50 text-gray-800 border border-emerald-200 rounded-bl-sm'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                          }`}>
                            {msg.isAdminReply && (
                              <p className="text-xs font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> Admin Reply
                              </p>
                            )}
                            {msg.content}
                            {msg.forwarded && <p className="text-xs mt-1 text-blue-300">📨 Forwarded to support team</p>}
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

              {selectedUser && (
                <div className="flex-shrink-0 px-4 pt-2 pb-3 bg-white border-t border-gray-100">
                  {selectedUser.user.botPaused && (
                    <p className="text-xs text-amber-600 font-medium mb-1.5">
                      Bot is OFF — your reply goes directly to the user
                    </p>
                  )}
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={replyRef}
                      value={reply}
                      onChange={e => {
                        setReply(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                      }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                      placeholder={selectedUser.user.botPaused ? 'Reply as support agent…' : 'Reply as admin (bot is still active)…'}
                      rows={1}
                      className="flex-1 resize-none px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 overflow-y-auto"
                      style={{ minHeight: '38px', maxHeight: '160px' }}
                    />
                    <button
                      onClick={sendReply}
                      disabled={!reply.trim() || sending}
                      className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotHistoryManagement;
