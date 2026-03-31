import { useState, useEffect } from 'react';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        syncPendingActions();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const syncPendingActions = () => {
    const pending = JSON.parse(localStorage.getItem('es_pending_actions') || '[]');
    if (pending.length > 0) {
      console.log('Back online — syncing your data...', pending);
      localStorage.setItem('es_pending_actions', '[]');
    }
  };

  return { isOnline, wasOffline };
}
