import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', glowColor = 'none', onClick, hoverable = false }) => {
  const glowMap = {
    teal: 'hover:glow-teal',
    amber: 'hover:glow-amber',
    red: 'hover:glow-red',
    purple: 'hover:glow-purple',
    none: ''
  };

  const hoverClasses = hoverable 
    ? `cursor-pointer hover:-translate-y-[2px] transition-es hover:border-white/10 ${glowMap[glowColor]}` 
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`es-glass rounded-2xl ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;