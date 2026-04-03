import mongoose from 'mongoose';
import { privateConnection } from '../config/db.js';

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    actorEmail: String,
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: String,
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, enum: ['success', 'denied', 'failed'], default: 'success' },
    reason: String,
    changes: mongoose.Schema.Types.Mixed,
    ip: String,
    userAgent: String
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });

export const AuditLog =
  privateConnection.models.AuditLog || privateConnection.model('AuditLog', auditLogSchema);
