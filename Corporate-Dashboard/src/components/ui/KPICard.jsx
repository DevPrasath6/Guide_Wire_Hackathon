import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const KPICard = ({ label, value, unit, change, changeType, icon, glowColor, idx = 0 }) => {
  const animatedValue = useAnimatedCounter(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.08 }}
    >
      <GlassCard hoverable className="p-6 relative overflow-hidden group h-full" glowColor={glowColor}>
        {/* Subtle background pulse based on glowColor */}
        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-1000 ${
          glowColor === 'teal' ? 'bg-es-teal' : 
          glowColor === 'amber' ? 'bg-es-amber' : 
          glowColor === 'red' ? 'bg-es-red' : 
          glowColor === 'purple' ? 'bg-es-purple' : 'bg-transparent'
        }`} />

        <div className="flex justify-between items-start mb-4">
          <h3 className="font-sans text-sm text-es-text-secondary font-medium">
            {label}
          </h3>
          <div className="text-es-text-muted">
            {icon}
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-4">
          {unit === '₹' && <span className="font-mono text-xl text-es-text-muted mr-1">₹</span>}
          <div className="font-syne text-4xl font-bold text-es-text-primary tracking-tight">
            {animatedValue}
          </div>
          {unit && unit !== '₹' && <span className="font-mono text-sm text-es-text-muted">{unit}</span>}
        </div>

        {change && (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className={`flex items-center px-1.5 py-0.5 rounded ${
              changeType === 'down' && glowColor === 'red' ? 'text-es-teal bg-es-teal/10' :
              changeType === 'up' && glowColor === 'red' ? 'text-es-red bg-es-red/10' :
              changeType === 'up' ? 'text-es-teal bg-es-teal/10' : 'text-es-red bg-es-red/10'
            }`}>
              {changeType === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {change}
            </span>
            <span className="text-es-text-muted ml-1">vs last week</span>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default KPICard;