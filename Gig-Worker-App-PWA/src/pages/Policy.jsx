import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import ConfidenceRing from '../components/ui/ConfidenceRing';
import { usePolicyStore } from '../store/policyStore';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/ui/Toast';

const ALL_TRIGGERS = [
  { name: 'Heavy Rain', emoji: '🌧', threshold: '> 15mm/hr' },
  { name: 'Flash Flood', emoji: '🌊', threshold: 'Alert + 5hr' },
  { name: 'Extreme Heat', emoji: '🌡', threshold: '> 42°C' },
  { name: 'Curfew', emoji: '🚨', threshold: 'Official' },
  { name: 'Strike', emoji: '✊', threshold: 'Local' },
  { name: 'Severe Pollution', emoji: '🌫', threshold: 'AQI > 400' },
];

export default function Policy() {
  const { activePlan, availablePlans, upgradePlan, syncFromWorker } = usePolicyStore();
  const worker = useAuthStore((state) => state.worker);
  const [upgradeModalPlan, setUpgradeModalPlan] = useState(null);

  const segmentMultipliers = {
    commodity: 1.15,
    food: 1,
    transportation: 0.9
  };

  const dynamicPrice = useMemo(() => {
    const segment = worker?.profile?.segment || 'food';
    const dailyEarnings = Number(worker?.profile?.dailyEarnings || 1000);
    const workShift = worker?.profile?.workShift || 'day';
    const workHours = Number(worker?.profile?.workHours || 8);
    const capacity = Number(worker?.profile?.orderCapacity || 80);
    const segmentFactor = segmentMultipliers[segment] || 1;
    const earningFactor = dailyEarnings >= 3000 ? 1.35 : dailyEarnings >= 2000 ? 1.25 : dailyEarnings >= 1200 ? 1.1 : dailyEarnings < 600 ? 0.95 : 1;
    const shiftFactor = workShift === 'night' ? 1.22 : workShift === 'mixed' ? 1.12 : 1;
    const hoursFactor = workHours >= 12 ? 1.22 : workHours >= 10 ? 1.12 : workHours <= 5 ? 0.9 : 1;
    const capacityFactor = capacity >= 180 ? 1.2 : capacity >= 120 ? 1.1 : capacity <= 60 ? 0.92 : 1;
    return (base) => Math.max(20, Math.round((base * segmentFactor * earningFactor * shiftFactor * hoursFactor * capacityFactor) / 5) * 5);
  }, [worker?.profile?.segment, worker?.profile?.dailyEarnings, worker?.profile?.workShift, worker?.profile?.workHours, worker?.profile?.orderCapacity]);

  React.useEffect(() => {
    syncFromWorker();
  }, [syncFromWorker, worker?.policy?.planId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          {/* Header & Current Plan */}
          <motion.div variants={itemVariants}>
            <h1 className="font-display text-xl text-white">My Coverage</h1>
            <div className="mt-1">
              <span className="chip bg-es-teal-glow text-es-teal border border-es-teal/30">
                {activePlan?.name} · Active
              </span>
            </div>

            {activePlan && (
              <GlassCard glow="teal" className="mt-4 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-display text-base text-es-teal">{activePlan.name}</h2>
                    <p className="text-sm text-gray-400 mt-1">Up to ₹{activePlan.coverageAmount} per week</p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-[22px] text-white font-bold">₹{Number(worker?.policy?.weeklyPremium || dynamicPrice(activePlan.weeklyPremium))}</span>
                    <span className="text-xs text-gray-400">/wk</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {ALL_TRIGGERS.map(t => {
                    const isEnabled = activePlan.triggers.includes(t.name);
                    return (
                      <div key={t.name} className={`rounded-[10px] p-2 flex items-center justify-between ${isEnabled ? 'bg-es-teal/10 border border-es-teal/20' : 'bg-white/5 border border-white/5 opacity-50'}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px]">{t.emoji}</span>
                          <span className={`font-body text-xs ${isEnabled ? 'text-es-teal' : 'text-gray-400 line-through'}`}>{t.name}</span>
                        </div>
                        {isEnabled && <span className="font-mono text-[10px] text-gray-400">{t.threshold}</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-3">
                    <span className="text-xs text-gray-400">Valid Mon 28 Mar – Sun 3 Apr</span>
                  <button className="text-xs text-es-teal outline-none" onClick={() => window.scrollTo({top: 400, behavior: 'smooth'})}>Upgrade</button>
                </div>
              </GlassCard>
            )}
          </motion.div>

          {/* Plan Cards Section */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-end mb-3">
              <h2 className="font-display text-base text-white">Available Plans</h2>
              <span className="text-xs text-es-teal cursor-pointer">compare all</span>
            </div>

            <div className="flex flex-col gap-4">
              {availablePlans.map(plan => {
                const isActive = activePlan?.id === plan.id;
                const isRecommended = plan.id === 'standard';
                const mockScore = plan.id === 'basic' ? 65 : plan.id === 'standard' ? 78 : 92;
                const weeklyPremium = isActive
                  ? Number(worker?.policy?.weeklyPremium || dynamicPrice(plan.weeklyPremium))
                  : dynamicPrice(plan.weeklyPremium);

                return (
                  <GlassCard key={plan.id} className={`p-5 relative overflow-hidden ${isActive ? 'border-l-4 border-l-es-teal' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display text-lg text-white">{plan.name}</h3>
                      {isActive && <span className="chip bg-es-teal-glow text-es-teal border border-es-teal/30">ACTIVE</span>}
                      {!isActive && isRecommended && <span className="chip bg-es-amber-glow text-es-amber border border-es-amber/30 absolute top-4 right-4 text-[10px]">RECOMMENDED</span>}
                    </div>

                    <div className="mb-4">
                      <span className="font-display text-[42px] text-es-teal font-extrabold">₹{weeklyPremium}</span>
                      <span className="font-body text-sm text-gray-400 ml-1">/week</span>
                      <span className="block text-[11px] text-gray-400 italic mt-0.5">≈ ₹{weeklyPremium * 4}/month</span>
                    </div>

                    <div className="h-px bg-white/5 my-4" />

                    <p className="font-body text-sm text-white font-medium mb-3">Covers up to ₹{plan.coverageAmount}</p>

                    <div className="grid grid-cols-2 gap-1.5 mb-4">
                      {ALL_TRIGGERS.map(t => {
                        const isEnabled = plan.triggers.includes(t.name);
                        return (
                          <div key={t.name} className={`flex items-center gap-1.5 py-1 px-2 rounded-full overflow-hidden text-ellipsis whitespace-nowrap ${isEnabled ? 'bg-es-teal/10 text-es-teal' : 'bg-white/5 text-gray-400 opacity-50'}`}>
                            {isEnabled ? <Check size={12} /> : <X size={12} />}
                            <span className={`text-[11px] font-body ${!isEnabled && 'line-through'}`}>{t.name}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center gap-2 text-[13px] text-es-teal font-body">
                           <Clock size={14} className="text-es-teal" />
                           {plan.payoutSpeed} payout
                        </div>
                        {plan.hasSwarmProtection && (
                           <div className="flex items-center gap-2 text-[12px] text-es-purple font-body">
                               <span>🛡</span> Swarm fraud protection included
                           </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl mb-5">
                        <ConfidenceRing score={mockScore} size={40} />
                        <span className="text-xs text-gray-400">Your risk score for <br/>this zone:</span>
                    </div>

                    <GradientButton 
                        label={isActive ? "Current Plan" : "Activate Plan"}
                        variant={isActive ? "secondary" : "primary"}
                        fullWidth
                        onClick={() => !isActive && setUpgradeModalPlan(plan)}
                    />

                  </GlassCard>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {upgradeModalPlan && (
          <UpgradeModal 
             plan={upgradeModalPlan} 
             currentPlan={activePlan}
             onClose={() => setUpgradeModalPlan(null)}
             onConfirm={() => {
                 upgradePlan(upgradeModalPlan.id, {
                   segment: worker?.profile?.segment,
                   dailyEarnings: worker?.profile?.dailyEarnings,
                   platform: worker?.profile?.platform,
                   workShift: worker?.profile?.workShift,
                   workHours: worker?.profile?.workHours
                 });
                 toast.success('Your changes saved');
             }}
          />
        )}
      </AnimatePresence>

    </>
  );
}

function UpgradeModal({ plan, currentPlan, onClose, onConfirm }) {
  const currentPremium = Number(currentPlan?.weeklyPremium || 0);
  const nextPremium = Number(plan?.weeklyPremium || 0);
  const diff = nextPremium - currentPremium;
    const diffText = diff > 0 ? `+₹${diff}/week more` : `-₹${Math.abs(diff)}/week less`;
    const diffColor = diff > 0 ? 'text-es-amber' : 'text-es-teal';

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleConfirm = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            onConfirm();
            setTimeout(() => {
                onClose();
            }, 2000);
        }, 1500);
    };

    return (
        <React.Fragment>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2 }}
               className="fixed inset-0 bg-black/70 backdrop-blur-[8px] z-[100]"
               onClick={onClose}
            />
            <motion.div
               initial={{ y: 300, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 300, opacity: 0 }}
               transition={{ duration: 0.35, ease: "easeOut" }}
               className="fixed bottom-0 left-0 right-0 bg-[#161D35] rounded-t-[24px] border-t border-white/10 p-6 pb-[calc(env(safe-area-inset-bottom)+24px)] z-[101] max-h-[80svh] overflow-y-auto"
            >
                <div className="w-[36px] h-1 bg-white/20 mx-auto rounded-sm mb-5" />
                
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-6">
                        <svg className="w-16 h-16 mb-4 text-es-teal" viewBox="0 0 52 52">
                            <circle className="stroke-current" cx="26" cy="26" r="25" fill="none" strokeWidth="2" strokeDasharray="157" strokeDashoffset="0" style={{ animation: 'dash 0.6s ease-in-out forwards' }} />
                            <path className="stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="36" strokeDashoffset="0" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{ animation: 'dash 0.6s ease-in-out forwards 0.3s' }} />
                        </svg>
                        <h2 className="font-display text-base text-es-teal text-center">You're now covered under {plan.name}!</h2>
                        <style>{`
                            @keyframes dash { from { stroke-dashoffset: 157; } to { stroke-dashoffset: 0; } }
                        `}</style>
                    </div>
                ) : isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-es-teal/30 border-t-es-teal animate-spin" />
                        <span className="text-sm text-es-teal font-body">Processing...</span>
                        <div className="flex gap-4 mt-2 opacity-50">
                            <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center text-[10px]">GPay</div>
                            <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center text-[10px]">PPe</div>
                            <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center text-[10px]">UPI</div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <h2 className="font-display text-[18px] text-white mb-6">Switch to {plan.name}?</h2>
                        
                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 mb-2">
                            <div className="flex flex-col">
                                <span className="text-[11px] text-gray-400 mb-1">Your current plan</span>
                                <span className="font-display text-[14px] text-white">{currentPlan.name} <span className="text-gray-400 ml-1">₹{currentPremium}</span></span>
                            </div>
                            <div className="text-es-teal">→</div>
                            <div className="flex flex-col text-right">
                                <span className="text-[11px] text-gray-400 mb-1">New plan</span>
                                <span className="font-display text-[14px] text-es-teal">{plan.name} <span className="text-es-teal opacity-70 ml-1">₹{nextPremium}</span></span>
                            </div>
                        </div>
                        
                        <div className="text-center mb-6 mt-2">
                            <span className={`font-mono text-[13px] ${diffColor}`}>{diffText}</span>
                        </div>

                        <p className="text-[12px] text-gray-400 italic text-center mb-6 mt-2">New coverage starts next Monday</p>

                        <GradientButton 
                            label="Confirm & Pay"
                            fullWidth
                            onClick={handleConfirm}
                        />
                        <button 
                            className="mt-4 text-[13px] text-gray-400 text-center w-full focus:outline-none"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </motion.div>
        </React.Fragment>
    );
}

