const express = require('express');
const Lead = require('../models/Lead');
const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const { protect, employeeOrAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and employee/admin role
router.use(protect, employeeOrAdmin);

// @route   GET /api/employee/leads
// @desc    Get all leads (employees manage follow-ups)
// @access  Employee / Admin
router.get('/leads', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(filter)
    ]);

    res.json({ data: leads, total, page, totalPages: Math.ceil(total / limit), limit });
  } catch (error) {
    console.error('Employee fetch leads error:', error);
    res.status(500).json({ message: 'Server error fetching leads' });
  }
});

// @route   PUT /api/employee/leads/:id/status
// @desc    Update lead status (employees update follow-up progress)
// @access  Employee / Admin
router.put('/leads/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;

    const allowedStatuses = ['Pending', 'Contacted', 'Proposal Submitted', 'Deal Closed', 'Client Refused'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.status = status;
    if (note) {
      lead.notes.push({ note, addedBy: req.user._id });
    }

    await lead.save();
    await lead.populate('user', 'name email');
    res.json(lead);
  } catch (error) {
    console.error('Employee update lead status error:', error);
    res.status(500).json({ message: 'Server error updating lead status' });
  }
});

// @route   GET /api/employee/profile
// @desc    Get own profile
// @access  Employee / Admin
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Employee get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @route   GET /api/employee/users
// @desc    Get all regular users (for chat)
// @access  Employee / Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user', isActive: true })
      .select('name email')
      .sort({ name: 1 });
    res.json(users);
  } catch (error) {
    console.error('Employee get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   GET /api/employee/conversations
// @desc    Get all chat conversations (employees see all user messages)
// @access  Employee / Admin
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await ChatMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          user: { _id: '$user._id', name: '$user.name', email: '$user.email', role: '$user.role' },
          lastMessage: 1,
          unreadCount: 1
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Employee get conversations error:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
});

module.exports = router;
