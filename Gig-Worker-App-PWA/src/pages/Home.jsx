import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, FileText, CreditCard, HelpCircle, X } from 'lucide-react'

import { useAuthStore } from '../store/authStore'
import { usePolicyStore } from '../store/policyStore'
import { useClaimsStore } from '../store/claimsStore'
import { usePollTrigger } from '../hooks/usePollTrigger'
import { esApi } from '../services/api'

import GlassCard from '../components/ui/GlassCard'
import GradientButton from '../components/ui/GradientButton'
import MetricCard from '../components/ui/MetricCard'
import ClaimCard from '../components/claims/ClaimCard'

export default function Home() {
  const navigate = useNavigate()
  const { worker } = useAuthStore()
  const { activePlan } = usePolicyStore()
  const { claims, fetchClaims } = useClaimsStore()
  const [summary, setSummary] = useState(null)
  
  // Use mock zone if worker not fully initialized
  const safeZone = worker?.zone || 'Mumbai'
  const { disruption, dismiss } = usePollTrigger(safeZone)

  const firstName = worker?.name ? worker.name.split(' ')[0] : 'Partner'

  useEffect(() => {
    let mounted = true

    const loadSummary = () => {
      esApi.getDashboardSummary()
        .then((data) => {
          if (mounted) setSummary(data)
        })
        .catch(() => {
          if (mounted) setSummary(null)
        })
    }

    const syncNow = () => {
      loadSummary()
      fetchClaims({ silent: true })
    }

    syncNow()

    const onClaimsChanged = () => syncNow()
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncNow()
    }

    window.addEventListener('es:claims:changed', onClaimsChanged)
    window.addEventListener('visibilitychange', onVisibilityChange)

    const id = setInterval(() => {
      if (document.visibilityState === 'visible') syncNow()
    }, 30000)

    return () => {
      mounted = false
      clearInterval(id)
      window.removeEventListener('es:claims:changed', onClaimsChanged)
      window.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [fetchClaims])

  const usedCoverage = 0
  const coveragePercent = Math.min((usedCoverage / (activePlan?.coverageAmount || 1000)) * 100, 100)

  // Map triggers to emojis for UI
  const triggerIcons = {
    'Heavy Rain': '🌧️',
    'Flash Flood': '🌊',
    'Extreme Heat': '☀️',
    'Curfew': '🚨',
    'Strike': '🛑',
    'Severe Pollution': '🌫️'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  const getRecentClaims = () => {
    if (summary?.recentClaims?.length) return summary.recentClaims.slice(0, 3)
    return claims.slice(0, 3)
  }

  return (
    <div className="h-full overflow-y-auto px-4 pt-4 pb-20 no-scrollbar">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        {/* SECTION 1 - Greeting */}
        <motion.div variants={itemVariants} className="px-1">
          <h1 className="font-body text-[14px] text-es-secondary">
            Good morning, {firstName} 👋
          </h1>
          <p className="font-body text-[12px] text-es-muted mt-0.5">
            {worker?.platform || 'Zomato'} partner · {safeZone}
          </p>
        </motion.div>

        {/* SECTION 2 - Disruption Alert Banner */}
        <AnimatePresence>
          {disruption && (
            <motion.div
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <GlassCard 
                className="relative overflow-hidden mb-2" 
                style={{ 
                  background: 'rgba(245,158,11,0.06)', 
                  borderColor: 'rgba(245,158,11,0.2)',
                  borderLeft: '4px solid #F59E0B'
                }}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="font-display text-[15px] text-white flex items-center gap-2">
                      <span>⚠️</span> Heavy Rain Alert — {disruption.zone}
                    </h2>
                    <button onClick={dismiss} className="text-es-muted hover:text-white p-1 -m-1">
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between font-body text-[12px] text-es-muted mb-1.5">
                      <span>Severity: {disruption.severity}/10</span>
                    </div>
                    <div className="h-[6px] bg-white/10 rounded-full overflow-hidden w-full relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(disruption.severity / 10) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
                      />
                    </div>
                    <p className="text-[12px] text-es-muted mt-2">
                      Deliveries in your zone are severely affected
                    </p>
                    <p className="text-[13px] text-es-amber font-mono mt-1 font-medium">
                      Estimated loss: ₹{disruption.estimatedLoss}
                    </p>
                  </div>
                  
                  <GradientButton 
                    label={`⚡ Claim ₹${disruption.estimatedLoss} Now`}
                    fullWidth
                    size="sm"
                    className="mt-2 mb-3"
                    onClick={() => navigate('/claims', { state: { autoDisruption: disruption } })}
                  />
                  <div className="text-center">
                    <button className="text-[12px] text-es-muted hover:text-white transition-colors pb-1">
                      I'll file manually
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 3 - Active Coverage Card */}
        <motion.div variants={itemVariants}>
          <GlassCard glow="teal" className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-[15px] text-es-teal font-bold">{activePlan?.name || 'Standard Shield'}</h3>
              <span className="bg-es-teal/15 text-es-teal border border-es-teal/30 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">
                ACTIVE
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-[12px] text-es-muted mb-1.5 font-body">
                <span>Coverage This Week</span>
                <span>₹{usedCoverage} / ₹{activePlan?.coverageAmount || 1000}</span>
              </div>
              <div className="h-[6px] bg-white/10 rounded-full overflow-hidden w-full relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${coveragePercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-es-teal rounded-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto flex gap-2 pb-1 no-scrollbar mb-4 -mx-1 px-1">
              {activePlan?.triggers?.map(trigger => (
                <span 
                  key={trigger} 
                  className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full text-es-teal bg-es-teal/10 border border-es-teal/20 whitespace-nowrap"
                >
                  {triggerIcons[trigger] || '⚠️'} {trigger}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-[12px] pt-3 border-t border-white/5">
              <span className="text-es-muted">Valid until Sun 5 Apr</span>
              <span className="text-es-amber">3 days left</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* SECTION 4 - This Week Summary */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2">
          <MetricCard 
            label="Protected" 
            value={`₹${summary?.payoutTotal || 0}`} 
            icon="Shield" 
            color="teal" 
          />
          <MetricCard 
            label="Claims" 
            value={summary?.totalClaims ?? claims.length} 
            icon="FileText" 
            color="blue" 
          />
          <MetricCard 
            label="Premium" 
            value={`₹${worker?.policy?.weeklyPremium || activePlan?.weeklyPremium || 45}`} 
            icon="CreditCard" 
            color="amber" 
          />
        </motion.div>

        {/* SECTION 5 - Recent Claims */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="font-display text-[16px] text-white">Recent Claims</h3>
            <button onClick={() => navigate('/claims')} className="text-[13px] text-es-teal hover:underline">
              View All
            </button>
          </div>
          
          {claims.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center opacity-70">
              <span className="text-[40px] mb-3">🛡️</span>
              <p className="text-[14px] text-es-muted mb-1">No claims yet</p>
              <p className="text-[12px] text-es-muted/70 max-w-[200px]">
                We'll notify you when a disruption occurs
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {getRecentClaims().map((claim, index) => (
                <ClaimCard key={claim.id || index} claim={claim} />
              ))}
            </div>
          )}
        </motion.div>

        {/* SECTION 6 - Quick Actions */}
        <motion.div variants={itemVariants} className="mb-2">
          <h3 className="font-display text-[14px] text-es-muted mb-3 px-1 mt-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <GlassCard onClick={() => navigate('/claims')} hoverable className="p-4 flex items-center gap-3">
              <FileText size={20} className="text-es-teal" />
              <span className="font-body text-[13px] text-white">File a Claim</span>
            </GlassCard>
            
            <GlassCard onClick={() => navigate('/policy')} hoverable className="p-4 flex items-center gap-3">
              <Shield size={20} className="text-es-purple" />
              <span className="font-body text-[13px] text-white">View Policy</span>
            </GlassCard>
            
            <GlassCard onClick={() => navigate('/claims')} hoverable className="p-4 flex items-center gap-3">
              <CreditCard size={20} className="text-es-amber" />
              <span className="font-body text-[13px] text-white">History</span>
            </GlassCard>
            
            <GlassCard onClick={() => navigate('/support')} hoverable className="p-4 flex items-center gap-3">
              <HelpCircle size={20} className="text-es-blue" />
              <span className="font-body text-[13px] text-white">Support</span>
            </GlassCard>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
