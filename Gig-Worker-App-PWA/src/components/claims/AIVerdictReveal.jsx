import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ConfidenceRing from '../ui/ConfidenceRing'
import GlassCard from '../ui/GlassCard'
import GradientButton from '../ui/GradientButton'

const PHASES = [
  { id: 'geo', text: "Verifying Geolocations & Time...", delay: 1500 },
  { id: 'weather', text: "Cross-referencing IMD Weather Data...", delay: 2000 },
  { id: 'orders', text: "Analyzing Swiggy/Zomato Demand Drop...", delay: 2000 },
  { id: 'fraud', text: "Running Guidewire Fraud Checks...", delay: 1500 },
]

export default function AIVerdictReveal({ onComplete, autoApproved = true, payout = 450 }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (phaseIndex < PHASES.length) {
      const timer = setTimeout(() => {
        setPhaseIndex(prev => prev + 1)
      }, PHASES[phaseIndex].delay)
      return () => clearTimeout(timer)
    } else {
      setTimeout(() => setShowResult(true), 500)
    }
  }, [phaseIndex])

  return (
    <div className="fixed inset-0 z-50 bg-es-bg flex flex-col justify-center px-6">
      {!showResult ? (
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mb-12 relative"
          >
            <div className="absolute inset-0 rounded-full border-4 border-es-teal/20" />
            <div className="absolute inset-0 rounded-full border-4 border-es-teal border-t-transparent animate-spin-fast" />
          </motion.div>

          <div className="space-y-4 w-full max-w-sm">
            {PHASES.map((phase, i) => {
              const isPast = i < phaseIndex
              const isCurrent = i === phaseIndex
              
              if (i > phaseIndex) return null

              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 flex justify-center">
                    {isPast ? (
                      <span className="text-es-teal text-xl">✓</span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-es-teal animate-pulse" />
                    )}
                  </div>
                  <span className={`font-mono text-sm ${isPast ? 'text-white' : 'text-es-teal'}`}>
                    {phase.text}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <GlassCard className={`p-8 text-center ${autoApproved ? 'border-es-teal/30 glow-teal' : 'border-es-brand/30'}`}>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              {autoApproved ? (
                <div className="w-20 h-20 rounded-full bg-es-teal/20 flex items-center justify-center text-4xl">
                  🎉
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-es-brand/20 flex items-center justify-center text-4xl">
                  ⏳
                </div>
              )}
            </motion.div>
            
            <h2 className="font-display leading-tight text-white mb-2">
              {autoApproved ? "Claim Approved Instantly!" : "Claim Sent for Review"}
            </h2>
            
            <p className="text-es-muted text-[15px] mb-8">
              {autoApproved ? (
                <>AI Confidence verified parameters.<br/>Payout heading to your account.</>
              ) : (
                "Our team needs to manually verify the details. We'll update you within 24 hours."
              )}
            </p>

            {autoApproved && (
              <div className="font-display text-[48px] text-es-teal font-extrabold mb-8">
                ₹{payout}
              </div>
            )}

            <GradientButton 
              label="Back to Claims" 
              onClick={onComplete} 
              fullWidth 
              size="lg"
            />
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
