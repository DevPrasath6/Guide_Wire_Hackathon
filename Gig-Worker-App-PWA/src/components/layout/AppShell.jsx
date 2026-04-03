import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { useGlobalNotifications } from '../../hooks/useGlobalNotifications';

const OfflineBanner = () => {
  const { isOnline, wasOffline } = useOfflineSync();
  const [showSynced, setShowSynced] = React.useState(false);

  React.useEffect(() => {
    if (isOnline && wasOffline) {
      setShowSynced(true);
      const tt = setTimeout(() => setShowSynced(false), 2000);
      return () => clearTimeout(tt);
    }
  }, [isOnline, wasOffline]);

  return (
    <AnimatePresence>
      {(!isOnline || showSynced) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: '40px', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="glass"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: !isOnline ? 'rgba(245,158,11,0.1)' : 'rgba(0,200,150,0.1)', border: 'none', borderRadius: 0 }}
        >
          <span style={{ color: !isOnline ? '#F59E0B' : '#00C896', fontSize: '12px', fontWeight: 600 }}>
            {!isOnline ? "You're offline — showing last synced data" : "Synced ✓"}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AppShell = ({ children }) => {
  useGlobalNotifications();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
      <AnimatedBackground />
      <TopBar />
      <OfflineBanner />
      <div className="safe-bottom" style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        {children}
      </div>
      <BottomNav />
    </div>
  );
};
export default AppShell;
