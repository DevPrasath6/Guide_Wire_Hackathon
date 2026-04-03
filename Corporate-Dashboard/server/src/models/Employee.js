import mongoose from 'mongoose';
import { privateConnection } from '../config/db.js';

const employeeProfileSchema = new mongoose.Schema(
  {
    department: { type: String, default: 'operations' },
    title: { type: String, default: 'Employee' }
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['employee', 'analyst', 'support', 'admin', 'superadmin'],
      default: 'employee'
    },
    permissions: [{ type: String }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' }],
    employeeProfile: employeeProfileSchema,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Employee =
  privateConnection.models.Employee || privateConnection.model('Employee', employeeSchema);
