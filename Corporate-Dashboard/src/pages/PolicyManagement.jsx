import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShieldCheck, Banknote, Activity, Eye, PauseCircle, TrendingUp, Download } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import KPICard from '../components/ui/KPICard';
import PolicyDetailDrawer from '../components/ui/PolicyDetailDrawer';
import SuspendPolicyModal from '../components/ui/SuspendPolicyModal';
import AdjustPremiumModal from '../components/ui/AdjustPremiumModal';
import Toast from '../components/ui/Toast';
import { getPolicies, updatePolicy } from '../services/api';
import useLiveRefresh from '../hooks/useLiveRefresh';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 }
};

const PolicyManagement = () => {
  const [policies, setPolicies] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterZone, setFilterZone] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals & Drawers state
  const [viewPolicy, setViewPolicy] = useState(null);
  const [suspendPolicy, setSuspendPolicy] = useState(null);
  const [adjustPolicy, setAdjustPolicy] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const loadPolicies = useCallback(async () => {
    try {
      const data = await getPolicies();
      setPolicies(data || []);
    } catch (err) {
      addToast('Load Failed', err.response?.data?.message || 'Unable to fetch policies', 'error');
    }
  }, []);

  useLiveRefresh(loadPolicies, {
    intervalMs: 12000,
    topics: ['heartbeat', 'policies', 'claims', 'dashboard']
  });

  // Compute stats
  const activeCount = policies.filter(p => p.status === 'active').length;
  const totalRevenue = policies.reduce((acc, p) => p.status === 'active' ? acc + p.weeklyPremium : acc, 0);
  const avgRisk = policies.length ? Math.round(policies.reduce((acc, p) => acc + p.riskScore, 0) / policies.length) : 0;

  // Filters
  const uniqueZones = ['All', ...new Set(policies.map(p => p.zone))];
  const uniqueTypes = ['All', 'Basic Shield', 'Standard Shield', 'Premium Shield'];

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const matchSearch = p.workerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'All' || p.coverageType === filterType;
      const matchZone = filterZone === 'All' || p.zone === filterZone;
      const matchStatus = filterStatus === 'All' || p.status === filterStatus;
      return matchSearch && matchType && matchZone && matchStatus;
    });
  }, [policies, searchTerm, filterType, filterZone, filterStatus]);

  // Actions
  const handleSuspend = async (id) => {
    await updatePolicy(id, { status: 'suspended', reason: suspendReason });
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, status: 'suspended' } : p));
    addToast('Policy Suspended', `Coverage paused for ${id}. Reason: ${suspendReason}`, 'error');
    setSuspendReason('');
  };

  const handleAdjust = async (id, newPremium, reason) => {
    await updatePolicy(id, { weeklyPremium: newPremium, reason });
    setPolicies(prev => prev.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          weeklyPremium: newPremium, 
          premiumBreakdown: { ...p.premiumBreakdown, finalPremium: newPremium } 
        };
      }
      return p;
    }));
    addToast('Premium Adjusted', `Weekly premium updated to ₹${newPremium} for ${id}.`, 'success');
  };

  const getRiskColor = (score) => {
    if (score < 34) return 'bg-es-teal';
    if (score < 67) return 'bg-es-amber';
    return 'bg-es-red';
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'active': return 'text-es-teal bg-es-teal/10 border-es-teal/20';
      case 'suspended': return 'text-es-red bg-es-red/10 border-es-red/20';
      case 'pending': return 'text-es-amber bg-es-amber/10 border-es-amber/20';
      case 'expired': return 'text-es-text-muted bg-[#ffffff10] border-[#ffffff20]';
      default: return 'text-es-text-primary border-[#ffffff20]';
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="relative pb-10 flex flex-col h-[calc(100vh-theme(spacing.24))] min-h-0"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 mb-6">
        <div>
          <h1 className="text-3xl font-syne font-bold mb-2">Policy Options</h1>
          <p className="text-es-text-secondary">Manage coverage, adjust premiums, and configure triggers.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-es-teal text-[#0A0F1C] hover:bg-es-teal-dim transition-es font-bold text-sm">
          <Download size={16} /> Export View
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0 mb-6">
        <KPICard idx={0} label="Active Policies" value={activeCount} change="+12" changeType="up" icon={<ShieldCheck size={20} />} glowColor="teal" />
        <KPICard idx={1} label="Weekly Premium Revenue" value={totalRevenue} unit="₹" change="+4.5%" changeType="up" icon={<Banknote size={20} />} glowColor="teal" />
        <KPICard idx={2} label="Average Risk Score" value={avgRisk} change="-2" changeType="down" icon={<Activity size={20} />} glowColor="amber" />
      </div>

      <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden min-h-0" glowColor="none">
        {/* Filters */}
        <div className="p-4 border-b border-[#ffffff10] flex flex-wrap gap-4 items-center bg-[#ffffff02] shrink-0">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-es-text-muted" size={16} />
            <input
              type="text"
              placeholder="Search worker name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A2234] border border-[#ffffff15] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-es-teal/50 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#1A2234] border border-[#ffffff15] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-es-teal/50 appearance-none text-es-text-secondary cursor-pointer"
            >
              {uniqueTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
            </select>

            <select 
              value={filterZone} 
              onChange={(e) => setFilterZone(e.target.value)}
              className="bg-[#1A2234] border border-[#ffffff15] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-es-teal/50 appearance-none text-es-text-secondary cursor-pointer"
            >
              {uniqueZones.map(z => <option key={z} value={z}>{z === 'All' ? 'All Zones' : z}</option>)}
            </select>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#1A2234] border border-[#ffffff15] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-es-teal/50 appearance-none text-es-text-secondary cursor-pointer"
            >
              {['All', 'active', 'suspended', 'pending', 'expired'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 p-4 border-b border-[#ffffff10] text-xs font-mono text-es-text-secondary uppercase tracking-wider shrink-0 mr-2">
          <div>Worker</div>
          <div>Zone</div>
          <div>Coverage Type</div>
          <div>Premium</div>
          <div>Risk Score</div>
          <div>Status</div>
          <div className="text-right w-24">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {filteredPolicies.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-es-text-muted">
              <Filter size={48} className="mb-4 opacity-20" />
              <p>No policies match your filters.</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <AnimatePresence>
                {filteredPolicies.map((policy, idx) => (
                  <motion.div
                    key={policy.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.3) }}
                    className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 p-3 rounded-lg border border-transparent hover:bg-[#ffffff05] hover:border-[#ffffff0a] items-center transition-colors ${
                      policy.status === 'suspended' ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ffffff0a] flex items-center justify-center text-xs font-syne font-bold border border-[#ffffff10]">
                        {policy.workerName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-white truncate">{policy.workerName}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-es-text-muted">{policy.id}</span>
                          <span className="text-[9px] font-mono uppercase bg-[#ffffff10] px-1.5 py-0.5 rounded leading-none">{policy.platform}</span>
                        </div>
                      </div>
                    </div>

                    <div className="font-syne font-medium text-sm truncate">{policy.zone}</div>

                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wide border ${
                        policy.coverageType.includes('Premium') ? 'bg-es-purple/10 text-es-purple border-es-purple/20' :
                        policy.coverageType.includes('Standard') ? 'bg-es-teal/10 text-es-teal border-es-teal/20' :
                        'bg-[#ffffff10] text-es-text-secondary border-[#ffffff20]'
                      }`}>
                        {policy.coverageType}
                      </span>
                    </div>

                    <div className="font-mono text-sm font-medium text-es-teal">
                      ₹{policy.weeklyPremium} <span className="text-[10px] text-es-text-muted">/ wk</span>
                    </div>

                    <div className="flex items-center gap-3 w-32">
                      <div className="flex-1 h-1.5 bg-[#ffffff15] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${policy.riskScore}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${getRiskColor(policy.riskScore)}`}
                        />
                      </div>
                      <span className="font-mono text-xs w-6">{policy.riskScore}</span>
                    </div>

                    <div>
                      <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wide border inline-flex items-center gap-1.5 ${getStatusColor(policy.status)}`}>
                        {policy.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-es-teal animate-pulse" />}
                        {policy.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-1 w-24">
                      <button 
                        onClick={() => setViewPolicy(policy)}
                        className="p-1.5 rounded text-es-text-muted hover:text-es-teal hover:bg-[#ffffff10] transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {policy.status === 'active' && (
                        <>
                          <button 
                            onClick={() => setAdjustPolicy(policy)}
                            className="p-1.5 rounded text-es-text-muted hover:text-white hover:bg-[#ffffff10] transition-colors"
                            title="Adjust Premium"
                          >
                            <TrendingUp size={16} />
                          </button>
                          <button 
                            onClick={() => setSuspendPolicy(policy)}
                            className="p-1.5 rounded text-es-text-muted hover:text-es-red hover:bg-[#ffffff10] transition-colors"
                            title="Suspend Policy"
                          >
                            <PauseCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </GlassCard>

      <PolicyDetailDrawer 
        isOpen={!!viewPolicy} 
        onClose={() => setViewPolicy(null)} 
        policy={viewPolicy} 
      />

      <SuspendPolicyModal
        isOpen={!!suspendPolicy}
        onClose={() => setSuspendPolicy(null)}
        onConfirm={handleSuspend}
        policy={suspendPolicy}
        reason={suspendReason}
        setReason={setSuspendReason}
      />

      <AdjustPremiumModal
        isOpen={!!adjustPolicy}
        onClose={() => setAdjustPolicy(null)}
        onConfirm={handleAdjust}
        policy={adjustPolicy}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </motion.div>
  );
};

export default PolicyManagement;