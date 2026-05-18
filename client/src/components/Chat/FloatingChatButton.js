import React, { useState, useEffect, useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { MessageCircle, X, Send, Bot, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const WELCOME = {
  role: 'assistant',
  content: "👋 Hi! I'm the Referus support assistant. Ask me anything about the platform — commissions, withdrawals, leads, or anything else!",
};

const FloatingChatButton = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen]             = useState(false);
  const [messages, setMessages]         = useState([WELCOME]);
  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [greeting, setGreeting]         = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const pollRef   = useRef(null);

  // Auto-open and show greeting on first login
  useEffect(() => {
    if (!user?._id) return;
    const key = `referus_welcomed_${user._id}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');

    // Open after 1.5s so the page has settled
    const openTimer = setTimeout(() => {
      setIsOpen(true);
      setGreeting(true);

      // First typing bubble → greeting message
      setTimeout(() => {
        const name = user.name?.split(' ')[0] || 'there';
        setMessages([{
          role: 'assistant',
          content: `👋 Welcome to Referus, ${name}! Great to have you here.`,
        }]);
        setGreeting(false);

        // Second typing bubble → follow-up
        setTimeout(() => {
          setGreeting(true);
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: "I'm your personal support assistant. Ask me anything — how to submit a lead, track your earnings, withdraw funds, or anything else on the platform. I'm here 24/7 😊",
            }]);
            setGreeting(false);
          }, 1800);
        }, 600);

      }, 1800);
    }, 1500);

    return () => clearTimeout(openTimer);
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Load full history on first open
  useEffect(() => {
    if (!isOpen || historyLoaded) return;
    const token = localStorage.getItem('token');
    if (!token) { setHistoryLoaded(true); return; }

    fetch(`${API_BASE_URL}/chat/bot/history`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages([WELCOME, ...data]);
        }
      })
      .catch(() => {})
      .finally(() => setHistoryLoaded(true));
  }, [isOpen, historyLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll for new messages (admin replies) every 5s while open
  const pollNew = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/chat/bot/history`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;
      setMessages(prev => {
        const existingIds = new Set(prev.filter(m => m._id).map(m => m._id));
        const newMsgs = data.filter(m => !existingIds.has(m._id));
        if (newMsgs.length === 0) return prev;
        return [WELCOME, ...data];
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen && historyLoaded) {
      pollRef.current = setInterval(pollNew, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [isOpen, historyLoaded, pollNew]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/chat/bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ message: text, history: next.slice(1) }),
      });
      const data = await res.json();
      const assistantMsg = { role: 'assistant', content: data.reply, forwarded: data.forwarded, isAdminReply: false };
      setMessages(prev => [...prev, assistantMsg]);
      // Refresh from server to get real IDs
      if (token) {
        setTimeout(() => {
          fetch(`${API_BASE_URL}/chat/bot/history`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (Array.isArray(data) && data.length > 0) setMessages([WELCOME, ...data]); })
            .catch(() => {});
        }, 500);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't connect. Please try again or email us at contact@referus.co" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const renderAvatar = (msg) => {
    if (msg.role === 'user') {
      return (
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <User className="h-3.5 w-3.5 text-white" />
        </div>
      );
    }
    if (msg.isAdminReply) {
      return (
        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="h-3.5 w-3.5 text-white" />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
        <Bot className="h-3.5 w-3.5 text-blue-600" />
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 bg-blue-700 text-white p-4 rounded-full shadow-lg hover:bg-blue-800 transform hover:scale-110 transition duration-200 z-40 group"
        aria-label="Chat with us"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap">
            Chat with us
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden" style={{ height: '500px' }}>
          <div className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Referus Support</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <p className="text-xs text-blue-200 leading-tight">AI Assistant · Online</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={msg._id || i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {renderAvatar(msg)}
                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : msg.isAdminReply
                      ? 'bg-emerald-50 text-gray-800 border border-emerald-200 rounded-bl-sm shadow-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.isAdminReply && (
                    <p className="text-xs font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Support Agent
                    </p>
                  )}
                  {msg.content}
                  {msg.forwarded && <p className="text-xs mt-1.5 text-blue-400">📨 Forwarded to support team</p>}
                </div>
              </div>
            ))}

            {(loading || greeting) && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex-shrink-0 px-3 py-3 bg-white border-t border-gray-100 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 resize-none px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-24"
              style={{ minHeight: '38px' }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatButton;
