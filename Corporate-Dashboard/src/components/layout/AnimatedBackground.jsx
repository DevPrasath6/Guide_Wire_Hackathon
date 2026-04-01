import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0A0E1A]">
      {/* Orb 1: Teal */}
      <motion.div
        className="absolute top-0 left-0 rounded-full blur-[120px] opacity-10 bg-[#00C896]"
        style={{ width: '600px', height: '600px', transform: 'translate(-50%, -50%)' }}
        animate={{
          x: ['-100px', '100px', '-100px'],
          y: ['-80px', '80px', '-80px'],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      {/* Orb 2: Purple */}
      <motion.div
        className="absolute bottom-0 right-0 rounded-full blur-[120px] opacity-10 bg-[#8B5CF6]"
        style={{ width: '500px', height: '500px', transform: 'translate(50%, 50%)' }}
        animate={{
          x: ['100px', '-100px', '100px'],
          y: ['80px', '-80px', '80px'],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      {/* Orb 3: Blue */}
      <motion.div
        className="absolute top-1/2 right-1/4 rounded-full blur-[120px] opacity-10 bg-[#3B82F6]"
        style={{ width: '400px', height: '400px', transform: 'translate(50%, -50%)' }}
        animate={{
          x: ['-50px', '120px', '-50px'],
          y: ['50px', '-60px', '50px'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      {/* Dot Grid overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
      {/* Noise filter */}
      <svg className="fixed inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)"></rect>
      </svg>
    </div>
  );
};

export default AnimatedBackground;