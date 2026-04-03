import React from 'react'

export default function StatusChip({ status }) {
  const styles = {
    approved: { backgroundColor: 'rgba(0,200,150,0.15)', color: '#00C896', border: '1px solid rgba(0,200,150,0.3)' },
    pending: { backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' },
    rejected: { backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' },
    flagged: { backgroundColor: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }
  }

  const safeStatus = status ? status.toLowerCase() : 'pending'
  const currentStyle = styles[safeStatus] || styles.pending
  const display = safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)

  return (
    <span className="chip" style={currentStyle}>
      {display}
    </span>
  )
}
