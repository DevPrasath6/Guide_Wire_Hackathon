import mongoose from 'mongoose';
import { publicConnection } from '../config/db.js';

const employeeProfileSchema = new mongoose.Schema(
  {
    department: { type: String, default: 'operations' },
    title: { type: String, default: 'Employee' }
  },
  { _id: false }
);

const workerProfileSchema = new mongoose.Schema(
  {
    avatar: String,
    platform: { type: String, default: 'Rapido' },
    zone: { type: String, default: 'Coimbatore' },
    segment: { type: String, default: 'transportation' },
    dailyEarnings: { type: Number, default: 1200 },
    orderCapacity: { type: Number, default: 50 },
    workShift: { type: String, default: 'day' },
    workHours: { type: Number, default: 8 }
  },
  { _id: false }
);

const policySchema = new mongoose.Schema(
  {
    tier: { type: String, default: 'Standard Shield' },
    planId: { type: String, default: 'standard' },
    weeklyPremium: { type: Number, default: 45 },
    active: { type: Boolean, default: true },
    claimBanUntil: Date,
    fraudStrikeCount: { type: Number, default: 0 }
  },
  { _id: false }
);

const payoutSchema = new mongoose.Schema(
  {
    method: { type: String, default: 'upi' },
    upiId: String,
    bankAccount: String
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    lat: Number,
    lng: Number,
    accuracy: Number,
    source: { type: String, default: 'gps' },
    timestamp: { type: Number, default: Date.now }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, index: true },
    passwordHash: String,
    photoURL: String,
    firebase: {
      uid: { type: String, index: true, sparse: true },
      providerId: String
    },
    role: {
      type: String,
      enum: ['worker', 'employee', 'analyst', 'support', 'admin', 'superadmin'],
      default: 'worker'
    },
    permissions: [{ type: String }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' }],
    employeeProfile: employeeProfileSchema,
    profile: workerProfileSchema,
    policy: policySchema,
    payout: payoutSchema,
    currentLocation: locationSchema,
    locationHistory: [locationSchema],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const User = publicConnection.models.User || publicConnection.model('User', userSchema);
