import { useState, useEffect } from 'react'
import { MOCK_DISRUPTION } from '../constants/mock'

export function usePollTrigger(zone) {
  const [disruption, setDisruption] = useState(null)
  const [lastChecked, setLastChecked] = useState(null)
  
  const check = async () => {
    setLastChecked(new Date())
    // In mock mode: alternate between disruption and no-disruption for demo
    // Use sessionStorage to track state so it persists page navigation
    const mockActive = sessionStorage.getItem('mock_disruption') !== 'dismissed'
    if (mockActive) setDisruption(MOCK_DISRUPTION)
    else setDisruption(null)
  }
  
  useEffect(() => {
    check()
    const id = setInterval(check, 30000)  // 30s in dev
    return () => clearInterval(id)
  }, [zone])
  
  const dismiss = () => {
    sessionStorage.setItem('mock_disruption', 'dismissed')
    setDisruption(null)
  }
  
  return { disruption, lastChecked, refresh: check, dismiss }
}
