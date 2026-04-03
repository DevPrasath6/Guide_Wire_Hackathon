import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, User, AlertCircle, ArrowRight, Activity } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { login } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login({ email: username.trim().toLowerCase(), password: password.trim() });
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        permissions: data.permissions || []
      }));
      navigate('/', { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Dashboard backend unreachable on http://localhost:5001.');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials. Access denied.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-es-text-primary flex items-center justify-center relative overflow-hidden">
      {/* Background Graphic Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-es-teal/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-es-blue/5 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Abstract grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-6 relative z-10"
      >
        <GlassCard className="p-8 backdrop-blur-xl border border-es-teal/20" glowColor="teal">
          
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-es-teal/10 rounded-2xl border border-es-teal/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,200,150,0.2)]">
              <Shield size={32} className="text-es-teal" />
            </div>
          </div>

          <h1 className="font-syne text-2xl font-bold text-center mb-1">Corporate Core</h1>
          <p className="text-es-text-secondary text-sm text-center mb-8">Earnings Shield Intranet Access</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-es-text-muted uppercase tracking-wider ml-1">Admin ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={16} className="text-es-text-muted" />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#1A2234] border border-[#ffffff15] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-es-teal focus:ring-1 focus:ring-es-teal/50 transition-all font-mono"
                  placeholder="Enter your internal ID"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-es-text-muted uppercase tracking-wider ml-1">Authentication Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} className="text-es-text-muted" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1A2234] border border-[#ffffff15] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-es-teal focus:ring-1 focus:ring-es-teal/50 transition-all font-mono"
                  placeholder="Enter secure password"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="bg-es-red/10 border border-es-red/20 text-es-red text-xs px-3 py-2 rounded-lg flex items-center gap-2"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={isLoading || !username || !password}
              className="w-full bg-es-teal text-[#0A0F1C] font-syne font-bold py-3.5 rounded-xl hover:bg-es-teal-dim transition-es disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 shadow-[0_0_15px_rgba(0,200,150,0.25)] hover:shadow-[0_0_25px_rgba(0,200,150,0.4)]"
            >
              {isLoading ? (
                <>
                  <Activity size={18} className="animate-pulse" />
                  <span>Verifying Node...</span>
                </>
              ) : (
                <>
                  <span>Establish Secure Link</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-es-text-muted flex flex-col items-center gap-2">
             <div className="flex items-center gap-1.5 opacity-60">
               <div className="w-1.5 h-1.5 rounded-full bg-es-teal shadow-[0_0_5px_#00c896]"></div>
               Network Active
             </div>
             <div>Admin authorization requires bi-annual renewal.<br/>Access constitutes consent to monitoring.</div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;