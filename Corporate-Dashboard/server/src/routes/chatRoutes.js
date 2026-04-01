import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { Ticket } from '../models/Ticket.js';
import { Claim } from '../models/Claim.js';
import { PERMISSIONS } from '../config/permissions.js';
import { writeAuditLog } from '../services/auditService.js';

const router = express.Router();

router.get('/tickets', authRequired, async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id }).sort({ updatedAt: -1 });
  return res.json(tickets);
});

router.get('/claims', authRequired, async (req, res) => {
  const claims = await Claim.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(15);
  return res.json(claims);
});

router.post('/tickets', authRequired, async (req, res) => {
  const { category, relatedClaimId, question } = req.body;
  const ticket = await Ticket.create({
    user: req.user._id,
    category,
    relatedClaim: relatedClaimId,
    question,
    messages: [{ senderType: 'worker', senderId: req.user._id, body: question }]
  });

  req.app.locals.io?.emit('chat:ticket:update', ticket);
  return res.status(201).json(ticket);
});

router.post('/tickets/:ticketId/message', authRequired, async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.ticketId, user: req.user._id });
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  ticket.messages.push({ senderType: 'worker', senderId: req.user._id, body: req.body.message });
  await ticket.save();
  req.app.locals.io?.emit('chat:message', { ticketId: ticket._id, message: req.body.message });
  return res.json(ticket);
});

router.post('/tickets/:ticketId/escalate', authRequired, async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.ticketId, user: req.user._id });
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  ticket.escalated = true;
  ticket.status = 'escalated';
  await ticket.save();
  req.app.locals.io?.emit('chat:ticket:escalated', ticket);
  return res.json(ticket);
});

router.post('/tickets/:ticketId/close', authRequired, async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.ticketId, user: req.user._id });
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  ticket.status = 'closed';
  await ticket.save();
  return res.json(ticket);
});

router.get('/admin/tickets', authRequired, requirePermission(PERMISSIONS.TICKETS_READ_ALL), async (req, res) => {
  const tickets = await Ticket.find().populate('user', 'name email profile.zone').sort({ updatedAt: -1 });
  return res.json(tickets);
});

router.post('/admin/tickets/:ticketId/close', authRequired, requirePermission(PERMISSIONS.TICKETS_UPDATE), async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(req.params.ticketId, { status: 'closed' }, { new: true });
  await writeAuditLog(req, {
    action: 'ticket_closed_by_admin',
    resourceType: 'ticket',
    resourceId: req.params.ticketId,
    status: 'success'
  });
  return res.json(ticket);
});

router.post('/admin/tickets/:ticketId/reopen', authRequired, requirePermission(PERMISSIONS.TICKETS_UPDATE), async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(req.params.ticketId, { status: 'open' }, { new: true });
  await writeAuditLog(req, {
    action: 'ticket_reopened_by_admin',
    resourceType: 'ticket',
    resourceId: req.params.ticketId,
    status: 'success'
  });
  return res.json(ticket);
});

router.post('/admin/tickets/:ticketId/message', authRequired, requirePermission(PERMISSIONS.TICKETS_UPDATE), async (req, res) => {
  const body = String(req.body.message || '').trim();
  if (!body) {
    return res.status(400).json({ message: 'message is required' });
  }

  const ticket = await Ticket.findById(req.params.ticketId).populate('user', 'name email profile.zone');
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  ticket.messages.push({ senderType: 'employee', senderId: req.user._id, body });
  await ticket.save();

  await writeAuditLog(req, {
    action: 'ticket_replied_by_admin',
    resourceType: 'ticket',
    resourceId: req.params.ticketId,
    status: 'success'
  });

  req.app.locals.io?.emit('chat:message', {
    ticketId: ticket._id,
    senderType: 'employee',
    message: body
  });

  return res.json(ticket);
});

export default router;
