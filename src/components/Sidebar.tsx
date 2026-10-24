import React from 'react';
import { 
  LayoutDashboard, 
  Store, 
  ShoppingBag, 
  RotateCcw, 
  Trophy, 
  FileText, 
  ShieldCheck, 
  LogOut, 
  Settings,
  Sparkles,
  ChevronRight,
  Ticket,
  Banknote,
  Tag,
  Users
} from 'lucide-react';
import { StepType, Assistant, ActionModalType } from '../types';
import { COMPANY_CONFIG } from '../constants/companyConfig';

export type AdminTabType = 'overview' | 'pricing' | 'sellers' | 'assistants' | 'ledger';

interface SidebarProps {
  currentStep: StepType;
  setCurrentStep: (step: StepType) => void;
  authenticatedRole: 'admin' | 'assistant' | null;
  currentAssistant: Assistant;
  onSwitchUser: () => void;
  activeActionId?: '3.1' | '3.2' | '3.3' | '3.4' | '3.5';
  onSelectAction?: (actionId: '3.1' | '3.2' | '3.3' | '3.4' | '3.5') => void;
  onOpenFinalReceipt?: () => void;
  activeAdminTab?: AdminTabType;
  onSelectAdminTab?: (tab: AdminTabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentStep,
  setCurrentStep,
  authenticatedRole,
  currentAssistant,
  onSwitchUser,
  activeActionId,
  onSelectAction,
  onOpenFinalReceipt,
  activeAdminTab = 'overview',
  onSelectAdminTab
}) => {
  const isWorkspace = currentStep === 'SELLER_WORKSPACE';
  const isDirectory = currentStep === 'SELLER_SELECT';
  const isAdmin = currentStep === 'ADMIN_DASHBOARD';

  return (
    <aside className="w-72 glass-panel text-gray-800 flex flex-col justify-between p-6 shrink-0 shadow-sm relative z-30 select-none min-h-screen border-r border-gray-200/80 backdrop-blur-2xl">
      
      {/* Top Branding Section */}
      <div className="space-y-8">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 px-2">
          <div className="w-12 h-12 rounded-2xl glass-panel-elevated text-gray-900 flex items-center justify-center font-black shadow-sm border border-gray-200 text-xl transform hover:scale-105 transition-transform">
            <span>🎟️</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-gray-900 leading-tight">
                {COMPANY_CONFIG.shortName}
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-orange-500 text-white uppercase tracking-wider shadow-sm">
                POS
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium tracking-tight">
              Wholesale Lottery Portal
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-4 mb-2">
            Main Operations
          </div>

          {/* 1. Admin Section Navigation Items (Moved to Left Panel as requested) */}
          {authenticatedRole === 'admin' || currentStep === 'ADMIN_DASHBOARD' ? (
            <div className="space-y-1.5">

              {/* 1.1 Overview */}
              <button
                onClick={() => {
                  if (onSelectAdminTab) onSelectAdminTab('overview');
                  setCurrentStep('ADMIN_DASHBOARD');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 group cursor-pointer min-h-[46px] ${
                  isAdmin && (activeAdminTab === 'overview' || !activeAdminTab)
                    ? 'neon-gradient-btn text-white font-black shadow-md shadow-orange-500/25 translate-x-1'
                    : 'text-gray-700 hover:bg-orange-50/80 hover:text-orange-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${isAdmin && (activeAdminTab === 'overview' || !activeAdminTab) ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`} />
                  <span>Overview & KPIs</span>
                </div>
                {isAdmin && (activeAdminTab === 'overview' || !activeAdminTab) && <ChevronRight className="w-4 h-4 text-white" />}
              </button>

              {/* 1. Sellers Management */}
              <button
                onClick={() => {
                  if (onSelectAdminTab) onSelectAdminTab('sellers');
                  setCurrentStep('ADMIN_DASHBOARD');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 group cursor-pointer min-h-[46px] ${
                  isAdmin && activeAdminTab === 'sellers'
                    ? 'neon-gradient-btn text-white font-black shadow-md shadow-orange-500/25 translate-x-1'
                    : 'text-gray-700 hover:bg-orange-50/80 hover:text-orange-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Store className={`w-4 h-4 ${isAdmin && activeAdminTab === 'sellers' ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`} />
                  <span>1. Sellers Management</span>
                </div>
                {isAdmin && activeAdminTab === 'sellers' && <ChevronRight className="w-4 h-4 text-white" />}
              </button>

              {/* 2. Assistant Accounts & Security */}
              <button
                onClick={() => {
                  if (onSelectAdminTab) onSelectAdminTab('assistants');
                  setCurrentStep('ADMIN_DASHBOARD');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 group cursor-pointer min-h-[46px] ${
                  isAdmin && activeAdminTab === 'assistants'
                    ? 'neon-gradient-btn text-white font-black shadow-md shadow-orange-500/25 translate-x-1'
                    : 'text-gray-700 hover:bg-orange-50/80 hover:text-orange-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${isAdmin && activeAdminTab === 'assistants' ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`} />
                  <span>2. Assistant Accounts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isAdmin && activeAdminTab === 'assistants' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700 border border-orange-200'
                  }`}>
                    4
                  </span>
                  {isAdmin && activeAdminTab === 'assistants' && <ChevronRight className="w-4 h-4 text-white" />}
                </div>
              </button>

              {/* 3. Ticket Catalog & Tier Pricing */}
              <button
                onClick={() => {
                  if (onSelectAdminTab) onSelectAdminTab('pricing');
                  setCurrentStep('ADMIN_DASHBOARD');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 group cursor-pointer min-h-[46px] ${
                  isAdmin && activeAdminTab === 'pricing'
                    ? 'neon-gradient-btn text-white font-black shadow-md shadow-orange-500/25 translate-x-1'
                    : 'text-gray-700 hover:bg-orange-50/80 hover:text-orange-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Tag className={`w-4 h-4 ${isAdmin && activeAdminTab === 'pricing' ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`} />
                  <span>3. Ticket Catalog & Pricing</span>
                </div>
                {isAdmin && activeAdminTab === 'pricing' && <ChevronRight className="w-4 h-4 text-white" />}
              </button>

              {/* Audit Trail & Ledger */}
              <button
                onClick={() => {
                  if (onSelectAdminTab) onSelectAdminTab('ledger');
                  setCurrentStep('ADMIN_DASHBOARD');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 group cursor-pointer min-h-[46px] ${
                  isAdmin && activeAdminTab === 'ledger'
                    ? 'neon-gradient-btn text-white font-black shadow-md shadow-orange-500/25 translate-x-1'
                    : 'text-gray-700 hover:bg-orange-50/80 hover:text-orange-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className={`w-4 h-4 ${isAdmin && activeAdminTab === 'ledger' ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`} />
                  <span>Audit Trail</span>
                </div>
                {isAdmin && activeAdminTab === 'ledger' && <ChevronRight className="w-4 h-4 text-white" />}
              </button>
            </div>
          ) : (
            <>
              {/* POS Terminal Operations (Only in Field Assistant Terminal) */}
              <button
                onClick={() => setCurrentStep('SELLER_WORKSPACE')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                  isWorkspace && (!activeActionId || activeActionId === '3.1')
                    ? 'neon-gradient-btn text-white font-bold shadow-md shadow-orange-500/25 translate-x-1'
                    : 'text-gray-600 hover:bg-orange-50/80 hover:text-orange-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${isWorkspace && (!activeActionId || activeActionId === '3.1') ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`} />
                  <span>Retailer POS Terminal</span>
                </div>
                {isWorkspace && (!activeActionId || activeActionId === '3.1') && <ChevronRight className="w-4 h-4 text-white" />}
              </button>

              {/* 3.1 Sale & Dispatch */}
              <button
                onClick={() => {
                  if (onSelectAction) onSelectAction('3.1');
                  setCurrentStep('SELLER_WORKSPACE');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                  isWorkspace && activeActionId === '3.1'
                    ? 'neon-gradient-btn text-white font-bold shadow-md shadow-orange-500/25 translate-x-1'
                    : 'text-gray-600 hover:bg-orange-50/80 hover:text-orange-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className={`w-4 h-4 ${isWorkspace && activeActionId === '3.1' ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'} group-hover:scale-110 transition-transform`} />
                  <span>Sale & Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isWorkspace && activeActionId === '3.1' ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-600 border border-orange-200'
                  }`}>
                    3.1
                  </span>
                  {isWorkspace && activeActionId === '3.1' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>

              {/* 3.2 Pack Return */}
              <button
                onClick={() => {
                  if (onSelectAction) onSelectAction('3.2');
                  setCurrentStep('SELLER_WORKSPACE');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                  isWorkspace && activeActionId === '3.2'
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold shadow-md shadow-cyan-600/25 translate-x-1'
                    : 'text-gray-600 hover:bg-cyan-50/80 hover:text-cyan-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className={`w-4 h-4 ${isWorkspace && activeActionId === '3.2' ? 'text-white' : 'text-gray-400 group-hover:text-cyan-600'} group-hover:scale-110 transition-transform`} />
                  <span>Pack Return</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isWorkspace && activeActionId === '3.2' ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  }`}>
                    3.2
                  </span>
                  {isWorkspace && activeActionId === '3.2' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>

              {/* 3.3 Winning Tickets */}
              <button
                onClick={() => {
                  if (onSelectAction) onSelectAction('3.3');
                  setCurrentStep('SELLER_WORKSPACE');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                  isWorkspace && activeActionId === '3.3'
                    ? 'neon-gradient-btn text-white font-bold shadow-md shadow-orange-500/25 translate-x-1'
                    : 'text-gray-600 hover:bg-orange-50/80 hover:text-orange-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Trophy className={`w-4 h-4 ${isWorkspace && activeActionId === '3.3' ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'} group-hover:scale-110 transition-transform`} />
                  <span>Winning Tickets</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isWorkspace && activeActionId === '3.3' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    3.3
                  </span>
                  {isWorkspace && activeActionId === '3.3' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>

              {/* 3.4 Non-Winning Stubs */}
              <button
                onClick={() => {
                  if (onSelectAction) onSelectAction('3.4');
                  setCurrentStep('SELLER_WORKSPACE');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                  isWorkspace && activeActionId === '3.4'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-md shadow-rose-500/25 translate-x-1'
                    : 'text-gray-600 hover:bg-rose-50/80 hover:text-rose-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Ticket className={`w-4 h-4 ${isWorkspace && activeActionId === '3.4' ? 'text-white' : 'text-gray-400 group-hover:text-rose-500'} group-hover:scale-110 transition-transform`} />
                  <span>Non-Winning Stubs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isWorkspace && activeActionId === '3.4' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    3.4
                  </span>
                  {isWorkspace && activeActionId === '3.4' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>

              {/* 3.5 Pay by Cash */}
              <button
                onClick={() => {
                  if (onSelectAction) onSelectAction('3.5');
                  setCurrentStep('SELLER_WORKSPACE');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                  isWorkspace && activeActionId === '3.5'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/25 translate-x-1'
                    : 'text-gray-600 hover:bg-emerald-50/80 hover:text-emerald-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className={`w-4 h-4 ${isWorkspace && activeActionId === '3.5' ? 'text-white' : 'text-gray-400 group-hover:text-emerald-600'} group-hover:scale-110 transition-transform`} />
                  <span>Pay by Cash</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isWorkspace && activeActionId === '3.5' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    3.5
                  </span>
                  {isWorkspace && activeActionId === '3.5' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            </>
          )}

          {/* 6. Ledger Statements */}
          <button
            onClick={() => {
              if (onOpenFinalReceipt) onOpenFinalReceipt();
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-gray-700 hover:bg-orange-50/80 hover:text-orange-600 transition-all group mt-2 pt-2 border-t border-gray-200/80 min-h-[46px]"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
              <span>Ledger Statements</span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
              Receipt
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom Profile Summary & User Switcher */}
      <div className="pt-6 border-t border-gray-200/80 space-y-3">
        <div className="glass-panel-elevated border border-gray-200/90 rounded-2xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${
              authenticatedRole === 'admin' 
                ? 'bg-orange-500 text-white' 
                : currentAssistant?.avatarBg || 'bg-amber-500 text-white'
            }`}>
              {authenticatedRole === 'admin' ? 'AD' : currentAssistant?.id?.replace('ast', '#') || '#1'}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 truncate">
                {authenticatedRole === 'admin' ? 'Head Office Admin' : currentAssistant?.shortName}
              </h4>
              <p className="text-[10px] text-gray-500 truncate">
                {authenticatedRole === 'admin' ? 'Full Authority' : currentAssistant?.route?.split('/')[0]}
              </p>
            </div>
          </div>

          <button
            onClick={onSwitchUser}
            className="p-2 rounded-xl glass-panel hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-colors border border-gray-200"
            title="Switch User / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-center text-gray-400 font-mono">
          LankaLotto SaaS POS • v2.4
        </p>
      </div>

    </aside>
  );
};
