const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const chat = require('../controllers/chat.controller');

router.get('/tickets', protect, chat.listTickets);
router.get('/claims', protect, chat.getClaimsForTicket);
router.post('/tickets', protect, chat.createTicket);
router.post('/tickets/:ticketId/message', protect, chat.postMessage);
router.post('/tickets/:ticketId/escalate', protect, chat.escalateTicket);
router.post('/tickets/:ticketId/close', protect, chat.closeTicketByUser);

// corporate dashboard controls
router.get('/admin/tickets', protect, chat.listAllTickets);
router.post('/admin/tickets/:ticketId/close', protect, chat.closeTicketByAgent);
router.post('/admin/tickets/:ticketId/reopen', protect, chat.reopenTicketByAgent);

module.exports = router;
