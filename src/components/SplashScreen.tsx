import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { COMPANY_CONFIG } from '../constants/companyConfig';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

/**
 * CASE 0: STARTUP SPLASH SCREEN / LOADING PAGE
 * 
 * Displays company branding & animated loader when the site/app loads.
 * Automatically transitions to User Selection once loading reaches 100%.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish,
  durationMs = COMPANY_CONFIG.splash.durationMs
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const steps = COMPANY_CONFIG.splash.loadingSteps;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawPct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(rawPct);

      // Determine matching step status text
      const matchingIndex = steps.findIndex(s => rawPct <= s.progress);
      if (matchingIndex !== -1) {
        setCurrentStatusIndex(matchingIndex);
      } else {
        setCurrentStatusIndex(steps.length - 1);
      }

      if (rawPct >= 100) {
        clearInterval(interval);
        // Trigger smooth fadeout animation before switching screen
        setIsFadingOut(true);
        setTimeout(() => {
          onFinish();
        }, 400); // 400ms exit fade
      }
    }, 25);

    return () => clearInterval(interval);
  }, [durationMs, onFinish, steps]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 200);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-12 bg-[#F8FAFC] text-gray-900 selection:bg-orange-500/20 selection:text-orange-950 transition-opacity duration-400 ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Skip Button */}
      <div className="w-full max-w-4xl flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 uppercase">
            Terminal Boot • v1.0.0
          </span>
        </div>

        <button
          onClick={handleSkip}
          className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white border border-gray-200/80 text-xs font-semibold text-gray-700 hover:text-gray-950 transition-all shadow-sm backdrop-blur-md"
          title="Skip intro and proceed directly to user selection"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-orange-500" />
        </button>
      </div>

      {/* Main Center Content: Company Logo & Branding */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/90 shadow-xl shadow-orange-500/5 space-y-6">
        
        {/* Animated Company Logo Badge */}
        <div className="relative">
          {/* Radial pulse rings */}
          <div className="absolute -inset-4 rounded-3xl bg-orange-500/20 blur-md animate-pulse" />
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-orange-400 to-amber-500 opacity-60 blur-xs" />
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 p-0.5 shadow-2xl shadow-orange-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-white flex flex-col items-center justify-center p-3 border border-orange-200/50 shadow-inner">
              <span className="text-4xl sm:text-5xl drop-shadow-sm select-none transform hover:scale-110 transition-transform">
                {COMPANY_CONFIG.splash.logoIcon}
              </span>
            </div>
          </div>
        </div>

        {/* Company & System Titles */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-400/30 text-orange-600 text-[11px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>{COMPANY_CONFIG.splash.badgeText}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
            {COMPANY_CONFIG.shortName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">POS</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 font-semibold">
            {COMPANY_CONFIG.companyName}
          </p>

          <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
            {COMPANY_CONFIG.tagline}
          </p>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-gray-600">
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              {steps[currentStatusIndex]?.text || 'Loading...'}
            </span>
            <span className="text-orange-600 font-black">{progress}%</span>
          </div>

          {/* Progress track */}
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/80 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 rounded-full transition-all duration-75 ease-out shadow-sm shadow-orange-500/30"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-gray-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Local Storage & Offline Field Resilient</span>
        </div>
        <p className="text-[10px] text-gray-500 font-mono">
          {COMPANY_CONFIG.legalRegistration}
        </p>
      </div>

    </div>
  );
};
