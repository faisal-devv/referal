import React, { useEffect, useRef } from 'react';
import { MessageCircle, Phone, Mail } from 'lucide-react';
import EmptyState from '../Common/EmptyState';

const MessageList = ({ 
  messages, 
  selectedConversation, 
  currentUserId 
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <EmptyState
          icon={MessageCircle}
          title="Select a conversation"
          description="Choose a conversation from the list to start chatting"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {selectedConversation.user.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {selectedConversation.user.name}
            </h3>
            <p className="text-xs text-gray-500">
              {selectedConversation.user.email}
            </p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600 transition duration-200">
              <Phone className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition duration-200">
              <Mail className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender._id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender._id === currentUserId
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.sender._id === currentUserId
                    ? 'text-primary-100'
                    : 'text-gray-500'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="No messages yet"
            description="Start the conversation by sending a message"
          />
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
