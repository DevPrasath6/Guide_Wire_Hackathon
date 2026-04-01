import mongoose from 'mongoose';
import { publicConnection } from '../config/db.js';

const claimSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    hours: { type: Number, required: true },
    lat: Number,
    lng: Number,
    note: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'under_review'],
      default: 'pending',
      index: true
    },
    reason: String,
    instantAmount: { type: Number, default: 0 },
    heldAmount: { type: Number, default: 0 },
    claimedAmount: { type: Number, default: 0 },
    calculatedLoss: { type: Number, default: 0 },
    aiConfidence: { type: Number, default: 0 },
    aiDecision: { type: String, default: 'pending' },
    aiBreakdown: {
      weatherSignal: { type: Number, default: 0 },
      locationTrust: { type: Number, default: 0 },
      fraudRisk: { type: Number, default: 0 },
      policyFit: { type: Number, default: 0 }
    },
    fraudFlag: { type: Boolean, default: false, index: true },
    fraudScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Claim = publicConnection.models.Claim || publicConnection.model('Claim', claimSchema);
