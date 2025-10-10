const Withdrawal = require('../../../models/Withdrawal');
const connectDB = require('../../../config/database');
const { setCorsHeaders, handleOptions, protect } = require('../_utils');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  try {
    // Connect to database
    await connectDB();

    // Protect route
    const user = await protect(req);

    if (req.method === 'GET') {
      // Get user's withdrawal history
      const withdrawals = await Withdrawal.find({ user: user._id })
        .populate('processedBy', 'name')
        .sort({ createdAt: -1 });
      
      res.json(withdrawals);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Withdrawals error:', error);
    if (error.message.includes('Not authorized')) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

