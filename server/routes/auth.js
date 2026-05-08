const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  validate: { xForwardedForHeader: false },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many accounts created from this IP. Please try again after an hour.' },
  validate: { xForwardedForHeader: false },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── userId generator ──────────────────────────────────────────────────────────

const generateUserId = async (name) => {
  const parts = name.trim().toLowerCase().split(/\s+/);
  const first = parts[0].replace(/[^a-z0-9]/g, '').slice(0, 8);
  const lastInitial = parts.length > 1
    ? (parts[parts.length - 1][0] || '').replace(/[^a-z]/g, '')
    : '';
  const prefix = first + lastInitial;

  // Find the highest 7-digit counter across all existing userIds
  const users = await User.find({ userId: { $exists: true, $ne: null } }, 'userId');
  let maxNum = 999;
  for (const u of users) {
    if (u.userId && u.userId.length >= 7) {
      const tail = parseInt(u.userId.slice(-7), 10);
      if (!isNaN(tail) && tail > maxNum) maxNum = tail;
    }
  }

  const suffix = String(maxNum + 1).padStart(7, '0');
  return `${prefix}${suffix}`;
};

// ── Welcome email ─────────────────────────────────────────────────────────────

const sendWelcomeEmail = async (email, name, userId) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`[DEV] Welcome email for ${email} — User ID: ${userId}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"Referus" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Welcome to Referus.co — Your User ID',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#1e293b">Welcome to Referus.co, ${name}!</h2>
        <p style="color:#475569">Your account has been created successfully. Here is your unique User ID — keep it handy, you may need it when contacting support or referencing your account.</p>
        <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;margin:24px 0;text-align:center">
          <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em">Your User ID</p>
          <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:.04em;color:#4f46e5">${userId}</p>
        </div>
        <p style="color:#94a3b8;font-size:13px">This ID is unique to you. You can also view it anytime on your profile page.</p>
        <p style="color:#475569">Happy referring!</p>
        <p style="color:#475569"><strong>— The Referus Team</strong></p>
      </div>
    `,
  });
};

const sendResetEmail = async (email, resetUrl) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP is not configured. Set SMTP_HOST and SMTP_USER env vars.');
    }
    console.log(`[DEV] Password reset link for ${email}:\n${resetUrl}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: `"Referus" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your Referus password',
    html: `
      <p>You requested a password reset for your Referus account.</p>
      <p>Click the link below to set a new password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#1d4ed8;color:#fff;border-radius:6px;text-decoration:none;">Reset Password</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
};

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerLimiter, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if registration is allowed
    const settings = await Settings.findById('global');
    if (settings && settings.allowRegistration === false) {
      return res.status(403).json({ message: 'New registrations are currently disabled. Please contact support.' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate unique userId
    const userId = await generateUserId(name);

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      userId,
    });

    if (user) {
      // Send welcome email with userId (non-blocking — don't fail registration if email fails)
      sendWelcomeEmail(user.email, user.name, user.userId).catch(err =>
        console.error('Failed to send welcome email:', err)
      );

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId,
        wallet: user.wallet,
        preferredCurrency: user.preferredCurrency,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error?.message, error?.stack);
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ message: 'Server error during registration', error: error?.message });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId,
        wallet: user.wallet,
        preferredCurrency: user.preferredCurrency,
        phone: user.phone,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current user's name and/or password
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, profileImage, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name && name.trim().length >= 2) user.name = name.trim();
    if (typeof phone === 'string') user.phone = phone.trim();
    if (typeof profileImage === 'string') {
      if (profileImage && !profileImage.startsWith('data:image/')) {
        return res.status(400).json({ message: 'Invalid image format' });
      }
      user.profileImage = profileImage;
    }

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required to set a new password' });
      if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
      user.password = newPassword;
    }

    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, profileImage: user.profileImage });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', loginLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Always respond with success to avoid email enumeration
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    try {
      await sendResetEmail(user.email, resetUrl);
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }

    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
