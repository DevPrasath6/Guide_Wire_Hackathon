import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail } from 'lucide-react';
import GradientButton from '../components/ui/GradientButton';
import AnimatedBackground from '../components/layout/AnimatedBackground';
import { MOCK_WORKER } from '../constants/mock';

export default function Login() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState(30);
  
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOTP = () => {
    if (phone.length === 10) {
      setStep(2);
      setCountdown(30);
      // focus first OTP input slightly after render
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split('');
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length && index + i < 6; i++) {
        newOtp[index + i] = pasted[i];
      }
      setOtp(newOtp);
      // Focus next empty or last
      const nextIndex = Math.min(index + pasted.length, 5);
      otpRefs.current[nextIndex]?.focus();
      
      // Check auto-submit
      if (newOtp.join('').length === 6) {
        handleVerifyOTP(newOtp.join(''));
      }
      return;
    }

    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(false);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.join('').length === 6 && value !== '') {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = (code) => {
    const finalCode = code || otp.join('');
    
    if (finalCode === '000000') {
      setError(true);
      return;
    }

    setIsVerifying(true);
    
    // Simulate API delay
    setTimeout(() => {
      localStorage.setItem('es_token', 'mock_jwt_' + Date.now());
      localStorage.setItem('es_worker', JSON.stringify(MOCK_WORKER));
      navigate('/home');
    }, 1200);
  };

  const handleSkipDemo = () => {
    localStorage.setItem('es_token', 'demo_token');
    localStorage.setItem('es_worker', JSON.stringify(MOCK_WORKER));
    navigate('/home');
  };

  const handleSocialAuth = (provider) => {
    setIsVerifying(true);
    // Simulate API delay for social auth (Google/Apple)
    setTimeout(() => {
      localStorage.setItem('es_token', `mock_${provider}_jwt_` + Date.now());
      localStorage.setItem('es_worker', JSON.stringify(MOCK_WORKER));
      navigate('/home');
    }, 1200);
  };

  const handleEmailAuth = () => {
    if (!email || password.length < 6) return;
    setIsVerifying(true);
    // Simulate API delay for email auth
    setTimeout(() => {
      localStorage.setItem('es_token', 'mock_email_jwt_' + Date.now());
      localStorage.setItem('es_worker', JSON.stringify(MOCK_WORKER));
      navigate('/home');
    }, 1200);
  };

  return (
    <div className="relative flex flex-col w-full min-h-[100svh] overflow-hidden text-es-primary">
      <AnimatedBackground />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[430px] mx-auto px-6 z-10">
        
        {/* Top Section */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="mb-4 flex justify-center">
            <img src="/logo.png" alt="Earnings Shield Logo" className="w-[64px] h-[64px] rounded-2xl shadow-lg" />
          </div>
          <h1 className="font-display text-[20px] font-bold text-es-teal tracking-wide">
            EARNINGS SHIELD
          </h1>
          <p className="font-mono text-[11px] text-es-muted tracking-[0.1em] mt-1">
            WORKER PORTAL
          </p>
        </div>

        {/* Login Container */}
        <div className="w-full relative min-h-[180px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Phone & Social Entry */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="mb-2">
                  <label className="text-es-muted text-[13px] font-body mb-2 block">Mobile number</label>
                  <div className="flex">
                    <div className="glass-input !w-[56px] flex items-center justify-center !border-r-0 !rounded-r-none text-es-secondary">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className="glass-input !rounded-l-none flex-1 font-mono tracking-wider"
                      maxLength={10}
                    />
                  </div>
                </div>
                
                <GradientButton
                  label="Continue with Phone"
                  onClick={handleSendOTP}
                  fullWidth
                  disabled={phone.length < 10}
                />

                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-es-border"></div>
                  <span className="px-3 text-[12px] text-es-muted">or continue with</span>
                  <div className="flex-1 h-px bg-es-border"></div>
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={() => handleSocialAuth('google')} className="flex items-center justify-center gap-3 w-full h-[52px] bg-white text-[#000] rounded-xl font-body font-medium text-[15px] transition-transform active:scale-[0.98]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button onClick={() => handleSocialAuth('apple')} className="flex items-center justify-center gap-3 w-full h-[52px] bg-black border border-es-border text-white rounded-xl font-body font-medium text-[15px] transition-transform active:scale-[0.98]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.05 16.57c-.89 1.39-1.83 2.76-3.32 2.81-1.45.05-1.95-.85-3.59-.85-1.66 0-2.21.82-3.57.87-1.45.05-2.5-1.45-3.41-2.87-1.85-2.69-3.26-7.61-1.35-10.96.95-1.63 2.6-2.67 4.41-2.69 1.41-.02 2.74.96 3.59.96.85 0 2.45-1.2 4.14-1.02 1.76.11 3.35.89 4.3 2.3-3.66 2.13-3.03 7.23.8 8.8-1.05 2.14-2.11 4.09-3.41 5.86l.01-.01zm-3.46-13.88c.73-.89 1.22-2.14 1.09-3.37-1.12.05-2.43.76-3.19 1.66-.68.79-1.26 2.05-1.11 3.25 1.25.1 2.46-.66 3.21-1.54z"/>
                    </svg>
                    Apple
                  </button>
                  <button onClick={() => setStep(3)} className="glass-input flex items-center justify-center gap-3 w-full !h-[52px] hover:border-es-teal transition-transform active:scale-[0.98]">
                    <Mail className="w-5 h-5 text-es-teal" />
                    <span className="font-body font-medium text-[15px] text-es-primary">Email Registration</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: OTP Entry */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full flex flex-col items-center"
              >
                <p className="text-es-muted text-[13px] text-center mb-6">
                  Enter the 6-digit OTP sent to <br/>
                  <span className="text-white">+91 {phone}</span>
                  <button 
                    onClick={() => { setStep(1); setOtp(Array(6).fill('')); setError(false); }}
                    className="ml-2 text-es-teal underline text-[12px]"
                  >
                    Edit
                  </button>
                </p>

                <div className="flex gap-2 justify-center mb-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6} // to capture paste
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`glass-input !w-[44px] !h-[52px] !px-0 text-center text-[20px] font-mono transition-colors ${
                          error ? "border-es-red" : ""
                        }`}
                    />
                  ))}
                </div>

                <div className="h-[20px] mb-6">
                  {error && (
                    <p className="text-es-red text-[13px] text-center">
                      Incorrect OTP. Try again.
                    </p>
                  )}
                </div>

                {isVerifying ? (
                  <div className="h-[52px] flex items-center justify-center w-full bg-es-card rounded-full border border-es-border">
                    <Loader2 className="w-6 h-6 text-es-teal animate-spin" />
                  </div>
                ) : (
                  <GradientButton
                    label="Verify & Login"
                    onClick={() => handleVerifyOTP()}
                    fullWidth
                    disabled={otp.join('').length < 6}
                  />
                )}

                <button
                  disabled={countdown > 0 || isVerifying}
                  onClick={() => setCountdown(30)}
                  className="mt-6 text-[13px] transition-colors"
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </motion.div>
            )}

            {/* STEP 3: Email Auth */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full flex flex-col"
              >
                <div className="mb-4">
                  <label className="text-es-muted text-[13px] font-body mb-2 block">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="glass-input mb-4"
                    placeholder="you@example.com"
                  />
                  <label className="text-es-muted text-[13px] font-body mb-2 block">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="glass-input"
                    placeholder="••••••••"
                  />
                </div>

                {isVerifying ? (
                  <div className="h-[52px] flex items-center justify-center w-full bg-es-card rounded-full border border-es-border mt-4">
                    <Loader2 className="w-6 h-6 text-es-teal animate-spin" />
                  </div>
                ) : (
                  <div className="mt-4">
                    <GradientButton
                      label="Sign In / Sign Up"
                      onClick={handleEmailAuth}
                      fullWidth
                      disabled={!email || password.length < 6}
                    />
                  </div>
                )}

                <button
                  disabled={isVerifying}
                  onClick={() => setStep(1)}
                  className="mt-6 text-es-muted text-[13px] w-full text-center transition-colors hover:text-white"
                >
                  Back to all options
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Demo Skip Link */}
        <div className="absolute bottom-safe-bottom w-full text-center pb-8">
          <button 
            onClick={handleSkipDemo}
            className="text-es-muted text-[11px] hover:text-white transition-colors"
          >
            Skip login (demo)
          </button>
        </div>

      </div>
    </div>
  );
}
