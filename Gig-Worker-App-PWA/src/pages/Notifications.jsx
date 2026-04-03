import React from 'react';
import { motion } from 'framer-motion';
import { Bell, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { esApi } from '../services/api';
import { toast } from '../components/ui/Toast';

export default function Notifications() {
  const [notifications, setNotifications] = React.useState([]);

  const load = React.useCallback(async () => {
    try {
      const list = await esApi.getNotifications();
      setNotifications(list);
    } catch {
      setNotifications([]);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    const onNotificationsChanged = () => load();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') load();
    };

    window.addEventListener('es:notifications:changed', onNotificationsChanged);
    window.addEventListener('visibilitychange', onVisibility);

    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 30000);

    return () => {
      clearInterval(id);
      window.removeEventListener('es:notifications:changed', onNotificationsChanged);
      window.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  const getTypeMeta = (type) => {
    if (type === 'warning') return { icon: ShieldAlert, color: 'text-es-amber', bg: 'bg-es-amber/10' };
    if (type === 'error' || type === 'fraud') return { icon: ShieldAlert, color: 'text-es-red', bg: 'bg-es-red/10' };
    if (type === 'success') return { icon: CheckCircle, color: 'text-es-teal', bg: 'bg-es-teal/10' };
    return { icon: Info, color: 'text-es-secondary', bg: 'bg-es-secondary/10' };
  };

  const markAllRead = async () => {
    try {
      await esApi.markAllNotificationsRead();
      toast.success('All notifications marked as read');
      load();
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 pt-4 pb-20 no-scrollbar relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[24px] font-bold text-white">Notifications</h1>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="text-xs text-es-teal">Mark all read</button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <GlassCard className="p-4 text-center text-es-secondary text-sm">No notifications yet.</GlassCard>
      ) : (
      <div className="space-y-4">
        {notifications.map((notif, index) => {
          const meta = getTypeMeta(notif.type);
          const IconComp = meta.icon;
          return (
          <motion.div
            key={notif._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className={`p-4 flex gap-4 items-start ${notif.read ? 'opacity-70' : ''}`}>
              <div className={`p-2 rounded-full ${meta.bg}`}>
                <IconComp className={meta.color} size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-body font-bold text-[14px] text-white">{notif.title}</h3>
                  <span className="text-[10px] text-es-muted">{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
                <p className="font-body text-[13px] text-es-muted leading-tight">
                  {notif.message}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )})}
      </div>
      )}
    </div>
  );
}