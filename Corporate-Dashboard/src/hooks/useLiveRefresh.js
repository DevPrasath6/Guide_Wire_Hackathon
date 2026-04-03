import { useEffect, useMemo, useRef } from 'react';

export const LIVE_REFRESH_EVENT = 'es:live-refresh';

export function publishLiveRefresh(topic, payload = {}) {
  window.dispatchEvent(
    new CustomEvent(LIVE_REFRESH_EVENT, {
      detail: {
        topic,
        payload,
        timestamp: Date.now()
      }
    })
  );
}

export default function useLiveRefresh(refreshFn, options = {}) {
  const {
    intervalMs = 15000,
    topics = ['heartbeat'],
    runOnMount = true,
    enabled = true
  } = options;

  const topicKey = useMemo(() => topics.slice().sort().join('|'), [topics]);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof refreshFn !== 'function') return undefined;

    const runRefresh = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        await refreshFn();
      } finally {
        inFlightRef.current = false;
      }
    };

    if (runOnMount) {
      runRefresh();
    }

    const onLiveRefresh = (event) => {
      const topic = event?.detail?.topic;
      if (topics.includes('*') || topics.includes(topic)) {
        runRefresh();
      }
    };

    window.addEventListener(LIVE_REFRESH_EVENT, onLiveRefresh);
    const interval = setInterval(runRefresh, intervalMs);

    return () => {
      window.removeEventListener(LIVE_REFRESH_EVENT, onLiveRefresh);
      clearInterval(interval);
    };
  }, [enabled, intervalMs, refreshFn, runOnMount, topicKey]);
}
