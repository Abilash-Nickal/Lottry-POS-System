import React, { useState } from 'react';
import { Users, Shield, Check } from 'lucide-react';
import { Assistant } from '../types';

interface UserSelectionProps {
  assistants?: Assistant[];
  onSelectAssistant: (assistantId: string) => void;
  onSelectAdmin: () => void;
}

export const UserSelection: React.FC<UserSelectionProps> = ({
  assistants = [],
  onSelectAssistant,
  onSelectAdmin
}) => {
  const [selectedTab, setSelectedTab] = useState<'assistants' | 'supervisor'>('assistants');

  // Fallback demo assistants matching the exact screenshot layout
  const displayAssistants: Assistant[] = assistants.length > 0 ? assistants.slice(0, 4) : [
    { id: 'ast1', name: 'Nuwan Perera', shortName: 'Nuwan Perera', username: 'nuwan', defaultPass: '1234', phone: '+94 77 123 4567', route: 'Colombo Fort Route', cashInHand: 42500, winningVouchers: 12400, totalOrdersToday: 8, avatarBg: 'bg-orange-500' },
    { id: 'ast2', name: 'Mohamed Rizwan', shortName: 'Mohamed Rizwan', username: 'rizwan', defaultPass: '1234', phone: '+94 71 987 6543', route: 'Kollupitiya Route', cashInHand: 18200, winningVouchers: 8500, totalOrdersToday: 5, avatarBg: 'bg-emerald-500' },
    { id: 'ast3', name: 'Mohamed Rizwan', shortName: 'Mohamed Rizwan', username: 'rizwan2', defaultPass: '1234', phone: '+94 76 555 4321', route: 'Maradana Route', cashInHand: 31000, winningVouchers: 14200, totalOrdersToday: 7, avatarBg: 'bg-blue-500' },
    { id: 'ast4', name: 'Mohamed Rizwan', shortName: 'Mohamed Rizwan', username: 'rizwan3', defaultPass: '1234', phone: '+94 75 444 3322', route: 'Dehiwala Route', cashInHand: 24800, winningVouchers: 6900, totalOrdersToday: 6, avatarBg: 'bg-purple-500' },
  ];

  const [selectedId, setSelectedId] = useState<string>(displayAssistants[0]?.id || 'ast1');

  const handleCardClick = (astId: string) => {
    setSelectedId(astId);
    setTimeout(() => {
      onSelectAssistant(astId);
    }, 220);
  };

  return (
    <div 
      className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-300 flex flex-col items-center select-none"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
    >
      
      {/* 1. Top Centered Badge (Matching Screenshot) */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FCEEEA] border border-[#FADCD5] text-[#9E2A1E] text-[11px] font-bold tracking-wider uppercase mb-3.5 shadow-2xs">
        <svg className="w-3.5 h-3.5 text-[#9E2A1E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v3" />
          <path d="M18.36 5.64l-2.12 2.12" />
          <path d="M5.64 5.64l2.12 2.12" />
          <path d="M9 13.5V6a2 2 0 1 1 4 0v7.5" />
          <path d="M13 10a2 2 0 1 1 4 0v4a7 7 0 1 1-14 0v-2a2 2 0 1 1 4 0v2" />
        </svg>
        <span>Shift Authentication Step 1 of 2</span>
      </div>

      {/* 2. Heading */}
      <h1 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-[#1E1915] tracking-tight text-center">
        Select Field Assistant
      </h1>

      {/* 3. Subheading */}
      <p className="text-[#6E645D] text-xs sm:text-sm max-w-xl mx-auto font-medium text-center mt-2.5 leading-relaxed">
        Choose active operator profile to unlock the route inventory ledger,
        <br className="hidden sm:inline" /> live sales scanner, and depot cash drawers.
      </p>

      {/* 4. Segmented Selector Pill (Matching Screenshot) */}
      <div className="inline-flex p-1 rounded-full bg-[#EFEAE4] border border-[#E2DBD3] text-xs sm:text-sm font-semibold gap-1 mt-6 shadow-inner">
        <button
          type="button"
          onClick={() => setSelectedTab('assistants')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all cursor-pointer ${
            selectedTab === 'assistants'
              ? 'bg-white text-[#1E1915] shadow-xs font-bold'
              : 'text-[#6E645D] hover:text-[#1E1915]'
          }`}
        >
          <Users className="w-4 h-4 text-[#C25838]" />
          <span>Field Assistants</span>
          <span className="px-2 py-0.5 rounded-full bg-[#FCEEEA] text-[#C25838] text-[10px] sm:text-[11px] font-black border border-[#FADCD5]">
            {displayAssistants.length} Active
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('supervisor');
            onSelectAdmin();
          }}
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all cursor-pointer ${
            selectedTab === 'supervisor'
              ? 'bg-white text-[#1E1915] shadow-xs font-bold'
              : 'text-[#6E645D] hover:text-[#1E1915]'
          }`}
        >
          <Shield className="w-4 h-4 text-[#8C827A]" />
          <span>Supervisor Hub</span>
        </button>
      </div>

      {/* 5. The 4 Cards in Horizontal Row (Matching Screenshot Exactly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full mt-10">
        {displayAssistants.map((ast, idx) => {
          const isSelected = selectedId === ast.id || (selectedId === '' && idx === 0);
          const displayName = ast.shortName || ast.name.replace(/^Assistant \d+:\s*/i, '');
          const initials = displayName
            .split(' ')
            .map(n => n[0])
            .filter(Boolean)
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'OP';

          return (
            <div
              key={ast.id}
              onClick={() => handleCardClick(ast.id)}
              className={`relative rounded-[28px] sm:rounded-[32px] p-6 pb-5 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer bg-white ${
                isSelected
                  ? 'border-[3.5px] border-[#3E2114] shadow-md shadow-[#3E2114]/10'
                  : 'border border-[#E5DDD5] hover:border-[#D08B6B] hover:shadow-xs'
              }`}
            >
              {/* Top Right Check Badge for Selected Card */}
              {isSelected && (
                <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-[#8A251A] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              {/* Big Circular Avatar with terracotta glow and red dot */}
              <div className="relative mt-2 mb-4">
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold tracking-tight shadow-inner ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#F0B19E] to-[#E59781] text-[#2C1D17] ring-2 ring-[#D9826A]/30'
                      : 'bg-gradient-to-b from-[#F2DDD2] to-[#E8CBB8] text-[#2C1D17]'
                  }`}
                >
                  {initials}
                </div>
                {/* Small terracotta dot on bottom-right of circle */}
                <span className="w-3.5 h-3.5 rounded-full bg-[#8A251A] border-2 border-white absolute bottom-1 right-1 shadow-xs" />
              </div>

              {/* Operator Name */}
              <div className="mb-5 px-1">
                <h3 className="font-extrabold text-lg sm:text-xl text-[#1E1915] tracking-tight">
                  {displayName}
                </h3>
              </div>

              {/* Bottom Status Text with subtle top border */}
              <div className="pt-3 border-t border-[#F2ECE6] w-full">
                <span
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-[#8A251A] font-bold' : 'text-[#7D756E]'
                  }`}
                >
                  {isSelected ? 'Currently Selected' : 'Tap to Switch'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
