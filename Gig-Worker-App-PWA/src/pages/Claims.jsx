import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useClaimsStore } from '../store/claimsStore'
import { esApi } from '../services/api'
import { toast } from '../components/ui/Toast'
import AutoClaimBanner from '../components/claims/AutoClaimBanner'
import ClaimCard from '../components/claims/ClaimCard'
import ClaimStepWizard from '../components/claims/ClaimStepWizard'
import AIVerdictReveal from '../components/claims/AIVerdictReveal'
import BottomSheet from '../components/ui/BottomSheet'
import GlassCard from '../components/ui/GlassCard'
import StatusChip from '../components/ui/StatusChip'

const TABS = ['Active', 'Past']

export default function Claims() {
  const { claims, pendingDisruption, loading, isSubmitting, submitResult, fetchClaims, setPendingDisruption, setSubmitting, setResult, clearResult } = useClaimsStore()
  
  const [activeTab, setActiveTab] = useState('Active')
  const [showWizard, setShowWizard] = useState(false)
  const [wizardIsAutoFill, setWizardIsAutoFill] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const location = useLocation()
  const { claimId } = useParams()

  useEffect(() => {
    fetchClaims()
  }, [fetchClaims])

  useEffect(() => {
    const syncClaims = () => fetchClaims({ silent: true })
    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncClaims()
    }

    window.addEventListener('es:claims:changed', syncClaims)
    window.addEventListener('visibilitychange', onVisibility)

    const id = setInterval(() => {
      if (document.visibilityState === 'visible') syncClaims()
    }, 30000)

    return () => {
      clearInterval(id)
      window.removeEventListener('es:claims:changed', syncClaims)
      window.removeEventListener('visibilitychange', onVisibility)
    }
  }, [fetchClaims])

  useEffect(() => {
    if (location.state?.autoDisruption) {
      setPendingDisruption(location.state.autoDisruption)
      setWizardIsAutoFill(true)
      setShowWizard(true)
    }
  }, [location.state, setPendingDisruption])

  useEffect(() => {
    let cancelled = false

    const loadById = async () => {
      if (!claimId) return

      try {
        const exact = await esApi.getClaimById(claimId)
        if (!cancelled && exact) {
          setSelectedClaim(exact)
          return
        }
      } catch (err) {
        console.warn('Failed to fetch claim by id, falling back to local list', err)
      }

      const matched = claims.find(
        (c) => String(c.id || c.claimId || c._id) === String(claimId)
      )

      if (!cancelled && matched) {
        setSelectedClaim(matched)
      }
    }

    loadById()
    return () => {
      cancelled = true
    }
  }, [claimId, claims])

  // Filter claims based on tab
  const activeClaims = claims.filter(c => c.status === 'pending')
  const pastClaims = claims.filter(c => c.status === 'approved' || c.status === 'rejected')
  
  const displayedClaims = activeTab === 'Active' ? activeClaims : pastClaims

  const handleOpenManual = (isAuto = false) => {
    setWizardIsAutoFill(isAuto)
    setShowWizard(true)
  }

  const getCurrentLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported on this device'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  })

  const normalizeType = (type) => {
    const map = {
      rain: 'Heavy Rain',
      heat: 'Extreme Heat',
      platform: 'Platform Outage',
      accident: 'Vehicle Issue'
    }
    return map[type] || type
  }

  const handleWizardSubmit = async (formData) => {
    setShowWizard(false)
    setSubmitting(true)

    try {
      const coords = await getCurrentLocation()
      const submitted = await esApi.submitClaim({
        type: normalizeType(formData.type),
        hours: Number(formData.duration || formData.hours || 1),
        lat: coords.lat,
        lng: coords.lng,
        note: formData.note || ''
      })

      setResult({
        success: true,
        status: submitted?.status,
        confidence: Math.round(Number(submitted?.aiScore || 0.8) * 100),
        instantAmount: submitted?.instantAmount || 0,
        heldAmount: submitted?.heldAmount || 0,
        amount: (submitted?.instantAmount || 0) + (submitted?.heldAmount || 0)
      })
      await fetchClaims()
      toast.success('Claim submitted and synced')
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit claim. Please check location permission and retry.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAIRevealComplete = () => {
    clearResult()
    fetchClaims()
  }

  return (
    <div className="min-h-[calc(100svh-140px)] bg-es-bg pb-4 pt-4 font-sans">
      <main className="px-5">
        {/* Floating action button at top for regular manual claim */}
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => handleOpenManual(false)}
            className="bg-es-teal/10 text-es-teal border border-es-teal/30 px-4 py-2 rounded-full text-[13px] font-medium active:scale-95 transition-transform"
          >
            + File Claim
          </button>
        </div>

        {/* Auto-Claim Hook */}
        {pendingDisruption && activeClaims.length === 0 && (
          <AutoClaimBanner 
            disruption={pendingDisruption} 
            onOpenManual={(useAutoData) => handleOpenManual(useAutoData)} 
          />
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/10 mb-6">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[14px] px-2 relative transition-colors ${
                activeTab === tab ? 'text-white font-medium' : 'text-es-muted'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="claimTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-es-brand"
                />
              )}
            </button>
          ))}
        </div>

        {/* Claims List */}
        <motion.div layout className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-es-muted text-sm">
                Loading claims...
              </motion.div>
            ) : displayedClaims.length > 0 ? (
              displayedClaims.map((claim) => (
                <ClaimCard 
                  key={claim.id || claim.claimId} 
                  claim={claim} 
                  onClick={() => setSelectedClaim(claim)}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-4xl mb-4 opacity-50">📂</div>
                <div className="text-es-muted text-[14px]">No {activeTab.toLowerCase()} claims found.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Manual File Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <ClaimStepWizard 
            initialType={wizardIsAutoFill ? (pendingDisruption?.type.toLowerCase().includes('rain') ? 'rain' : 'platform') : ''}
            isAutoFill={wizardIsAutoFill}
            onSubmit={handleWizardSubmit}
            onClose={() => setShowWizard(false)}
          />
        )}
      </AnimatePresence>

      {/* AI Processing / Result Screen over everything */}
      {(isSubmitting || submitResult) && (
        <AIVerdictReveal 
          autoApproved={submitResult?.status === 'approved'}
          payout={submitResult?.amount}
          onComplete={handleAIRevealComplete}
        />
      )}

      {/* Selected Claim Detail Bottom Sheet */}
      <BottomSheet 
        isOpen={!!selectedClaim} 
        onClose={() => {
          setSelectedClaim(null)
          if (claimId) navigate('/claims')
        }}
        title="Claim Details"
      >
        {selectedClaim && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[24px] mb-2">{selectedClaim.icon}</div>
                <h3 className="font-display text-[20px] text-white capitalize">{selectedClaim.type}</h3>
                <div className="text-es-muted text-[13px]">{selectedClaim.date}</div>
              </div>
              <StatusChip status={selectedClaim.status} />
            </div>

            <GlassCard className="p-4 space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="text-es-muted">Claim ID</span>
                <span className="text-white font-mono">{selectedClaim.id}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-es-muted">Amount</span>
                <span className="text-white font-medium">₹{selectedClaim.amount}</span>
              </div>
              {selectedClaim.status === 'processing' && (
                <div className="mt-4 p-3 bg-es-amber/10 border border-es-amber/20 rounded max-w-full">
                  <div className="text-es-amber text-[12px] font-mono mb-1 flex items-center gap-2">
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-es-amber border-t-transparent rounded-full" />
                    AI Verification Pending
                  </div>
                  <div className="text-es-amber/70 text-[11px] leading-tight">
                    Cross-referencing geolocation and platform outage reports. Usually takes &lt;2 hours.
                  </div>
                </div>
              )}
            </GlassCard>

            {selectedClaim.status === 'approved' && (
              <div className="text-center p-4">
                <div className="text-es-teal text-[14px] flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-es-teal" />
                  Payout transferred to registered bank account.
                </div>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

    </div>
  )
}
