const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wallet
// @desc    Get user's wallet balance
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wallet');
    res.json(user.wallet);
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Server error fetching wallet' });
  }
});

// @route   POST /api/wallet/withdraw
// @desc    Request withdrawal
// @access  Private
router.post('/withdraw', protect, [
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('currency').isIn(['USD', 'AED', 'EUR', 'SAR']).withMessage('Invalid currency'),
  body('bankDetails.accountHolderName').trim().isLength({ min: 1 }).withMessage('Account holder name is required'),
  body('bankDetails.bankName').trim().isLength({ min: 1 }).withMessage('Bank name is required'),
  body('bankDetails.accountNumber').trim().isLength({ min: 1 }).withMessage('Account number is required'),
  body('bankDetails.routingNumber').trim().isLength({ min: 1 }).withMessage('Routing number is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency, bankDetails } = req.body;
    const user = await User.findById(req.user._id);

    // Check if user has sufficient balance
    if (user.wallet[currency.toLowerCase()] < amount) {
      return res.status(400).json({ 
        message: `Insufficient balance. Available: ${user.wallet[currency.toLowerCase()]} ${currency}` 
      });
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      amount,
      currency,
      bankDetails
    });

    await withdrawal.populate('user', 'name email');
    res.status(201).json(withdrawal);
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ message: 'Server error processing withdrawal request' });
  }
});

// @route   GET /api/wallet/withdrawals
// @desc    Get user's withdrawal history
// @access  Private
router.get('/withdrawals', protect, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id })
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(withdrawals);
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Server error fetching withdrawals' });
  }
});

// @route   GET /api/wallet/admin/withdrawals
// @desc    Get all withdrawal requests (Admin only)
// @access  Private/Admin
router.get('/admin/withdrawals', protect, adminOnly, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('user', 'name email')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(withdrawals);
  } catch (error) {
    console.error('Get all withdrawals error:', error);
    res.status(500).json({ message: 'Server error fetching all withdrawals' });
  }
});

// @route   PUT /api/wallet/admin/withdrawals/:id
// @desc    Update withdrawal status (Admin only)
// @access  Private/Admin
router.put('/admin/withdrawals/:id', protect, adminOnly, [
  body('status').isIn(['pending', 'approved', 'rejected', 'processed']).withMessage('Invalid status'),
  body('adminNotes').optional().trim().isLength({ max: 500 }).withMessage('Admin notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, adminNotes } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    withdrawal.status = status;
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    
    if (adminNotes) {
      withdrawal.adminNotes = adminNotes;
    }

    // If approved, deduct from user's wallet
    if (status === 'approved') {
      const user = await User.findById(withdrawal.user);
      const currency = withdrawal.currency.toLowerCase();
      
      if (user.wallet[currency] >= withdrawal.amount) {
        user.wallet[currency] -= withdrawal.amount;
        await user.save();
      } else {
        return res.status(400).json({ message: 'Insufficient balance for withdrawal' });
      }
    }

    await withdrawal.save();
    await withdrawal.populate('user', 'name email');
    await withdrawal.populate('processedBy', 'name');

    res.json(withdrawal);
  } catch (error) {
    console.error('Update withdrawal status error:', error);
    res.status(500).json({ message: 'Server error updating withdrawal status' });
  }
});

// @route   PUT /api/wallet/admin/balance
// @desc    Update user wallet balance (Admin only)
// @access  Private/Admin
router.put('/admin/balance', protect, adminOnly, [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('currency').isIn(['USD', 'AED', 'EUR', 'SAR']).withMessage('Invalid currency'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('operation').isIn(['add', 'subtract', 'set']).withMessage('Operation must be add, subtract, or set')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, currency, amount, operation } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currencyKey = currency.toLowerCase();
    const currentBalance = user.wallet[currencyKey];

    switch (operation) {
      case 'add':
        user.wallet[currencyKey] += amount;
        break;
      case 'subtract':
        if (user.wallet[currencyKey] < amount) {
          return res.status(400).json({ message: 'Insufficient balance' });
        }
        user.wallet[currencyKey] -= amount;
        break;
      case 'set':
        user.wallet[currencyKey] = amount;
        break;
    }

    await user.save();
    res.json({ 
      message: 'Wallet updated successfully',
      wallet: user.wallet 
    });
  } catch (error) {
    console.error('Update wallet balance error:', error);
    res.status(500).json({ message: 'Server error updating wallet balance' });
  }
});

module.exports = router;
