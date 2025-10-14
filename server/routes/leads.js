const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const { protect, adminOnly } = require('../middleware/auth');

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

    const leadData = {
      ...req.body,
      user: req.user._id
    };

    const lead = await Lead.create(leadData);
    await lead.populate('user', 'name email');
    
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
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error fetching leads' });
  }
});

// @route   GET /api/leads/:id
// @desc    Get single lead
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('user', 'name email');
    
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

    lead.status = status;
    
    if (note) {
      lead.notes.push({
        note,
        addedBy: req.user._id
      });
    }

    await lead.save();
    await lead.populate('user', 'name email');
    await lead.populate('notes.addedBy', 'name');

    res.json(lead);
  } catch (error) {
    console.error('Update lead status error:', error);
    res.status(500).json({ message: 'Server error updating lead status' });
  }
});

// @route   GET /api/leads/admin/all
// @desc    Get all leads (Admin only)
// @access  Private/Admin
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate('user', 'name email')
      .populate('notes.addedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (error) {
    console.error('Get all leads error:', error);
    res.status(500).json({ message: 'Server error fetching all leads' });
  }
});

module.exports = router;
