import mongoose from 'mongoose';
import { publicConnection } from '../config/db.js';

const taxDocumentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fiscalYear: { type: String, required: true },
    type: { type: String, enum: ['statement', 'invoice', 'certificate'], default: 'statement' },
    fileName: String,
    fileUrl: String
  },
  { timestamps: true }
);

export const TaxDocument =
  publicConnection.models.TaxDocument || publicConnection.model('TaxDocument', taxDocumentSchema);
