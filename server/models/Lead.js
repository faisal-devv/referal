const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
    maxlength: [100, 'Category cannot be more than 100 characters']
  },
  companyName: {
    type: String,
    required: [true, 'Please provide company name'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  contactPerson: {
    type: String,
    required: [true, 'Please provide contact person name'],
    trim: true,
    maxlength: [50, 'Contact person name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide contact email'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please provide contact phone'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide lead description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  hasReference: {
    type: Boolean,
    default: false
  },
  referencePerson: {
    type: String,
    trim: true,
    maxlength: [100, 'Reference person name cannot be more than 100 characters']
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Contacted',
      'Deal Closed',
      'Proposal Submitted',
      'Client Refused'
    ],
    default: 'Pending'
  },
  value: {
    type: Number,
    required: [true, 'Please provide estimated deal value'],
    min: [0, 'Deal value cannot be negative']
  },
  currency: {
    type: String,
    enum: ['USD', 'AED', 'EUR', 'SAR'],
    default: 'USD'
  },
  commission: {
    type: Number,
    default: 0
  },
  notes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
