import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import GradientButton from '../components/ui/GradientButton';
import AnimatedBackground from '../components/layout/AnimatedBackground';
import { MOCK_WORKER } from '../constants/mock';

export default function Login() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
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

  return (
    <div className="relative flex flex-col w-full min-h-[100svh] overflow-hidden text-es-primary">
      <AnimatedBackground />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[430px] mx-auto px-6 z-10">
        
        {/* Top Section */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="text-[48px] mb-4">???</div>
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
            
            {/* STEP 1: Phone Entry */}
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
                
                <p className="text-es-muted text-[12px] mb-6">
                  We'll send a 6-digit OTP to verify
                </p>

                <GradientButton
                  label="Send OTP"
                  onClick={handleSendOTP}
                  fullWidth
                  disabled={phone.length < 10}
                />
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

                <div className={lex gap-2 justify-center mb-2 }>
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
                      className={glass-input !w-[44px] !h-[52px] !px-0 text-center text-[20px] font-mono transition-colors }
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
                  className={mt-6 text-[13px] transition-colors }
                >
                  {countdown > 0 ? Resend OTP in s : 'Resend OTP'}
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
