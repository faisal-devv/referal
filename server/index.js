const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/database');
const ChatMessage = require('./models/ChatMessage');
const dns = require('dns');

// Load environment variables
require('dotenv').config();

// Prefer IPv4 DNS results to avoid some SRV/IPv6 connectivity issues
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// CORS must come first so all responses (including errors) carry the right headers
const allowedOrigins = [
  'https://www.referus.co',
  'https://referus.co'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    // Allow any localhost/127.0.0.1 origin in development
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Security middleware
app.use(helmet());

// Rate limiting — disable X-Forwarded-For validation for local/non-proxied environments
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  validate: { xForwardedForHeader: false }
});
app.use(limiter);

// Ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/queries', require('./routes/queries'));
app.use('/api/employee', require('./routes/employee'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/partners', require('./routes/partners'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return next(new Error('Server misconfiguration'));
    const decoded = jwt.verify(token, secret);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  // Auto-join authenticated user's own room — client cannot spoof the room
  socket.join(`user_${socket.userId}`);

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    try {
      const { receiverId, message } = data;
      const senderId = socket.userId; // always from verified token, not client payload

      // Persist to database
      const chatMessage = await ChatMessage.create({
        sender: senderId,
        receiver: receiverId,
        message
      });

      const payload = {
        _id: chatMessage._id,
        senderId,
        receiverId,
        message,
        timestamp: chatMessage.createdAt
      };

      // Emit to receiver
      socket.to(`user_${receiverId}`).emit('newMessage', payload);

      // Emit back to sender for confirmation
      socket.emit('messageSent', payload);
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`user_${data.receiverId}`).emit('userTyping', {
      senderId: socket.userId,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {});
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ... existing code ...

// Conditional listening for local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.\n` +
        `Try one of the following:\n` +
        `- Kill the process: lsof -n -i :${PORT} | awk 'NR>1 {print $2}' | xargs -r kill -9\n` +
        `- Or run on another port: PORT=5001 npm run dev`);
      process.exit(1);
    }
    throw err;
  });
}

// **REQUIRED FOR VERCEL DEPLOYMENT**
// Vercel handles the server listening internally for serverless functions.
module.exports = server;