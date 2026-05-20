const express = require('express');
const { body, validationResult } = require('express-validator');
const ChatMessage = require('../models/ChatMessage');
const BotMessage = require('../models/BotMessage');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const BOT_KNOWLEDGE = require('../data/botKnowledge');
const Notification = require('../models/Notification');
const { sendBotMessageAlert } = require('../utils/email');

const router = express.Router();

const buildSystemPrompt = (settings) => {
  const minUSD = settings?.minWithdrawalUSD ?? 10;
  const processingDays = settings?.withdrawalProcessingDays ?? '3-5';
  const email = settings?.supportEmail ?? 'contact@referus.co';
  const responseHours = settings?.supportResponseHours ?? 24;

  return `You are a friendly support assistant for Referus.co.

Platform facts:
- Free to join, no hidden fees. Users submit leads and earn when a deal closes.
- Wallet currencies: USD, AED, EUR, SAR. Viewable in 150+ world currencies.
- Minimum withdrawal: $${minUSD} USD. Processing: ${processingDays} business days.
- Lead statuses: Pending → Contacted → Proposal Submitted → Deal Closed / Client Refused
- No limit on lead submissions. Global platform — any country accepted.
- One account per person. Password reset via email (link valid 1 hour).
- Support response time: within ${responseHours} hours on business days.
- Contact: ${email}

${BOT_KNOWLEDGE}

Instructions:
- Use the knowledge base above to answer questions directly and confidently.
- Keep answers short, clear, and friendly.
- If a question needs account-specific information (e.g. specific withdrawal status, a specific lead dispute, billing issue), reply with only: FORWARD_TO_SUPPORT`;
};

// Helper: extract user from JWT without hard-failing (optional auth)
const tryGetUser = async (req) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || null;
  } catch {
    return null;
  }
};

// @route   POST /api/chat/bot
router.post('/bot', [
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 1000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { message, history = [] } = req.body;
  const userId = await tryGetUser(req);

  // If admin has paused the bot for this user, save msg but skip AI
  if (userId) {
    const userDoc = await User.findById(userId).select('botPaused name');
    if (userDoc?.botPaused) {
      await BotMessage.create({ user: userId, role: 'user', content: message });
      // Notify all admins
      User.find({ role: { $in: ['admin', 'superadmin'] } }).select('_id').then(admins => {
        const notifications = admins.map(a => ({
          recipient: a._id,
          type: 'user_message',
          title: 'New message from user',
          message: `${userDoc.name} sent a message: "${message.slice(0, 80)}${message.length > 80 ? '…' : ''}"`,
          link: '/admin',
        }));
        if (notifications.length > 0) Notification.insertMany(notifications).catch(() => {});
      }).catch(() => {});
      return res.json({ reply: "Our support team is reviewing your conversation and will reply shortly.", botPaused: true });
    }
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      if (userId) {
        BotMessage.insertMany([
          { user: userId, role: 'user', content: message },
          { user: userId, role: 'assistant', content: "Our AI assistant is temporarily unavailable. Your query has been forwarded to our support team — they'll contact you within 24 hours.", forwarded: true },
        ]).catch(() => {});
      }
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

    let finalReply = reply;
    let forwarded = false;

    if (reply.includes('FORWARD_TO_SUPPORT')) {
      finalReply = "Your question needs a look at your specific account. I've forwarded it to our support team and they'll get back to you within 24 hours. Anything else I can help with?";
      forwarded = true;
    }

    if (userId) {
      BotMessage.insertMany([
        { user: userId, role: 'user', content: message },
        { user: userId, role: 'assistant', content: finalReply, forwarded },
      ]).catch(() => {});

      // Alert team only on first message of a new session
      if (history.length === 0) {
        const userDoc = await User.findById(userId).select('userId name').catch(() => null);
        if (userDoc) sendBotMessageAlert(userDoc.userId, userDoc.name).catch(() => {});
      }
    }

    res.json({ reply: finalReply, forwarded });
  } catch (err) {
    console.error('Bot error:', err.message);
    const errReply = "I'm having a little trouble right now. Your query has been forwarded to our support team — they'll contact you within 24 hours.";
    if (userId) {
      BotMessage.insertMany([
        { user: userId, role: 'user', content: message },
        { user: userId, role: 'assistant', content: errReply, forwarded: true },
      ]).catch(() => {});
    }
    res.json({ reply: errReply, forwarded: true });
  }
});

// @route   GET /api/chat/bot/history
// @desc    Get bot chat history for current user
// @access  Private
router.get('/bot/history', protect, async (req, res) => {
  try {
    const messages = await BotMessage.find({ user: req.user._id })
      .sort({ createdAt: 1 })
      .limit(200);
    res.json(messages);
  } catch (err) {
    console.error('Bot history error:', err);
    res.status(500).json({ message: 'Server error fetching bot history' });
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
router.get('/admin/users', protect, adminOnly, async (req, res) => {
  try {
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
