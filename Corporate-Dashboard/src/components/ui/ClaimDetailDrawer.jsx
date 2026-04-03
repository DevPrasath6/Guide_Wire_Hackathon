import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Clock, AlertTriangle, ShieldCheck, Server, Maximize2, MapPin, Search } from 'lucide-react';
import ConfidenceRing from './ConfidenceRing';
import StatusChip from './StatusChip';

const ClaimDetailDrawer = ({ isOpen, onClose, claim, onOverride, onFlagFraud }) => {
  const [overrideReason, setOverrideReason] = useState('');
  
  if (!isOpen || !claim) return null;

  const handleAction = (status) => {
    if (onOverride) onOverride(claim.id, status, overrideReason);
    setOverrideReason('');
  };

  const handleFraud = () => {
    if (onFlagFraud) onFlagFraud(claim.id, overrideReason);
    setOverrideReason('');
  };

  const normalizedStatus = String(claim.status || '').toLowerCase();

  const getMetricColor = (val) => {
    if (val >= 80) return 'text-es-teal bg-es-teal/10 border-es-teal/20';
    if (val >= 50) return 'text-es-amber bg-es-amber/10 border-es-amber/20';
    return 'text-es-red bg-es-red/10 border-es-red/20';
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#060a14]/60 backdrop-blur-sm z-50"
      />
      
      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-[500px] border-l border-[#ffffff15] bg-[#0A0F1C]/95 backdrop-blur-xl z-50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ffffff10] shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-syne font-bold">Claim Details</h2>
              <StatusChip status={claim.status || claim.aiDecision} />
            </div>
            <div className="font-mono text-xs text-es-text-muted">ID: {claim.id}</div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#ffffff10] text-es-text-muted hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Worker Info */}
          <section>
            <h3 className="text-sm font-semibold font-syne text-es-text-secondary uppercase tracking-wider mb-4">Worker Context</h3>
            <div className="p-4 rounded-xl border border-[#ffffff10] bg-[#ffffff05] grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-es-text-muted mb-1">Worker</p>
                <p className="font-medium">{claim.workerName}</p>
                <p className="text-xs font-mono text-es-text-secondary mt-0.5">{claim.workerId}</p>
              </div>
              <div>
                <p className="text-xs text-es-text-muted mb-1">Platform</p>
                <p className="font-medium text-sm px-2 py-0.5 bg-[#ffffff10] rounded inline-block">
                  {claim.platform}
                </p>
              </div>
              <div className="col-span-2 flex gap-4 pt-3 border-t border-[#ffffff0f]">
                <div>
                  <p className="text-xs text-es-text-muted mb-1">Requested Amount</p>
                  <p className="font-mono text-lg font-semibold text-es-teal">₹{claim.claimedAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-es-text-muted mb-1">Estimated Direct Loss</p>
                  <p className="font-mono text-lg font-medium text-es-text-secondary">₹{claim.calculatedLoss}</p>
                </div>
              </div>
            </div>
          </section>

          {/* AI Decision Breakdown */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold font-syne text-es-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Maximize2 size={14} /> Overall Confidence
              </h3>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase bg-es-navy text-es-teal px-2 py-0.5 rounded border border-es-teal/30">
                  Model v2.4
                </span>
              </div>
            </div>
            
            <div className="p-5 rounded-xl border border-[#ffffff10] bg-gradient-to-br from-[#ffffff05] to-[#ffffff02] flex items-center gap-6">
              <div className="shrink-0 scale-125 ml-2">
                <ConfidenceRing percentage={claim.aiConfidence} size={80} strokeWidth={8} showLabel={false} />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-mono font-bold">{claim.aiConfidence}%</div>
                <div className="text-sm text-es-text-secondary">AI recommends <strong className="text-white capitalize">{claim.aiDecision}</strong></div>
              </div>
            </div>

            {/* Score Factors */}
            <div className="mt-4 space-y-4">
              {claim.aiBreakdown && Object.entries(claim.aiBreakdown).map(([key, value], idx) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                let Icon = Server;
                if (key.includes('weather') || key.includes('geo')) Icon = MapPin;
                if (key.includes('fraud')) Icon = ShieldCheck;
                if (key.includes('policy')) Icon = Search;

                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={key} 
                    className="flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-es-text-secondary">
                        <Icon size={14} /> {label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getMetricColor(value)}`}>
                        {value}%
                      </span>
                    </div>
                    <ConfidenceRing percentage={value} barMode={true} />
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Timeline / Audit Log (Snippet) */}
          <section>
            <h3 className="text-sm font-semibold font-syne text-es-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock size={14} /> Processing Timeline
            </h3>
            <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-es-teal before:via-[#ffffff15] before:to-transparent">
              <div className="relative flex items-center gap-4">
                <div className="absolute left-0 w-2 h-2 rounded-full bg-es-teal -translate-x-[5px] ring-4 ring-[#0A0F1C]" />
                <div className="flex-1">
                  <p className="text-sm">Claim Filed</p>
                  <p className="text-xs text-es-text-muted">{claim.date}</p>
                </div>
              </div>
              <div className="relative flex items-center gap-4">
                <div className="absolute left-0 w-2 h-2 rounded-full bg-es-teal -translate-x-[5px] ring-4 ring-[#0A0F1C]" />
                <div className="flex-1">
                  <p className="text-sm">AI Analyzed</p>
                  <p className="text-xs text-es-text-muted">Instantly</p>
                </div>
              </div>
              {normalizedStatus === 'approved' && String(claim.aiDecision || '').toLowerCase() !== 'approved' && (
                <div className="relative flex items-center gap-4">
                  <div className="absolute left-0 w-2 h-2 rounded-full bg-es-amber -translate-x-[5px] ring-4 ring-[#0A0F1C]" />
                  <div className="flex-1">
                    <p className="text-sm text-es-amber">Manual Override: Approved</p>
                    <p className="text-xs text-es-text-muted">By Admin</p>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Footer Actions (Override Panel) */}
        {(normalizedStatus === 'pending' || normalizedStatus === 'under_review') && (
          <div className="p-6 border-t border-[#ffffff10] bg-[#ffffff02] shrink-0">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-es-amber" /> Override Decision
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Reason for manual override (required)"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full bg-[#1A2234] border border-[#ffffff15] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-es-teal/50 transition-colors"
              />
              <div className="flex gap-3">
                <button 
                  disabled={!overrideReason.trim()}
                  onClick={() => handleAction('Approved')}
                  className="flex-1 flex justify-center items-center gap-2 py-2 rounded-lg bg-es-teal/10 text-es-teal border border-es-teal/30 hover:bg-es-teal hover:text-[#0A0F1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button 
                  disabled={!overrideReason.trim()}
                  onClick={() => handleAction('Rejected')}
                  className="flex-1 flex justify-center items-center gap-2 py-2 rounded-lg bg-es-red/10 text-es-red border border-es-red/30 hover:bg-es-red hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button
                  disabled={!overrideReason.trim()}
                  onClick={handleFraud}
                  className="flex-1 flex justify-center items-center gap-2 py-2 rounded-lg bg-es-amber/10 text-es-amber border border-es-amber/30 hover:bg-es-amber hover:text-[#0A0F1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                >
                  <AlertTriangle size={16} /> Flag Fraud
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ClaimDetailDrawer;