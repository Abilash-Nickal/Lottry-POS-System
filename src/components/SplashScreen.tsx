import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

/**
 * STARTUP LOADING SCREEN
 * Simple, elegant loading screen that transitions smoothly to User Selection.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish,
  durationMs = 1200
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawPct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(rawPct);

      if (rawPct >= 100) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onFinish();
        }, 300);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [durationMs, onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#F7F4F0] text-[#1E1915] select-none transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
    >
      {/* Centered Minimal Brand & Loader */}
      <div className="flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Icon */}
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-[#E6DDD4] shadow-xs flex items-center justify-center text-3xl sm:text-4xl">
            🎟️
          </div>
          {/* Subtle warm ring pulse */}
          <div className="absolute -inset-1 rounded-2xl border border-[#C25838]/20 animate-pulse pointer-events-none" />
        </div>

        {/* Brand Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1915] tracking-tight">
            LankaLotto <span className="text-[#C25838]">POS</span>
          </h1>
          <p className="text-xs text-[#7F7266] font-medium">
            Wholesale Lottery Distribution System
          </p>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-48 sm:w-56 space-y-2 pt-1">
          <div className="w-full bg-[#E6DDD4] h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#C25838] rounded-full transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-[#A89C91]">
            <span>Loading...</span>
            <span className="font-mono">{progress}%</span>
          </div>
        </div>

      </div>

      {/* Subtle bottom note */}
      <div className="absolute bottom-6 text-center text-[11px] text-[#A89C91] font-medium">
        Secure Terminal Access
      </div>
    </div>
  );
};
