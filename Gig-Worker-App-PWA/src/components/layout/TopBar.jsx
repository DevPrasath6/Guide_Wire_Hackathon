import React from 'react';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { Bell } from 'lucide-react';

const TopBar = () => {
  const { isOnline } = useOfflineSync();
  return (
    <div style={{ height: '56px', position: 'sticky', top: 0, zIndex: 40, background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🛡️</span>
        <span style={{ fontFamily: 'Syne', color: '#00C896', fontSize: '15px', fontWeight: 700 }}>EARNINGS SHIELD</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isOnline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ color: '#F59E0B', fontSize: '12px' }}>Offline</span>
          </div>
        )}
        <div style={{ position: 'relative' }}>
          <Bell color="#00C896" size={24} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
        </div>
      </div>
    </div>
  );
};
export default TopBar;
