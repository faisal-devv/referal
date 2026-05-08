const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['lead_submitted', 'lead_status_updated', 'deal_closed', 'withdrawal_requested'],
    required: true,
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  link:    { type: String, default: '' },
  isRead:  { type: Boolean, default: false, index: true },
}, { timestamps: true });

// Helper used by routes to create a notification without duplicating logic
notificationSchema.statics.create_ = async function ({ recipient, type, title, message, link = '' }) {
  return this.create({ recipient, type, title, message, link });
};

module.exports = mongoose.model('Notification', notificationSchema);
