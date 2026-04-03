import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const toast = {
  success: (msg) => window.__esToast?.('success', msg),
  error: (msg) => window.__esToast?.('error', msg),
  info: (msg) => window.__esToast?.('info', msg),
  warning: (msg) => window.__esToast?.('warning', msg)
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    window.__esToast = addToast;
    return () => {
      delete window.__esToast;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle className="text-es-teal" size={18} />,
    error: <AlertTriangle className="text-es-red" size={18} />,
    info: <Info className="text-es-blue" size={18} />,
    warning: <AlertTriangle className="text-es-orange" size={18} />
  };

  const borders = {
    success: 'border-l-es-teal',
    error: 'border-l-es-red',
    info: 'border-l-es-blue',
    warning: 'border-l-es-orange'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`glass pointer-events-auto px-4 py-3 rounded-xl flex items-center gap-3 w-full max-w-[340px] shadow-lg border-l-[3px] ${borders[toast.type] || 'border-l-white'}`}
      style={{
        background: 'rgba(20, 25, 30, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      {icons[toast.type] || <Info size={18} className="text-white" />}
      <span className="font-body text-[14px] text-white flex-1">{toast.message}</span>
      <button onClick={onRemove} className="text-es-muted hover:text-white transition-colors">
        <X size={16} />
      </button>
    </motion.div>
  );
};
