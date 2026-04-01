const SupportTicket = require('../models/SupportTicket');
const Claim = require('../models/Claim');
const { getIo } = require('../sockets/socket');

const nextTicketId = () => `TKT-${Date.now().toString(36).toUpperCase()}`;

const buildBotReply = (category, text = '') => {
  const lower = String(text).toLowerCase();
  if (category === 'policy') {
    return 'Policy premium is calculated from your segment (commodity/food/transport), daily earnings, and risk factors. Basic, Standard, and Premium tiers differ by trigger coverage and payout speed.';
  }
  if (category === 'claim') {
    return 'Claims are scored by AI using disruption type, GPS location match, and behavioral consistency. High confidence gets faster payout; medium confidence may hold part of amount for review.';
  }
  if (category === 'payment') {
    return 'Payouts can be sent through UPI, bank, or wallet based on your saved payout settings. You can update these from Profile -> Payout Settings.';
  }
  if (lower.includes('fraud') || lower.includes('urgent') || lower.includes('agent')) {
    return 'This looks important. You can press "Chat with agent" and I will escalate this ticket to a live support agent.';
  }
  return 'I can help with policy, claims, and payments. Please choose a category or ask your question in detail.';
};

exports.listTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ updatedAt: -1 }).lean();
    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClaimsForTicket = async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30).lean();
    const mapped = claims.map((c) => ({
      id: c._id,
      title: `${c.type} · ${new Date(c.createdAt).toLocaleDateString()}`,
      status: c.status
    }));
    res.status(200).json({ claims: mapped });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const { category, relatedClaimId, question } = req.body;
    if (!category) return res.status(400).json({ message: 'category is required' });

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      ticketId: nextTicketId(),
      category,
      relatedClaimId: relatedClaimId || null,
      messages: [
        { sender: 'system', senderName: 'System', text: 'Ticket opened.' },
        ...(question ? [{ sender: 'user', senderName: req.user.name || 'User', text: question }] : []),
        { sender: 'bot', senderName: 'AI Assistant', text: buildBotReply(category, question) }
      ]
    });

    res.status(201).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'text is required' });

    const ticket = await SupportTicket.findOne({ _id: ticketId, userId: req.user._id });
    if (!ticket) return res.status(404).json({ message: 'ticket not found' });
    if (ticket.status === 'closed') return res.status(400).json({ message: 'ticket is closed' });

    ticket.messages.push({ sender: 'user', senderName: req.user.name || 'User', text });

    if (ticket.escalatedToAgent) {
      ticket.messages.push({ sender: 'system', senderName: 'System', text: `${ticket.agentName || 'Agent'} is typing...` });
      ticket.messages.push({ sender: 'agent', senderName: ticket.agentName || 'Support Agent', text: 'Thanks for the update. I am reviewing your ticket now.' });
    } else {
      const botText = buildBotReply(ticket.category, text);
      ticket.messages.push({ sender: 'bot', senderName: 'AI Assistant', text: botText });
    }

    await ticket.save();

    const io = getIo();
    io.emit('chat:ticket:update', { ticketId: ticket._id, status: ticket.status });

    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.escalateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await SupportTicket.findOne({ _id: ticketId, userId: req.user._id });
    if (!ticket) return res.status(404).json({ message: 'ticket not found' });
    if (ticket.status === 'closed') return res.status(400).json({ message: 'ticket is closed' });

    ticket.escalatedToAgent = true;
    ticket.agentName = ticket.agentName || 'Anita Sharma';
    ticket.messages.push({ sender: 'system', senderName: 'System', text: `Ticket escalated to ${ticket.agentName}.` });
    await ticket.save();

    const io = getIo();
    io.emit('chat:ticket:escalated', { ticketId: ticket._id, agentName: ticket.agentName });

    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.closeTicketByUser = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await SupportTicket.findOne({ _id: ticketId, userId: req.user._id });
    if (!ticket) return res.status(404).json({ message: 'ticket not found' });
    if (ticket.status === 'closed') return res.status(200).json({ ticket });

    ticket.status = 'closed';
    ticket.closedBy = 'user';
    ticket.messages.push({ sender: 'system', senderName: 'System', text: 'Ticket closed by user.' });
    await ticket.save();

    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin endpoints for corporate dashboard
exports.listAllTickets = async (req, res) => {
  try {
    if (!['admin', 'superuser'].includes(req.user.role)) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const tickets = await SupportTicket.find().sort({ updatedAt: -1 }).lean();
    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.closeTicketByAgent = async (req, res) => {
  try {
    if (!['admin', 'superuser'].includes(req.user.role)) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const { ticketId } = req.params;
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'ticket not found' });

    ticket.status = 'closed';
    ticket.closedBy = 'agent';
    ticket.messages.push({ sender: 'agent', senderName: req.user.name || 'Support Agent', text: 'Ticket closed by support team.' });
    await ticket.save();

    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reopenTicketByAgent = async (req, res) => {
  try {
    if (!['admin', 'superuser'].includes(req.user.role)) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const { ticketId } = req.params;
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'ticket not found' });

    ticket.status = 'open';
    ticket.closedBy = 'none';
    ticket.messages.push({ sender: 'agent', senderName: req.user.name || 'Support Agent', text: 'Ticket reopened by support team.' });
    await ticket.save();

    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
