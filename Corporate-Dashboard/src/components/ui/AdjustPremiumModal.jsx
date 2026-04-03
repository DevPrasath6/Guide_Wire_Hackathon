import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Info } from 'lucide-react';

const AdjustPremiumModal = ({ isOpen, onClose, onConfirm, policy }) => {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (policy) {
      setAmount(policy.weeklyPremium);
      setReason('');
    }
  }, [policy]);

  if (!isOpen || !policy) return null;

  const handleAdjust = (val) => {
    setAmount(prev => Math.max(0, prev + val));
  };

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
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-syne font-bold mb-1">Adjust Premium</h2>
              <p className="text-xs font-mono text-es-text-muted">{policy.workerName} • {policy.id}</p>
            </div>
            <button onClick={onClose} className="p-1 text-es-text-muted hover:text-white rounded-full hover:bg-[#ffffff10] transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-6 bg-[#ffffff05] border border-[#ffffff10] rounded-xl mb-6">
            <span className="text-sm text-es-text-secondary mb-2">New Weekly Premium</span>
            <div className="text-5xl font-mono font-bold text-es-teal mb-4 flex items-center gap-2">
              <span className="text-2xl mt-2 text-es-teal/70">₹</span>
              {amount}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleAdjust(-5)} className="w-10 h-10 rounded-full border border-es-red/30 bg-es-red/10 text-es-red flex items-center justify-center hover:bg-es-red/20 transition-colors">
                <TrendingDown size={18} />
              </button>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-24 text-center bg-transparent border-b border-[#ffffff30] font-mono text-lg focus:outline-none focus:border-es-teal py-1"
                min="0"
              />
              <button onClick={() => handleAdjust(5)} className="w-10 h-10 rounded-full border border-es-teal/30 bg-es-teal/10 text-es-teal flex items-center justify-center hover:bg-es-teal/20 transition-colors">
                <TrendingUp size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-es-purple/10 border border-es-purple/20 mb-6">
            <Info size={16} className="text-es-purple shrink-0 mt-0.5" />
            <p className="text-xs text-es-purple/90 italic">
              Our model suggests <strong>₹52</strong> based on recent zone activity and current risk multipliers.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-medium text-es-text-muted mb-2 uppercase tracking-wider">Adjustment Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#1A2234] border border-[#ffffff15] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-es-teal/50 transition-colors appearance-none"
              >
                <option value="" disabled>Select reason (required)</option>
                <option value="Zone risk change">Zone risk change</option>
                <option value="Behavioral update">Behavioral update</option>
                <option value="Manual review">Manual review</option>
                <option value="Seasonal adjustment">Seasonal adjustment</option>
              </select>
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
              disabled={!reason}
              onClick={() => {
                onConfirm(policy.id, amount, reason);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-es-teal text-[#0A0F1C] hover:bg-es-teal-dim transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed border border-es-teal/50 pointer-events-auto"
            >
              Confirm Adjustment
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdjustPremiumModal;