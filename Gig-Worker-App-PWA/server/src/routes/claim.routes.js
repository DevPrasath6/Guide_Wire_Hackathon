const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claim.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

/**
 * @swagger
 * /api/claims/create:
 *   post:
 *     summary: Submit a new claim
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               hours:
 *                 type: number
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               evidence:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Claim created successfully
 */
router.post('/create', protect, upload.array('evidence', 5), claimController.submitClaim);

/**
 * @swagger
 * /api/claims/my-claims:
 *   get:
 *     summary: Get all claims for the authenticated user
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user claims
 */
router.get('/my-claims', protect, claimController.getUserClaims);
router.get('/my-summary', protect, claimController.getMyClaimSummary);
router.get('/:id', protect, claimController.getClaimById);

module.exports = router;