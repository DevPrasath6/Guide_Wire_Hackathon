import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border es-glass shadow-lg min-w-[300px] ${
              toast.type === 'success' ? 'border-es-teal/30 bg-es-teal/10' :
              toast.type === 'error' ? 'border-es-red/30 bg-es-red/10' :
              'border-[#ffffff20] bg-[#ffffff0a]'
            }`}
          >
            <div className={`shrink-0 ${
              toast.type === 'success' ? 'text-es-teal' :
              toast.type === 'error' ? 'text-es-red' :
              'text-es-text-secondary'
            }`}>
              {toast.type === 'success' && <CheckCircle2 size={18} />}
              {toast.type === 'error' && <AlertTriangle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{toast.title}</div>
              {toast.message && (
                <div className="text-xs text-es-text-secondary mt-0.5">{toast.message}</div>
              )}
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-md text-es-text-muted hover:text-white hover:bg-[#ffffff10] transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;