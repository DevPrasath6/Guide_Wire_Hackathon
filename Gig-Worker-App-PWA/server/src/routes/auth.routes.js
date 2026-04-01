const express = require('express');
const router = express.Router();
const { registerUser, authUser, getMe, firebaseAuth, upgradePolicy, updateProfile, getTaxDocuments } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/firebase', firebaseAuth);
router.get('/profile', protect, getMe);
router.get('/tax-documents', protect, getTaxDocuments);
router.put('/profile', protect, updateProfile);
router.post('/upgrade-policy', protect, upgradePolicy);

module.exports = router;
