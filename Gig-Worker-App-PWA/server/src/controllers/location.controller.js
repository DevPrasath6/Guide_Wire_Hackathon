const User = require('../models/User');
const LocationLog = require('../models/LocationLog');

// @desc    Update user GPS location
// @route   POST /api/location/update
// @access  Private
exports.updateLocation = async (req, res) => {
  try {
    const { longitude, latitude, lng, lat, accuracy, timestamp, source } = req.body;

    const resolvedLng = Number(longitude ?? lng);
    const resolvedLat = Number(latitude ?? lat);
    const resolvedAccuracy = accuracy === undefined ? null : Number(accuracy);

    if (Number.isNaN(resolvedLng) || Number.isNaN(resolvedLat)) {
      return res.status(400).json({ message: 'Please provide longitude and latitude' });
    }

    if (resolvedAccuracy !== null && resolvedAccuracy > 50) {
      return res.status(400).json({ message: 'Low location precision. Please enable GPS and retry.' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update GeoJSON location
    user.location = {
      type: 'Point',
      coordinates: [resolvedLng, resolvedLat] // GeoJSON format requires [lng, lat]
    };
    user.lastLocationAt = timestamp ? new Date(Number(timestamp)) : new Date();
    user.isOnline = true;
    
    await user.save();

    await LocationLog.create({
      userId: user._id,
      location: {
        type: 'Point',
        coordinates: [resolvedLng, resolvedLat]
      },
      accuracy: resolvedAccuracy,
      source: source || 'gps',
      capturedAt: user.lastLocationAt
    });

    // Emit live location update to socket for admin dashboards
    const io = req.app.get('io');
    if (io) {
      io.emit('location:update', {
        userId: user._id,
        name: user.name,
        location: user.location,
        timestamp: user.lastLocationAt,
        accuracy: resolvedAccuracy,
        platform: user.profile?.platform,
        zone: user.profile?.zone
      });
    }

    res.status(200).json({ success: true, message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
