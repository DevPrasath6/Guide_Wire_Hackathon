import React from 'react';

const AnimatedBackground = () => {
  return (
    <div style={{ zIndex: -1, position: 'fixed', inset: 0, background: '#0A0E1A' }}>
      <div 
        className="orb1" 
        style={{ borderRadius: '50%', position: 'absolute', pointerEvents: 'none', width: '500px', height: '500px', background: '#00C896', opacity: 0.08, filter: 'blur(100px)', top: '-100px', left: '-100px' }} 
      />
      <div 
        className="orb2" 
        style={{ borderRadius: '50%', position: 'absolute', pointerEvents: 'none', width: '400px', height: '400px', background: '#8B5CF6', opacity: 0.07, filter: 'blur(120px)', bottom: '-80px', right: '-80px' }} 
      />
      <div 
        className="orb3" 
        style={{ borderRadius: '50%', position: 'absolute', pointerEvents: 'none', width: '350px', height: '350px', background: '#3B82F6', opacity: 0.06, filter: 'blur(100px)', top: '40%', right: '-50px' }} 
      />
      <div 
        style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} 
      />
    </div>
  );
};
export default AnimatedBackground;
