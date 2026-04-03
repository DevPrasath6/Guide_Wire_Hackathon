import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Activity, BarChart3, CloudRain, AlertTriangle, ArrowRight, ShieldAlert, History } from 'lucide-react';
import StatusChip from './StatusChip';

const PolicyDetailDrawer = ({ isOpen, onClose, policy }) => {
  if (!isOpen || !policy) return null;

  const getMetricColor = (val, reversed = false) => {
    const isGood = reversed ? val < 30 : val >= 70;
    const isWarning = reversed ? (val >= 30 && val < 60) : (val < 70 && val >= 40);
    if (isGood) return 'text-es-teal bg-es-teal/10 border-es-teal/20';
    if (isWarning) return 'text-es-amber bg-es-amber/10 border-es-amber/20';
    return 'text-es-red bg-es-red/10 border-es-red/20';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#060a14]/60 backdrop-blur-sm z-50"
      />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-[480px] border-l border-[#ffffff15] bg-[#0A0F1C]/95 backdrop-blur-xl z-50 flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#ffffff10] shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-syne font-bold">Policy Details</h2>
              <StatusChip status={policy.status} />
            </div>
            <div className="font-mono text-xs text-es-text-muted">ID: {policy.id}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#ffffff10] text-es-text-muted hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          <section>
            <h3 className="text-sm font-semibold font-syne text-es-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield size={14} /> Coverage Overview
            </h3>
            <div className="p-4 rounded-xl border border-[#ffffff10] bg-[#ffffff05] grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-es-text-muted mb-1">Worker</p>
                <p className="font-medium text-white">{policy.workerName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wide border ${
                    policy.platform === 'Zomato' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' :
                    policy.platform === 'Swiggy' ? 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20' :
                    policy.platform === 'Zepto' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20' :
                    'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
                  }`}>
                    {policy.platform}
                  </span>
                  <span className="text-[10px] font-mono text-es-text-muted">{policy.workerId}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-es-text-muted mb-1">Coverage Limit</p>
                <p className="font-mono font-bold text-lg text-white">₹{policy.coverageAmount}</p>
                <p className="text-[10px] text-es-text-muted mt-0.5">{policy.coverageType}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold font-syne text-es-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={14} /> Premium Breakdown
            </h3>
            <div className="flex flex-col gap-3">
              <div className="p-3 border border-[#ffffff0a] bg-[#ffffff02] rounded-lg flex justify-between items-center relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-es-text-muted" />
                <span className="pl-2 text-sm text-es-text-secondary">Base Premium</span>
                <span className="font-mono font-medium">₹{policy.premiumBreakdown.base}</span>
              </div>
              
              <div className="flex justify-center -my-2 z-10">
                <div className="bg-[#0A0F1C] border border-[#ffffff15] rounded-full p-1 text-es-text-muted">
                  <ArrowRight size={14} className="rotate-90" />
                </div>
              </div>

              <div className="p-3 border border-[#ffffff0a] bg-[#ffffff02] rounded-lg flex justify-between items-center relative gap-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-es-amber" />
                <div className="pl-2">
                  <span className="text-sm text-es-text-secondary block">Zone Factor & Risk</span>
                  <span className="text-[10px] text-es-amber">+{policy.premiumBreakdown.zoneFactor} (Zone) × {policy.premiumBreakdown.riskMultiplier}x (Risk)</span>
                </div>
                <div className="font-mono font-medium text-es-amber">+ ₹{(policy.premiumBreakdown.finalPremium - policy.premiumBreakdown.base).toFixed(2)}</div>
              </div>

              <div className="flex justify-center -my-2 z-10">
                <div className="bg-[#0A0F1C] border border-[#ffffff15] rounded-full p-1 text-es-text-muted">
                  <ArrowRight size={14} className="rotate-90" />
                </div>
              </div>

              <div className="p-4 border border-es-teal/30 bg-es-teal/5 rounded-xl flex justify-between items-center relative shadow-[0_0_15px_rgba(0,200,150,0.05)]">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-es-teal rounded-l-xl" />
                <span className="pl-2 font-syne font-bold text-white">Final Weekly</span>
                <span className="font-mono font-bold text-2xl text-es-teal">₹{policy.premiumBreakdown.finalPremium}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold font-syne text-es-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <CloudRain size={14} /> Active Triggers
            </h3>
            <div className="flex flex-wrap gap-2">
              {policy.triggersEnabled.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-es-teal/20 bg-es-teal/5 text-xs font-mono text-es-teal">
                  <div className="w-1.5 h-1.5 rounded-full bg-es-teal animate-pulse" />
                  {t}
                </div>
              ))}
              <div className="px-3 py-1.5 rounded-full border border-dashed border-[#ffffff20] text-xs font-mono text-es-text-muted cursor-not-allowed">
                + Unlocked manually
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold font-syne text-es-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 size={14} /> AI Risk Profile
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#ffffff05] border border-[#ffffff0a] rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-es-text-muted">Zone Risk</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getMetricColor(85, true)}`}>
                    High
                  </span>
                </div>
                <div className="font-mono font-medium">{policy.zone}</div>
              </div>
              <div className="p-3 bg-[#ffffff05] border border-[#ffffff0a] rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-es-text-muted">Behavioral</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getMetricColor(90)}`}>
                    90/100
                  </span>
                </div>
                <div className="font-mono font-medium">Excellent</div>
              </div>
              <div className="p-3 bg-[#ffffff05] border border-[#ffffff0a] rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-es-text-muted">Claim Ratio</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getMetricColor(policy.claimsThisMonth * 10, true)}`}>
                    {policy.claimsThisMonth}/mo
                  </span>
                </div>
                <div className="font-mono font-medium">₹{policy.totalPayouts} Total</div>
              </div>
              <div className="p-3 bg-[#ffffff05] border border-[#ffffff0a] rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-es-text-muted">Platform</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getMetricColor(75)}`}>
                    Stable
                  </span>
                </div>
                <div className="font-mono font-medium">{policy.platform}</div>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PolicyDetailDrawer;