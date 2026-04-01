import React, { useEffect, useRef, useState } from 'react'
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
  const [evidenceError, setEvidenceError] = useState('')
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraPreviewUrl, setCameraPreviewUrl] = useState('')
  const [formData, setFormData] = useState({
    type: initialType || '',
    duration: 3,
    evidence: null
  })

  const stopCameraStream = () => {
    if (!cameraStream) return
    cameraStream.getTracks().forEach((track) => track.stop())
    setCameraStream(null)
  }

  useEffect(() => {
    return () => {
      stopCameraStream()
      if (cameraPreviewUrl) {
        URL.revokeObjectURL(cameraPreviewUrl)
      }
    }
  }, [cameraPreviewUrl])

  useEffect(() => {
    if (cameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraOpen, cameraStream])

  const handleNext = () => setStep(s => s + 1)
  const handlePrev = () => setStep(s => s - 1)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      amount: formData.duration * 150 // Mock calculation
    })
  }

  const handleEvidenceSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setEvidenceError('')
    setFormData((prev) => ({ ...prev, evidence: file }))
  }

  const handleOpenGallery = () => {
    setEvidenceError('')
    fileInputRef.current?.click()
  }

  const handleCaptureFromCamera = async () => {
    setEvidenceError('')
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported on this device/browser.')
      }

      setCameraLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })

      setCameraStream(stream)
      setCameraPreviewUrl('')
      setCameraOpen(true)
    } catch (error) {
      setEvidenceError(error?.message || 'Camera permission denied. Please allow access and try again.')
    } finally {
      setCameraLoading(false)
    }
  }

  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const width = video.videoWidth || 1280
    const height = video.videoHeight || 720
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, width, height)

    canvas.toBlob((blob) => {
      if (!blob) {
        setEvidenceError('Could not capture photo. Please try again.')
        return
      }

      if (cameraPreviewUrl) {
        URL.revokeObjectURL(cameraPreviewUrl)
      }

      const file = new File([blob], `claim-evidence-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const preview = URL.createObjectURL(blob)
      setCameraPreviewUrl(preview)
      setFormData((prev) => ({ ...prev, evidence: file }))
      setEvidenceError('')
      stopCameraStream()
    }, 'image/jpeg', 0.92)
  }

  const handleUsePhoto = () => {
    setCameraOpen(false)
  }

  const handleRetake = async () => {
    try {
      setCameraLoading(true)
      if (cameraPreviewUrl) {
        URL.revokeObjectURL(cameraPreviewUrl)
      }
      setCameraPreviewUrl('')
      setFormData((prev) => ({ ...prev, evidence: null }))

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      setCameraStream(stream)
    } catch (error) {
      setEvidenceError(error?.message || 'Could not restart camera.')
    } finally {
      setCameraLoading(false)
    }
  }

  const handleCloseCamera = () => {
    stopCameraStream()
    setCameraOpen(false)
  }

  return (
    <>
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
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center bg-white/5 space-y-3">
                  <span className="text-2xl mb-2 block">📸</span>
                  <div className="text-es-teal text-[14px] font-mono mb-1">Tap to upload</div>
                  <div className="text-es-muted text-[11px]">Optional if AI verifies the event</div>
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleCaptureFromCamera}
                      disabled={cameraLoading}
                      className="px-3 py-2 rounded-lg bg-es-teal/20 border border-es-teal/40 text-es-teal text-[12px]"
                    >
                      {cameraLoading ? 'Opening...' : 'Use Camera'}
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenGallery}
                      className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-[12px]"
                    >
                      Choose File
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleEvidenceSelect}
                    className="hidden"
                  />
                  {formData.evidence && (
                    <div className="text-es-teal text-[11px]">Selected: {formData.evidence.name}</div>
                  )}
                  {evidenceError && (
                    <div className="text-es-red text-[11px]">{evidenceError}</div>
                  )}
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

                <div className="flex justify-between border-b border-white/10 pb-4">
                  <span className="text-es-muted text-sm">Evidence</span>
                  <span className="text-white font-medium">{formData.evidence ? 'Attached' : 'Not attached'}</span>
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

      {cameraOpen && (
        <div className="fixed inset-0 z-[60] bg-es-black/95 flex flex-col p-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-white font-display text-lg">Capture Evidence</h3>
            <button
              type="button"
              onClick={handleCloseCamera}
              className="text-es-muted text-sm"
            >
              Close
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            {!cameraPreviewUrl ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[62svh] object-cover rounded-2xl border border-white/10"
              />
            ) : (
              <img
                src={cameraPreviewUrl}
                alt="Captured evidence"
                className="w-full max-h-[62svh] object-cover rounded-2xl border border-white/10"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="space-y-2 pb-safe-bottom">
            {!cameraPreviewUrl ? (
              <GradientButton label="Capture Photo" fullWidth onClick={handleTakePhoto} />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="h-[48px] rounded-full bg-white/10 border border-white/20 text-white"
                >
                  Retake
                </button>
                <GradientButton label="Use Photo" fullWidth onClick={handleUsePhoto} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
