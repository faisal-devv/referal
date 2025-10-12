const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
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

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Ensure DB connection before handling requests to avoid race conditions
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'https://www.referus.co',
  'https://referus.co'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser or same-origin
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    try {
      const { receiverId, message, senderId } = data;
      
      // Emit to receiver
      socket.to(`user_${receiverId}`).emit('newMessage', {
        senderId,
        message,
        timestamp: new Date()
      });
      
      // Emit back to sender for confirmation
      socket.emit('messageSent', {
        receiverId,
        message,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`user_${data.receiverId}`).emit('userTyping', {
      senderId: data.senderId,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
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