import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Shield, FileText, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Policy', path: '/policy', icon: Shield },
    { name: 'Claims', path: '/claims', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, height: 'calc(64px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)', background: 'rgba(15,22,41,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        const color = isActive ? '#00C896' : '#475569';
        return (
          <div key={item.name} onClick={() => navigate(item.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '8px', gap: '4px', cursor: 'pointer' }}>
            <item.icon size={22} color={color} />
            <div style={{ height: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
              {isActive && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#00C896' }} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default BottomNav;
