import React, { forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../ui/GlassCard'
import StatusChip from '../ui/StatusChip'

const ClaimCard = forwardRef(function ClaimCard({ claim, onClick }, ref) {
  const navigate = useNavigate()

  const colorMap = {
    approved: '#00C896', // teal
    pending: '#F59E0B',  // amber
    rejected: '#EF4444', // red
    flagged: '#8B5CF6'   // purple
  }

  const borderColor = colorMap[claim.status?.toLowerCase()] || colorMap.pending

  // Prefer persisted backend payout fields; fallback only if absent.
  const amount = Number(claim.amount || claim.estimatedLoss || 0)
  const hasDbPayout = claim.instantAmount != null || claim.heldAmount != null
  const instantPayout = hasDbPayout
    ? Number(claim.instantAmount || 0)
    : Number(claim.instant || Math.round(amount * 0.8))
  const heldPayout = hasDbPayout
    ? Number(claim.heldAmount || 0)
    : Number(claim.held || (amount - instantPayout))

  return (
    <GlassCard
      ref={ref}
      onClick={() => onClick ? onClick(claim) : navigate(`/claims/${claim.id || ''}`)}
      className="mb-2 p-[12px_14px] cursor-pointer hover:bg-white/5 transition-colors"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-body text-[14px] text-white flex items-center gap-1.5">
          <span>{claim.icon || "🌧️"}</span>
          <span>{claim.type || claim.event}</span>
        </div>
        <StatusChip status={claim.status} />
      </div>

      <div className="flex justify-between items-center mt-1">
        <div className="font-mono text-[10px] text-es-muted">{claim.id}</div>
        <div className="font-body text-[11px] text-es-muted">{claim.date}</div>
      </div>

      {(claim.status === 'approved' || claim.status === 'pending') && (
        <div className="mt-3 pt-3 border-t border-white/5 flex gap-3">
          <div className="text-[12px] text-es-teal font-medium tracking-wide">
            ⚡ ₹{instantPayout} instant
          </div>
          <div className="text-[12px] text-es-amber font-medium tracking-wide">
            ⏳ ₹{heldPayout} held
          </div>
        </div>
      )}
    </GlassCard>
  )
})

export default ClaimCard
