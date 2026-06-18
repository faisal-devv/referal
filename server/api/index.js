const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('../config/database');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// CORS must be first — before rate limiter and DB middleware so preflight OPTIONS
// requests get headers immediately without waiting for MongoDB to connect.
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'https://www.referus.co',
  'https://referus.co'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Security middleware
app.use(helmet());

// Rate limiting — skip OPTIONS so browser preflights are never rate-limited
// (a 429 on a preflight has no CORS headers, which the browser misreads as a CORS block)
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 500,
  validate: { xForwardedForHeader: false },
  skip: (req) => req.method === 'OPTIONS',
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

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/leads', require('../routes/leads'));
app.use('/api/wallet', require('../routes/wallet'));
app.use('/api/chat', require('../routes/chat'));
app.use('/api/users', require('../routes/users'));
app.use('/api/admin', require('../routes/admin'));
app.use('/api/queries', require('../routes/queries'));
app.use('/api/notifications', require('../routes/notifications'));
app.use('/api/partners', require('../routes/partners'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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

// Export for Vercel serverless
module.exports = app;
