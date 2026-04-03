import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getUnreadNotificationCount } from '../services/api';
import { publishLiveRefresh } from './useLiveRefresh';

export default function useRealtimeBus(addToast) {
  const previousUnreadRef = useRef(0);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return undefined;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true
    });

    const emit = (topic, payload) => publishLiveRefresh(topic, payload);

    socket.on('admin:claim:new', (payload) => {
      emit('claims', payload);
      emit('dashboard', payload);
      emit('analytics', payload);
      addToast?.('New Claim', 'A new claim was received.', 'info');
    });

    socket.on('claim_update', (payload) => {
      emit('claims', payload);
      emit('dashboard', payload);
      emit('policies', payload);
      emit('analytics', payload);
      addToast?.('Claim Updated', 'Claim status was updated in realtime.', 'info');
    });

    socket.on('dashboard:location:update', (payload) => {
      emit('dashboard', payload);
      emit('analytics', payload);
    });

    socket.on('chat:ticket:update', (payload) => {
      emit('tickets', payload);
      addToast?.('Support Update', 'A support ticket has a new update.', 'info');
    });

    const heartbeat = setInterval(() => {
      emit('heartbeat', { source: 'interval' });
    }, 15000);

    const notificationsPoll = setInterval(async () => {
      try {
        const result = await getUnreadNotificationCount();
        const unread = Number(result?.count || 0);
        if (unread > previousUnreadRef.current) {
          addToast?.('New Notification', `You have ${unread} unread notifications.`, 'info');
          emit('notifications', { unread });
        }
        previousUnreadRef.current = unread;
      } catch (_err) {
        // Ignore intermittent notification poll failures.
      }
    }, 12000);

    return () => {
      clearInterval(heartbeat);
      clearInterval(notificationsPoll);
      socket.disconnect();
    };
  }, [addToast]);
}
