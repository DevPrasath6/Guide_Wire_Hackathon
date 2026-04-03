const mongoose = require('mongoose');

const locationLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  accuracy: { type: Number, default: null },
  source: { type: String, enum: ['gps', 'network', 'unknown'], default: 'gps' },
  capturedAt: { type: Date, default: Date.now }
}, { timestamps: true });

locationLogSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('LocationLog', locationLogSchema);
