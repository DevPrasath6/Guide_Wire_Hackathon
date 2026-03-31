import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GradientButton from '../components/ui/GradientButton';
import AnimatedBackground from '../components/layout/AnimatedBackground';

const SLIDES = [
  {
    icon: "/logo.png",
    emoji: "🛡️",
    title: "Your Work, Protected",
    subtitle: "Income insurance built for Zomato, Swiggy, Zepto and other delivery partners. When disruptions stop your deliveries, we pay you.",
    color: "#00C896"
  },
  {
    emoji: "🤖",
    title: "Zero-Touch Claims",
    subtitle: "Our AI detects rain, floods, curfews in your zone automatically. Your claim is filed and scored within seconds. No forms, no calls.",
    color: "#8B5CF6"
  },
  {
    emoji: "⚡",
    title: "₹25/week. Real Protection.",
    subtitle: "Plans from ?25 to ?70 per week. Get paid in minutes, not days. Cancel anytime. No hidden charges.",
    color: "#F59E0B"
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    } else {
      navigate('/login');
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="relative flex flex-col w-full h-[100svh] overflow-hidden text-es-primary">
      <AnimatedBackground />

      {/* Slide Content */}
      <div className="flex-1 relative flex items-center justify-center -mt-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full max-w-[430px] px-8 flex flex-col items-center text-center absolute"
          >
            {/* Emoji with Background Glow */}
            <div className="relative flex items-center justify-center w-32 h-32 mb-6">
              <div 
                className="absolute inset-0 rounded-full opacity-15"
                style={{ backgroundColor: slide.color, filter: 'blur(40px)', transform: 'scale(1.5)' }}
              ></div>
              <div className="text-[80px] z-10 animate-bounce-slow">
                {slide.icon ? (
                  <img src={slide.icon} alt="ES" className="w-[100px] h-[100px] rounded-[18px] shadow-2xl border border-white/10" />
                ) : (
                  slide.emoji
                )}
              </div>
            </div>

            <h1 className="font-display text-[32px] font-bold text-white mt-6 leading-tight">
              {slide.title}
            </h1>
            <p className="font-body text-[16px] font-normal text-es-secondary mt-3 leading-[1.7]">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="sticky bottom-0 w-full px-6 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mb-8 h-2">
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              layout
               className="h-2 rounded-full"
              style={{
                width: i === currentSlide ? 24 : 8,
                backgroundColor: i === currentSlide ? slide.color : undefined
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="mb-2">
          {currentSlide < 2 ? (
            <div className="flex items-center justify-between">
              <button 
                onClick={handleSkip}
                className="text-es-muted text-[14px] font-body px-2 h-11 flex items-center"
              >
                Skip
              </button>
              <GradientButton 
                label="Next &rarr;" 
                onClick={handleNext}
                className="min-w-[160px]"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <GradientButton 
                label="Get Started &rarr;" 
                onClick={handleNext}
                fullWidth
              />
              <button 
                onClick={handleSkip}
                className="text-es-muted text-[13px] font-body text-center mt-2"
              >
                Already covered? <span className="text-es-teal underline decoration-es-teal/30 underline-offset-2">Sign in</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
