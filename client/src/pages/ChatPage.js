import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Search, Phone, Mail, Bot } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/AppThemeContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const BOT_CONV_ID = '__bot__';

const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const ChatPage = () => {
  const { user } = useAuth();
  const { isDark } = useAppTheme();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [botMessages, setBotMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [botLoading, setBotLoading] = useState(false);
  const [sendingBot, setSendingBot] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // ── Theme tokens ──────────────────────────────────────────────
  const cardBg     = isDark ? '#161b22' : '#ffffff';
  const borderCls  = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const divCls     = isDark ? 'divide-slate-700/50'  : 'divide-gray-200';
  const headingCls = isDark ? 'text-white'    : 'text-gray-900';
  const subCls     = isDark ? 'text-slate-400' : 'text-gray-500';
  const mutedCls   = isDark ? 'text-slate-500' : 'text-gray-400';
  const inputCls   = isDark
    ? 'w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm'
    : 'w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';
  const rowHoverCls = isDark ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50';

  useEffect(() => {
    fetchConversations();
    initializeSocket();
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;
    if (selectedConversation._id === BOT_CONV_ID) {
      fetchBotHistory();
    } else {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botMessages, botLoading]);

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', { auth: { token } });
    newSocket.on('connect_error', (err) => console.error('Socket error:', err.message));
    newSocket.on('newMessage', (message) => setMessages(prev => [...prev, message]));
    socketRef.current = newSocket;
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/chat/conversations`);
      setConversations(response.data);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/messages/${userId}`);
      setMessages(response.data);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const fetchBotHistory = async () => {
    try {
      setBotLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/chat/bot/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBotMessages(response.data);
    } catch {
      toast.error('Failed to load AI chat history');
    } finally {
      setBotLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !socketRef.current) return;
    try {
      const messageData = { receiverId: selectedConversation._id, message: newMessage.trim() };
      await axios.post(`${API_BASE_URL}/chat/send`, messageData);
      socketRef.current.emit('sendMessage', { ...messageData, senderId: user._id });
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  const sendBotMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || sendingBot) return;
    setNewMessage('');
    setSendingBot(true);
    // Optimistic user bubble
    const optimistic = { _id: `opt-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() };
    setBotMessages(prev => [...prev, optimistic]);
    try {
      const history = botMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post(`${API_BASE_URL}/chat/bot`, { message: text, history });
      const botReply = { _id: `bot-${Date.now()}`, role: 'assistant', content: res.data.reply, forwarded: res.data.forwarded, createdAt: new Date().toISOString() };
      setBotMessages(prev => [...prev, botReply]);
    } catch {
      setBotMessages(prev => [...prev, { _id: `err-${Date.now()}`, role: 'assistant', content: "Sorry, I couldn't connect. Please try again.", createdAt: new Date().toISOString() }]);
    } finally {
      setSendingBot(false);
    }
  };

  const isBotSelected = selectedConversation?._id === BOT_CONV_ID;

  const botConv = {
    _id: BOT_CONV_ID,
    user: { _id: BOT_CONV_ID, name: 'AI Assistant', email: 'Referus Support Bot' },
    lastMessage: botMessages.length > 0
      ? { message: botMessages[botMessages.length - 1].content, createdAt: botMessages[botMessages.length - 1].createdAt }
      : { message: 'Ask me anything about the platform…', createdAt: null },
    unreadCount: 0,
    isBot: true,
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allConversations = [botConv, ...filteredConversations];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${headingCls}`}>Chat</h1>
        <p className={`text-sm mt-1 ${subCls}`}>Communicate with our support team</p>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-4 rounded-xl border ${borderCls} overflow-hidden`} style={{ height: 600 }}>

        {/* Conversations sidebar */}
        <div className={`lg:col-span-1 flex flex-col border-r ${borderCls}`} style={{ background: cardBg }}>
          <div className={`p-3 border-b ${borderCls}`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${mutedCls}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={inputCls.replace('px-3', 'pl-9 pr-3')}
                placeholder="Search..."
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className={`divide-y ${divCls}`}>
              {allConversations.map((conv) => {
                const active = selectedConversation?._id === conv._id;
                return (
                  <div
                    key={conv._id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 cursor-pointer transition-colors ${
                      active
                        ? isDark ? 'bg-emerald-500/10 border-r-2 border-emerald-500' : 'bg-emerald-50 border-r-2 border-emerald-500'
                        : rowHoverCls
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        conv.isBot
                          ? isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                          : isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                      }`}>
                        {conv.isBot
                          ? <Bot className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                          : <span className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                              {conv.user.name.charAt(0).toUpperCase()}
                            </span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium truncate ${headingCls}`}>{conv.user.name}</p>
                          {conv.unreadCount > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500 text-white ml-1">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${subCls}`}>{conv.lastMessage?.message}</p>
                        {conv.lastMessage?.createdAt && (
                          <p className={`text-xs mt-0.5 ${mutedCls}`}>
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3 flex flex-col" style={{ background: isDark ? '#0d1117' : '#fafafa' }}>
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className={`flex items-center gap-3 px-4 py-3 border-b ${borderCls}`} style={{ background: cardBg }}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isBotSelected
                    ? isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                    : isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                }`}>
                  {isBotSelected
                    ? <Bot className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    : <span className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {selectedConversation.user.name.charAt(0).toUpperCase()}
                      </span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${headingCls}`}>{selectedConversation.user.name}</p>
                  <p className={`text-xs ${subCls}`}>{selectedConversation.user.email}</p>
                </div>
                {!isBotSelected && (
                  <div className="flex items-center gap-2">
                    <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-white hover:bg-slate-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-white hover:bg-slate-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isBotSelected ? (
                  botLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  ) : botMessages.length > 0 ? (
                    (() => {
                      let lastDate = null;
                      return botMessages.map((msg) => {
                        const msgDate = new Date(msg.createdAt).toDateString();
                        const showDate = msgDate !== lastDate;
                        lastDate = msgDate;
                        return (
                          <React.Fragment key={msg._id}>
                            {showDate && (
                              <div className="flex items-center gap-3 my-3">
                                <div className={`flex-1 h-px ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                                  {formatDateLabel(msg.createdAt)}
                                </span>
                                <div className={`flex-1 h-px ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
                              </div>
                            )}
                            <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'}`}>
                                {msg.role === 'user'
                                  ? <span className="text-white text-xs font-bold">{(user?.name || 'U')[0].toUpperCase()}</span>
                                  : <Bot className={`h-3.5 w-3.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                }
                              </div>
                              <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                                msg.role === 'user'
                                  ? 'bg-blue-600 text-white rounded-br-sm'
                                  : isDark ? 'bg-slate-800 text-white border border-slate-700 rounded-bl-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                              }`}>
                                {msg.content}
                                {msg.forwarded && (
                                  <p className="text-xs mt-1 text-blue-400">📨 Forwarded to support team</p>
                                )}
                                <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      });
                    })()
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Bot className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                        <p className={`text-sm font-medium mb-1 ${headingCls}`}>No previous conversations</p>
                        <p className={`text-xs ${subCls}`}>Use the chat button at the bottom-right to talk to the AI assistant</p>
                      </div>
                    </div>
                  )
                ) : (
                  messages.length > 0 ? (
                    messages.map((message) => {
                      const isOther = message.sender._id === selectedConversation._id;
                      return (
                        <div key={message._id} className={`flex ${isOther ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
                            isOther
                              ? isDark ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'
                              : 'bg-emerald-500 text-white'
                          }`}>
                            <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${isOther ? (isDark ? 'text-slate-500' : 'text-gray-400') : 'text-emerald-100'}`}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                        <p className={`text-sm font-medium mb-1 ${headingCls}`}>No messages yet</p>
                        <p className={`text-xs ${subCls}`}>Send a message to start the conversation</p>
                      </div>
                    </div>
                  )
                )}

                {sendingBot && (
                  <div className="flex items-end gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'}`}>
                      <Bot className={`h-3.5 w-3.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div className={`px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className={`p-4 border-t ${borderCls}`} style={{ background: cardBg }}>
                <form onSubmit={isBotSelected ? sendBotMessage : sendMessage} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isBotSelected ? 'Ask the AI assistant…' : 'Type your message...'}
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || (isBotSelected ? sendingBot : false)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className={`h-14 w-14 mx-auto mb-4 ${isDark ? 'text-slate-700' : 'text-gray-300'}`} />
                <p className={`text-base font-semibold mb-1 ${headingCls}`}>Select a conversation</p>
                <p className={`text-sm ${subCls}`}>Choose from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
