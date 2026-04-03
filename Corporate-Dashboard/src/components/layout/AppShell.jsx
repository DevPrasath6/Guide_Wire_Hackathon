import React, { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AnimatedBackground from './AnimatedBackground';
import Toast from '../ui/Toast';
import useRealtimeBus from '../../hooks/useRealtimeBus';

const AppShell = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useRealtimeBus(addToast);

  return (
    <div className="min-h-screen text-es-text-primary flex">
      <AnimatedBackground />
      <Sidebar />
      <TopBar />
      <main className="flex-1 ml-[240px] mt-[64px] p-8 overflow-y-auto w-[calc(100%-240px)]">
        <Outlet />
      </main>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default AppShell;