import React from 'react';
import { ArrowLeft, User, Navigation, ChevronRight, Smartphone } from 'lucide-react';
import { Assistant } from '../types';
import { COMPANY_CONFIG } from '../constants/companyConfig';

interface DistributorSelectionProps {
  assistants: Assistant[];
  onSelectDistributor: (assistantId: string) => void;
  onBack: () => void;
}

/**
 * STEP: SELECT DISTRIBUTORS
 * 
 * Appears when user clicks "Distributors" on the main 2-button screen.
 * Flow: Distributors -> Select Distributors -> Login -> Panel
 */
export const DistributorSelection: React.FC<DistributorSelectionProps> = ({
  assistants,
  onSelectDistributor,
  onBack
}) => {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-300">
      
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors border border-gray-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-orange-500" />
          <span>Back to Role Selection</span>
        </button>
      </div>

      {/* Screen Title */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-panel border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-wider bg-orange-50/60">
          <Smartphone className="w-3.5 h-3.5 text-orange-500" />
          <span>Select Distributor Profile</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Choose Your Distributor Account
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto font-medium">
          Select your assigned route profile to proceed to password login:
        </p>
      </div>

      {/* Distributor List Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {assistants.map((ast, idx) => (
          <div
            key={ast.id}
            onClick={() => onSelectDistributor(ast.id)}
            className="group glass-panel-elevated hover:bg-orange-50/30 border border-gray-200 hover:border-orange-400 rounded-3xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-orange-500/10 hover:-translate-y-0.5 flex flex-col justify-between shadow-sm"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-700 border border-orange-200 flex items-center justify-center font-black text-xs shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                {`#0${idx + 1}`}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Distributor #{idx + 1}
                </span>
                <h3 className="font-extrabold text-base text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                  {ast.shortName}
                </h3>
                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1 truncate font-medium">
                  <Navigation className="w-3 h-3 text-orange-500 flex-shrink-0" />
                  <span className="truncate">{ast.route}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:text-orange-700">
              <span>Login to Terminal</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-6 font-mono">
        {COMPANY_CONFIG.companyName} • Field POS Network
      </p>

    </div>
  );
};
