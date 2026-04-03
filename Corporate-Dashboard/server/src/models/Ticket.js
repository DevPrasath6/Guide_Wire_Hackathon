import mongoose from 'mongoose';
import { publicConnection } from '../config/db.js';

const messageSchema = new mongoose.Schema(
  {
    senderType: { type: String, enum: ['worker', 'employee', 'system'], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    body: { type: String, required: true }
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true },
    relatedClaim: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
    question: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'escalated', 'closed'],
      default: 'open',
      index: true
    },
    messages: [messageSchema],
    escalated: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Ticket = publicConnection.models.Ticket || publicConnection.model('Ticket', ticketSchema);
