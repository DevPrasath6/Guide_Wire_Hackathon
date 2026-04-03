import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Database, BrainCircuit, Shield } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import api from '../services/api';

export default function SystemStatus() {
  const navigate = useNavigate();
  const [aiStatus, setAiStatus] = useState('Checking...');
  const [dashStatus, setDashStatus] = useState('Checking...');

  useEffect(() => {
    checkServices();
  }, []);

  const checkServices = async () => {
    try {
      const aiRes = await api.get('/ai/status');
      setAiStatus(aiRes.data.status === 'connected' ? 'Connected (FastAPI)' : 'Disconnected');
    } catch {
      setAiStatus('Offline');
    }

    try {
      const dashRes = await api.get('/dashboard/status');
      setDashStatus(dashRes.data.status === 'connected' ? 'Connected' : 'Disconnected');
    } catch {
      setDashStatus('Offline');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f12]">
      <TopBar 
        title="System Status" 
        leftIcon={<ArrowLeft size={24} />} 
        onLeftClick={() => navigate('/profile')}
      />
      <div className="px-4 py-6 scroll-smooth flex-1 overflow-y-auto">
        <div className="glass p-4 mb-4">
          <div className="flex items-center gap-3">
            <BrainCircuit size={24} className="text-es-teal" />
            <div className="flex-1">
              <h3 className="text-white font-body font-bold">AI Model Agent</h3>
              <p className="text-es-muted text-xs">Evaluates fraud & claims in real-time</p>
            </div>
            <div className={`px-2 py-1 rounded text-xs ${aiStatus.includes('Connected') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {aiStatus}
            </div>
          </div>
        </div>

        <div className="glass p-4 mb-4">
          <div className="flex items-center gap-3">
            <Activity size={24} className="text-blue-400" />
            <div className="flex-1">
              <h3 className="text-white font-body font-bold">Corporate Dashboard</h3>
              <p className="text-es-muted text-xs">Central Command & Microservices</p>
            </div>
            <div className={`px-2 py-1 rounded text-xs ${dashStatus.includes('Connected') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {dashStatus}
            </div>
          </div>
        </div>
        
        <div className="glass p-4 mb-4">
          <div className="flex items-center gap-3">
            <Database size={24} className="text-purple-400" />
            <div className="flex-1">
              <h3 className="text-white font-body font-bold">MongoDB Cluster</h3>
            </div>
            <div className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
              Online
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}