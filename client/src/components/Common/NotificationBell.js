import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, DollarSign, FileText, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const TYPE_ICON = {
  lead_submitted:      <FileText className="h-4 w-4 text-indigo-500" />,
  lead_status_updated: <TrendingUp className="h-4 w-4 text-blue-500" />,
  deal_closed:         <DollarSign className="h-4 w-4 text-emerald-500" />,
  withdrawal_requested:<DollarSign className="h-4 w-4 text-orange-500" />,
};

const TYPE_BG = {
  lead_submitted:       'bg-indigo-50',
  lead_status_updated:  'bg-blue-50',
  deal_closed:          'bg-emerald-50',
  withdrawal_requested: 'bg-orange-50',
};

const relativeTime = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = ({ theme = 'light' }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const ref                               = useRef(null);
  const navigate                          = useNavigate();
  const token                             = localStorage.getItem('token');

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (e, id) => {
    e.stopPropagation();
    await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.filter(n => n._id !== id));
    setUnreadCount(prev => {
      const wasUnread = notifications.find(n => n._id === id && !n.isRead);
      return wasUnread ? Math.max(0, prev - 1) : prev;
    });
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) await markRead(notif._id);
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const isDark = theme === 'dark';
  const bellBtn   = isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100';
  const panel     = isDark ? 'bg-slate-800 border-slate-700 shadow-2xl' : 'bg-white border-gray-200 shadow-2xl';
  const headerBdr = isDark ? 'border-slate-700' : 'border-gray-100';
  const titleCls  = isDark ? 'text-white' : 'text-gray-900';
  const itemHover = isDark ? 'hover:bg-slate-700/60' : 'hover:bg-gray-50';
  const msgCls    = isDark ? 'text-slate-300' : 'text-gray-600';
  const timeCls   = isDark ? 'text-slate-500' : 'text-gray-400';
  const emptyText = isDark ? 'text-slate-400' : 'text-gray-400';
  const delBtn    = isDark ? 'text-slate-500 hover:text-red-400' : 'text-gray-300 hover:text-red-400';
  const markAllBtn= isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800';
  const unreadDot = isDark ? 'bg-slate-700' : 'bg-indigo-50';

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); fetchNotifications(); }}
        className={`relative p-2 rounded-lg transition-colors ${bellBtn}`}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 ring-1 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className={`absolute right-0 mt-2 w-80 rounded-xl border z-50 overflow-hidden ${panel}`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${headerBdr}`}>
            <span className={`text-sm font-semibold ${titleCls}`}>
              Notifications {unreadCount > 0 && <span className="ml-1 text-xs font-normal text-gray-400">({unreadCount} unread)</span>}
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className={`text-xs font-medium transition-colors ${markAllBtn}`} title="Mark all read">
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className={`transition-colors ${timeCls}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-10 gap-2 ${emptyText}`}>
                <Bell className="h-8 w-8 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group ${itemHover} ${!notif.isRead ? unreadDot : ''}`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${TYPE_BG[notif.type] || 'bg-gray-100'}`}>
                    {TYPE_ICON[notif.type] || <Bell className="h-4 w-4 text-gray-400" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-xs font-semibold leading-tight ${titleCls}`}>{notif.title}</p>
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />}
                    </div>
                    <p className={`text-xs leading-relaxed mt-0.5 ${msgCls}`}>{notif.message}</p>
                    <p className={`text-[10px] mt-1 ${timeCls}`}>{relativeTime(notif.createdAt)}</p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => deleteNotif(e, notif._id)}
                    className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${delBtn}`}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
