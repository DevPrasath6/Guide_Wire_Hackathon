import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Ticket, XCircle } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { toast } from '../components/ui/Toast';

const CATEGORIES = [
  { id: 'general', label: 'General Query' },
  { id: 'claim', label: 'Claim Related' },
  { id: 'payment', label: 'Payment Related' },
  { id: 'policy', label: 'Policy / Premium' }
];

const QUESTIONS = [
  'What issue are you facing?',
  'When did this issue start?',
  'Any extra details we should know?'
];

export default function ChatBot() {
  const navigate = useNavigate();
  const worker = useAuthStore(s => s.worker);
  const [messages, setMessages] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [claims, setClaims] = useState([]);
  const [category, setCategory] = useState('');
  const [relatedClaimId, setRelatedClaimId] = useState('');
  const [answers, setAnswers] = useState(['', '', '']);
  const [questionStep, setQuestionStep] = useState(0);
  const [phase, setPhase] = useState('intake'); // intake | questioning | chat
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [agentTyping, setAgentTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const boot = async () => {
      try {
        const [{ data: ticketData }, { data: claimData }] = await Promise.all([
          api.get('/chat/tickets'),
          api.get('/chat/claims')
        ]);
        setTickets(ticketData?.tickets || []);
        setClaims(claimData?.claims || []);
        const openTicket = (ticketData?.tickets || []).find((t) => t.status === 'open');
        if (openTicket) {
          setTicket(openTicket);
          setMessages(openTicket.messages || []);
          setCategory(openTicket.category);
          setRelatedClaimId(openTicket.relatedClaimId || '');
          setPhase('chat');
        }
      } catch {
        // Keep page usable even if backend is down
      }
    };
    boot();
  }, []);

  const refreshTickets = async () => {
    try {
      const { data } = await api.get('/chat/tickets');
      setTickets(data?.tickets || []);
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const beginQuestions = () => {
    if (!category) {
      toast.warning('Select a support category first');
      return;
    }
    setPhase('questioning');
    setQuestionStep(0);
  };

  const nextQuestion = () => {
    if (!answers[questionStep].trim()) {
      toast.warning('Please answer the question to continue');
      return;
    }
    if (questionStep < 2) {
      setQuestionStep((s) => s + 1);
      return;
    }
    createTicket();
  };

  const createTicket = async () => {
    setLoading(true);
    try {
      const summary = answers.filter(Boolean).join(' | ');
      const { data } = await api.post('/chat/tickets', {
        category,
        relatedClaimId: relatedClaimId || null,
        question: summary
      });
      setTicket(data.ticket);
      setMessages(data.ticket.messages || []);
      await refreshTickets();
      setPhase('chat');
      toast.success('Support ticket created');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!ticket || ticket.status === 'closed') return;
    if (!input.trim()) return;
    const pendingText = input;
    setInput('');

    try {
      const { data } = await api.post(`/chat/tickets/${ticket._id}/message`, { text: pendingText });
      setTicket(data.ticket);
      setMessages(data.ticket.messages || []);
      await refreshTickets();
      if (data.ticket.escalatedToAgent) {
        setAgentTyping(true);
        setTimeout(() => setAgentTyping(false), 900);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    }
  };

  const escalateToAgent = async () => {
    if (!ticket || ticket.status === 'closed') return;
    try {
      setAgentTyping(true);
      const { data } = await api.post(`/chat/tickets/${ticket._id}/escalate`);
      setTicket(data.ticket);
      setMessages(data.ticket.messages || []);
      await refreshTickets();
      setTimeout(() => setAgentTyping(false), 900);
      toast.info('Ticket escalated to support agent');
    } catch (error) {
      setAgentTyping(false);
      toast.error(error?.response?.data?.message || 'Failed to escalate');
    }
  };

  const closeTicket = async () => {
    if (!ticket || ticket.status === 'closed') return;
    try {
      const { data } = await api.post(`/chat/tickets/${ticket._id}/close`);
      setTicket(data.ticket);
      setMessages(data.ticket.messages || []);
      await refreshTickets();
      toast.success('Ticket closed');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to close ticket');
    }
  };

  const openExistingTicket = (selected) => {
    setTicket(selected);
    setMessages(selected.messages || []);
    setCategory(selected.category);
    setRelatedClaimId(selected.relatedClaimId || '');
    setPhase('chat');
  };

  const startNewTicket = () => {
    setTicket(null);
    setMessages([]);
    setCategory('');
    setRelatedClaimId('');
    setAnswers(['', '', '']);
    setQuestionStep(0);
    setPhase('intake');
  };

  return (
    <div className="flex flex-col h-[100svh] bg-[#0a0f12]">
      <TopBar />

      <div className="px-4 pt-4">
        <button onClick={() => navigate(-1)} className="text-es-secondary flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="px-4 py-2">
        <div className="glass p-2 rounded-xl flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={startNewTicket}
            className="px-3 py-1.5 text-xs rounded-full bg-es-teal text-white whitespace-nowrap"
          >
            + New Ticket
          </button>
          {tickets.map((t) => (
            <button
              key={t._id}
              onClick={() => openExistingTicket(t)}
              className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap border ${ticket?._id === t._id ? 'border-es-teal text-es-teal' : 'border-white/15 text-es-secondary'}`}
            >
              {t.ticketId} · {t.status}
            </button>
          ))}
        </div>
      </div>

      {phase === 'intake' && (
        <div className="px-4 py-4">
          <div className="glass p-4 rounded-2xl">
            <h2 className="font-display text-white text-lg mb-2">Support Ticket Intake</h2>
            <p className="text-es-secondary text-sm mb-3">Select your query type and optional related claim.</p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`rounded-xl px-3 py-2 text-sm ${category === cat.id ? 'bg-es-teal text-white' : 'bg-white/5 text-es-secondary'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <label className="text-[11px] text-es-secondary">Related claim (optional)</label>
            <select
              value={relatedClaimId}
              onChange={(e) => setRelatedClaimId(e.target.value)}
              className="glass-input mt-1 !h-[44px]"
            >
              <option value="">No related claim</option>
              {claims.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            <button onClick={beginQuestions} className="w-full mt-4 rounded-full bg-es-teal text-white py-2">
              Continue
            </button>
          </div>
        </div>
      )}

      {phase === 'questioning' && (
        <div className="px-4 py-4">
          <div className="glass p-4 rounded-2xl">
            <h3 className="font-display text-white text-lg mb-2">Question {questionStep + 1} of 3</h3>
            <p className="text-es-secondary text-sm mb-3">{QUESTIONS[questionStep]}</p>
            <textarea
              value={answers[questionStep]}
              onChange={(e) => {
                const next = [...answers];
                next[questionStep] = e.target.value;
                setAnswers(next);
              }}
              className="glass-input !h-[90px] resize-none"
            />

            <button
              onClick={nextQuestion}
              disabled={loading}
              className="w-full mt-4 rounded-full bg-es-teal text-white py-2 disabled:opacity-60"
            >
              {questionStep === 2 ? (loading ? 'Creating ticket...' : 'Create Ticket') : 'Next'}
            </button>
          </div>
        </div>
      )}

      {phase === 'chat' && (
        <>
          <div className="px-4 pt-2 pb-2 flex items-center justify-between text-xs text-es-secondary">
            <span className="flex items-center gap-2"><Ticket size={13} /> {ticket?.ticketId}</span>
            <span className={ticket?.status === 'closed' ? 'text-es-red' : 'text-es-teal'}>{ticket?.status?.toUpperCase()}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
            {messages.map((m, idx) => (
              <div key={`${m.createdAt || Date.now()}-${idx}`} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  m.sender === 'user'
                    ? 'bg-es-teal text-[#0a0f12] rounded-tr-sm'
                    : m.sender === 'system'
                      ? 'bg-white/10 text-es-secondary w-full text-center text-xs'
                      : 'glass rounded-tl-sm text-white'
                }`}>
                  {m.sender === 'bot' && <div className="text-es-teal text-xs mb-1 flex items-center gap-1"><Bot size={12} /> AI Assistant</div>}
                  {m.sender === 'agent' && <div className="text-blue-400 text-xs mb-1 flex items-center gap-1"><User size={12} /> {m.senderName || 'Support Agent'}</div>}
                  <div className="text-sm font-body">{m.text}</div>
                </div>
              </div>
            ))}

            {agentTyping && (
              <div className="text-xs text-es-secondary px-1">{ticket?.agentName || 'Support Agent'} is typing...</div>
            )}
          </div>

          <div className="px-4 pb-2 flex gap-2">
            <button
              onClick={escalateToAgent}
              disabled={!ticket || ticket.status === 'closed' || ticket.escalatedToAgent}
              className="flex-1 rounded-full border border-es-blue/50 text-es-blue py-2 text-xs disabled:opacity-50"
            >
              {ticket?.escalatedToAgent ? 'Agent Assigned' : 'Chat with Agent'}
            </button>
            <button
              onClick={closeTicket}
              disabled={!ticket || ticket.status === 'closed'}
              className="flex items-center justify-center gap-1 rounded-full border border-es-red/50 text-es-red px-3 py-2 text-xs disabled:opacity-50"
            >
              <XCircle size={14} /> Close
            </button>
          </div>

          <div className="p-4 glass rounded-t-2xl flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={ticket?.status === 'closed' ? 'Ticket is closed' : 'Type your message...'}
              disabled={!ticket || ticket.status === 'closed'}
              className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2 text-white outline-none disabled:opacity-60"
            />
            <button
              onClick={sendMessage}
              disabled={!ticket || ticket.status === 'closed'}
              className="w-10 h-10 rounded-full bg-es-teal text-[#0a0f12] flex items-center justify-center disabled:opacity-60"
            >
              <Send size={18} className="-ml-0.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}