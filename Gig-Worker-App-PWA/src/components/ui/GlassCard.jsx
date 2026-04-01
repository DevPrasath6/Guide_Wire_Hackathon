import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const GlassCard = forwardRef(function GlassCard(
  { children, className = '', glow = 'none', onClick, hoverable, style },
  ref
) {
  let baseClass = 'glass';
  if (glow === 'teal') baseClass += ' glow-teal';
  else if (glow === 'amber') baseClass += ' glow-amber';
  else if (glow === 'red') baseClass += ' glow-red';
  
  if (hoverable) baseClass += ' glass-hover';

  const props = {
    ref,
    className: `${baseClass} ${className}`,
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
    style,
  };

  if (onClick) {
    props.onClick = onClick;
    props.role = 'button';
    props.style = { ...(style || {}), cursor: 'pointer' };
  }

  return <motion.div {...props}>{children}</motion.div>;
});
export default GlassCard;
