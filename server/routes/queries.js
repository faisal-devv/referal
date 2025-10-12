const express = require('express');
const Query = require('../models/Query');

const router = express.Router();

// @route   POST /api/queries
// @desc    Create a new contact query (public)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const query = await Query.create({ name, email, subject, message });
    return res.status(201).json(query);
  } catch (error) {
    console.error('Create query error:', error);
    return res.status(500).json({ message: 'Server error creating query' });
  }
});

module.exports = router;
