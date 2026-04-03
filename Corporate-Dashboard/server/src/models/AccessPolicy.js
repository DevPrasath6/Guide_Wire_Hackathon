import mongoose from 'mongoose';
import { privateConnection } from '../config/db.js';

const statementSchema = new mongoose.Schema(
  {
    resource: { type: String, required: true },
    action: { type: String, required: true },
    effect: { type: String, enum: ['allow', 'deny'], default: 'allow' }
  },
  { _id: false }
);

const accessPolicySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    statements: [statementSchema],
    permissions: [{ type: String }]
  },
  { timestamps: true }
);

export const AccessPolicy =
  privateConnection.models.AccessPolicy || privateConnection.model('AccessPolicy', accessPolicySchema);
