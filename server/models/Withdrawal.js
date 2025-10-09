const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide withdrawal amount'],
    min: [1, 'Withdrawal amount must be at least 1']
  },
  currency: {
    type: String,
    required: [true, 'Please select currency'],
    enum: ['USD', 'AED', 'EUR', 'SAR']
  },
  bankDetails: {
    accountHolderName: {
      type: String,
      required: [true, 'Please provide account holder name'],
      trim: true
    },
    bankName: {
      type: String,
      required: [true, 'Please provide bank name'],
      trim: true
    },
    accountNumber: {
      type: String,
      required: [true, 'Please provide account number'],
      trim: true
    },
    routingNumber: {
      type: String,
      required: [true, 'Please provide routing number'],
      trim: true
    },
    iban: {
      type: String,
      trim: true
    },
    swiftCode: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
