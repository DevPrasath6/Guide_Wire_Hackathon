import { useState, useEffect } from 'react';
import { getCircuitBreakerStatus } from '../services/api';

export const useCircuitBreaker = () => {
  const [status, setStatus] = useState("NORMAL");
  const [activeZones, setActiveZones] = useState([]);
  const [lastActivation, setLastActivation] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const data = await getCircuitBreakerStatus();
        if (isMounted) {
          setStatus(data.status);
          setActiveZones(data.active_zones || []);
          setLastActivation(data.last_activation);
        }
      } catch (error) {
        console.error("Failed to fetch circuit breaker status:", error);
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 30 seconds
    const intervalId = setInterval(fetchStatus, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return { status, activeZones, lastActivation };
};