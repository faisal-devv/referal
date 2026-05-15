const mongoose = require('mongoose');

const botMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true, maxlength: 2000 },
  forwarded:    { type: Boolean, default: false },
  isAdminReply: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('BotMessage', botMessageSchema);
