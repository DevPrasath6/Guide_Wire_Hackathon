import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { Bell } from 'lucide-react';
import { esApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const TopBar = () => {
  const { isOnline } = useOfflineSync();
  const navigate = useNavigate();
  const worker = useAuthStore((state) => state.worker);
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const count = await esApi.getUnreadNotifications();
        if (mounted) setUnread(Number(count || 0));
      } catch {
        if (mounted) setUnread(0);
      }
    };

    load();

    const onNotificationsChanged = () => load();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') load();
    };

    window.addEventListener('es:notifications:changed', onNotificationsChanged);
    window.addEventListener('visibilitychange', onVisibility);

    const id = setInterval(load, 10000);

    return () => {
      mounted = false;
      clearInterval(id);
      window.removeEventListener('es:notifications:changed', onNotificationsChanged);
      window.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const claimBanUntil = worker?.policy?.claimBanUntil ? new Date(worker.policy.claimBanUntil) : null;
  const claimBanActive = claimBanUntil && claimBanUntil > new Date();

  return (
    <div style={{ height: '56px', position: 'sticky', top: 0, zIndex: 40, background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src="/logo.png" alt="ES" className="w-[20px] h-[20px] rounded mr-2" />
        <span style={{ fontFamily: 'Syne', color: '#00C896', fontSize: '15px', fontWeight: 700 }}>EARNINGS SHIELD</span>
        {claimBanActive && (
          <span className="text-[10px] px-2 py-[2px] rounded-full bg-es-red/20 text-es-red border border-es-red/40">
            Claim Ban
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isOnline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ color: '#F59E0B', fontSize: '12px' }}>Offline</span>
          </div>
        )}
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
          <Bell color="#00C896" size={24} />
          {unread > 0 && <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />}
        </div>
      </div>
    </div>
  );
};
export default TopBar;
