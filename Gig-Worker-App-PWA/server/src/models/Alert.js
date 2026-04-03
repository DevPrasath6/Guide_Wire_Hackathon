const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: String,
  location: String,
  estimatedLoss: Number,
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);