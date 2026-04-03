import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy, Search, Send, RefreshCw, Lock, LockOpen, AlertTriangle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Toast from '../components/ui/Toast';
import {
  closeAdminTicket,
  getAdminTickets,
  reopenAdminTicket,
  sendAdminTicketMessage
} from '../services/api';
import { hasPermission } from '../utils/rbac';
import useLiveRefresh from '../hooks/useLiveRefresh';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 }
};

const statusPillClasses = {
  open: 'text-es-teal bg-es-teal/10 border-es-teal/30',
  escalated: 'text-es-amber bg-es-amber/10 border-es-amber/30',
  closed: 'text-es-text-muted bg-[#ffffff10] border-[#ffffff20]'
};

const senderClasses = {
  worker: 'bg-[#ffffff10] border-[#ffffff1f] text-es-text-primary',
  employee: 'bg-es-teal/10 border-es-teal/30 text-es-teal',
  system: 'bg-es-blue/10 border-es-blue/30 text-es-blue'
};

const SupportTickets = () => {
  const canReadTickets = hasPermission('tickets.read_all');
  const canUpdateTickets = hasPermission('tickets.update');

  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState([]);

  const messagesEndRef = useRef(null);

  const addToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const refreshTickets = useCallback(async (preserveSelection = true) => {
    const data = await getAdminTickets();
    setTickets(data || []);
    if (!preserveSelection) {
      setSelectedTicketId(data?.[0]?._id || null);
      return;
    }
    if (!selectedTicketId && data?.length) {
      setSelectedTicketId(data[0]._id);
      return;
    }
    const exists = data?.some((ticket) => ticket._id === selectedTicketId);
    if (!exists) setSelectedTicketId(data?.[0]?._id || null);
  }, [selectedTicketId]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await refreshTickets(false);
      } catch (err) {
        if (mounted) {
          addToast('Load Failed', err.response?.data?.message || 'Unable to load support tickets', 'error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [refreshTickets]);

  useLiveRefresh(
    () => refreshTickets(true).catch(() => {}),
    {
      intervalMs: 10000,
      topics: ['heartbeat', 'tickets', 'notifications']
    }
  );

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const statusOk = statusFilter === 'all' || ticket.status === statusFilter;
      const query = searchTerm.trim().toLowerCase();
      if (!query) return statusOk;
      const searchable = [
        ticket._id,
        ticket.user?.name,
        ticket.user?.email,
        ticket.category,
        ticket.question
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return statusOk && searchable.includes(query);
    });
  }, [tickets, searchTerm, statusFilter]);

  const selectedTicket = useMemo(
    () => filteredTickets.find((ticket) => ticket._id === selectedTicketId) || null,
    [filteredTickets, selectedTicketId]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages?.length]);

  const updateTicketInState = (updated) => {
    setTickets((prev) => prev.map((ticket) => (ticket._id === updated._id ? updated : ticket)));
  };

  const handleSendReply = async () => {
    const message = replyText.trim();
    if (!message || !selectedTicket || !canUpdateTickets) return;

    try {
      setBusy(true);
      const updated = await sendAdminTicketMessage(selectedTicket._id, message);
      updateTicketInState(updated);
      setReplyText('');
      addToast('Reply Sent', 'Message delivered to worker.', 'success');
    } catch (err) {
      addToast('Reply Failed', err.response?.data?.message || 'Unable to send message', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleClose = async () => {
    if (!selectedTicket || !canUpdateTickets) return;
    try {
      setBusy(true);
      const updated = await closeAdminTicket(selectedTicket._id);
      updateTicketInState(updated);
      addToast('Ticket Closed', 'Support ticket marked as closed.', 'success');
    } catch (err) {
      addToast('Close Failed', err.response?.data?.message || 'Unable to close ticket', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleReopen = async () => {
    if (!selectedTicket || !canUpdateTickets) return;
    try {
      setBusy(true);
      const updated = await reopenAdminTicket(selectedTicket._id);
      updateTicketInState(updated);
      addToast('Ticket Reopened', 'Support ticket is open again.', 'success');
    } catch (err) {
      addToast('Reopen Failed', err.response?.data?.message || 'Unable to reopen ticket', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!canReadTickets) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-syne font-bold">Support Tickets</h1>
        <GlassCard className="p-6 border border-es-amber/30 bg-es-amber/10" glowColor="none">
          <div className="flex items-center gap-3 text-es-amber">
            <AlertTriangle size={18} />
            You do not have permission to view support tickets.
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="pb-10 flex flex-col gap-6 h-[calc(100vh-theme(spacing.24))] min-h-0"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-syne font-bold mb-2">Support Tickets</h1>
          <p className="text-es-text-secondary">Live worker support inbox with conversation thread and ticket controls.</p>
        </div>
        <button
          onClick={() => refreshTickets(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#ffffff20] bg-[#ffffff05] hover:bg-[#ffffff10] transition-colors text-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6 min-h-0 flex-1">
        <GlassCard className="p-4 flex flex-col min-h-0" glowColor="none">
          <div className="space-y-3 mb-4 shrink-0">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-es-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by worker, email, category..."
                className="w-full bg-[#1A2234] border border-[#ffffff15] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-es-teal/50"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#1A2234] border border-[#ffffff15] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-es-teal/50"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {loading ? (
              <div className="text-es-text-muted text-sm">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-es-text-muted text-sm">No tickets found.</div>
            ) : (
              filteredTickets.map((ticket) => (
                <button
                  key={ticket._id}
                  onClick={() => setSelectedTicketId(ticket._id)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    selectedTicketId === ticket._id
                      ? 'border-es-teal/40 bg-es-teal/10'
                      : 'border-[#ffffff15] bg-[#ffffff04] hover:bg-[#ffffff08]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-medium text-sm truncate">{ticket.user?.name || 'Unknown Worker'}</div>
                    <div className={`px-2 py-0.5 rounded text-[10px] uppercase border ${statusPillClasses[ticket.status] || statusPillClasses.open}`}>
                      {ticket.status}
                    </div>
                  </div>
                  <div className="text-xs text-es-text-muted truncate">{ticket.category} • {ticket.user?.email || 'No email'}</div>
                  <div className="text-xs text-es-text-secondary mt-1 truncate">{ticket.question}</div>
                </button>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-0 overflow-hidden flex flex-col min-h-0" glowColor="blue">
          {!selectedTicket ? (
            <div className="h-full flex items-center justify-center text-es-text-muted text-sm">Select a ticket to view chat.</div>
          ) : (
            <>
              <div className="p-4 border-b border-[#ffffff10] flex items-center justify-between gap-4 shrink-0">
                <div>
                  <div className="font-syne font-semibold">{selectedTicket.user?.name || 'Unknown Worker'}</div>
                  <div className="text-xs text-es-text-muted">{selectedTicket.user?.email || 'No email'} • {selectedTicket.category}</div>
                  <div className="text-xs text-es-text-secondary mt-1">Ticket: {selectedTicket._id}</div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTicket.status !== 'closed' ? (
                    <button
                      disabled={!canUpdateTickets || busy}
                      onClick={handleClose}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-es-red/40 text-es-red bg-es-red/10 hover:bg-es-red hover:text-white transition-colors disabled:opacity-40"
                    >
                      <Lock size={14} /> Close
                    </button>
                  ) : (
                    <button
                      disabled={!canUpdateTickets || busy}
                      onClick={handleReopen}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-es-teal/40 text-es-teal bg-es-teal/10 hover:bg-es-teal hover:text-[#0A0F1C] transition-colors disabled:opacity-40"
                    >
                      <LockOpen size={14} /> Reopen
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {selectedTicket.messages?.length ? (
                  selectedTicket.messages.map((msg) => (
                    <div key={msg._id || `${msg.senderType}-${msg.createdAt}`} className="max-w-[82%]">
                      <div className={`rounded-xl border px-3 py-2 text-sm ${senderClasses[msg.senderType] || senderClasses.system}`}>
                        <div className="text-[10px] uppercase tracking-wider mb-1 opacity-80">{msg.senderType}</div>
                        <div>{msg.body}</div>
                      </div>
                      <div className="text-[10px] text-es-text-muted mt-1 ml-1">{new Date(msg.createdAt).toLocaleString()}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-es-text-muted text-sm">No messages yet.</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-[#ffffff10] shrink-0">
                <div className="flex items-end gap-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    placeholder={canUpdateTickets ? 'Type support response...' : 'No permission to reply'}
                    disabled={!canUpdateTickets || selectedTicket.status === 'closed'}
                    className="flex-1 bg-[#1A2234] border border-[#ffffff15] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-es-teal/50 disabled:opacity-50"
                  />
                  <button
                    disabled={!canUpdateTickets || busy || !replyText.trim() || selectedTicket.status === 'closed'}
                    onClick={handleSendReply}
                    className="h-10 px-4 rounded-lg bg-es-teal text-[#0A0F1C] font-semibold hover:bg-es-teal-dim transition-colors disabled:opacity-40 flex items-center gap-2"
                  >
                    <Send size={14} /> Send
                  </button>
                </div>
                {selectedTicket.status === 'closed' && (
                  <div className="text-xs text-es-amber mt-2">This ticket is closed. Reopen it to continue chat.</div>
                )}
              </div>
            </>
          )}
        </GlassCard>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </motion.div>
  );
};

export default SupportTickets;
