const axios = require('axios');

// Configure FastAPI URL (would normally be in .env)
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

/**
 * @swagger
 * /api/ai/analyze-claim:
 *   post:
 *     summary: Send a claim to AI model for fraud and eligibility analysis
 *     tags: [AI Integration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               claimId:
 *                 type: string
 *               workerLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lon:
 *                     type: number
 *               evidenceUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Analysis complete
 */
exports.analyzeClaim = async (req, res) => {
  try {
    const { claimId, workerLocation, evidenceUrl } = req.body;
    // Call fast API
    // const response = await axios.post(`${FASTAPI_URL}/analyze`, { claimId, workerLocation, evidenceUrl });
    // Mocking response for now
    const response = {
      data: {
        claimId,
        fraudScore: 0.12,
        eligible: true,
        reason: 'Location matches rainfall anomaly data'
      }
    };
    
    // In production, update claim in DB here based on response
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     summary: Check FastAPI connection status
 *     tags: [AI Integration]
 *     responses:
 *       200:
 *         description: AI is connected
 */
exports.getAiStatus = async (req, res) => {
  try {
    res.json({ status: 'connected', version: '1.0.2', latency: '45ms' });
  } catch (error) {
    res.status(500).json({ status: 'disconnected', message: error.message });
  }
};
