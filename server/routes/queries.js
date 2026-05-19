const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Query = require('../models/Query');
const { sendContactQueryEmail } = require('../utils/email');

const router = express.Router();

const queryRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many submissions. Please try again later.' },
  validate: { xForwardedForHeader: false },
});

// @route   POST /api/queries
// @desc    Create a new contact query (public)
// @access  Public
router.post('/', queryRateLimit, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('subject').trim().isLength({ min: 2, max: 200 }).withMessage('Subject must be 2–200 characters'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be 10–2000 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  try {
    const { name, email, subject, message } = req.body;
    const query = await Query.create({ name, email, subject, message });
    sendContactQueryEmail(name, email, subject, message).catch(() => {});
    return res.status(201).json(query);
  } catch (error) {
    console.error('Create query error:', error);
    return res.status(500).json({ message: 'Server error creating query' });
  }
});

module.exports = router;
