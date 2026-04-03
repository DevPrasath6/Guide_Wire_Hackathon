import mongoose from 'mongoose';
import { publicConnection } from '../config/db.js';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'security'],
      default: 'info'
    },
    read: { type: Boolean, default: false, index: true },
    meta: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const Notification =
  publicConnection.models.Notification || publicConnection.model('Notification', notificationSchema);
