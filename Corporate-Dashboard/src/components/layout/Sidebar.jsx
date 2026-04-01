import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Shield, BarChart3, Settings, ShieldAlert, Users, MessageSquare } from 'lucide-react';
import { getSessionUser, hasPermission } from '../../utils/rbac';

const Sidebar = () => {
  const user = getSessionUser();
  const navItems = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Claims', path: '/claims', icon: <FileText size={20} /> },
    ...(hasPermission('tickets.read_all') ? [{ name: 'Support', path: '/support', icon: <MessageSquare size={20} /> }] : []),
    { name: 'Policies', path: '/policies', icon: <Shield size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    ...(hasPermission('users.read') ? [{ name: 'Employees', path: '/employees', icon: <Users size={20} /> }] : []),
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-[240px] fixed left-0 top-0 h-full bg-[#0F1629]/80 backdrop-blur-[20px] border-r border-[#ffffff0f] flex flex-col justify-between">
      <div>
        {/* Logo Area */}
        <div className="p-6 border-b border-[#ffffff0f]">
          <div className="flex items-center gap-2 text-es-teal font-syne font-bold text-xl">
            <ShieldAlert className="text-es-teal" size={24} />
            <span>EARNINGS SHIELD</span>
          </div>
          <div className="font-mono text-[10px] text-es-text-muted mt-1 uppercase tracking-widest pl-8">
            Corporate Portal
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-sans transition-es
                ${isActive 
                  ? 'text-es-teal bg-es-teal/10 border-l-4 border-es-teal' 
                  : 'text-es-text-secondary hover:text-es-text-primary hover:bg-[#ffffff0a] border-l-4 border-transparent'}
              `}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Area */}
      <div className="p-4 border-t border-[#ffffff0f] m-4 es-glass rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-es-teal/20 border border-es-teal text-es-teal flex items-center justify-center font-syne font-bold">
          {(user?.name || 'User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="font-syne font-semibold text-sm text-es-text-primary">{user?.name || 'Admin User'}</div>
          <div className="font-mono text-xs text-es-text-muted">{user?.role || 'employee'}</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;