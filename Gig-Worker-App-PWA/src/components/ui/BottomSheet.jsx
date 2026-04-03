import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BottomSheet({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-[8px]"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 bg-es-navyMid rounded-t-[24px] border-t border-white/10 p-[24px] pb-[calc(24px+env(safe-area-inset-bottom))] max-h-[80svh] overflow-y-auto"
          >
            <div className="w-[36px] h-[4px] bg-white/20 mx-auto rounded-sm mb-[20px]" />
            {title && (
              <h2 className="font-display text-[18px] text-white mb-4">{title}</h2>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
