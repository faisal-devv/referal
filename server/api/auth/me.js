const User = require('../../models/User');
const connectDB = require('../../config/database');
const { setCorsHeaders, handleOptions, protect } = require('../_utils');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectDB();

    // Protect route
    const user = await protect(req);
    
    const userData = await User.findById(user._id).select('-password');
    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    if (error.message.includes('Not authorized')) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
