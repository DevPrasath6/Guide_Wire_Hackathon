const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ active: true }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    // In real app, socket.io broadcast here
    const io = req.app.get('io');
    if (io) io.emit('new_alert', alert);
    
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};