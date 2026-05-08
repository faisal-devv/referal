const express = require('express');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const Query = require('../models/Query');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');

const CURRENCY_WALLET_KEY = { USD: 'usd', AED: 'aed', EUR: 'euro', SAR: 'sar' };

const calculateCommissionAmount = async (lead) => {
  const settings = await Settings.findById('global');
  if (!settings?.commissionRates || lead.value <= 0) return 0;

  let rates = settings.commissionRates.get(lead.category);
  if (!rates) {
    settings.commissionRates.forEach((v, k) => {
      if (!rates) {
        const kl = k.toLowerCase();
        const cl = lead.category.toLowerCase();
        if (kl.includes(cl) || cl.includes(kl)) rates = v;
      }
    });
  }

  if (!rates) return 0;
  const midRate = (rates.min + rates.max) / 2;
  return parseFloat(((lead.value * midRate) / 100).toFixed(2));
};

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
        .populate('user', 'name email')
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

    // Notify the lead owner about the status change
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

module.exports = router;
