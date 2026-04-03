const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  name: { type: String, required: true },
  provider: { type: String, enum: ['phone', 'google', 'apple'], default: 'phone' },
  providerId: { type: String, default: '' },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  role: { type: String, enum: ['worker', 'admin', 'superuser'], default: 'worker' },
  profile: {
    avatar: String,
    platform: String,
    zone: String,
    segment: { type: String, enum: ['commodity', 'food', 'transportation'], default: 'food' },
    dailyEarnings: { type: Number, default: 1000 },
    orderCapacity: { type: Number, default: 100 },
    workShift: { type: String, enum: ['day', 'night', 'mixed'], default: 'day' },
    workHours: { type: Number, default: 8 }
  },
  policy: {
    tier: { type: String, enum: ['Basic Shield', 'Standard Shield', 'Premium Shield'], default: 'Basic Shield' },
    planId: { type: String, enum: ['basic', 'standard', 'premium'], default: 'basic' },
    weeklyPremium: { type: Number, default: 25 },
    active: { type: Boolean, default: true },
    upgradedAt: Date,
    claimBanUntil: { type: Date, default: null },
    fraudStrikeCount: { type: Number, default: 0 },
    penaltyReason: { type: String, default: '' },
  },
  payout: {
    method: { type: String, enum: ['upi', 'bank', 'wallet'], default: 'upi' },
    upiId: String,
    bankName: String,
    accountNumber: String,
    ifsc: String,
    walletNumber: String
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  lastLocationAt: Date,
  isOnline: { type: Boolean, default: false },
}, { timestamps: true });

// Index for geospacial queries
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
