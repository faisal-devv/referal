const express = require('express');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { protect, adminOnly, superAdminOnly } = require('../middleware/auth');
const Query = require('../models/Query');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const BotMessage = require('../models/BotMessage');
const { sendLeadStatusEmail } = require('../utils/email');

const { CURRENCY_WALLET_KEY, calculateCommissionAmount } = require('../utils/constants');

const router = express.Router();

// Helper — get or create the singleton settings document
const getSettings = () =>
  Settings.findByIdAndUpdate(
    'global',
    { $setOnInsert: { _id: 'global' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

// @route   GET /api/admin/settings/public
// @access  Public — safe fields only (no auth required)
router.get('/settings/public', async (req, res) => {
  try {
    const settings = await getSettings();
    const rates = {};
    if (settings.commissionRates) {
      settings.commissionRates.forEach((v, k) => { rates[k] = v; });
    }
    res.json({
      supportEmail: settings.supportEmail,
      supportResponseHours: settings.supportResponseHours,
      minWithdrawalUSD: settings.minWithdrawalUSD,
      withdrawalProcessingDays: settings.withdrawalProcessingDays,
      commissionRates: rates,
    });
  } catch (err) {
    console.error('Get public settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/settings
// @access  Private (Admin only)
router.get('/settings', protect, adminOnly, async (req, res) => {
  try {
    const settings = await getSettings();
    // Convert Map to plain object for JSON response
    const rates = {};
    if (settings.commissionRates) {
      settings.commissionRates.forEach((v, k) => { rates[k] = v; });
    }
    res.json({ ...settings.toObject(), commissionRates: rates });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

// @route   PUT /api/admin/settings
// @access  Private (Admin only)
router.put('/settings', protect, adminOnly, async (req, res) => {
  try {
    const allowed = [
      'supportEmail', 'supportResponseHours',
      'allowRegistration',
      'minWithdrawalUSD', 'withdrawalProcessingDays',
      'commissionRates'
    ];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const settings = await Settings.findByIdAndUpdate(
      'global',
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const rates = {};
    if (settings.commissionRates) {
      settings.commissionRates.forEach((v, k) => { rates[k] = v; });
    }
    res.json({ ...settings.toObject(), commissionRates: rates });
  } catch (err) {
    console.error('Save settings error:', err);
    res.status(500).json({ message: 'Server error saving settings' });
  }
});

// @route   GET /api/admin/leads
// @desc    Get all leads for admin (paginated)
// @access  Private (Admin only)
router.get('/leads', protect, adminOnly, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 500));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('user', 'name email userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(filter)
    ]);

    res.json({ data: leads, total, page, totalPages: Math.ceil(total / limit), limit });
  } catch (error) {
    console.error('Admin fetch leads error:', error);
    res.status(500).json({ message: 'Server error fetching leads' });
  }
});

// @route   PUT /api/admin/leads/:id
// @desc    Edit full lead details (Admin only)
// @access  Private (Admin only)
router.put('/leads/:id', protect, adminOnly, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const allowed = [
      'companyName', 'contactPerson', 'email', 'phone',
      'category', 'description', 'hasReference', 'referencePerson',
      'value', 'currency', 'status'
    ];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) lead[field] = req.body[field];
    });

    await lead.save();
    await lead.populate('user', 'name email');
    res.json(lead);
  } catch (error) {
    console.error('Admin edit lead error:', error);
    res.status(500).json({ message: 'Server error editing lead' });
  }
});

// @route   DELETE /api/admin/leads/:id
// @desc    Delete a lead (Superadmin only)
// @access  Private (Superadmin only)
router.delete('/leads/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Server error deleting lead' });
  }
});

