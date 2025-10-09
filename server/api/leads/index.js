const Lead = require('../../models/Lead');
const connectDB = require('../../config/database');
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
      // Get user's leads
      const leads = await Lead.find({ user: user._id })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
      
      res.json(leads);
    } else if (req.method === 'POST') {
      // Create a new lead
      const leadData = {
        ...req.body,
        user: user._id
      };

      const lead = await Lead.create(leadData);
      await lead.populate('user', 'name email');
      
      res.status(201).json(lead);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Leads error:', error);
    if (error.message.includes('Not authorized')) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
