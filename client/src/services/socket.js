import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.url = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    this.connected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(this.url, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.connected = true;
      this.emit('userConnected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });

    // Re-register all listeners
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  on(event, callback) {
    this.listeners.set(event, callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Chat specific methods
  joinRoom(userId) {
    this.emit('join', userId);
  }

  sendMessage(messageData) {
    this.emit('sendMessage', messageData);
  }

  onNewMessage(callback) {
    this.on('newMessage', callback);
  }

  onMessageSent(callback) {
    this.on('messageSent', callback);
  }

  onUserTyping(callback) {
    this.on('userTyping', callback);
  }

  onUserConnected(callback) {
    this.on('userConnected', callback);
  }

  onUserDisconnected(callback) {
    this.on('userDisconnected', callback);
  }

  // Typing indicators
  startTyping(receiverId, senderId) {
    this.emit('typing', { receiverId, senderId, isTyping: true });
  }

  stopTyping(receiverId, senderId) {
    this.emit('typing', { receiverId, senderId, isTyping: false });
  }

  // Lead updates
  onLeadStatusUpdate(callback) {
    this.on('leadStatusUpdate', callback);
  }

  // Withdrawal updates
  onWithdrawalStatusUpdate(callback) {
    this.on('withdrawalStatusUpdate', callback);
  }

  // Wallet updates
  onWalletUpdate(callback) {
    this.on('walletUpdate', callback);
  }

  // Error handling
  onError(callback) {
    this.on('error', callback);
  }

  // Connection status
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
