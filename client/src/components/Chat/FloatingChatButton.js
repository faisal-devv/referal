import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, User, Mail, Phone } from 'lucide-react';

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true); // You can change this to false for offline mode
  const [message, setMessage] = useState('');
  const [offlineForm, setOfflineForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Simulate online/offline status (you can replace this with real logic)
  useEffect(() => {
    // For demo purposes, we'll set it to online
    // In production, you might want to check server status or business hours
    setIsOnline(true);
  }, []);

  const handleChatToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsSubmitted(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Send live chat message
      await fetch('https://formspree.io/f/xkgqvjkw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'live_chat',
          message: message,
          notificationEmail: 'shoaibfm1988@gmail.com',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
      });

      setMessage('');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfflineSubmit = async (e) => {
    e.preventDefault();
    
    if (!offlineForm.name.trim() || !offlineForm.email.trim() || !offlineForm.message.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await fetch('https://formspree.io/f/xkgqvjkw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'offline_message',
          name: offlineForm.name,
          email: offlineForm.email,
          message: offlineForm.message,
          notificationEmail: 'shoaibfm1988@gmail.com',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
      });

      setOfflineForm({ name: '', email: '', message: '' });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error sending offline message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleChatToggle}
        className="fixed bottom-6 right-6 bg-blue-700 text-white p-4 rounded-full shadow-lg hover:bg-blue-800 transform hover:scale-110 transition duration-200 z-40 group sm:bottom-6 sm:right-6"
        aria-label="Chat with us"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap">
          Chat with us
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 animate-slide-in-up sm:bottom-24 sm:right-6">
          {/* Chat Header */}
          <div className="bg-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <h3 className="font-semibold">Referus Support Chat</h3>
            </div>
            <button
              onClick={handleChatToggle}
              className="text-white hover:text-gray-200 transition duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">✅ Thank you! Your message has been received. We'll get back to you soon.</h4>
                <p className="text-sm text-gray-600">
                  Your message has been sent successfully.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 text-blue-700 text-sm font-medium hover:text-blue-800"
                >
                  Send another message
                </button>
              </div>
            ) : isOnline ? (
              /* Online Chat */
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    👋 Hi! How can we help you today?
                  </p>
                </div>
                
                <div className="space-y-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                  />
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isSubmitting}
                    className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Offline Form */
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    We're currently offline, but we'll get back to you soon!
                  </p>
                </div>
                
                <form onSubmit={handleOfflineSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={offlineForm.name}
                        onChange={(e) => setOfflineForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={offlineForm.email}
                        onChange={(e) => setOfflineForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      value={offlineForm.message}
                      onChange={(e) => setOfflineForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatButton;
