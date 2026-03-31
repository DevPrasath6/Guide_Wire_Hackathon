import { motion } from 'framer-motion';

export default function GradientButton({
  label,
  onClick,
  fullWidth = false,
  size = 'md',
  variant = 'primary',
  disabled = false,
  className = ''
}) {
  const sizeClasses = {
    sm: 'h-[40px] px-5 text-[13px]',
    md: 'h-[52px] px-7 text-[15px]',
    lg: 'h-[60px] px-8 text-[16px]'
  };

  const baseClasses = `inline-flex items-center justify-center font-display font-semibold rounded-full transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${fullWidth ? 'w-full' : ''} ${sizeClasses[size] || sizeClasses.md} ${className}`;

  if (variant === 'secondary') {
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        className={`${baseClasses} bg-transparent border border-[#00C896] text-[#00C896] hover:bg-[#00C896]/10 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {label}
      </motion.button>
    );
  }

  // Primary
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`${baseClasses} text-white bg-gradient-to-br from-[#00C896] to-[#009E76] shadow-[0_4px_20px_rgba(0,200,150,0.35)] hover:shadow-[0_6px_28px_rgba(0,200,150,0.5)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {label}
    </motion.button>
  );
}
