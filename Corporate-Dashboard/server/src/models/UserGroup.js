import mongoose from 'mongoose';
import { privateConnection } from '../config/db.js';

const userGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    permissions: [{ type: String }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }]
  },
  { timestamps: true }
);

export const UserGroup =
  privateConnection.models.UserGroup || privateConnection.model('UserGroup', userGroupSchema);
