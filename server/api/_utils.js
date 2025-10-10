// Common utilities for Vercel API functions

// Set CORS headers
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
};

// Handle OPTIONS request
const handleOptions = (res) => {
  setCorsHeaders(res);
  res.status(200).end();
};

// JWT Token generation
const generateToken = (id) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Protect middleware for authentication
const protect = async (req) => {
  const jwt = require('jsonwebtoken');
  const User = require('../../models/User');
  
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw new Error('Not authorized, token failed');
    }
  }
  
  if (!token) {
    throw new Error('Not authorized, no token');
  }
};

module.exports = {
  setCorsHeaders,
  handleOptions,
  generateToken,
  protect
};
