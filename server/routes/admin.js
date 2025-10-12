const express = require('express');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const Query = require('../models/Query');

const router = express.Router();

// @route   GET /api/admin/leads
// @desc    Get all leads for admin
// @access  Private (Admin only)
router.get('/leads', protect, adminOnly, async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (error) {
    console.error('Admin fetch leads error:', error);
    res.status(500).json({ message: 'Server error fetching leads' });
  }
});

// @route   PUT /api/admin/leads/:id/status
// @desc    Update lead status (Admin only)
// @access  Private (Admin only)
router.put('/leads/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.status = status;
    await lead.save();

    const updatedLead = await Lead.findById(req.params.id)
      .populate('user', 'name email');

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

module.exports = router;
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
