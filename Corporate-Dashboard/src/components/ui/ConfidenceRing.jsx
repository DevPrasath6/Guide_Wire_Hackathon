import React from 'react';
import { motion } from 'framer-motion';

const ConfidenceRing = ({ percentage, size = 64, strokeWidth = 6, barMode = false, showLabel = true }) => {
  if (barMode) {
    let colorClass = 'bg-es-red';
    if (percentage >= 80) colorClass = 'bg-es-teal';
    else if (percentage >= 60) colorClass = 'bg-es-amber';

    return (
      <div className="w-full h-2 bg-[#ffffff0f] rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  let color = '#EF4444'; // Red (< 60)
  if (percentage >= 80) color = '#00C896'; // Teal (>= 80)
  else if (percentage >= 60) color = '#F59E0B'; // Amber (60-79)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[11px] font-medium text-es-text-primary">
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ConfidenceRing;