import { useState, useEffect } from 'react'
import api from '../services/api'

export function usePollTrigger(zone) {
  const [disruption, setDisruption] = useState(null)
  const [lastChecked, setLastChecked] = useState(null)

  const check = async () => {
    setLastChecked(new Date())
    try {
      const { data } = await api.get('/alerts');
      if (data && data.length > 0) {
        setDisruption({
          id: data[0]._id,
          type: data[0].title,
          zone: data[0].location || zone,
          severity: 9,
          estimatedLoss: data[0].estimatedLoss || 600,
          timestamp: data[0].createdAt
        });
      } else {
        setDisruption(null);
      }
    } catch (err) {
      console.error(err);
      setDisruption(null);
    }
  }

  useEffect(() => {
    check()
    const id = setInterval(check, 10000)  // 10s polling
    return () => clearInterval(id)
  }, [zone])

  const dismiss = () => {
  }
  
  return { disruption, lastChecked, refresh: check, dismiss }
}
