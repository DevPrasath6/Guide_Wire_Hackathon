import React from 'react';
import GlassCard from '../components/ui/GlassCard';

export default function Home() { 
  return (
    <div style={{padding: '16px', color: 'white'}}>
      <h1 style={{fontFamily: 'Syne', fontSize: '24px', marginBottom: '16px'}}>Welcome</h1>
      <GlassCard className="p-4">
        <p className="text-es-text-secondary">Your Earnings Shield is ready.</p>
      </GlassCard>
    </div>
  ); 
}
