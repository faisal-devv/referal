const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const Notification = require('../models/Notification');
const { verifyHcaptcha } = require('../utils/captcha');
const { CURRENCY_WALLET_KEY, calculateCommissionAmount } = require('../utils/constants');

const router = express.Router();

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Private
router.post('/', protect, [
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('companyName').trim().isLength({ min: 1 }).withMessage('Company name is required'),
  body('contactPerson').trim().isLength({ min: 1 }).withMessage('Contact person is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').trim().isLength({ min: 1 }).withMessage('Phone number is required'),
  body('value').isNumeric().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('currency').isIn(['USD', 'AED', 'EUR', 'SAR']).withMessage('Invalid currency'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const captchaOk = await verifyHcaptcha(req.body.hcaptchaToken);
    if (!captchaOk) {
      return res.status(400).json({ message: 'CAPTCHA verification failed. Please try again.' });
    }

    const { hcaptchaToken, ...leadFields } = req.body;
    const leadData = {
      ...leadFields,
      user: req.user._id
    };

    const lead = await Lead.create(leadData);
    await lead.populate('user', 'name email userId');

    // Notify all admins/superadmins about the new lead
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }, '_id');
    const notifData = admins.map(a => ({
      recipient: a._id,
      type: 'lead_submitted',
      title: 'New Lead Submitted',
      message: `${lead.user.name} submitted a lead for ${lead.companyName} (${lead.category})`,
      link: '/admin?tab=leads',
    }));
    if (notifData.length) Notification.insertMany(notifData).catch(() => {});

    res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error creating lead' });
  }
});

// @route   GET /api/leads
// @desc    Get user's leads
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const leads = await Lead.find({ user: req.user._id })
      .populate('user', 'name email userId')
      .sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error fetching leads' });
  }
});

// @route   GET /api/leads/admin/all
// @desc    Get all leads (Admin only, paginated)
// @access  Private/Admin
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 500));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('user', 'name email userId')
        .populate('notes.addedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(filter)
    ]);

    res.json({ data: leads, total, page, totalPages: Math.ceil(total / limit), limit });
  } catch (error) {
    console.error('Get all leads error:', error);
    res.status(500).json({ message: 'Server error fetching all leads' });
  }
});

// @route   GET /api/leads/:id
// @desc    Get single lead
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('user', 'name email userId');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if user owns the lead or is admin
    if (lead.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this lead' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Server error fetching lead' });
  }
});

// @route   PUT /api/leads/:id
// @desc    Update lead details (owner only, Pending leads)
// @access  Private
router.put('/:id', protect, [
  body('companyName').optional().trim().isLength({ min: 1, max: 100 }),
  body('contactPerson').optional().trim().isLength({ min: 1, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ min: 1 }),
  body('category').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('hasReference').optional().isBoolean(),
  body('referencePerson').optional().trim().isLength({ max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    if (lead.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this lead' });
    }
    if (lead.status !== 'Pending') {
      return res.status(400).json({ message: 'Only Pending leads can be edited' });
    }

    const allowed = ['companyName', 'contactPerson', 'email', 'phone', 'category', 'description', 'hasReference', 'referencePerson'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) lead[field] = req.body[field];
    });

    await lead.save({ validateBeforeSave: false });
    await lead.populate('user', 'name email userId');
    res.json(lead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server error updating lead' });
  }
});

// @route   PUT /api/leads/:id/status
// @desc    Update lead status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, [
  body('status').isIn([
    'Pending',
    'Contacted',
    'Deal Closed',
    'Proposal Submitted',
    'Client Refused'
  ]).withMessage('Invalid status'),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, note } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const wasNotClosed = lead.status !== 'Deal Closed';
    lead.status = status;

    if (note) {
      lead.notes.push({
        note,
        addedBy: req.user._id
      });
    }

    // Calculate and award commission the first time a lead reaches Deal Closed
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
    await lead.populate('user', 'name email userId');
    await lead.populate('notes.addedBy', 'name');

    res.json(lead);
  } catch (error) {
    console.error('Update lead status error:', error);
    res.status(500).json({ message: 'Server error updating lead status' });
  }
});

module.exports = router;
