const express = require('express');
const { body, validationResult } = require('express-validator');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const buildSystemPrompt = (settings) => {
  const rates = {};
  if (settings?.commissionRates) {
    settings.commissionRates.forEach((v, k) => { rates[k] = v; });
  }
  const rateLines = Object.entries(rates).map(([industry, r]) =>
    `  - ${industry}: ${r.min}–${r.max}%`
  ).join('\n') || '  - IT Services (5-10%), Construction (5-10%), Real Estate (1-3%), Banking & Finance (0.5-2%), Insurance (2-8%)';

  const minUSD = settings?.minWithdrawalUSD ?? 10;
  const processingDays = settings?.withdrawalProcessingDays ?? '3-5';
  const email = settings?.supportEmail ?? 'contact@referus.co';
  const responseHours = settings?.supportResponseHours ?? 24;

  return `You are a friendly support assistant for Referus.co, a referral platform where users earn commissions by referring business leads.

Key facts:
- Free to join, no hidden fees. Users submit leads and earn when a deal closes.
- Commission rates by industry:\n${rateLines}
- Wallet currencies: USD, AED, EUR, SAR. Viewable in 150+ world currencies.
- Minimum withdrawal: $${minUSD} USD. Processing: ${processingDays} business days.
- Lead statuses: Pending → Contacted → Proposal Submitted → Deal Closed / Client Refused
- No limit on lead submissions. Global platform — any country accepted.
- One account per person. Password reset via email (link valid 1 hour).
- Support response time: within ${responseHours} hours on business days.
- Contact: ${email}

Keep answers short and friendly. If a question needs account-specific information (e.g. specific withdrawal status, a specific lead dispute, billing issue), reply with only: FORWARD_TO_SUPPORT`;
};

// @route   POST /api/chat/bot
router.post('/bot', [
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 1000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { message, history = [] } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        reply: "Our AI assistant is temporarily unavailable. Your query has been forwarded to our support team — they'll contact you within 24 hours.",
        forwarded: true,
      });
    }

    const settings = await Settings.findById('global');
    const systemPrompt = buildSystemPrompt(settings);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      systemInstruction: systemPrompt,
    });

    // Build prior chat history (max last 10 turns)
    const chatHistory = history.slice(-10).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text().trim();

    if (reply.includes('FORWARD_TO_SUPPORT')) {
      return res.json({
        reply: "Your question needs a look at your specific account. I've forwarded it to our support team and they'll get back to you within 24 hours. Anything else I can help with?",
        forwarded: true,
      });
    }

    res.json({ reply, forwarded: false });
  } catch (err) {
    console.error('Bot error:', err.message);
    res.json({
      reply: "I'm having a little trouble right now. Your query has been forwarded to our support team — they'll contact you within 24 hours.",
      forwarded: true,
    });
  }
});

// @route   POST /api/chat/send
// @desc    Send a message
// @access  Private
router.post('/send', protect, [
  body('receiverId').isMongoId().withMessage('Valid receiver ID is required'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, message } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create message
    const chatMessage = await ChatMessage.create({
      sender: req.user._id,
      receiver: receiverId,
      message
    });

    await chatMessage.populate('sender', 'name email');
    await chatMessage.populate('receiver', 'name email');

    res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

// @route   GET /api/chat/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    // Get all unique users the current user has chatted with
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
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
                {
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            role: '$user.role'
          },
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
});

// @route   GET /api/chat/messages/:userId
// @desc    Get messages with a specific user
// @access  Private
router.get('/messages/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get messages between current user and the other user
    const messages = await ChatMessage.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await ChatMessage.updateMany(
      { sender: userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// @route   GET /api/chat/admin/users
// @desc    Get all users for admin chat
// @access  Private
router.get('/admin/users', protect, async (req, res) => {
  try {
    // Only admins can access this
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({ role: 'user' })
      .select('name email')
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    console.error('Get users for admin chat error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

module.exports = router;
