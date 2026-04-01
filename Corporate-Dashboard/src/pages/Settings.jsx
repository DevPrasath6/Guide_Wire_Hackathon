import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Database, Key, Check, Users, Save, Activity, Server, Cpu, TerminalSquare } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import {
  getAiConfidence,
  getAiDataQuality,
  getAiHallucinationCheck,
  getAiHealth,
  getAiPrediction,
  getAiSystemStatus,
  getClaims
} from '../services/api';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 }
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    autoPayoutLimit: '50000',
    riskThreshold: '0.65',
    emailAlerts: true,
    smsAlerts: false,
    mfaEnabled: true,
    apiKey: 'sk_live_8f9x********************',
  });
  const [isSaved, setIsSaved] = useState(false);

  // Testing & Diagnostics state
  const initialMockMode = localStorage.getItem('ENABLE_MOCK_MODE') === 'true';

  const [mockModeEnabled, setMockModeEnabled] = useState(initialMockMode);
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, online, offline
  const [aiDiagnostics, setAiDiagnostics] = useState({
    healthStatus: 'unknown',
    systemStatus: 'system_disconnected',
    connected: false,
    fastApiConnected: false,
    modelConfidence: 0,
    claimConfidence: null,
    dataQualityScore: 0,
    dataQualityGrade: '-',
    hallucinationRisk: 'unknown',
    hallucinationScore: 0,
    lastUpdated: null,
    fastApiVersion: 'v1'
  });
  const [aiLogs, setAiLogs] = useState([
    "[SYSTEM] Initializing Earnings Shield AI Nexus v2.4...",
    "[SYSTEM] Loading climate risk weights from DB...",
    "[SYSTEM] Connection to prediction model established."
  ]);
  const logsEndRef = useRef(null);

  const appendLog = (message) => {
    const stamp = new Date().toISOString().split('T')[1].slice(0, 8);
    setAiLogs((prev) => [...prev.slice(-120), `[LOG-${stamp}] ${message}`]);
  };

  useEffect(() => {
    let isMounted = true;
    let logInterval = null;

    if (activeTab === 'testing') {
      setBackendStatus('checking');
      
      const loadDiagnostics = async () => {
        if (mockModeEnabled) {
          if (!isMounted) return;
          setBackendStatus('mock');
          setAiDiagnostics({
            healthStatus: 'mock',
            systemStatus: 'system_connected',
            connected: true,
            fastApiConnected: false,
            modelConfidence: 92,
            claimConfidence: 90,
            dataQualityScore: 94,
            dataQualityGrade: 'A',
            hallucinationRisk: 'low',
            hallucinationScore: 12,
            lastUpdated: new Date().toISOString(),
            fastApiVersion: 'mock'
          });
          appendLog('Mock diagnostics active.');
          return;
        }

        try {
          const [health, system] = await Promise.all([getAiHealth(), getAiSystemStatus()]);

          const predictionResponse = await getAiPrediction({
            type: 'diagnostic_probe',
            hours: 1,
            note: 'Settings diagnostics heartbeat probe'
          });

          const fallbackDataQuality = await getAiDataQuality({
            claimInput: {
              type: 'diagnostic_probe',
              hours: 1
            }
          });

          const hallucinationResponse = await getAiHallucinationCheck({
            prediction: predictionResponse.prediction,
            payload: predictionResponse.payload
          });

          let claimConfidence = null;
          try {
            const claims = await getClaims({ limit: 1 });
            const firstClaimId = claims?.[0]?.id || claims?.[0]?._id;
            if (firstClaimId) {
              const confidenceResponse = await getAiConfidence(firstClaimId);
              claimConfidence = Number(confidenceResponse?.aiConfidence ?? null);
            }
          } catch (_err) {
            claimConfidence = null;
          }

          if (!isMounted) return;

          const quality = predictionResponse.dataQuality || fallbackDataQuality.dataQuality || {};
          const hallucination = hallucinationResponse.hallucination || {};

          setBackendStatus(system.connected ? 'online' : 'offline');
          setAiDiagnostics({
            healthStatus: health.status || 'unknown',
            systemStatus: system.status || 'system_disconnected',
            connected: Boolean(system.connected),
            fastApiConnected: Boolean(system.components?.fastApiConnected),
            modelConfidence: Number(predictionResponse.prediction?.confidence || 0),
            claimConfidence,
            dataQualityScore: Number(quality.score || 0),
            dataQualityGrade: quality.grade || '-',
            hallucinationRisk: hallucination.risk || 'unknown',
            hallucinationScore: Number(hallucination.score || 0),
            lastUpdated: new Date().toISOString(),
            fastApiVersion: system.fastApiVersion || predictionResponse.fastApiVersion || 'v1'
          });

          appendLog(`AI health=${health.status} | system=${system.status} | fastapi=${system.components?.fastApiConnected ? 'connected' : 'disconnected'}`);
          appendLog(`Prediction confidence=${Number(predictionResponse.prediction?.confidence || 0)}% | decision=${predictionResponse.prediction?.decision || 'unknown'}`);
          appendLog(`Data quality=${Number(quality.score || 0)} (${quality.grade || '-'}) | hallucination=${hallucination.risk || 'unknown'} (${Number(hallucination.score || 0)})`);
        } catch (_error) {
          if (!isMounted) return;
          setBackendStatus('offline');
          setAiDiagnostics((prev) => ({
            ...prev,
            connected: false,
            systemStatus: 'system_disconnected',
            healthStatus: 'error',
            lastUpdated: new Date().toISOString()
          }));
          appendLog('AI diagnostics fetch failed. Check auth/token/backend availability.');
        }
      };

      loadDiagnostics();
      logInterval = setInterval(loadDiagnostics, 15000);
    }

    return () => {
      isMounted = false;
      if (logInterval) clearInterval(logInterval);
    };
  }, [activeTab, mockModeEnabled]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiLogs]);

  const handleMockToggle = () => {
    const newVal = !mockModeEnabled;
    setMockModeEnabled(newVal);
    localStorage.setItem('ENABLE_MOCK_MODE', newVal.toString());
    window.dispatchEvent(
      new CustomEvent('es:live-refresh', {
        detail: {
          topic: 'heartbeat',
          payload: { source: 'settings_toggle', mockMode: newVal },
          timestamp: Date.now()
        }
      })
    );
    setAiLogs(prev => [...prev, `[SYSTEM] Data Loading Mode Switched to: ${newVal ? 'MOCK' : 'LIVE FAST_API'}. Changes are now live.`]);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', icon: SettingsIcon, label: 'General Parameters' },
    { id: 'security', icon: Shield, label: 'Security & Access' },
    { id: 'notifications', icon: Bell, label: 'Alert Routing' },
    { id: 'api', icon: Database, label: 'API & Integrations' },
    { id: 'testing', icon: Activity, label: 'Testing & Diagnostics' },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="pb-10 space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-syne font-bold mb-2">System Configuration</h1>
        <p className="text-es-text-secondary">Manage global application thresholds and routing rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Nav */}
        <GlassCard className="p-4 lg:col-span-1 h-fit" glowColor="none">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-es-teal/10 text-es-teal border border-es-teal/20 shadow-[0_0_15px_rgba(0,200,150,0.1)]'
                    : 'text-es-text-secondary hover:bg-[#ffffff0a] hover:text-white border border-transparent'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-es-teal' : 'text-es-text-muted'} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-[#ffffff15] px-2 text-xs text-es-text-muted">
            <div className="mb-2">Admin Hierarchy Level: <strong>Superuser</strong></div>
            <div className="flex items-center gap-2">
              <Users size={12} />
              <span>4 active sessions</span>
            </div>
          </div>
        </GlassCard>

        {/* Content Area */}
        <GlassCard className="p-6 lg:col-span-3 min-h-[500px] flex flex-col" glowColor={activeTab === 'testing' ? 'blue' : 'teal'}>
          
          <div className="flex-1">
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <h3 className="font-syne text-lg font-semibold border-b border-[#ffffff15] pb-2 mb-6">Algorithm Thresholds</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-es-text-secondary">Auto-Payout Threshold (INR)</label>
                      <p className="text-xs text-es-text-muted mb-2">Maximum amount processed without manual review</p>
                      <input 
                        type="number" 
                        value={formData.autoPayoutLimit}
                        onChange={(e) => setFormData({...formData, autoPayoutLimit: e.target.value})}
                        className="w-full bg-[#0A0F1C] border border-[#ffffff1f] rounded-lg px-4 py-2.5 text-white font-mono focus:outline-none focus:border-es-teal" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-es-text-secondary">Circuit Breaker Risk Trigger</label>
                      <p className="text-xs text-es-text-muted mb-2">Confidence index required to suspend zone (0.0 - 1.0)</p>
                      <input 
                        type="number" 
                        step="0.05"
                        value={formData.riskThreshold}
                        onChange={(e) => setFormData({...formData, riskThreshold: e.target.value})}
                        className="w-full bg-[#0A0F1C] border border-[#ffffff1f] rounded-lg px-4 py-2.5 text-white font-mono focus:outline-none focus:border-es-teal" 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <h3 className="font-syne text-lg font-semibold border-b border-[#ffffff15] pb-2 mb-6">Access Control</h3>
                  
                  <label className="flex items-center justify-between p-4 bg-[#ffffff05] border border-[#ffffff10] rounded-xl cursor-pointer hover:border-es-teal/30 transition-colors">
                    <div>
                      <div className="font-medium text-white mb-1">Require Multi-Factor Auth (MFA)</div>
                      <div className="text-xs text-es-text-muted">Enforce secondary authentication via internal app for all admin nodes.</div>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${formData.mfaEnabled ? 'bg-es-teal' : 'bg-gray-700'}`} onClick={(e) => { e.preventDefault(); setFormData({...formData, mfaEnabled: !formData.mfaEnabled})}}>
                      <motion.div layout className={`w-4 h-4 rounded-full bg-white`} style={{ x: formData.mfaEnabled ? 20 : 0 }} />
                    </div>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <h3 className="font-syne text-lg font-semibold border-b border-[#ffffff15] pb-2 mb-6">Alert Routing</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-[#ffffff05] border border-[#ffffff10] rounded-xl cursor-pointer hover:border-es-teal/30 transition-colors">
                      <div>
                        <div className="font-medium text-white mb-1">High-Risk Email Alerts</div>
                        <div className="text-xs text-es-text-muted">Receive digest emails when anomalies are detected.</div>
                      </div>
                      <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${formData.emailAlerts ? 'bg-es-teal' : 'bg-gray-700'}`} onClick={(e) => { e.preventDefault(); setFormData({...formData, emailAlerts: !formData.emailAlerts})}}>
                        <motion.div layout className={`w-4 h-4 rounded-full bg-white`} style={{ x: formData.emailAlerts ? 20 : 0 }} />
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-[#ffffff05] border border-[#ffffff10] rounded-xl cursor-pointer hover:border-es-teal/30 transition-colors">
                      <div>
                        <div className="font-medium text-white mb-1">SMS Escalation (Circuit Breaker)</div>
                        <div className="text-xs text-es-text-muted">Pings on-call admin directly if a region auto-suspends.</div>
                      </div>
                      <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${formData.smsAlerts ? 'bg-es-teal' : 'bg-gray-700'}`} onClick={(e) => { e.preventDefault(); setFormData({...formData, smsAlerts: !formData.smsAlerts})}}>
                        <motion.div layout className={`w-4 h-4 rounded-full bg-white`} style={{ x: formData.smsAlerts ? 20 : 0 }} />
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* API */}
            {activeTab === 'api' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <h3 className="font-syne text-lg font-semibold border-b border-[#ffffff15] pb-2 mb-6">Payment Gateway Keys</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-es-text-secondary">Production Secret Key</label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-es-text-muted" />
                        <input 
                          type="password" 
                          value={formData.apiKey}
                          readOnly
                          className="w-full bg-[#0A0F1C] border border-[#ffffff1f] rounded-lg pl-10 pr-4 py-2.5 text-white font-mono focus:outline-none" 
                        />
                      </div>
                      <button className="px-4 py-2 bg-[#ffffff10] hover:bg-[#ffffff20] border border-[#ffffff1a] rounded-lg font-medium text-sm transition-colors">
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Testing & Diagnostics */}
            {activeTab === 'testing' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 h-full flex flex-col">
                <div className="flex justify-between items-end border-b border-[#ffffff15] pb-2 mb-4">
                  <h3 className="font-syne text-lg font-semibold flex items-center gap-2">
                    <Activity size={20} className="text-es-blue" />
                    Diagnostics & Network State
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Server size={14} className="text-es-text-muted" />
                      <span className="text-xs text-es-text-secondary uppercase">FastAPI Backend:</span>
                      {backendStatus === 'checking' && <span className="text-xs text-es-amber animate-pulse">Pinging...</span>}
                      {backendStatus === 'mock' && <span className="text-xs text-es-amber font-mono font-bold">MOCK LOOPBACK</span>}
                      {backendStatus === 'online' && <span className="text-xs text-es-teal font-mono font-bold">ONLINE</span>}
                      {backendStatus === 'offline' && <span className="text-xs text-es-red font-mono font-bold">OFFLINE</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Cpu size={14} className="text-es-text-muted" />
                      <span className="text-xs text-es-text-secondary uppercase">Model Conf:</span>
                      <span className="text-xs text-es-teal font-mono font-bold">{aiDiagnostics.modelConfidence}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 shrink-0">
                  <div className="rounded-xl border border-[#ffffff18] bg-[#ffffff06] p-3">
                    <div className="text-[10px] uppercase text-es-text-muted">AI Health</div>
                    <div className="text-sm font-mono text-white mt-1">{aiDiagnostics.healthStatus}</div>
                    <div className="text-[11px] text-es-text-secondary mt-1">Version: {aiDiagnostics.fastApiVersion}</div>
                  </div>

                  <div className="rounded-xl border border-[#ffffff18] bg-[#ffffff06] p-3">
                    <div className="text-[10px] uppercase text-es-text-muted">System State</div>
                    <div className={`text-sm font-mono mt-1 ${aiDiagnostics.connected ? 'text-es-teal' : 'text-es-red'}`}>
                      {aiDiagnostics.systemStatus}
                    </div>
                    <div className="text-[11px] text-es-text-secondary mt-1">FastAPI: {aiDiagnostics.fastApiConnected ? 'connected' : 'disconnected'}</div>
                  </div>

                  <div className="rounded-xl border border-[#ffffff18] bg-[#ffffff06] p-3">
                    <div className="text-[10px] uppercase text-es-text-muted">Claim Confidence</div>
                    <div className="text-sm font-mono text-white mt-1">
                      {aiDiagnostics.claimConfidence == null ? 'N/A' : `${aiDiagnostics.claimConfidence}%`}
                    </div>
                    <div className="text-[11px] text-es-text-secondary mt-1">Latest claim AI confidence</div>
                  </div>

                  <div className="rounded-xl border border-[#ffffff18] bg-[#ffffff06] p-3">
                    <div className="text-[10px] uppercase text-es-text-muted">Data Quality</div>
                    <div className="text-sm font-mono text-white mt-1">
                      {aiDiagnostics.dataQualityScore} ({aiDiagnostics.dataQualityGrade})
                    </div>
                    <div className="text-[11px] text-es-text-secondary mt-1">/api/ai/data-quality + predict payload</div>
                  </div>

                  <div className="rounded-xl border border-[#ffffff18] bg-[#ffffff06] p-3">
                    <div className="text-[10px] uppercase text-es-text-muted">Hallucination Risk</div>
                    <div className="text-sm font-mono text-white mt-1">{aiDiagnostics.hallucinationRisk}</div>
                    <div className="text-[11px] text-es-text-secondary mt-1">Score: {aiDiagnostics.hallucinationScore}</div>
                  </div>

                  <div className="rounded-xl border border-[#ffffff18] bg-[#ffffff06] p-3">
                    <div className="text-[10px] uppercase text-es-text-muted">Last Updated</div>
                    <div className="text-sm font-mono text-white mt-1">
                      {aiDiagnostics.lastUpdated ? new Date(aiDiagnostics.lastUpdated).toLocaleTimeString() : 'N/A'}
                    </div>
                    <div className="text-[11px] text-es-text-secondary mt-1">Auto refresh every 15s</div>
                  </div>
                </div>

                {/* Mock Mode Toggle */}
                <label className="flex items-center justify-between p-4 bg-es-blue/5 border border-es-blue/20 rounded-xl cursor-pointer hover:border-es-blue/40 transition-colors shrink-0">
                  <div>
                    <div className="font-medium text-white mb-1 flex items-center gap-2">
                      Enable Local Mock Data 
                      {mockModeEnabled && <span className="px-2 py-0.5 rounded-full bg-es-amber/20 text-es-amber text-[10px] font-bold border border-es-amber/30">ACTIVE</span>}
                    </div>
                    <div className="text-xs text-es-text-muted">Turn off to force the dashboard to connect to your live FastAPI backend. Applies instantly across pages.</div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${mockModeEnabled ? 'bg-es-blue' : 'bg-gray-700'}`} onClick={(e) => { e.preventDefault(); handleMockToggle(); }}>
                    <motion.div layout className={`w-4 h-4 rounded-full bg-white`} style={{ x: mockModeEnabled ? 20 : 0 }} />
                  </div>
                </label>

                {/* Realtime AI Protocol Logs */}
                <div className="h-[320px] min-h-[320px] max-h-[320px] bg-[#0A0F1C] border border-[#ffffff15] rounded-xl flex flex-col overflow-hidden mt-2 relative">
                  <div className="h-8 bg-[#ffffff05] border-b border-[#ffffff10] flex items-center px-4 gap-2 shrink-0">
                    <TerminalSquare size={14} className="text-es-text-muted" />
                    <span className="text-xs font-mono text-es-text-muted">AI_Nexus_Pipeline_Logs</span>
                  </div>
                  <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-es-blue space-y-2">
                    {aiLogs.map((log, idx) => (
                      <div key={idx} className={`${log.includes('Conf') ? 'text-es-teal' : log.includes('SYSTEM') ? 'text-[#94A3B8]' : 'text-white/80'}`}>
                        {log}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                  {/* Fading overlay at top inside container */}
                  <div className="absolute top-8 left-0 right-0 h-4 bg-gradient-to-b from-[#0A0F1C] to-transparent pointer-events-none" />
                </div>

              </motion.div>
            )}
          </div>

          <div className="pt-6 border-t border-[#ffffff15] flex justify-end shrink-0 mt-8">
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                isSaved 
                  ? 'bg-es-teal/20 text-es-teal border border-es-teal/50' 
                  : activeTab === 'testing' 
                    ? 'bg-es-blue text-[#0A0F1C] hover:bg-es-blue/80 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'bg-es-teal text-[#0A0F1C] hover:bg-es-teal-dim shadow-[0_0_15px_rgba(0,200,150,0.2)]'
              }`}
            >
              {isSaved ? <Check size={16} /> : <Save size={16} />}
              {isSaved ? 'Parameters Synced' : 'Apply Configuration'}
            </button>
          </div>

        </GlassCard>
      </div>
    </motion.div>
  );
};

export default Settings;