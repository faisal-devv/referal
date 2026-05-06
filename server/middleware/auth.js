const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET not set' });
      }
      const decoded = jwt.verify(token, secret);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'Not authorized, account deactivated' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error?.message);
      if (error?.name === 'TokenExpiredError') {
        const devDetail = process.env.NODE_ENV !== 'production' && error?.expiredAt ? ` (expired at ${error.expiredAt.toISOString()})` : '';
        return res.status(401).json({ message: `Not authorized, token expired${devDetail}` });
      }
      if (error?.name === 'JsonWebTokenError') {
        const devDetail = process.env.NODE_ENV !== 'production' && error?.message ? ` (${error.message})` : '';
        return res.status(401).json({ message: `Not authorized, invalid token${devDetail}` });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Super Admin privileges required.' });
  }
};

const employeeOnly = (req, res, next) => {
  if (req.user && req.user.role === 'employee') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Employee privileges required.' });
  }
};

const employeeOrAdmin = (req, res, next) => {
  if (req.user && ['employee', 'admin', 'superadmin'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied.' });
  }
};

module.exports = { protect, adminOnly, superAdminOnly, employeeOnly, employeeOrAdmin };
