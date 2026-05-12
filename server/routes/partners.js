const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerApplication = require('../models/PartnerApplication');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const FREE_EMAIL_DOMAINS = [
  'gmail.com','yahoo.com','hotmail.com','outlook.com','live.com','icloud.com',
  'aol.com','mail.com','protonmail.com','zoho.com','yandex.com','gmx.com',
  'inbox.com','fastmail.com','me.com','msn.com','yahoo.co.uk','yahoo.in',
];

const isFreeEmail = (email) => {
  const domain = (email || '').split('@')[1]?.toLowerCase();
  return FREE_EMAIL_DOMAINS.includes(domain);
};

const VALID_INDUSTRIES = [
  'IT & ERP Services',
  'Banking & Finance',
  'Real Estate',
  'Construction & Interior Design',
  'Insurance',
];

// @route   POST /api/partners/apply
// @desc    Submit a partner application (public)
// @access  Public
router.post('/apply', [
  body('companyName').trim().notEmpty().withMessage('Company name is required').isLength({ max: 200 }),
  body('websiteUrl').trim().notEmpty().withMessage('Website URL is required').isLength({ max: 300 }),
  body('companyPhone').trim().notEmpty().withMessage('Company phone is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('industryService').trim().notEmpty().withMessage('Industry/Service is required'),
  body('yearEstablished').isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Please enter a valid year'),
  body('contactFullName').trim().notEmpty().withMessage('Full name is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  body('contactEmail').isEmail().withMessage('Please enter a valid email address').normalizeEmail({ gmail_remove_dots: false }),
  body('interestedIndustries').isArray({ min: 1 }).withMessage('Please select at least one industry'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (isFreeEmail(req.body.contactEmail)) {
      return res.status(400).json({ errors: [{ path: 'contactEmail', msg: 'Please use a company email address, not a personal email' }] });
    }

    const invalidIndustries = (req.body.interestedIndustries || []).filter(i => !VALID_INDUSTRIES.includes(i));
    if (invalidIndustries.length > 0) {
      return res.status(400).json({ errors: [{ path: 'interestedIndustries', msg: 'Invalid industry selected' }] });
    }

    const existing = await PartnerApplication.findOne({ contactEmail: req.body.contactEmail.toLowerCase() });
    if (existing) {
      return res.status(400).json({ errors: [{ path: 'contactEmail', msg: 'An application with this email already exists' }] });
    }

    const application = await PartnerApplication.create({
      companyName:          req.body.companyName,
      websiteUrl:           req.body.websiteUrl,
      companyPhone:         req.body.companyPhone,
      country:              req.body.country,
      city:                 req.body.city,
      industryService:      req.body.industryService,
      yearEstablished:      req.body.yearEstablished,
      companySize:          req.body.companySize || '',
      contactFullName:      req.body.contactFullName,
      designation:          req.body.designation,
      linkedIn:             req.body.linkedIn || '',
      contactEmail:         req.body.contactEmail,
      businessPhone:        req.body.businessPhone || '',
      interestedIndustries: req.body.interestedIndustries,
    });

    res.status(201).json({ message: 'Application submitted successfully', id: application._id });
  } catch (error) {
    console.error('Partner application error:', error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
});

// @route   GET /api/partners/applications
// @desc    Get all partner applications (admin only)
// @access  Private/Admin
router.get('/applications', protect, adminOnly, async (req, res) => {
  try {
    const applications = await PartnerApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Get partner applications error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

// @route   PUT /api/partners/applications/:id/status
// @desc    Update application status (admin only)
// @access  Private/Admin
router.put('/applications/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const app = await PartnerApplication.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
