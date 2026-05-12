const mongoose = require('mongoose');

const partnerApplicationSchema = new mongoose.Schema({
  // Section 1 — Company Information
  companyName:      { type: String, required: true, trim: true, maxlength: 200 },
  websiteUrl:       { type: String, required: true, trim: true, maxlength: 300 },
  companyPhone:     { type: String, required: true, trim: true, maxlength: 30 },
  country:          { type: String, required: true, trim: true, maxlength: 100 },
  city:             { type: String, required: true, trim: true, maxlength: 100 },
  industryService:  { type: String, required: true, trim: true, maxlength: 200 },
  yearEstablished:  { type: Number, required: true, min: 1800, max: new Date().getFullYear() },
  companySize:      { type: String, trim: true, default: '' },

  // Section 2 — Contact Person
  contactFullName:  { type: String, required: true, trim: true, maxlength: 150 },
  designation:      { type: String, required: true, trim: true, maxlength: 150 },
  linkedIn:         { type: String, trim: true, default: '' },
  contactEmail:     { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
  businessPhone:    { type: String, trim: true, default: '' },

  // Interested industries (multi-select)
  interestedIndustries: { type: [String], required: true, validate: v => v.length > 0 },

  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('PartnerApplication', partnerApplicationSchema);
