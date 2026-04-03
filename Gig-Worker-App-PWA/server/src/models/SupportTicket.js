const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'bot', 'agent', 'system'], required: true },
  senderName: { type: String, default: '' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ticketId: { type: String, required: true, unique: true },
  category: { type: String, enum: ['general', 'claim', 'payment', 'policy'], required: true },
  relatedClaimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', default: null },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  escalatedToAgent: { type: Boolean, default: false },
  agentName: { type: String, default: '' },
  closedBy: { type: String, enum: ['user', 'agent', 'system', 'none'], default: 'none' },
  messages: { type: [messageSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
