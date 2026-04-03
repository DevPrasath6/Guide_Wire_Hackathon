const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimId: { type: String, unique: true, index: true },
  type: { type: String, required: true },
  hours: { type: Number, required: true },
  note: { type: String, default: '' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  aiScore: { type: Number, default: null },
  status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'pending' },
  decisionSource: { type: String, enum: ['es-ai', 'admin', 'system'], default: 'es-ai' },
  instantAmount: { type: Number, default: 0 },
  heldAmount: { type: Number, default: 0 },
  fraudFlag: { type: Boolean, default: false },
  reviewReason: { type: String, default: '' },
}, { timestamps: true });

claimSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Claim', claimSchema);
