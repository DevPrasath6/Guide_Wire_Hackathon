import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, ChevronDown, Download, CheckSquare, XSquare, ScrollText, UserCog, History } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import StatusChip from '../components/ui/StatusChip';
import ConfidenceRing from '../components/ui/ConfidenceRing';
import ClaimDetailDrawer from '../components/ui/ClaimDetailDrawer';
import Toast from '../components/ui/Toast';
import { flagClaimFraud, getAuditLogs, getClaims, updateClaim } from '../services/api';
import useLiveRefresh from '../hooks/useLiveRefresh';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 }
};

const ClaimsManagement = () => {
  const [claims, setClaims] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Drawer state
  const [selectedClaim, setSelectedClaim] = useState(null);
  
  // Table row selection state
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());

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

  // Audit Log Panel state
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const loadClaimsData = useCallback(async () => {
    try {
      const [claimsData, logsData] = await Promise.all([getClaims(), getAuditLogs()]);
      setClaims(claimsData || []);
      setAuditLogs(logsData || []);
    } catch (err) {
      addToast('Load Failed', err.response?.data?.message || 'Unable to fetch claims data', 'error');
    }
  }, []);

  useLiveRefresh(loadClaimsData, {
    intervalMs: 10000,
    topics: ['heartbeat', 'claims', 'dashboard']
  });

  const toggleRowSelection = (id) => {
    const newSet = new Set(selectedRowIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRowIds(newSet);
  };

  const toggleAllRows = () => {
    if (selectedRowIds.size === filteredClaims.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredClaims.map(c => c.id)));
    }
  };

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const matchSearch = c.workerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.platform.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || (c.status || '').toLowerCase() === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [claims, searchTerm, filterStatus]);

  const handleOverride = async (id, newStatus, reason) => {
    await updateClaim(id, {
      status: newStatus.toLowerCase(),
      reason
    });
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: newStatus.toLowerCase() } : c));
    addToast('Claim Updated', `Claim ${id} manually overridden to ${newStatus}. Reason: ${reason}`, newStatus === 'Approved' ? 'success' : 'error');
    setSelectedClaim(null);
  };

  const handleFlagFraud = async (id, reason) => {
    await flagClaimFraud(id, reason);
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected', fraudFlag: true } : c));
    addToast('Fraud Flagged', `Claim ${id} was rejected and marked as fraud.`, 'error');
    setSelectedClaim(null);
  };

  const handleBulkAction = async (action) => {
    const ids = Array.from(selectedRowIds);
    await Promise.all(ids.map((id) => updateClaim(id, { status: action.toLowerCase(), reason: 'Bulk action' })));
    setClaims(prev => prev.map(c => selectedRowIds.has(c.id) ? { ...c, status: action.toLowerCase() } : c));
    addToast('Bulk Action Applied', `${selectedRowIds.size} claims marked as ${action}.`, action === 'Approved' ? 'success' : 'error');
    setSelectedRowIds(new Set());
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="relative pb-24 min-h-full flex flex-col h-[calc(100vh-theme(spacing.24))]"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-syne font-bold mb-2">Claims Pipeline</h1>
          <p className="text-es-text-secondary">Process, review, and override AI claim verdicts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAuditOpen(!isAuditOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-es font-medium text-sm ${isAuditOpen ? 'bg-es-teal/10 border-es-teal/30 text-es-teal' : 'bg-[#ffffff05] border-[#ffffff15] text-es-text-primary hover:bg-[#ffffff10]'}`}
          >
            <History size={16} /> Audit Log
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-es-teal text-[#0A0F1C] hover:bg-es-teal-dim transition-es font-bold text-sm">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
        
        {/* Main Table Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden" glowColor="none">
            {/* Toolbar */}
            <div className="p-4 border-b border-[#ffffff10] flex flex-wrap gap-4 items-center justify-between shrink-0 bg-[#ffffff02]">
              
              <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-es-text-muted" size={16} />
                  <input
                    type="text"
                    placeholder="Search worker name, ID, platform..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1A2234] border border-[#ffffff15] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-es-teal/50 transition-colors"
                  />
                </div>
                
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#ffffff15] bg-[#ffffff05] hover:bg-[#ffffff10] transition-colors text-sm font-medium">
                    <Filter size={14} /> Status: {filterStatus === 'all' ? 'All' : filterStatus} <ChevronDown size={14} />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-40 bg-[#0A0F1C] border border-[#ffffff15] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                    {['all', 'pending', 'approved', 'rejected', 'under_review'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setFilterStatus(s)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#ffffff0a] transition-colors ${filterStatus === s ? 'text-es-teal font-medium' : 'text-es-text-secondary'}`}
                      >
                        {s === 'all' ? 'All' : s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-es-text-muted">
                <SlidersHorizontal size={14} /> Advanced
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] gap-4 p-4 border-b border-[#ffffff10] text-xs font-mono text-es-text-secondary uppercase tracking-wider shrink-0 mr-2">
              <div className="w-8 flex justify-center items-center">
                <input 
                  type="checkbox" 
                  checked={selectedRowIds.size === filteredClaims.length && filteredClaims.length > 0}
                  onChange={toggleAllRows}
                  className="accent-es-teal w-4 h-4 rounded border-[#ffffff30] bg-transparent cursor-pointer"
                />
              </div>
              <div>Claim Info</div>
              <div>Platform & Event</div>
              <div>Amount / Loss</div>
              <div>AI Confidence</div>
              <div>Status</div>
              <div className="text-right w-20">Actions</div>
            </div>

            {/* Table Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              {filteredClaims.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-es-text-muted">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p>No claims match your filters.</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  <AnimatePresence>
                    {filteredClaims.map((claim, idx) => (
                      <motion.div
                        key={claim.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.5) }}
                        className={`grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] gap-4 p-3 rounded-lg border items-center transition-colors ${
                          selectedRowIds.has(claim.id)
                            ? 'bg-es-teal/5 border-es-teal/30'
                            : String(claim.status || '').toLowerCase() === 'pending'
                              ? 'bg-[#ffffff08] border-[#ffffff10] hover:bg-[#ffffff0c]' 
                              : 'bg-transparent border-transparent hover:bg-[#ffffff05]'
                        }`}
                      >
                        <div className="w-8 flex justify-center">
                          <input 
                            type="checkbox" 
                            checked={selectedRowIds.has(claim.id)}
                            onChange={() => toggleRowSelection(claim.id)}
                            className="accent-es-teal w-4 h-4 rounded border-[#ffffff30] bg-transparent cursor-pointer"
                          />
                        </div>
                        
                        <div>
                          <div className="font-medium text-sm text-white">{claim.workerName}</div>
                          <div className="font-mono text-[10px] text-es-text-muted truncate max-w-[120px]">{claim.id}</div>
                        </div>

                        <div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                            claim.platform === 'Zomato' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' :
                            claim.platform === 'Swiggy' ? 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20' :
                            'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20'
                          }`}>
                            {claim.platform}
                          </span>
                          <div className="text-xs text-es-text-secondary mt-1">{claim.disruptionType}</div>
                        </div>

                        <div>
                          <div className="font-mono font-medium text-sm text-es-teal">₹{claim.claimedAmount}</div>
                          <div className="font-mono text-[10px] text-es-text-muted">Est. ₹{claim.calculatedLoss}</div>
                        </div>

                        <div className="flex items-center gap-3 w-40">
                          <div className="w-20">
                            <ConfidenceRing percentage={claim.aiConfidence} barMode={true} />
                          </div>
                          <span className="font-mono text-xs">{claim.aiConfidence}%</span>
                        </div>

                        <div>
                          <StatusChip status={claim.status} />
                        </div>

                        <div className="text-right w-20">
                          <button 
                            onClick={() => setSelectedClaim(claim)}
                            className="px-3 py-1.5 rounded-md bg-[#ffffff10] hover:bg-es-teal hover:text-[#0A0F1C] text-sm font-medium transition-colors"
                          >
                            Review
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Collapsible Audit Log Panel */}
        <AnimatePresence>
          {isAuditOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 overflow-hidden"
            >
              <GlassCard className="h-full p-5 flex flex-col w-[320px]" glowColor="blue">
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <h3 className="font-syne font-semibold flex items-center gap-2">
                    <History size={16} /> Audit Trail
                  </h3>
                  <button onClick={() => setIsAuditOpen(false)} className="text-es-text-muted hover:text-white">
                    <XSquare size={16} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                  {auditLogs.map(log => (
                    <div key={log._id} className="relative pl-4 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-[#3B82F6] before:rounded-full pb-4 border-l border-[#ffffff10] ml-1.5 last:border-l-transparent">
                      <div className="text-sm font-medium mb-0.5">{log.action}</div>
                      <div className="text-xs text-es-text-secondary">{log.resourceType} • {log.resourceId}</div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-es-text-muted mt-2">
                        <span>{log.actorEmail || log.actor?.email || 'system'}</span>
                        <span>•</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedRowIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="es-glass rounded-full px-6 py-3 border border-es-teal/30 shadow-[0_0_30px_rgba(0,200,150,0.15)] flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-es-teal/20 text-es-teal flex items-center justify-center font-mono text-xs font-bold ring-2 ring-[#0A0F1C]">
                  {selectedRowIds.size}
                </div>
                <span className="text-sm font-medium">Claims Selected</span>
              </div>
              
              <div className="w-px h-6 bg-[#ffffff20]" />
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleBulkAction('Approved')}
                  className="px-4 py-1.5 rounded-full bg-es-teal/10 hover:bg-es-teal border border-es-teal/30 text-es-teal hover:text-[#0A0F1C] text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <CheckSquare size={14} /> Bulk Approve
                </button>
                <button 
                  onClick={() => handleBulkAction('Rejected')}
                  className="px-4 py-1.5 rounded-full bg-es-red/10 hover:bg-es-red border border-es-red/30 text-es-red hover:text-white text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <XSquare size={14} /> Bulk Reject
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Drawer */}
      <ClaimDetailDrawer 
        isOpen={!!selectedClaim} 
        onClose={() => setSelectedClaim(null)} 
        claim={selectedClaim}
        onOverride={handleOverride}
        onFlagFraud={handleFlagFraud}
      />

      {/* Toasts Container */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </motion.div>
  );
};

export default ClaimsManagement;