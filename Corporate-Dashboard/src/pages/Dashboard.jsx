import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Shield, FileText, Banknote, ShieldAlert, CloudRain, Thermometer, Waves, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import KPICard from '../components/ui/KPICard';
import DataTable from '../components/ui/DataTable';
import StatusChip from '../components/ui/StatusChip';
import ConfidenceRing from '../components/ui/ConfidenceRing';
import GlassCard from '../components/ui/GlassCard';
import { Link } from 'react-router-dom';
import { getClaims, getDashboardSummary } from '../services/api';
import useLiveRefresh from '../hooks/useLiveRefresh';
import { CITY_COORDINATES } from '../data/indianCities';
import ZonesWeatherMap from '../components/ui/ZonesWeatherMap';

const pageVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 }
};

const DISRUPTION_SEED = [
  { id: 1, zone: 'Mumbai', type: 'Heavy Rain', typeRaw: 'rain', claims: 142, time: '2 min ago', auto: true, color: 'border-l-es-teal' },
  { id: 2, zone: 'Delhi', type: 'Severe Heat', typeRaw: 'heat', claims: 89, time: '15 min ago', auto: false, color: 'border-l-es-red' },
  { id: 3, zone: 'Bengaluru', type: 'Flash Flood', typeRaw: 'flood', claims: 210, time: '32 min ago', auto: true, color: 'border-l-es-blue' },
  { id: 4, zone: 'Chennai', type: 'Local Strike', typeRaw: 'strike', claims: 45, time: '45 min ago', auto: false, color: 'border-l-es-amber' },
  { id: 5, zone: 'Pune', type: 'Heavy Rain', typeRaw: 'rain', claims: 67, time: '1 hr ago', auto: true, color: 'border-l-es-teal' },
  { id: 6, zone: 'Hyderabad', type: 'Extreme Heat', typeRaw: 'heat', claims: 112, time: '1.2 hrs ago', auto: false, color: 'border-l-es-red' },
  { id: 7, zone: 'Kolkata', type: 'Heavy Rain', typeRaw: 'rain', claims: 94, time: '1.5 hrs ago', auto: true, color: 'border-l-es-teal' },
  { id: 8, zone: 'Ahmedabad', type: 'Transport Strike', typeRaw: 'strike', claims: 34, time: '1.8 hrs ago', auto: false, color: 'border-l-es-amber' },
  { id: 9, zone: 'Coimbatore', type: 'Urban Flooding', typeRaw: 'flood', claims: 58, time: '2.1 hrs ago', auto: true, color: 'border-l-es-blue' },
  { id: 10, zone: 'Tirupur', type: 'Heat Wave', typeRaw: 'heat', claims: 41, time: '2.6 hrs ago', auto: false, color: 'border-l-es-red' },
  { id: 11, zone: 'Madurai', type: 'Heavy Rain', typeRaw: 'rain', claims: 62, time: '2.9 hrs ago', auto: true, color: 'border-l-es-teal' },
  { id: 12, zone: 'Kochi', type: 'Port Strike', typeRaw: 'strike', claims: 29, time: '3.2 hrs ago', auto: false, color: 'border-l-es-amber' }
];

const pieData = [
  { name: 'Auto-Approved', value: 850, color: '#00C896' },
  { name: 'Admin-Approved', value: 250, color: '#3B82F6' },
  { name: 'Rejected', value: 150, color: '#EF4444' },
  { name: 'Pending', value: 200, color: '#F59E0B' },
];

