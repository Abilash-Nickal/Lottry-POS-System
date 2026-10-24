import React from 'react';
import { Users, RotateCcw, Sparkles } from 'lucide-react';
import { Assistant, StepType } from '../types';
import { COMPANY_CONFIG } from '../constants/companyConfig';

interface HeaderNavProps {
  authenticatedRole: 'admin' | 'assistant' | null;
  selectedAssistantId: string;
  setSelectedAssistantId: (id: string) => void;
  assistants: Assistant[];
  currentStep: StepType;
  setCurrentStep: (step: StepType) => void;
  onSwitchUser: () => void;
  onReplaySplash?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  authenticatedRole,
  selectedAssistantId,
  setSelectedAssistantId,
  assistants,
  currentStep,
  setCurrentStep,
  onSwitchUser,
  onReplaySplash
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Identity (Clickable to preview Splash loading) */}
        <div 
          onClick={onReplaySplash} 
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to replay startup splash screen"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#18181B] text-white flex items-center justify-center font-black shadow-md text-lg group-hover:scale-105 transition-transform">
            {COMPANY_CONFIG.splash.logoIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-stone-900 leading-tight">
                {COMPANY_CONFIG.shortName}<span className="text-amber-500"> POS</span>
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60 uppercase tracking-wider">
                Live Terminal
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
              {COMPANY_CONFIG.tagline}
            </p>
          </div>
        </div>

        {/* Global Controls & Role Status */}
        <div className="flex items-center gap-2.5">
          {authenticatedRole && (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                authenticatedRole === 'admin'
                  ? 'bg-stone-100 text-stone-900 border-stone-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200/80'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {authenticatedRole === 'admin' ? 'Distributor Head (Admin)' : 'Field Assistant POS'}
              </span>

              {authenticatedRole === 'assistant' && (
                <div className="hidden md:flex items-center gap-1 bg-stone-100 p-1 rounded-full border border-stone-200 text-xs">
                  {assistants.map((ast) => (
                    <button
                      key={ast.id}
                      onClick={() => {
                        setSelectedAssistantId(ast.id);
                        if (currentStep === 'USER_SELECT' || currentStep === 'USER_LOGIN') {
                          setCurrentStep('SELLER_SELECT');
                        }
                      }}
                      className={`px-3 py-1 rounded-full font-bold transition-all ${
                        selectedAssistantId === ast.id
                          ? 'bg-[#18181B] text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {ast.shortName.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={onSwitchUser}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors border border-stone-200"
            title="Switch User / Logout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Switch User</span>
          </button>
        </div>

      </div>
    </header>
  );
};
