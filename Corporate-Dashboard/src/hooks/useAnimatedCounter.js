import { useState, useEffect } from 'react';

export const useAnimatedCounter = (targetValue, duration = 1500, startDelay = 0) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId = null;
    let timeoutId = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsedTime = timestamp - startTimestamp;
      const progress = Math.min(elapsedTime / duration, 1);

      // EaseOutQuart easing function for smooth deceleration
      const easeOut = (t) => 1 - Math.pow(1 - t, 4);
      
      const current = Math.floor(easeOut(progress) * targetValue);
      setCurrentValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrentValue(targetValue);
      }
    };

    timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(step);
    }, startDelay);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, duration, startDelay]);

  return currentValue;
};

export default useAnimatedCounter;