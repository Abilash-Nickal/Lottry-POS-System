import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Store, 
  MapPin, 
  Phone, 
  Lock, 
  ShoppingBag, 
  RotateCcw, 
  Trophy, 
  Ticket, 
  Banknote, 
  Calendar, 
  Check, 
  AlertTriangle, 
  Plus, 
  Minus, 
  X, 
  Printer, 
  Receipt, 
  History, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck,
  CreditCard,
  Cloud,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Seller, Assistant, Transaction, LotteryBrand, ForwardDay } from '../types';
import { formatLKR, getForward7Days } from '../utils/formatters';
import { RecentLedgerPage } from './RecentLedgerPage';
import { AvatarDisplay } from './AvatarDisplay';
import { ReturnModal } from './ActionModals/ReturnModal';
import { WinningModal } from './ActionModals/WinningModal';
import { NonWinningModal } from './ActionModals/NonWinningModal';
import { CashModal } from './ActionModals/CashModal';
import { dbUpsertSeller } from '../lib/databaseService';

interface SellerWorkspaceProps {
  currentSeller: Seller;
  currentAssistant: Assistant;
  sellerTransactions: Transaction[];
  brands: LotteryBrand[];
  onBackToDirectory: () => void;
  onOpenFinalReceipt: () => void;
  onConfirmSaleDispatch: (data: {
    categoryDesc: string;
    targetDayStr: string;
    items: Array<{
      dateStr: string;
      brandName: string;
      packs: number;
      tickets: number;
      rate: number;
      subtotal: number;
    }>;
    totalPacks: number;
    totalTickets: number;
    totalBill: number;
    dispatchNote: string;
  }) => void;
  onConfirmReturn: (data: {
    returnItems: Array<{ brandName: string; packs: number; rate: number; subtotal: number }>;
    totalPacks: number;
    totalRefund: number;
    reason: string;
    batchRef: string;
  }) => void;
  onConfirmWinning: (data: {
    totalWinningOffset: number;
    envelopeNo: string;
    ticketCount: string;
    breakdown: Record<string, string>;
  }) => void;
  onConfirmNonWinning: (data: {
    brandName: string;
    stubCount: string;
    ratePerStub: string;
    schemeRef: string;
    totalReimbursement: number;
  }) => void;
  onConfirmCash: (data: {
    cashAmount: number;
    reference: string;
  }) => void;
  activeActionId?: '3.1' | '3.2' | '3.3' | '3.4' | '3.5';
  onSelectActionId?: (id: '3.1' | '3.2' | '3.3' | '3.4' | '3.5') => void;
}