// @route   PUT /api/admin/leads/:id/status
// @desc    Update lead status (Admin only)
// @access  Private (Admin only)
router.put('/leads/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const wasNotClosed = lead.status !== 'Deal Closed';
    lead.status = status;

    if (note) {
      lead.notes.push({ note, addedBy: req.user._id });
    }

    if (status === 'Deal Closed' && wasNotClosed) {
      const commissionAmount = await calculateCommissionAmount(lead);
      if (commissionAmount > 0) {
        lead.commission = commissionAmount;
        const walletKey = CURRENCY_WALLET_KEY[lead.currency] || 'usd';
        await User.findByIdAndUpdate(lead.user, {
          $inc: { [`wallet.${walletKey}`]: commissionAmount }
        });
      }
    }

    await lead.save({ validateBeforeSave: false });
    const updatedLead = await Lead.findById(req.params.id)
      .populate('user', 'name email');

    // Notify and email the lead owner about the status change
    if (updatedLead.user) {
      const isDealClosed = status === 'Deal Closed';
      Notification.create({
        recipient: updatedLead.user._id,
        type: isDealClosed ? 'deal_closed' : 'lead_status_updated',
        title: isDealClosed ? '🎉 Deal Closed!' : 'Lead Status Updated',
        message: isDealClosed
          ? `Your lead for ${updatedLead.companyName} has been closed. Check your wallet for your reward!`
          : `Your lead for ${updatedLead.companyName} is now: ${status}`,
        link: '/leads',
      }).catch(() => {});
      sendLeadStatusEmail(
        updatedLead.user.email,
        updatedLead.user.name,
        updatedLead.companyName,
        status
      ).catch(() => {});
    }

    res.json(updatedLead);
  } catch (error) {
    console.error('Admin update lead status error:', error);
    res.status(500).json({ message: 'Server error updating lead status' });
  }
});

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const totalUsers = await User.countDocuments();
    const pendingLeads = await Lead.countDocuments({ status: 'Pending' });
    const activeUsers = await User.countDocuments({
      isActive: true,
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Calculate total incentives (sum of all commission fields)
    const leads = await Lead.find({ status: 'Deal Closed' });
    const totalIncentives = leads.reduce((sum, lead) => sum + (lead.commission || 0), 0);

    res.json({
      totalLeads,
      totalUsers,
      totalIncentives,
      pendingLeads,
      activeUsers
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// Queries admin endpoints

// @route   GET /api/admin/queries
// @desc    Get all contact queries
// @access  Private (Admin only)
router.get('/queries', protect, adminOnly, async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    console.error('Admin fetch queries error:', error);
    res.status(500).json({ message: 'Server error fetching queries' });
  }
});

// @route   GET /api/admin/queries/:id
// @desc    Get single query details
// @access  Private (Admin only)
router.get('/queries/:id', protect, adminOnly, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ message: 'Query not found' });
    res.json(query);
  } catch (error) {
    console.error('Admin get query error:', error);
    res.status(500).json({ message: 'Server error fetching query' });
  }
});

// @route   PUT /api/admin/queries/:id/status
// @desc    Update query status and handler
// @access  Private (Admin only)
router.put('/queries/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['New', 'In Progress', 'Resolved', 'Closed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ message: 'Query not found' });

    query.status = status;
    query.handledBy = req.user?._id || null;
    query.handledAt = ['Resolved', 'Closed'].includes(status) ? new Date() : null;
    await query.save();

    res.json(query);
  } catch (error) {
    console.error('Admin update query status error:', error);
    res.status(500).json({ message: 'Server error updating query status' });
  }
});

// @route   POST /api/admin/bot-history/:userId/reply
// @desc    Admin sends a reply to a user's bot chat
// @access  Private/Admin
router.post('/bot-history/:userId/reply', protect, adminOnly, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Content is required' });

    const message = await BotMessage.create({
      user: req.params.userId,
      role: 'assistant',
      content: content.trim(),
      isAdminReply: true,
    });

    // Emit real-time to user if they have the chat open
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.params.userId}`).emit('adminBotReply', {
        _id: message._id,
        role: 'assistant',
        content: message.content,
        isAdminReply: true,
        createdAt: message.createdAt,
      });
    }

    res.status(201).json(message);
  } catch (err) {
    console.error('Admin reply error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/bot-history/:userId/bot-pause
// @desc    Force-set botPaused to true (for admin-initiated chats)
// @access  Private/Admin
router.put('/bot-history/:userId/bot-pause', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { botPaused: true }, { new: true }).select('botPaused');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ botPaused: user.botPaused });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/bot-history/:userId/bot-toggle
// @desc    Toggle bot on/off for a specific user
// @access  Private/Admin
router.put('/bot-history/:userId/bot-toggle', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('botPaused name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.botPaused = !user.botPaused;
    await user.save();
    res.json({ botPaused: user.botPaused });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/bot-history
// @desc    Get all users who have bot messages (with message counts)
// @access  Private/Admin
router.get('/bot-history', protect, adminOnly, async (req, res) => {
  try {
    const users = await BotMessage.aggregate([
      { $sort: { createdAt: 1 } },
      { $group: {
        _id: '$user',
        count: { $sum: 1 },
        lastMessage: { $max: '$createdAt' },
        lastMessageRole: { $last: '$role' },
        lastIsAdminReply: { $last: '$isAdminReply' },
      }},
      { $sort: { lastMessage: -1 } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 1, count: 1, lastMessage: 1, lastMessageRole: 1, lastIsAdminReply: 1, 'user.name': 1, 'user.email': 1, 'user.userId': 1, 'user.botPaused': 1 } },
    ]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/bot-history/:userId
// @desc    Get bot chat history for a specific user
// @access  Private/Admin
router.get('/bot-history/:userId', protect, adminOnly, async (req, res) => {
  try {
    const messages = await BotMessage.find({ user: req.params.userId })
      .sort({ createdAt: 1 })
      .limit(500);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