const Dashboard = () => {
  const [activeZone, setActiveZone] = useState('All');
  const [summary, setSummary] = useState({
    activePolicies: 0,
    claimsThisWeek: 0,
    totalPayout: 0,
    fraudBlocked: 0
  });
  const [tableClaims, setTableClaims] = useState([]);
  const [weatherByCity, setWeatherByCity] = useState({});

  const openWeatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

  const loadDashboard = useCallback(async () => {
    try {
      const [summaryData, claimsData] = await Promise.all([
        getDashboardSummary(),
        getClaims({ limit: 5 })
      ]);
      setSummary(summaryData);
      setTableClaims(claimsData || []);
    } catch (err) {
      console.error('dashboard_data_load_failed', err.message);
    }
  }, []);

  useLiveRefresh(loadDashboard, {
    intervalMs: 12000,
    topics: ['heartbeat', 'dashboard', 'claims', 'analytics']
  });
  
  const filteredEvents = activeZone === 'All'
    ? DISRUPTION_SEED
    : DISRUPTION_SEED.filter((d) => d.zone === activeZone);

  const zones = useMemo(
    () =>
      [...new Set(DISRUPTION_SEED.map((event) => event.zone))]
        .map((name) => {
          const totalClaims = DISRUPTION_SEED.filter((event) => event.zone === name).reduce((sum, event) => sum + event.claims, 0);
          const risk = totalClaims >= 150 ? 'high' : totalClaims >= 80 ? 'medium' : 'low';
          return { name, risk };
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  useEffect(() => {
    if (!openWeatherApiKey) return;

    const pendingCities = filteredEvents
      .map((event) => event.zone)
      .filter((city, idx, arr) => arr.indexOf(city) === idx)
      .filter((city) => !weatherByCity[city]);

    if (!pendingCities.length) return;

    let mounted = true;

    const fetchWeather = async () => {
      const results = await Promise.all(
        pendingCities.map(async (city) => {
          const cityMeta = CITY_COORDINATES[city.toLowerCase()];
          if (!cityMeta) return null;

          try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${cityMeta.lat}&lon=${cityMeta.lng}&units=metric&APPID=${openWeatherApiKey}`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const data = await response.json();
            return {
              city,
              summary: `${Math.round(data?.main?.temp || 0)} C, ${data?.weather?.[0]?.main || 'Clear'}`
            };
          } catch (_err) {
            return null;
          }
        })
      );

      if (!mounted) return;

      setWeatherByCity((prev) => {
        const next = { ...prev };
        results.filter(Boolean).forEach((result) => {
          next[result.city] = result.summary;
        });
        return next;
      });
    };

    fetchWeather();

    return () => {
      mounted = false;
    };
  }, [filteredEvents, openWeatherApiKey, weatherByCity]);

  const getIcon = (type) => {
    switch(type) {
      case 'rain': return <CloudRain size={16} />;
      case 'heat': return <Thermometer size={16} />;
      case 'flood': return <Waves size={16} />;
      case 'strike': return <AlertTriangle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getPlatformColor = (platform) => {
    switch(platform) {
      case 'Zomato': return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30';
      case 'Swiggy': return 'bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30';
      case 'Zepto': return 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30';
      case 'Amazon': return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30';
      case 'Blinkit': return 'bg-[#FCD34D]/20 text-[#FCD34D] border-[#FCD34D]/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const tableCols = [
    { 
      header: 'Worker', 
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-es-teal/10 flex items-center justify-center text-es-teal font-syne font-bold text-xs border border-es-teal/30">
            {row.workerName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-sm">{row.workerName}</div>
            <div className="font-mono text-[10px] text-es-text-muted">{row.workerId}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Platform', 
      cell: (row) => (
        <span className={`px-2 py-1 border rounded text-[10px] font-mono uppercase tracking-wide ${getPlatformColor(row.platform)}`}>
          {row.platform}
        </span>
      )
    },
    { header: 'Zone', accessorKey: 'zone' },
    { header: 'Disruption', accessorKey: 'disruptionType' },
    { 
      header: 'Amount', 
      cell: (row) => <span className="font-mono font-medium text-es-teal">₹{row.claimedAmount}</span> 
    },
    { 
      header: 'AI Confidence', 
      cell: (row) => (
        <div className="w-32 flex items-center gap-3">
          <ConfidenceRing percentage={row.aiConfidence} barMode={true} />
          <span className="font-mono text-xs text-es-text-muted">{row.aiConfidence}%</span>
        </div>
      ) 
    },
    { 
      header: 'Status', 
      cell: (row) => <StatusChip status={row.aiDecision} />,
      align: 'center'
    },
    {
      header: 'Action',
      cell: () => (
        <Link to="/claims" className="text-es-teal hover:text-es-teal-dim text-sm font-medium transition-es flex items-center gap-1 group w-full justify-end">
          Review <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      ),
      align: 'right'
    }
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-8 pb-10"
    >
      {/* 4 KPIs row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard idx={0} label="Active Policies" value={summary.activePolicies} change="Live" changeType="up" icon={<Shield size={20} />} glowColor="teal" />
        <KPICard idx={1} label="Claims This Week" value={summary.claimsThisWeek} change="Live" changeType="up" icon={<FileText size={20} />} glowColor="amber" />
        <KPICard idx={2} label="Total Payout" value={summary.totalPayout} unit="₹" change="Live" changeType="up" icon={<Banknote size={20} />} glowColor="teal" />
        <KPICard idx={3} label="Fraud Blocked" value={summary.fraudBlocked} unit="₹" change="Live" changeType="down" icon={<ShieldAlert size={20} />} glowColor="red" />
      </div>

      {/* 2 Cols Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left: Live Feed (60%) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <GlassCard className="p-6 flex flex-col relative overflow-hidden" glowColor="none">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="font-syne text-lg font-semibold flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-es-teal opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-es-teal"></span>
                </span>
                Live Disruption Feed
              </h2>
              <span className="text-xs font-mono text-es-text-muted">Live monitoring active</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 shrink-0">
              <button 
                onClick={() => setActiveZone('All')}
                className={`px-3 py-1 text-xs rounded-full border transition-es font-mono ${activeZone === 'All' ? 'bg-[#ffffff15] border-[#ffffff30] text-white' : 'bg-transparent border-[#ffffff10] text-es-text-muted hover:text-white'}`}
              >
                ALL
              </button>
              {zones.map((z) => {
                let badgeClass = '';
                let pulseClass = '';
                if (z.risk === 'high') {
                  badgeClass = 'border-es-red text-es-red bg-es-red/10';
                  pulseClass = 'shadow-[0_0_10px_rgba(239,68,68,0.3)]';
                } else if (z.risk === 'medium') {
                  badgeClass = 'border-es-amber text-es-amber bg-es-amber/10';
                } else {
                  badgeClass = 'border-es-teal text-es-teal bg-es-teal/10';
                }

                if (activeZone !== 'All' && activeZone !== z.name) {
                  badgeClass = 'border-[#ffffff10] text-es-text-muted bg-transparent';
                  pulseClass = '';
                }

                return (
                  <button 
                    key={z.name}
                    onClick={() => setActiveZone(activeZone === z.name ? 'All' : z.name)}
                    className={`px-3 py-1 text-xs rounded-full border transition-es font-medium ${badgeClass} ${pulseClass} hover:opacity-80`}
                  >
                    {z.name}
                  </button>
                )
              })}
            </div>

            <div className="max-h-[520px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              <AnimatePresence>
                {filteredEvents.map((evt) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-xl bg-[#ffffff05] border border-[#ffffff0a] border-l-4 ${evt.color} flex justify-between items-center group relative overflow-hidden shrink-0`}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white opacity-0 group-hover:opacity-20 transition-opacity animate-pulse" />
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-[#ffffff0a] flex items-center justify-center text-es-text-secondary border border-[#ffffff0f]">
                        {getIcon(evt.typeRaw)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-syne font-bold">{evt.zone}</span>
                          <span className="text-es-text-muted text-xs">•</span>
                          <span className="font-sans text-sm">{evt.type}</span>
                        </div>
                        <div className="font-mono text-xs text-es-text-muted">
                          {evt.claims} claims triggered
                        </div>
                        <div className="font-mono text-[10px] text-es-text-muted mt-1">
                          {weatherByCity[evt.zone] || (openWeatherApiKey ? 'Loading weather...' : 'Set VITE_OPENWEATHER_API_KEY in .env')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                       <span className="text-xs font-mono text-es-text-muted">{evt.time}</span>
                       {evt.auto && (
                         <span className="text-[10px] bg-es-purple/10 text-es-purple border border-es-purple/30 px-2 py-0.5 rounded font-mono uppercase">
                           Auto-Claim
                         </span>
                       )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredEvents.length === 0 && (
                <div className="py-8 text-center text-sm text-es-text-muted border border-dashed border-[#ffffff10] rounded-xl h-32 flex items-center justify-center">No recent events for this zone.</div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-4" glowColor="none">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-syne text-base font-semibold">India Claim Zones Map</h3>
              <span className="text-[11px] font-mono text-es-text-muted">Circle size = claim volume</span>
            </div>
            <ZonesWeatherMap
              events={filteredEvents.map((event) => ({
                ...event,
                weatherSummary: weatherByCity[event.zone]
              }))}
            />
          </GlassCard>
        </div>

        {/* Right: AI Summary (40%) */}
        <div className="lg:col-span-2 flex flex-col">
          <GlassCard className="p-6 flex flex-col" glowColor="none">
            <h2 className="font-syne text-lg font-semibold mb-2 shrink-0">This Week's Outcomes</h2>
            
            <div className="h-[340px] flex flex-col justify-center items-center relative py-4">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="85%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0F1629', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F1F5F9' }}
                    itemStyle={{ color: '#F1F5F9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-syne text-3xl font-bold mt-2">1450</span>
                <span className="font-mono text-[10px] text-es-text-muted mt-1 uppercase tracking-wide">Total Claims</span>
              </div>
            </div>

            <div className="mt-auto shrink-0 grid grid-cols-2 gap-y-4 gap-x-2 pt-6 border-t border-[#ffffff0f]">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="truncate text-xs text-es-text-secondary">{item.name}</div>
                  <div className="ml-auto font-mono text-xs font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Table */}
      <div>
        <div className="flex items-center justify-between mb-4 mt-8">
          <h2 className="font-syne text-lg font-semibold">Action Required: Recent Claims</h2>
          <Link to="/claims" className="text-es-teal text-sm hover:text-es-teal-dim font-medium transition-es flex items-center gap-1 group">
            View All Claims <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <DataTable columns={tableCols} data={tableClaims.slice(0, 5)} />
      </div>
    </motion.div>
  );
};

export default Dashboard;