import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert } from 'lucide-react';

const SuspendPolicyModal = ({ isOpen, onClose, onConfirm, policy, reason, setReason }) => {
  if (!isOpen || !policy) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#060a14]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#0A0F1C] border border-[#ffffff15] rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-es-amber/10 flex items-center justify-center text-es-amber mb-4 border border-es-amber/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-syne font-bold mb-2">Suspend Policy?</h2>
            <p className="text-sm text-es-text-secondary">
              You are about to suspend coverage for <strong className="text-white">{policy.workerName}</strong>. 
              They will lose active protection and auto-claims will be paused.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-es-text-muted mb-1 uppercase tracking-wider">Reason for Suspension</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason (required)"
                className="w-full h-24 bg-[#1A2234] border border-[#ffffff15] rounded-xl p-3 text-sm focus:outline-none focus:border-es-amber/50 transition-colors resize-none custom-scrollbar"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#ffffff15] hover:bg-[#ffffff10] transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              disabled={!reason.trim()}
              onClick={() => {
                onConfirm(policy.id);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-es-red text-white hover:bg-[#DC2626] border border-es-red/30 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suspend Policy
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SuspendPolicyModal;