import React from 'react';
import { 
  Search, 
  Store, 
  Printer, 
  ChevronDown
} from 'lucide-react';
import { Seller, Assistant, StepType } from '../types';

interface TopHeaderProps {
  currentStep: StepType | string;
  currentSeller: Seller;
  currentAssistant: Assistant;
  authenticatedRole: 'admin' | 'assistant' | null;
  onSwitchRetailer: () => void;
  onOpenFinalReceipt: () => void;
  onSwitchUser: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentStep,
  currentSeller,
  currentAssistant,
  authenticatedRole,
  onSwitchRetailer,
  onOpenFinalReceipt,
  onSwitchUser,
  searchQuery = '',
  onSearchChange
}) => {
  // If on Admin Dashboard, top header is not shown
  if (currentStep === 'ADMIN_DASHBOARD') {
    return null;
  }

  // Determine page title based on active view
  let title = 'Retailer Ledger & Dispatch';
  let subtitle = `${currentSeller?.name} • ${currentSeller?.location}`;

  if (currentStep === 'ADMIN_DASHBOARD') {
    title = 'Distribution Head Console';
    subtitle = 'Wholesale pricing, ceiling controls & field reconciliation';
  } else if (currentStep === 'SELLER_SELECT') {
    title = 'Retailer Directory';
    subtitle = `Assigned Route: ${currentAssistant?.route}`;
  } else if (currentStep === 'SALE_CATEGORY_SELECT' || currentStep === 'SALE_DATE_AND_TICKETS') {
    title = 'Ticket Dispatch Terminal';
    subtitle = `Issuing pack batch for ${currentSeller?.name}`;
  }

  return (
    <header className="bg-transparent px-6 sm:px-8 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 select-none">
      
      {/* Left: Dynamic Title & Subtitle */}
      <div>
        <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
          {title}
        </h1>
        <p className="text-[11px] text-gray-500 font-medium mt-0.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span>{subtitle}</span>
        </p>
      </div>

      {/* Center: Rounded Figma Search Input */}
      <div className="relative w-full sm:w-72 order-3 sm:order-2">
        <Search className="w-3.5 h-3.5 text-[#9F9184] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="w-full figma-input pl-9 pr-3.5 py-1.5 text-xs text-[#26201D] placeholder-[#9F9184] focus:outline-none transition-all shadow-xs"
        />
      </div>

      {/* Right Controls: Quick Actions, Badges & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 order-2 sm:order-3">
        
        {/* Quick Retailer Switcher (When on workspace) */}
        {currentStep === 'SELLER_WORKSPACE' && (
          <button
            onClick={onSwitchRetailer}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl btn-secondary text-xs shadow-xs"
            title="Switch Retailer Account"
          >
            <Store className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden md:inline">Switch Retailer</span>
          </button>
        )}

        {/* Quick All-In-One Slip (Only available for Field Assistants in Seller Workspace) */}
        {authenticatedRole === 'assistant' && currentStep === 'SELLER_WORKSPACE' && (
          <button
            onClick={onOpenFinalReceipt}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl btn-primary text-xs shadow-md shadow-orange-500/20"
            title="Print All-In-One Consolidated Receipt Slip"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Print Slip</span>
          </button>
        )}



        {/* User Profile Pill */}
        <div 
          onClick={onSwitchUser}
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl bg-[#FAF7F4] hover:bg-[#F2ECE4] border border-[#E6DDD4] cursor-pointer group transition-all shadow-xs"
          title="Click to Switch User"
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs bg-gradient-to-br from-orange-500 to-amber-600">
            {authenticatedRole === 'admin' ? 'චි' : currentAssistant?.shortName?.charAt(0) || 'K'}
          </div>
          <div className="text-left hidden lg:block">
            <span className="text-xs font-bold text-[#26201D] block leading-tight group-hover:text-orange-600 transition-colors">
              {authenticatedRole === 'admin' ? 'W.M.G. චිත්රා වීරකෝන්' : currentAssistant?.shortName}
            </span>
            <span className="text-[10px] font-medium text-[#7F7266] block leading-tight">
              {authenticatedRole === 'admin' ? 'ලොතරැයි බෙදාහැරීම් කාර්යාලය • දෙහිඅත්තකණ්ඩිය' : 'Field POS Officer'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#9F9184] group-hover:text-[#26201D] transition-colors hidden sm:block" />
        </div>

      </div>

    </header>
  );
};
