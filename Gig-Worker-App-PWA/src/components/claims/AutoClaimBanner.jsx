import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import GradientButton from '../ui/GradientButton'
import ConfidenceRing from '../ui/ConfidenceRing'

export default function AutoClaimBanner({ disruption, onOpenManual }) {
  const navigate = useNavigate()

  if (!disruption) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden mb-4"
      >
        <GlassCard
          className="p-4 bg-es-amber/5 border-es-amber/20 glow-amber"
          style={{ borderLeft: '4px solid #F59E0B' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[20px] animate-bounce" style={{ animation: 'rain 1.5s infinite' }}>🌧️</span>
            <span className="font-display text-[15px] text-white">
              ⚠️ {disruption.type} — {disruption.zone}
            </span>
          </div>

          <div className="inline-flex items-center bg-es-amber border border-es-amber/30 text-es-black px-2 py-0.5 rounded-full text-[11px] font-bold mb-3">
            Severity {disruption.severity}/10
          </div>
          
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar mb-3">
            <span className="whitespace-nowrap px-2 py-1 rounded bg-white/5 border border-white/10 text-es-muted text-[10px]">🌡 IMD weather alert</span>
            <span className="whitespace-nowrap px-2 py-1 rounded bg-white/5 border border-white/10 text-es-muted text-[10px]">📍 Location match</span>
            <span className="whitespace-nowrap px-2 py-1 rounded bg-white/5 border border-white/10 text-es-muted text-[10px]">📊 Platform orders -68%</span>
          </div>

          <div className="flex items-center gap-3 mb-4 bg-white/5 p-2 rounded-lg">
            <ConfidenceRing score={88} size={36} />
            <div>
              <div className="text-es-teal text-[13px] font-mono mb-0.5">AI pre-assessment: HIGH CONFIDENCE</div>
              <div className="text-es-teal/80 text-[12px]">Instant payout eligible</div>
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="font-display text-[32px] text-es-teal font-extrabold flex items-center justify-center gap-1">
              <span>⚡</span> ₹{disruption.estimatedLoss}
            </div>
            <div className="text-es-muted text-[14px]">would arrive instantly</div>
          </div>

          <GradientButton
            onClick={() => onOpenManual(true, true)}
            label={`Claim ₹${disruption.estimatedLoss} Now →`}
            size="lg"
            fullWidth
            className="mb-3"
          />

          <button 
            onClick={() => onOpenManual(false, false)}
            className="w-full text-center text-es-muted text-[12px] underline decoration-es-muted/30 underline-offset-2"
          >
            I'll file this manually instead
          </button>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  )
}
