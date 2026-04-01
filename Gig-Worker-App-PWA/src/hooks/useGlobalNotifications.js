import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useClaimsStore } from '../store/claimsStore';
import { toast } from '../components/ui/Toast';

const WS_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export function useGlobalNotifications() {
  const token = useAuthStore(s => s.token);
  const refreshProfile = useAuthStore(s => s.refreshProfile);
  const fetchClaims = useClaimsStore(s => s.fetchClaims);
  const socketRef = useRef(null);
  const claimsRefreshLockRef = useRef(false);
  const profileRefreshLockRef = useRef(false);

  const emitUiEvent = (name, detail = {}) => {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  };

  const refreshClaimsSafely = async () => {
    if (claimsRefreshLockRef.current) return;
    claimsRefreshLockRef.current = true;
    try {
      await fetchClaims({ silent: true });
      emitUiEvent('es:claims:changed');
    } catch (err) {
      console.warn('Claims auto-refresh failed', err);
    } finally {
      setTimeout(() => {
        claimsRefreshLockRef.current = false;
      }, 1500);
    }
  };

  const refreshProfileSafely = async () => {
    if (profileRefreshLockRef.current) return;
    profileRefreshLockRef.current = true;
    try {
      await refreshProfile();
      emitUiEvent('es:profile:changed');
    } catch (err) {
      console.warn('Profile auto-refresh failed', err);
    } finally {
      setTimeout(() => {
        profileRefreshLockRef.current = false;
      }, 3000);
    }
  };

  useEffect(() => {
    if (!token) return;

    // Connect to websocket
    socketRef.current = io(WS_URL, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('Push notification socket connected');
    });

    // Handle generic notifications
    socketRef.current.on('notification', (data) => {
      // data: { title, body, type }
      
      // Native PWA notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.body,
          icon: '/logo.png'
        });
      }

      // In-app Toast
      if (data.type === 'error' || data.type === 'anomaly' || data.type === 'fraud') {
        toast.error(`${data.title}: ${data.body}`);
      } else if (data.type === 'success') {
        toast.success(`${data.title}: ${data.body}`);
      } else {
        toast.info(`${data.title}: ${data.body}`);
      }

      emitUiEvent('es:notifications:changed', data);
      refreshClaimsSafely();

      if (data.type === 'fraud') {
        refreshProfileSafely();
      }
    });

    socketRef.current.on('claim_update', () => {
      refreshClaimsSafely();
    });

    socketRef.current.on('new_claim', () => {
      refreshClaimsSafely();
    });

    const fallbackRefreshId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshClaimsSafely();
        emitUiEvent('es:notifications:changed');
      }
    }, 30000);

    return () => {
      clearInterval(fallbackRefreshId);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [fetchClaims, refreshProfile, token]);

  return socketRef.current;
}