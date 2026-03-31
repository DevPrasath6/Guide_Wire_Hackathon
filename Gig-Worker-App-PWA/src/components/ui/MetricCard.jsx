import React, { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import GlassCard from './GlassCard'

export default function MetricCard({ label, value, icon, color }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  // Extract number and currency symbol from string like "₹45" or "0"
  const valString = value.toString()
  const target = parseInt(valString.replace(/[^0-9]/g, ''), 10) || 0
  const prefix = valString.includes('₹') ? '₹' : ''

  useEffect(() => {
    if (target === 0) {
      setDisplayValue(0)
      return
    }
    
    let step = 0
    const maxSteps = 20
    const interval = setInterval(() => {
      step++
      setDisplayValue(Math.floor((target / maxSteps) * step))
      if (step >= maxSteps) clearInterval(interval)
    }, 800 / maxSteps)
    
    return () => clearInterval(interval)
  }, [target])

  const IconComp = Icons[icon]
  // Map our token names to standard hex values for icon color
  const colorMap = {
    teal: '#00C896',
    amber: '#F59E0B',
    blue: '#3B82F6',
  }

  return (
    <GlassCard className="p-3 flex flex-col gap-1 items-start" glow="none">
      {IconComp && <IconComp size={16} color={colorMap[color] || '#FFF'} />}
      <div className="font-display text-[22px] text-white font-bold tracking-tight mt-1">
        {prefix}{displayValue}
      </div>
      <div className="font-body text-[10px] text-es-muted truncate w-full">
        {label}
      </div>
    </GlassCard>
  )
}
