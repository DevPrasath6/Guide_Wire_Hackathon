import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { Download, BrainCircuit, Activity, AlertTriangle, ShieldCheck, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import ConfidenceRing from '../components/ui/ConfidenceRing';
import { getAnalytics } from '../services/api';
import useLiveRefresh from '../hooks/useLiveRefresh';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F1629]/95 border border-[#ffffff1a] rounded-xl p-3 shadow-xl backdrop-blur-md">
        <p className="font-mono text-xs text-es-text-muted mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-es-text-secondary capitalize">{entry.name}:</span>
              <span className="font-mono font-medium text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom interactive pie label
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#94A3B8" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontFamily="DM Sans" className="pointer-events-none">
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

const CustomDotArea = (props) => {
  const { cx, cy, stroke, fill } = props;
  return (
    <circle cx={cx} cy={cy} r={4} stroke="#ffffff" strokeWidth={2} fill={stroke || fill} />
  );
};

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [activePieIndex, setActivePieIndex] = useState(-1);
  const [analyticsData, setAnalyticsData] = useState({
    nextWeekPrediction: { expectedClaims: 0, highRiskZones: [], predictedPayout: 0, confidenceLevel: 0 },
    weeklyClaimsByType: [],
    payoutTierBreakdown: [],
    premiumVsPayoutTrend: [],
    zoneClaimsMap: [],
    lossRatioTrend: []
  });

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await getAnalytics(dateRange);
      setAnalyticsData(data);
    } catch (err) {
      console.error('analytics_load_failed', err.message);
    }
  }, [dateRange]);

  useLiveRefresh(loadAnalytics, {
    intervalMs: 15000,
    topics: ['heartbeat', 'analytics', 'claims', 'dashboard']
  });

  const onPieEnter = (_, index) => setActivePieIndex(index);
  const onPieLeave = () => setActivePieIndex(-1);

  // Colors mapping
  const barColors = {
    Rain: '#3B82F6',
    Flood: '#8B5CF6',
    Heat: '#EF4444',
    Curfew: '#F59E0B',
    Strike: '#EC4899',
    Pollution: '#94A3B8'
  };

  const getRiskColor = (risk) => {
    if (risk === 'high') return 'text-es-red bg-es-red/10 border-es-red/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
    if (risk === 'medium') return 'text-es-amber bg-es-amber/10 border-es-amber/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    return 'text-es-teal bg-es-teal/10 border-es-teal/20 shadow-[0_0_10px_rgba(0,200,150,0.2)]';
  };

  const sortedZones = [...analyticsData.zoneClaimsMap].sort((a, b) => {
    const riskVal = { high: 3, medium: 2, low: 1 };
    return riskVal[b.risk] - riskVal[a.risk];
  });

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="pb-10 space-y-6"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-syne font-bold mb-2">Analytics & Intelligence</h1>
          <p className="text-es-text-secondary">AI-driven forecasts and historical portfolio performance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-[#1A2234] border border-[#ffffff15] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-es-teal/50 appearance-none cursor-pointer font-medium"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="month">This Month</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-es-teal text-[#0A0F1C] hover:bg-es-teal-dim transition-es font-bold text-sm shadow-[0_0_15px_rgba(0,200,150,0.2)]">
            <Download size={16} /> Download Report
          </button>
        </div>
      </div>

      {/* ROW 1: AI Predictive Insights */}
      <GlassCard glowColor="amber" className="p-6 relative overflow-hidden bg-gradient-to-br from-[#F59E0B]/5 to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.05),transparent_50%)] pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-es-amber/10 flex items-center justify-center text-es-amber shrink-0 border border-es-amber/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <BrainCircuit size={28} />
            </div>
            <div>
              <h2 className="text-xl font-syne font-bold mb-1">Next Week Prediction</h2>
              <p className="text-sm text-es-text-secondary">Based on IMD weather forecast + historical disruption patterns</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 flex-1 justify-center">
            <div className="px-4 py-2 rounded-lg border border-[#ffffff10] bg-[#ffffff05] flex items-center gap-2">
              <Activity size={16} className="text-es-amber" />
              <span className="font-mono text-sm leading-none pt-0.5">~{analyticsData.nextWeekPrediction.expectedClaims} Claims Expected</span>
            </div>
            <div className="px-4 py-2 rounded-lg border border-es-red/20 bg-es-red/5 flex items-center gap-2">
              <AlertTriangle size={16} className="text-es-red" />
              <span className="font-mono text-sm leading-none pt-0.5">{analyticsData.nextWeekPrediction.highRiskZones.join(' + ')} High Risk</span>
            </div>
            <div className="px-4 py-2 rounded-lg border border-[#ffffff10] bg-[#ffffff05] flex items-center gap-2">
              <ShieldCheck size={16} className="text-es-teal" />
              <span className="font-mono text-sm leading-none pt-0.5">₹{(analyticsData.nextWeekPrediction.predictedPayout / 100000).toFixed(2)}L Predicted Payout</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 border-l border-[#ffffff10] pl-6">
            <div className="text-right">
              <div className="text-sm font-semibold font-syne">Model Confidence</div>
              <div className="text-xs text-es-text-muted">v2.4 Engine</div>
            </div>
            <ConfidenceRing percentage={analyticsData.nextWeekPrediction.confidenceLevel} size={54} strokeWidth={6} />
          </div>
        </div>
      </GlassCard>

      {/* ROW 2: 60/40 */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* Left 60%: Stacked Bar */}
        <GlassCard className="xl:col-span-3 p-6 flex flex-col h-[400px]" glowColor="none">
          <h3 className="font-syne text-base font-semibold mb-6 flex items-center gap-2 border-l-2 border-es-teal pl-2 leading-none">
            <BarChart3 size={16} className="text-es-text-muted" /> Claims by Disruption Type
          </h3>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.weeklyClaimsByType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontFamily: 'DM Sans', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontFamily: 'DM Sans', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans', color: '#94A3B8', paddingTop: '20px' }} />
                
                <Bar dataKey="Rain" stackId="a" fill={barColors.Rain} isAnimationActive={true} animationDuration={800} />
                <Bar dataKey="Flood" stackId="a" fill={barColors.Flood} isAnimationActive={true} animationDuration={800} />
                <Bar dataKey="Heat" stackId="a" fill={barColors.Heat} isAnimationActive={true} animationDuration={800} />
                <Bar dataKey="Curfew" stackId="a" fill={barColors.Curfew} isAnimationActive={true} animationDuration={800} />
                <Bar dataKey="Strike" stackId="a" fill={barColors.Strike} isAnimationActive={true} animationDuration={800} />
                <Bar dataKey="Pollution" stackId="a" fill={barColors.Pollution} radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Right 40%: Donut */}
        <GlassCard className="xl:col-span-2 p-6 flex flex-col h-[400px]" glowColor="none">
          <h3 className="font-syne text-base font-semibold mb-2 flex items-center gap-2 border-l-2 border-es-blue pl-2 leading-none">
            <PieIcon size={16} className="text-es-text-muted" /> Payout Tier Distribution
          </h3>
          <div className="flex-1 min-h-0 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.payoutTierBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="75%"
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={true}
                  animationDuration={800}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  // label={renderCustomizedLabel} 
                  // labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                >
                  {analyticsData.payoutTierBreakdown.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className={`transition-all duration-300 ${activePieIndex === index ? 'opacity-100 scale-105' : activePieIndex === -1 ? 'opacity-100' : 'opacity-40'}`} 
                      style={{ outline: "none", transformOrigin: "center" }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-syne text-4xl font-bold text-white leading-none">100<span className="text-2xl text-es-text-muted">%</span></span>
              <span className="font-mono text-[10px] text-es-text-muted mt-1 uppercase tracking-wider">Processed</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-4 border-t border-[#ffffff0f] shrink-0">
            {analyticsData.payoutTierBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="truncate text-xs text-es-text-secondary">{item.name}</div>
                </div>
                <div className="font-mono text-xs font-medium">{item.value}%</div>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>

      {/* ROW 3: Full Width Area Chart */}
      <GlassCard className="p-6 h-[400px] flex flex-col" glowColor="none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-syne text-base font-semibold flex items-center gap-2 border-l-2 border-es-teal pl-2 leading-none">
            <Activity size={16} className="text-es-text-muted" /> Premium vs Payout vs Fraud Blocked
          </h3>
        </div>
        
        <div className="flex-1 min-h-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData.premiumVsPayoutTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C896" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#00C896" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontFamily: 'DM Sans', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontFamily: 'DM Sans', fontSize: 11 }} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans', color: '#94A3B8' }} />
              <Area type="monotone" dataKey="premiumCollected" name="Premium Collected" stroke="#00C896" strokeWidth={2} fillOpacity={1} fill="url(#colorPremium)" activeDot={<CustomDotArea />} isAnimationActive={true} animationDuration={800} />
              <Area type="monotone" dataKey="payoutMade" name="Payout Made" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorPayout)" activeDot={<CustomDotArea />} isAnimationActive={true} animationDuration={800} />
              <Area type="monotone" dataKey="fraudBlocked" name="Fraud Blocked" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFraud)" activeDot={<CustomDotArea />} isAnimationActive={true} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* ROW 4: 40/60 */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Left 40%: Zone Hotmap Tiles */}
        <GlassCard className="xl:col-span-2 p-6 flex flex-col" glowColor="none">
          <h3 className="font-syne text-base font-semibold mb-4 flex items-center gap-2 border-l-2 border-es-red pl-2 leading-none">
            <AlertTriangle size={16} className="text-es-text-muted" /> Zone Risk Heatmap
          </h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {sortedZones.map((zone, i) => (
              <div key={zone.name} className={`rounded-xl border p-4 flex flex-col justify-center relative overflow-hidden group ${
                zone.risk === 'high' ? 'bg-[#ffffff05] border-es-red/20 hover:border-es-red/40' :
                zone.risk === 'medium' ? 'bg-[#ffffff05] border-es-amber/20 hover:border-es-amber/40' :
                'bg-[#ffffff02] border-[#ffffff10] hover:border-es-teal/30'
              }`}>
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${
                  zone.risk === 'high' ? 'bg-es-red' : zone.risk === 'medium' ? 'bg-es-amber' : 'bg-es-teal'
                }`} />
                
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <span className="font-syne font-semibold">{zone.name}</span>
                  <div className={`w-2 h-2 rounded-full mt-1 ${
                    zone.risk === 'high' ? 'bg-es-red shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                    zone.risk === 'medium' ? 'bg-es-amber shadow-[0_0_8px_rgba(245,158,11,0.8)]' :
                    'bg-es-teal shadow-[0_0_8px_rgba(0,200,150,0.8)]'
                  }`} />
                </div>
                
                <div className="flex items-end justify-between relative z-10">
                  <div>
                    <div className="text-xs text-es-text-muted mb-0.5">Claims</div>
                    <div className="font-mono text-lg font-bold leading-none">{zone.claimCount}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-es-text-muted mb-0.5">Fraud Rate</div>
                    <div className={`font-mono text-xs font-medium leading-none ${zone.fraudRate > 8 ? 'text-es-red' : 'text-es-text-secondary'}`}>
                      {zone.fraudRate}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Right 60%: Loss Ratio Line/Area */}
        <GlassCard className="xl:col-span-3 p-6 flex flex-col h-[350px] xl:h-auto" glowColor="none">
          <h3 className="font-syne text-base font-semibold mb-6 flex items-center gap-2 border-l-2 border-es-amber pl-2 leading-none">
            <Activity size={16} className="text-es-text-muted" /> Loss Ratio Trend
          </h3>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              {/* To achieve the dynamic fill, we use an AreaChart with a custom linearGradient based on the threshold */}
              <AreaChart data={analyticsData.lossRatioTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {/* Assuming domain is [0, 1] and target is 0.65 -> 35% from top */}
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="35%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="35%" stopColor="#00C896" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontFamily: 'DM Sans', fontSize: 11 }} />
                <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontFamily: 'DM Sans', fontSize: 11 }} tickFormatter={(val) => `${(val*100).toFixed(0)}%`} />
                <Tooltip content={<CustomTooltip />} />
                
                <ReferenceLine y={0.65} stroke="#F59E0B" strokeDasharray="3 3" strokeWidth={1} label={{ position: 'top', value: 'Target: 65%', fill: '#F59E0B', fontSize: 10, fontFamily: 'DM Sans' }} />
                
                <Area 
                  type="monotone" 
                  dataKey="ratio" 
                  name="Loss Ratio" 
                  stroke="#00C896" 
                  strokeWidth={2} 
                  fill="url(#splitColor)" 
                  activeDot={<CustomDotArea />} 
                  isAnimationActive={true} 
                  animationDuration={800} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

      </div>
    </motion.div>
  );
};

export default Analytics;