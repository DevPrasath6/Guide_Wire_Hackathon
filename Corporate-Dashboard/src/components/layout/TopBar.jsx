import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, MapPin, AlertTriangle, CheckCircle2, LogOut } from 'lucide-react';       
import { motion } from 'framer-motion';
import { getUnreadNotificationCount } from '../../services/api';
import useLiveRefresh from '../../hooks/useLiveRefresh';
import { INDIAN_CITIES } from '../../data/indianCities';

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const pageTitles = {
    '/': 'Dashboard Overview',
    '/claims': 'Claims Management',
    '/support': 'Support Tickets',
    '/policies': 'Policy Management',
    '/analytics': 'Analytics & Intelligence',
    '/employees': 'Employee Management',
    '/settings': 'System Settings'
  };
  
  const currentTitle = pageTitles[location.pathname] || 'Earnings Shield';

  const refreshUnread = useCallback(async () => {
    try {
      const result = await getUnreadNotificationCount();
      setUnreadCount(Number(result?.count || 0));
    } catch (_err) {
      // Ignore notification count fetch errors.
    }
  }, []);

  useLiveRefresh(refreshUnread, {
    intervalMs: 12000,
    topics: ['heartbeat', 'notifications', 'claims', 'tickets']
  });

  // Mock circuit breaker status for now
  const circuitStatus = 'NORMAL';

  return (
    <div className="h-16 fixed top-0 right-0 left-[240px] bg-[#0A0E1A]/60 backdrop-blur-[20px] border-b border-[#ffffff0f] z-10 flex items-center justify-between px-8">
      {/* Title */}
      <h1 className="font-syne text-xl font-semibold text-es-text-primary">
        {currentTitle}
      </h1>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        {/* Zone Selector */}
        <div className="flex items-center gap-2 es-glass px-4 py-2 rounded-full cursor-pointer hover:bg-[#ffffff0a] transition-es">
          <MapPin size={16} className="text-es-text-secondary" />
          <select className="bg-transparent border-none outline-none text-sm text-es-text-primary font-sans cursor-pointer">
            <option className="bg-es-navy text-white" value="all">All Zones</option>
            {INDIAN_CITIES.map((city) => (
              <option key={city.name} className="bg-es-navy text-white" value={city.name.toLowerCase()}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Circuit Breaker Pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border ${
          circuitStatus === 'NORMAL' 
            ? 'bg-es-teal/10 border-es-teal/30 text-es-teal' 
            : 'bg-es-red/10 border-es-red/30 text-es-red'
        }`}>
          {circuitStatus === 'NORMAL' ? (
            <CheckCircle2 size={14} />
          ) : (
            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <AlertTriangle size={14} />
            </motion.div>
          )}
          CIRCUIT: {circuitStatus}
        </div>

        {/* Notifications */}
        <div className="relative cursor-pointer w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#ffffff0a] transition-es">
          <Bell size={20} className="text-es-text-secondary" />
          {/* Unread badge */}
          {unreadCount > 0 && (
            <>
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-es-red text-[10px] leading-4 text-white text-center font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-es-red">
                <span className="absolute inset-0 rounded-full bg-es-red animate-ping opacity-75"></span>
              </span>
            </>
          )}
        </div>

        {/* User Profile / Logout */}
        <div className="h-8 w-px bg-[#ffffff15] mx-2"></div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-es-text-secondary hover:text-white transition-colors"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default TopBar;