export const SellerWorkspace: React.FC<SellerWorkspaceProps> = ({
  currentSeller,
  currentAssistant,
  sellerTransactions,
  brands,
  onBackToDirectory,
  onOpenFinalReceipt,
  onConfirmSaleDispatch,
  onConfirmReturn,
  onConfirmWinning,
  onConfirmNonWinning,
  onConfirmCash,
  activeActionId,
  onSelectActionId
}) => {
  // Toggle for full-page ledger view
  const [showLedgerPage, setShowLedgerPage] = useState(false);

  // Active Pop-up Screen Modal ('SALE' | 'RETURN' | 'WINNING' | 'NON_WINNING' | 'CASH' | null)
  const [activeModal, setActiveModal] = useState<'SALE' | 'RETURN' | 'WINNING' | 'NON_WINNING' | 'CASH' | null>(null);

  // Financial Metrics
  const currentCredit = currentSeller.currentCredit;
  const creditLimit = currentSeller.creditLimit;
  const availableCredit = Math.max(0, creditLimit - currentCredit);
  const percent = Math.min(100, Math.round((currentCredit / (creditLimit || 1)) * 100));

  // Cloud sync & printing state
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [cloudSavedAt, setCloudSavedAt] = useState<string | null>(null);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const handleDirectPrint = () => {
    onOpenFinalReceipt();
    // Allow modal to render then trigger print
    setTimeout(() => {
      window.print();
    }, 350);
  };

  const handleConfirmOrderCloud = async () => {
    setIsSavingCloud(true);
    try {
      if (saleMath.totalPacks > 0 && !saleMath.isProjectedExceeded) {
        handleExecuteSale();
      }
      // Save current seller state to database & Google Sheets
      await dbUpsertSeller(currentSeller);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCloudSavedAt(timeStr);
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 4000);
    } catch (err) {
      console.error('Error syncing order to cloud:', err);
    } finally {
      setIsSavingCloud(false);
    }
  };

  // --------------------------------------------------------------------------
  // TICKET SALE & DISPATCH POP-UP MODAL STATE & LOGIC
  // --------------------------------------------------------------------------
  const [saleCategory, setSaleCategory] = useState<'daily' | 'scratch'>('daily');
  const forwardDays = useMemo(() => getForward7Days(), []);
  const [selectedSaleDay, setSelectedSaleDay] = useState<ForwardDay>(forwardDays[0]);
  const [saleTicketCounts, setSaleTicketCounts] = useState<Record<string, number>>({});
  const [saleDispatchNote, setSaleDispatchNote] = useState('');

  const categoryBrands = useMemo(() => {
    return brands.filter(b => b.type === saleCategory);
  }, [brands, saleCategory]);

  const saleMath = useMemo(() => {
    let totalPacks = 0;
    let totalTickets = 0;
    let totalBill = 0;

    Object.entries(saleTicketCounts).forEach(([brandId, count]) => {
      const packs = count || 0;
      if (packs > 0) {
        const brand = brands.find(b => b.id === brandId);
        if (brand) {
          const tierPrice = currentSeller.tier === 'Tier A' ? brand.tierAPrice : brand.tierBPrice;
          const tickets = packs * brand.stockPerPack;
          totalPacks += packs;
          totalTickets += tickets;
          totalBill += tickets * tierPrice;
        }
      }
    });

    const projectedCredit = currentSeller.currentCredit + totalBill;
    const isProjectedExceeded = projectedCredit > currentSeller.creditLimit;
    const excess = isProjectedExceeded ? projectedCredit - currentSeller.creditLimit : 0;

    return { totalPacks, totalTickets, totalBill, projectedCredit, isProjectedExceeded, excess };
  }, [saleTicketCounts, brands, currentSeller]);

  // Live session reconciliation totals aggregated across today's transactions for this seller
  const sessionBreakdown = useMemo(() => {
    let grossBill = 0;
    let grossPacks = 0;
    let grossTickets = 0;

    let returnRefund = 0;
    let returnPacks = 0;

    let winningOffset = 0;
    let winningCount = 0;

    let nonWinningReimburse = 0;
    let nonWinningStubs = 0;

    let cashCollected = 0;

    sellerTransactions.forEach(t => {
      if (t.actionType?.includes('SALE') || (t.typeLabel && t.typeLabel.includes('Sale')) || t.deltaCredit > 0) {
        grossBill += t.deltaCredit;
        grossPacks += t.details?.totalPacks || 0;
        grossTickets += t.details?.totalTickets || (t.details?.totalPacks ? t.details.totalPacks * 100 : 0);
      } else if (t.actionType?.includes('RETURN') || (t.typeLabel && t.typeLabel.includes('Return'))) {
        returnRefund += Math.abs(t.deltaCredit);
        returnPacks += t.details?.totalPacks || 1;
      } else if (t.actionType?.includes('WINNING') || (t.typeLabel && t.typeLabel.includes('Winning'))) {
        winningOffset += Math.abs(t.deltaCredit);
        winningCount += 1;
      } else if (t.actionType?.includes('NON_WINNING') || (t.typeLabel && t.typeLabel.includes('Non-Winning'))) {
        nonWinningReimburse += Math.abs(t.deltaCredit);
        nonWinningStubs += parseInt(t.details?.stubCount) || 0;
      } else if (t.actionType?.includes('CASH') || (t.typeLabel && t.typeLabel.includes('Cash'))) {
        cashCollected += Math.abs(t.deltaCredit);
      }
    });

    const totalOffsets = returnRefund + winningOffset + nonWinningReimburse + cashCollected;
    const netBill = Math.max(0, grossBill - totalOffsets);

    // Starting credit before today's transactions
    const sortedTxns = [...sellerTransactions].reverse();
    const prevBalance = sortedTxns.length > 0 ? sortedTxns[0].previousCredit : currentSeller.currentCredit;

    return {
      grossBill,
      grossPacks,
      grossTickets,
      returnRefund,
      returnPacks,
      winningOffset,
      winningCount,
      nonWinningReimburse,
      nonWinningStubs,
      cashCollected,
      totalOffsets,
      netBill,
      prevBalance
    };
  }, [sellerTransactions, currentSeller]);

  const handleExecuteSale = () => {
    if (saleMath.totalPacks <= 0 || saleMath.isProjectedExceeded) return;

    const items = Object.entries(saleTicketCounts)
      .filter(([_, packs]) => packs > 0)
      .map(([brandId, packs]) => {
        const brand = brands.find(b => b.id === brandId)!;
        const tierPrice = currentSeller.tier === 'Tier A' ? brand.tierAPrice : brand.tierBPrice;
        const tickets = packs * brand.stockPerPack;
        return {
          dateStr: selectedSaleDay.dateStr,
          brandName: brand.name,
          packs,
          tickets,
          rate: tierPrice,
          subtotal: tickets * tierPrice
        };
      });

    onConfirmSaleDispatch({
      categoryDesc: saleCategory === 'daily' ? 'Daily Draw Lottery' : 'Instant Scratch Cards',
      targetDayStr: `${selectedSaleDay.label} (${selectedSaleDay.dateStr})`,
      items,
      totalPacks: saleMath.totalPacks,
      totalTickets: saleMath.totalTickets,
      totalBill: saleMath.totalBill,
      dispatchNote: saleDispatchNote
    });

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCloudSavedAt(timeStr);
    setShowSyncSuccess(true);
    setTimeout(() => setShowSyncSuccess(false), 4000);

    // Reset local sale form & close pop-up modal
    setSaleTicketCounts({});
    setSaleDispatchNote('');
    setActiveModal(null);
  };

  const handleUpdatePackQty = (brandId: string, delta: number) => {
    setSaleTicketCounts(prev => {
      const current = prev[brandId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const clone = { ...prev };
        delete clone[brandId];
        return clone;
      }
      return { ...prev, [brandId]: next };
    });
  };

  const handleSetPackQty = (brandId: string, qty: number) => {
    setSaleTicketCounts(prev => {
      const next = Math.max(0, isNaN(qty) ? 0 : qty);
      if (next === 0) {
        const clone = { ...prev };
        delete clone[brandId];
        return clone;
      }
      return { ...prev, [brandId]: next };
    });
  };

  // Full-page ledger view
  if (showLedgerPage) {
    return (
      <RecentLedgerPage
        currentSeller={currentSeller}
        currentAssistant={currentAssistant}
        sellerTransactions={sellerTransactions}
        onBack={() => setShowLedgerPage(false)}
        onOpenFinalReceipt={onOpenFinalReceipt}
      />
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 overflow-y-auto gap-3 text-[#26201D] animate-in fade-in duration-200">
      
      {/* ---------------------------------------------------------------- */}
      {/* 1. TOP CUSTOMER / SELLER BANNER (MATCHES USER IMAGE EXACTLY)       */}
      {/* ---------------------------------------------------------------- */}
      <div className="rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 border border-[#E6DDD4] bg-[#FAF8F5] shrink-0">
        
        {/* RETAILER INFO */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={onBackToDirectory}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5EFEB] text-[#26201D] flex items-center gap-1.5 border border-[#E6DDD4] text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Back to Retailer Directory"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#26201D]" />
              <span>Directory</span>
            </button>

            {/* Small icon on banner to access Recent Ledger in a new page */}
            <button
              onClick={() => setShowLedgerPage(true)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-[#F5EFEB] text-[#26201D] flex items-center gap-1.5 border border-[#E6DDD4] text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Open Recent Ledger & Audit History in full page"
            >
              <History className="w-3.5 h-3.5 text-[#D64933]" />
              <span className="hidden sm:inline">Ledger History</span>
            </button>

            <AvatarDisplay
              avatarId={currentSeller.avatarId || 'char-06'}
              name={currentSeller.name}
              size="md"
              showBadge={true}
              className="shrink-0"
            />

            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#26201D] tracking-tight">
                {currentSeller.name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E6DDD4]/60 text-[#7F7266]">
                #{currentSeller.id}
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#FAF0E9] text-[#D68A64] border border-[#F4DEC9] uppercase tracking-wider">
                {currentSeller.tier === 'Tier A' ? 'Tier A Wholesale' : 'Tier B Retail'}
              </span>
              {currentSeller.isFrozen && (
                <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-200">
                  <Lock className="w-3 h-3" /> Frozen
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-[#7F7266] font-medium pl-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-orange-500 shrink-0" /> {currentSeller.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#9F9184] shrink-0" /> {currentSeller.phone}
            </span>
            <span>•</span>
            <span>Owner: <strong className="text-[#26201D] font-bold">{currentSeller.owner}</strong></span>
          </div>
        </div>

        {/* TOP RIGHT FINANCIAL METRICS (3 DISTINCT CARDS AS IN SCREENSHOT) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
          {/* Card 1: Debt */}
          <div className="bg-[#FDF2F0] border border-[#F9C9C2] rounded-xl p-2.5 min-w-[145px]">
            <span className="text-[9px] font-bold text-[#D64933] uppercase tracking-wider block">
              Current Debt Balance
            </span>
            <div className="text-base sm:text-lg font-black text-[#D64933] tracking-tight font-mono mt-0.5">
              <span className="text-xs font-bold mr-1">LKR</span>-{formatLKR(currentCredit).replace('LKR', '').trim()}
            </div>
          </div>

          {/* Card 2: Credit Limit */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-2.5 min-w-[145px]">
            <span className="text-[9px] font-bold text-[#16A34A] uppercase tracking-wider block">
              Assigned Credit Limit
            </span>
            <div className="text-base sm:text-lg font-black text-[#16A34A] tracking-tight font-mono mt-0.5">
              <span className="text-xs font-bold mr-1">LKR</span>{formatLKR(creditLimit).replace('LKR', '').trim()}
            </div>
          </div>

          {/* Card 3: Available Room + Progress */}
          <div className="bg-white border border-[#E6DDD4] rounded-xl p-2.5 min-w-[145px] flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-[#7F7266] uppercase tracking-wider">
                Available Room
              </span>
              <span className="text-[9px] font-black text-[#D68A64]">
                {percent}% USED
              </span>
            </div>
            <div className="text-base sm:text-lg font-black text-[#26201D] tracking-tight font-mono mt-0.5">
              <span className="text-xs font-bold text-[#7F7266] mr-1">LKR</span>
              {formatLKR(availableCredit).replace('LKR', '').trim()}
            </div>
            <div className="w-full bg-[#E6DDD4] h-1 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full rounded-full bg-[#D68A64]" 
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 2. ORDER BREAKDOWN & ACTION BUTTONS LIST (CENTERED & FOCUSED)    */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-start py-2">
        
        {/* THE ORDERING ELEMENTS LIST CARD (EXACTLY LIKE USER IMAGE) */}
        <div className="max-w-xl w-full space-y-3">

          {/* TOP ACTIONS: CONFIRM ORDER TO CLOUD & PRINT DISPATCH SLIP (MATCHES USER IMAGE) */}
          <div className="space-y-2 mb-1">
            <div className="flex items-center justify-between px-1 text-xs font-bold">
              <span className="text-[#16A34A] flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                Remaining room: LKR {formatLKR(availableCredit).replace('LKR', '').trim()}
              </span>
              {cloudSavedAt && (
                <span className="text-[#0284C7] flex items-center gap-1 text-[11px] font-mono animate-in fade-in">
                  <Cloud className="w-3.5 h-3.5 text-[#0284C7]" />
                  Cloud Synced: {cloudSavedAt}
                </span>
              )}
            </div>

            {/* Confirm Order & Save to Cloud Button */}
            <button
              type="button"
              disabled={isSavingCloud || currentSeller.isFrozen}
              onClick={handleConfirmOrderCloud}
              className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer min-h-[48px] ${
                showSyncSuccess
                  ? 'bg-[#16A34A] text-white shadow-emerald-600/30'
                  : 'bg-[#D64933] hover:bg-[#bd3e2a] text-white shadow-[#D64933]/25 active:scale-[0.99]'
              } ${isSavingCloud || currentSeller.isFrozen ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {isSavingCloud ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Order to Cloud...</span>
                </>
              ) : showSyncSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Order Confirmed & Cloud Saved!</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 text-white" />
                  <span>Confirm Order & Save to Cloud</span>
                </>
              )}
            </button>

            {/* Print 80mm Dispatch Slip Button */}
            <button
              type="button"
              onClick={handleDirectPrint}
              className="w-full py-3 px-5 rounded-2xl bg-white hover:bg-[#F5EFEB] text-[#26201D] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 border border-[#E6DDD4] shadow-xs transition-all cursor-pointer active:scale-[0.99]"
            >
              <Printer className="w-4 h-4 text-[#D64933]" />
              <span>Print 80mm Dispatch Slip</span>
            </button>

            {/* Cancel Dispatch link */}
            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={onBackToDirectory}
                className="text-[11px] font-bold text-stone-400 hover:text-stone-700 hover:underline cursor-pointer transition-colors"
              >
                Cancel Dispatch / Back to Directory
              </button>
            </div>
          </div>
          
          <div className="rounded-3xl border border-[#E6DDD4] bg-[#FAF8F5] p-4 sm:p-5 shadow-xs space-y-3.5">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF0E9] border border-[#F4DEC9] text-[#D64933] flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4 text-[#D64933]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 block leading-tight">
                    Full Order & Bill Breakdown
                  </h3>
                  <span className="text-[11px] text-[#7F7266] font-medium">
                    Live Session Reconciliation
                  </span>
                </div>
              </div>

              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#FAF0E9] text-[#D64933] border border-[#F4DEC9] font-mono">
                {sessionBreakdown.grossPacks} Packs
              </span>
            </div>

            {/* Big Prominent Full Bill Amount Highlight */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E6DDD4] space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-black uppercase tracking-wider text-stone-600">
                  Full Bill Amount (Net):
                </span>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono tracking-tight">
                  <span className="text-xs font-bold text-stone-500 mr-1">LKR</span>
                  {formatLKR(sessionBreakdown.netBill).replace('LKR', '').trim()}
                </div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-stone-500 font-medium pt-1 border-t border-stone-100">
                <span>Gross: LKR {formatLKR(sessionBreakdown.grossBill).replace('LKR', '').trim()}</span>
                <span>Offsets: -LKR {formatLKR(sessionBreakdown.totalOffsets).replace('LKR', '').trim()}</span>
              </div>
            </div>

            {/* ALL ORDERING ELEMENTS LIST (THE 5 ACTION BUTTONS) */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block pl-0.5">
                All Ordering Elements
              </span>

              {/* 1. Gross Dispatch */}
              <div 
                onClick={() => setActiveModal('SALE')}
                className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-[#F5EFEB] border border-[#E6DDD4] cursor-pointer transition-all shadow-xs group select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF0E9] border border-[#F4DEC9] flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 text-[#D64933]" />
                  </div>
                  <div>
                    <span className="font-black text-stone-900 block leading-tight">1. Gross Dispatch</span>
                    <span className="text-[10px] text-stone-500">
                      {sessionBreakdown.grossPacks} packs ({sessionBreakdown.grossTickets} tix)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-stone-900 font-mono block">
                    +LKR {formatLKR(sessionBreakdown.grossBill).replace('LKR', '').trim()}
                  </span>
                  <span className="text-[10px] font-bold text-[#D64933] group-hover:underline">
                    {sessionBreakdown.grossPacks > 0 ? '3.1 Sale ›' : '+ Add ›'}
                  </span>
                </div>
              </div>

              {/* 2. Unsold Pack Returns */}
              <div 
                onClick={() => setActiveModal('RETURN')}
                className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-[#F5EFEB] border border-[#E6DDD4] cursor-pointer transition-all shadow-xs group select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4 text-[#0284C7]" />
                  </div>
                  <div>
                    <span className="font-black text-stone-900 block leading-tight">2. Unsold Pack Returns</span>
                    <span className="text-[10px] text-stone-500">
                      {sessionBreakdown.returnPacks} packs returned
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-black font-mono block ${sessionBreakdown.returnRefund > 0 ? 'text-[#0284C7]' : 'text-stone-500'}`}>
                    -LKR {formatLKR(sessionBreakdown.returnRefund).replace('LKR', '').trim()}
                  </span>
                  <span className="text-[10px] font-bold text-[#0284C7] group-hover:underline">
                    {sessionBreakdown.returnPacks > 0 ? 'Edit ›' : '+ Add ›'}
                  </span>
                </div>
              </div>

              {/* 3. Winning Tickets Offset */}
              <div 
                onClick={() => setActiveModal('WINNING')}
                className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-[#F5EFEB] border border-[#E6DDD4] cursor-pointer transition-all shadow-xs group select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FEFCE8] border border-[#FEF08A] flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-[#CA8A04]" />
                  </div>
                  <div>
                    <span className="font-black text-stone-900 block leading-tight">3. Winning Tickets Offset</span>
                    <span className="text-[10px] text-stone-500">
                      {sessionBreakdown.winningCount > 0 ? `${sessionBreakdown.winningCount} vouchers claimed` : '0 vouchers claimed'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-black font-mono block ${sessionBreakdown.winningOffset > 0 ? 'text-[#CA8A04]' : 'text-stone-500'}`}>
                    -LKR {formatLKR(sessionBreakdown.winningOffset).replace('LKR', '').trim()}
                  </span>
                  <span className="text-[10px] font-bold text-[#CA8A04] group-hover:underline">
                    {sessionBreakdown.winningOffset > 0 ? 'Edit ›' : '+ Add ›'}
                  </span>
                </div>
              </div>

              {/* 4. Non-Winning Drawback */}
              <div 
                onClick={() => setActiveModal('NON_WINNING')}
                className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-[#F5EFEB] border border-[#E6DDD4] cursor-pointer transition-all shadow-xs group select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FDF2F8] border border-[#FBCFE8] flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4 text-[#DB2777]" />
                  </div>
                  <div>
                    <span className="font-black text-stone-900 block leading-tight">4. Non-Winning Drawback</span>
                    <span className="text-[10px] text-stone-500">
                      {sessionBreakdown.nonWinningStubs > 0 ? `${sessionBreakdown.nonWinningStubs} stubs returned` : '0 stubs returned'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-black font-mono block ${sessionBreakdown.nonWinningReimburse > 0 ? 'text-[#DB2777]' : 'text-stone-500'}`}>
                    -LKR {formatLKR(sessionBreakdown.nonWinningReimburse).replace('LKR', '').trim()}
                  </span>
                  <span className="text-[10px] font-bold text-[#DB2777] group-hover:underline">
                    {sessionBreakdown.nonWinningReimburse > 0 ? 'Edit ›' : '+ Add ›'}
                  </span>
                </div>
              </div>

              {/* 5. Cash Payment */}
              <div 
                onClick={() => setActiveModal('CASH')}
                className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-[#F5EFEB] border border-[#E6DDD4] cursor-pointer transition-all shadow-xs group select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center shrink-0">
                    <Banknote className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <div>
                    <span className="font-black text-stone-900 block leading-tight">5. Cash Payment</span>
                    <span className="text-[10px] text-stone-500">
                      {sessionBreakdown.cashCollected > 0 ? 'Cash settlement logged' : 'No cash tendered'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-black font-mono block ${sessionBreakdown.cashCollected > 0 ? 'text-[#16A34A]' : 'text-stone-500'}`}>
                    -LKR {formatLKR(sessionBreakdown.cashCollected).replace('LKR', '').trim()}
                  </span>
                  <span className="text-[10px] font-bold text-[#16A34A] group-hover:underline">
                    {sessionBreakdown.cashCollected > 0 ? 'Edit ›' : '+ Add ›'}
                  </span>
                </div>
              </div>

            </div>

            {/* Debt Summary Impact */}
            <div className="pt-2 border-t border-[#E6DDD4] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#7F7266] font-medium">Previous Balance:</span>
                <span className="font-extrabold text-stone-900 font-mono">
                  LKR {formatLKR(sessionBreakdown.prevBalance).replace('LKR', '').trim()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-stone-900">Post-Order Debt:</span>
                <span className="font-black text-base text-[#D64933] font-mono">
                  LKR {formatLKR(currentCredit).replace('LKR', '').trim()}
                </span>
              </div>
            </div>

          </div>

          {/* Big Prominent Final Slip Button (Matching Image) */}
          <button
            type="button"
            onClick={handleDirectPrint}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#D64933] hover:bg-[#bd3e2a] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md shadow-[#D64933]/25 transition-all cursor-pointer min-h-[48px] active:scale-[0.99]"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Preview and Print Final Slip</span>
          </button>

        </div>

      </div>

      {/* ==================================================================== */}
      {/* 4. POP-UP MODAL 1: TICKET SALE & DISPATCH                            */}
      {/* ==================================================================== */}
      {activeModal === 'SALE' && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 to-stone-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF0E9]/20 border border-white/20 text-orange-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black tracking-tight">
                      Ticket Sale & Dispatch
                    </h3>
                    <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {currentSeller.tier} Pricing
                    </span>
                  </div>
                  <p className="text-xs text-stone-300">
                    Allocating lottery packs to <strong className="text-white">{currentSeller.name}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* Category Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSaleCategory('daily')}
                  className={`py-2.5 px-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    saleCategory === 'daily'
                      ? 'border-2 border-[#D64933] bg-orange-50/50 text-[#D64933] shadow-xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Calendar className={`w-4 h-4 ${saleCategory === 'daily' ? 'text-[#D64933]' : 'text-stone-400'}`} />
                  <span>Daily Draw Lotteries (100-pack)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSaleCategory('scratch')}
                  className={`py-2.5 px-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    saleCategory === 'scratch'
                      ? 'border-2 border-[#D64933] bg-orange-50/50 text-[#D64933] shadow-xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${saleCategory === 'scratch' ? 'text-[#D64933]' : 'text-stone-400'}`} />
                  <span>Instant Scratch Cards</span>
                </button>
              </div>

              {/* Forward 7-Day Draw Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-stone-600">
                  <span className="uppercase tracking-wider">Draw Date Allocation:</span>
                  <span className="text-[#D64933] font-black">{selectedSaleDay.label} ({selectedSaleDay.dateStr})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                  {forwardDays.map(day => {
                    const isSelected = selectedSaleDay.offset === day.offset;
                    return (
                      <button
                        key={day.offset}
                        type="button"
                        onClick={() => setSelectedSaleDay(day)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#D64933] text-white border-[#D64933] shadow-xs'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        <span className="text-[10px] block opacity-80 uppercase">{day.weekday}</span>
                        <span className="text-xs font-black block">{day.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ticket Brands List with Stepper */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-600">
                  <span className="uppercase tracking-wider">Select Brands & Pack Quantities:</span>
                  <span>{categoryBrands.length} brands available</span>
                </div>

                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
                  {categoryBrands.map(b => {
                    const rate = currentSeller.tier === 'Tier A' ? b.tierAPrice : b.tierBPrice;
                    const packs = saleTicketCounts[b.id] || 0;
                    const tickets = packs * b.stockPerPack;
                    const lineTotal = tickets * rate;

                    return (
                      <div 
                        key={b.id} 
                        className={`p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          packs > 0 ? 'bg-orange-50/40' : 'hover:bg-stone-50/70'
                        }`}
                      >
                        {/* Brand Name & Pricing Info */}
                        <div className="flex items-center gap-3">
                          <div className={`w-3.5 h-10 rounded-full bg-gradient-to-b ${b.color || 'from-orange-500 to-amber-600'} shrink-0`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-black text-stone-900">{b.name}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                                {b.stockPerPack} tix/pack
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              Face Value: LKR {b.faceValue} • Rate: <strong className="text-stone-800">{formatLKR(rate)}/tix</strong> ({formatLKR(rate * b.stockPerPack)}/pack)
                            </div>
                          </div>
                        </div>

                        {/* Quantity Stepper & Subtotal */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto">
                          {/* Stepper */}
                          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleUpdatePackQty(b.id, -1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                              title="Decrease 1 Pack"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={packs || ''}
                              onChange={(e) => handleSetPackQty(b.id, parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-12 text-center text-xs font-mono font-black bg-white py-1 focus:outline-none"
                            />

                            <button
                              type="button"
                              onClick={() => handleUpdatePackQty(b.id, 1)}
                              className="w-8 h-8 flex items-center justify-center bg-[#D64933] hover:bg-[#bd3e2a] text-white transition-colors cursor-pointer"
                              title="Increase 1 Pack"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Pack Buttons */}
                          <div className="hidden sm:flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdatePackQty(b.id, 5)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdatePackQty(b.id, 10)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                            >
                              +10
                            </button>
                          </div>

                          {/* Line Subtotal */}
                          <div className="text-right min-w-[90px]">
                            <span className="text-[10px] text-stone-400 block uppercase">Subtotal</span>
                            <span className={`text-xs sm:text-sm font-mono font-black ${packs > 0 ? 'text-[#D64933]' : 'text-stone-400'}`}>
                              {formatLKR(lineTotal)}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional Dispatch Note */}
              <div>
                <input
                  type="text"
                  value={saleDispatchNote}
                  onChange={(e) => setSaleDispatchNote(e.target.value)}
                  placeholder="Optional dispatch note / route reference (e.g. Regular morning run)..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D64933]"
                />
              </div>

            </div>

            {/* Order Breakdown Footer & Confirmation Button */}
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-[#FAF8F5] shrink-0 space-y-3">
              
              {/* Totals & Debt Impact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-stone-500 font-medium">Allocated:</span>
                    <strong className="text-stone-900">{saleMath.totalPacks} Packs ({saleMath.totalTickets} Tickets)</strong>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-stone-500 font-medium">Debt Impact:</span>
                    <span className="font-mono">{formatLKR(currentCredit)}</span>
                    <span>→</span>
                    <span className={`font-mono font-bold ${saleMath.isProjectedExceeded ? 'text-rose-600' : 'text-stone-900'}`}>
                      {formatLKR(saleMath.projectedCredit)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-stone-500 block uppercase tracking-wider">Total Bill Amount</span>
                  <div className="text-xl sm:text-2xl font-black font-mono text-[#D64933]">
                    {formatLKR(saleMath.totalBill)}
                  </div>
                </div>
              </div>

              {/* Credit Limit Exceeded Warning */}
              {saleMath.isProjectedExceeded && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Exceeds credit limit by {formatLKR(saleMath.excess)}! Pack allocation cannot be confirmed until debt is settled.
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saleMath.totalPacks <= 0 || saleMath.isProjectedExceeded}
                  onClick={handleExecuteSale}
                  className={`px-6 py-2.5 rounded-full text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                    saleMath.totalPacks > 0 && !saleMath.isProjectedExceeded
                      ? 'bg-[#D64933] hover:bg-[#bd3e2a] text-white shadow-orange-500/20 active:scale-95'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Cloud className="w-4 h-4" />
                  <span>Confirm Order & Save to Cloud</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. POP-UP MODAL 2: PACK RETURN                                       */}
      {/* ==================================================================== */}
      {activeModal === 'RETURN' && (
        <ReturnModal
          currentSeller={currentSeller}
          brands={brands}
          onClose={() => setActiveModal(null)}
          onConfirm={(data) => {
            onConfirmReturn(data);
            setActiveModal(null);
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* 6. POP-UP MODAL 3: WINNING TICKETS OFFSET                            */}
      {/* ==================================================================== */}
      {activeModal === 'WINNING' && (
        <WinningModal
          currentSeller={currentSeller}
          onClose={() => setActiveModal(null)}
          onConfirm={(data) => {
            onConfirmWinning(data);
            setActiveModal(null);
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* 7. POP-UP MODAL 4: NON-WINNING STUBS DRAWBACK                        */}
      {/* ==================================================================== */}
      {activeModal === 'NON_WINNING' && (
        <NonWinningModal
          currentSeller={currentSeller}
          brands={brands}
          onClose={() => setActiveModal(null)}
          onConfirm={(data) => {
            onConfirmNonWinning(data);
            setActiveModal(null);
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* 8. POP-UP MODAL 5: PAY BY CASH DIRECT COLLECTION                     */}
      {/* ==================================================================== */}
      {activeModal === 'CASH' && (
        <CashModal
          currentSeller={currentSeller}
          currentAssistant={currentAssistant}
          onClose={() => setActiveModal(null)}
          onConfirm={(data) => {
            onConfirmCash(data);
            setActiveModal(null);
          }}
        />
      )}

    </div>
  );
};
