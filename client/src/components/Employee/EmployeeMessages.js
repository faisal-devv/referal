import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Clock, 
  User, 
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Mock data - in production, this would be an API call
      const mockMessages = [
        {
          id: 1,
          clientName: 'John Smith',
          clientEmail: 'john@techcorp.com',
          clientPhone: '+1-555-0123',
          subject: 'Question about our project timeline',
          message: 'Hi, I submitted a lead for our digital transformation project. Could you provide an update on the timeline and next steps?',
          status: 'unread',
          receivedAt: '2024-01-15T10:30:00Z',
          leadId: 1,
          leadTitle: 'TechCorp Solutions - Digital Transformation',
          replies: []
        },
        {
          id: 2,
          clientName: 'Sarah Wilson',
          clientEmail: 'sarah@wilsonconstruction.com',
          clientPhone: '+1-555-0124',
          subject: 'Budget clarification needed',
          message: 'We need clarification on the budget breakdown for our construction project. Can someone contact us?',
          status: 'pending',
          receivedAt: '2024-01-14T14:20:00Z',
          leadId: 2,
          leadTitle: 'Wilson Construction - Commercial Building',
          replies: [
            {
              id: 1,
              message: 'Hi Sarah, I\'ll connect you with our construction specialist who can provide detailed budget breakdown. You should hear from them within 24 hours.',
              sentAt: '2024-01-14T15:30:00Z',
              sentBy: 'Employee - Mike Chen',
              sentByEmail: 'mike@referralhub.com'
            }
          ]
        },
        {
          id: 3,
          clientName: 'Mike Chen',
          clientEmail: 'mike@chenrealestate.com',
          clientPhone: '+1-555-0125',
          subject: 'Property valuation update',
          message: 'We\'re ready to proceed with the property transaction. Please provide the latest valuation report.',
          status: 'replied',
          receivedAt: '2024-01-13T09:15:00Z',
          leadId: 3,
          leadTitle: 'Chen Real Estate - Luxury Property',
          replies: [
            {
              id: 1,
              message: 'Thank you for your interest, Mike. I\'ve forwarded your request to our real estate specialist. The valuation report will be sent to you within 48 hours.',
              sentAt: '2024-01-13T11:20:00Z',
              sentBy: 'Employee - Sarah Wilson',
              sentByEmail: 'sarah@referralhub.com'
            }
          ]
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.leadTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(msg => msg.status === statusFilter);
    }

    setFilteredMessages(filtered);
  };

  const sendReply = async (messageId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      const newReply = {
        id: Date.now(),
        message: replyText,
        sentAt: new Date().toISOString(),
        sentBy: 'Employee - Current User', // In production, get from auth context
        sentByEmail: 'employee@referralhub.com'
      };

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId 
            ? { 
                ...msg, 
                replies: [...msg.replies, newReply],
                status: 'replied'
              }
            : msg
        )
      );

      setReplyText('');
      toast.success('Reply sent successfully');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const markAsRead = (messageId) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      )
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Messages</h2>
          <p className="text-gray-600 mt-1">Reply to client inquiries and manage communications</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            Total: {messages.length} messages | Unread: {messages.filter(m => m.status === 'unread').length}
          </span>
        </div>
      </div>

      {/* Employee Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Message Management</h3>
            <p className="text-sm text-green-700 mt-1">
              You can reply to client messages. All replies are logged and visible to admins.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread</option>
                <option value="pending">Pending</option>
                <option value="replied">Replied</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => {
                  setSelectedMessage(message);
                  markAsRead(message.id);
                }}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition duration-200 ${
                  message.status === 'unread' ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                } ${selectedMessage?.id === message.id ? 'bg-blue-100' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">{message.clientName}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        message.status === 'unread' ? 'bg-red-100 text-red-800' :
                        message.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {message.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-1">{message.subject}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{message.message}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(message.receivedAt)}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {message.replies.length} replies
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Details and Reply */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedMessage ? 'Message Details' : 'Select a Message'}
            </h3>
          </div>
          
          {selectedMessage ? (
            <div className="p-6 space-y-6">
              {/* Client Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Client Information</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{selectedMessage.clientName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{selectedMessage.clientEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{selectedMessage.clientPhone}</span>
                  </div>
                </div>
              </div>

              {/* Lead Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Related Lead</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{selectedMessage.leadTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">Lead ID: {selectedMessage.leadId}</p>
                </div>
              </div>

              {/* Original Message */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Original Message</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{selectedMessage.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Received: {formatDate(selectedMessage.receivedAt)}
                  </p>
                </div>
              </div>

              {/* Previous Replies */}
              {selectedMessage.replies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Previous Replies</h4>
                  <div className="space-y-3">
                    {selectedMessage.replies.map((reply) => (
                      <div key={reply.id} className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900">{reply.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            by {reply.sentBy}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(reply.sentAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Send Reply</h4>
                <div className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => sendReply(selectedMessage.id)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a message to view details and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeMessages;
