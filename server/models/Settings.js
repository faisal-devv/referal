const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // singleton — only one document ever exists
  _id: { type: String, default: 'global' },

  // Platform contact
  supportEmail: { type: String, default: 'contact@referus.co' },
  supportResponseHours: { type: Number, default: 24 },

  // Registration
  allowRegistration: { type: Boolean, default: true },

  // Withdrawal
  minWithdrawalUSD: { type: Number, default: 10 },
  withdrawalProcessingDays: { type: String, default: '3-5' },

  // Commission rates per industry
  commissionRates: {
    type: Map,
    of: {
      min: { type: Number },
      max: { type: Number }
    },
    default: {
      'IT / Software Development': { min: 5,   max: 10 },
      'Banking & Finance':         { min: 0.5, max: 2  },
      'Real Estate':               { min: 1,   max: 3  },
      'Construction':              { min: 5,   max: 10 },
      'Insurance':                 { min: 2,   max: 8  },
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
