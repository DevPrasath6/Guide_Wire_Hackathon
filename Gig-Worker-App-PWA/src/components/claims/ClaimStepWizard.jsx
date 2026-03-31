import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GradientButton from '../ui/GradientButton'
import GlassCard from '../ui/GlassCard'

const CLAIM_TYPES = [
  { id: 'rain', icon: '🌧️', label: 'Severe Rain' },
  { id: 'heat', icon: '☀️', label: 'Extreme Heat' },
  { id: 'platform', icon: '📉', label: 'Platform Outage' },
  { id: 'accident', icon: '🚲', label: 'Vehicle Issue' }
]

export default function ClaimStepWizard({ onSubmit, initialType = '', onClose, isAutoFill }) {
  const [step, setStep] = useState(isAutoFill ? 2 : 1)
  const [formData, setFormData] = useState({
    type: initialType || '',
    duration: 3,
    evidence: null
  })

  const handleNext = () => setStep(s => s + 1)
  const handlePrev = () => setStep(s => s - 1)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      amount: formData.duration * 150 // Mock calculation
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-es-bg/95 backdrop-blur-md flex flex-col p-4 sm:p-6">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5 pt-safe">
        <button 
          onClick={step === 1 && !isAutoFill ? onClose : handlePrev}
          className="text-es-muted text-sm w-16 text-left"
        >
          {step === 1 && !isAutoFill ? 'Cancel' : '← Back'}
        </button>
        <span className="font-mono text-es-teal text-sm tracking-widest">
          STEP {step}/3
        </span>
        <div className="w-16" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="font-display text-[24px] text-white">What caused you to lose earnings today?</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {CLAIM_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFormData({ ...formData, type: t.id })}
                    className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-colors ${
                      formData.type === t.id 
                        ? 'bg-es-teal/10 border-es-teal text-es-teal' 
                        : 'bg-white/5 border-white/10 text-white'
                    }`}
                  >
                    <span className="text-3xl">{t.icon}</span>
                    <span className="font-mono text-[11px] uppercase tracking-wider">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-8">
                <GradientButton 
                  label="Continue" 
                  fullWidth 
                  onClick={handleNext}
                  disabled={!formData.type}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="font-display text-[24px] text-white">Provide Details</h2>
              
              <div>
                <label className="block text-es-muted text-[13px] mb-4">Hours of work lost</label>
                <div className="flex items-center gap-4">
                  <span className="text-white font-mono w-4">1h</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="flex-1 accent-es-teal"
                  />
                  <span className="text-white font-mono w-6">{formData.duration}h</span>
                </div>
              </div>

              <div>
                <label className="block text-es-muted text-[13px] mb-4">Upload Proof (Screenshot / Photo)</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-white/5">
                  <span className="text-2xl mb-2 block">📸</span>
                  <div className="text-es-teal text-[14px] font-mono mb-1">Tap to upload</div>
                  <div className="text-es-muted text-[11px]">Optional if AI verifies the event</div>
                </div>
              </div>

              <div className="pt-4">
                <GradientButton 
                  label="Review Claim" 
                  fullWidth 
                  onClick={handleNext}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="font-display text-[24px] text-white">Review & Submit</h2>
              
              <GlassCard className="p-5 space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-4">
                  <span className="text-es-muted text-sm">Event Type</span>
                  <span className="text-white font-medium capitalize flex items-center gap-2">
                    {CLAIM_TYPES.find(t => t.id === formData.type)?.icon} 
                    {CLAIM_TYPES.find(t => t.id === formData.type)?.label}
                  </span>
                </div>
                
                <div className="flex justify-between border-b border-white/10 pb-4">
                  <span className="text-es-muted text-sm">Time Impact</span>
                  <span className="text-white font-medium">{formData.duration} hours</span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-es-teal text-sm">Estimated Payout</span>
                  <span className="text-es-teal font-display text-[20px]">
                    ₹{formData.duration * 150}
                  </span>
                </div>
              </GlassCard>

              <div className="bg-es-amber/10 border-l-4 border-es-amber p-4 rounded-r-lg mt-6">
                <p className="text-[12px] text-es-amber/90 leading-relaxed">
                  By submitting, you agree to our Terms of Service. Fraudulent claims will result in immediate policy cancellation and platform ban.
                </p>
              </div>

              <div className="pt-8">
                <GradientButton 
                  label="Submit for AI Processing" 
                  fullWidth 
                  size="lg"
                  onClick={handleSubmit}
                  className="mb-3"
                />
                <button 
                  onClick={onClose}
                  className="w-full text-center text-es-muted text-[13px] py-3"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
