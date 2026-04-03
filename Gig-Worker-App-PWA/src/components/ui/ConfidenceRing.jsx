import React, { useEffect, useState } from 'react';

export default function ConfidenceRing({ score = 0, size = 56, showLabel = true }) {
  const [offset, setOffset] = useState(0);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    // Initial offset is circumference so it starts empty, then animate to target
    const timeout = setTimeout(() => {
        setOffset(circumference - (score / 100) * circumference);
    }, 100);
    return () => clearTimeout(timeout);
  }, [score, circumference]);

  const strokeColor = score >= 80 ? '#00C896' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ 
            transition: 'stroke-dashoffset 0.8s ease-out', 
            strokeDashoffset: offset === 0 && score === 0 ? circumference : offset 
          }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showLabel && (
        <div 
          className="absolute inset-0 flex items-center justify-center font-mono" 
          style={{ fontSize: size * 0.28, color: 'white' }}
        >
          {score}%
        </div>
      )}
    </div>
  );
}
