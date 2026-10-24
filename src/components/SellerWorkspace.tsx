import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Store, 
  MapPin, 
  Phone, 
  Lock, 
  CreditCard, 
  ShieldCheck, 
  Wallet, 
  TrendingUp, 
  Sparkles, 
  ShoppingBag, 
  RotateCcw, 
  Trophy, 
  Ticket, 
  Banknote, 
  ChevronRight, 
  FileText, 
  Printer,
  Calendar,
  Zap,
  Check,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt
} from 'lucide-react';
import { Seller, Assistant, Transaction, LotteryBrand, ForwardDay } from '../types';
import { formatLKR, getForward7Days } from '../utils/formatters';
import { RecentLedgerPage } from './RecentLedgerPage';

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
  activeActionId: externalActiveActionId,
  onSelectActionId
}) => {
  // Dedicated Full Page View for Recent Ledger Activity
  const [showLedgerPage, setShowLedgerPage] = useState(false);

  // Master-Detail Active Action State
  const [internalActionId, setInternalActionId] = useState<'3.1' | '3.2' | '3.3' | '3.4' | '3.5'>('3.1');
  const activeAction = externalActiveActionId || internalActionId;

  const setActiveAction = (id: '3.1' | '3.2' | '3.3' | '3.4' | '3.5') => {
    setInternalActionId(id);
    if (onSelectActionId) onSelectActionId(id);
  };

  const currentCredit = currentSeller.currentCredit;
  const creditLimit = currentSeller.creditLimit;
  const availableCredit = Math.max(0, creditLimit - currentCredit);
  const percent = Math.min(100, Math.round((currentCredit / (creditLimit || 1)) * 100));
  const isExceeded = currentCredit > creditLimit;

  // --------------------------------------------------------------------------
  // ACTION 3.1 STATE & LOGIC: SALE & DISPATCH
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

    // Reset local sale form
    setSaleTicketCounts({});
    setSaleDispatchNote('');
  };

  // --------------------------------------------------------------------------
  // ACTION 3.2 STATE & LOGIC: PACK RETURN
  // --------------------------------------------------------------------------
  const [returnCart, setReturnCart] = useState<Record<string, number>>({});
  const [returnReason, setReturnReason] = useState('Unsold pre-draw return');
  const [returnSerialBatch, setReturnSerialBatch] = useState('');

  const returnTotals = useMemo(() => {
    let totalPacks = 0;
    let totalRefund = 0;

    Object.entries(returnCart).forEach(([brandId, count]) => {
      const qty = count || 0;
      if (qty > 0) {
        const brand = brands.find(b => b.id === brandId);
        if (brand) {
          const tierPrice = currentSeller.tier === 'Tier A' ? brand.tierAPrice : brand.tierBPrice;
          const tickets = qty * brand.stockPerPack;
          totalPacks += qty;
          totalRefund += tickets * tierPrice;
        }
      }
    });

    const projectedCredit = Math.max(0, currentSeller.currentCredit - totalRefund);
    return { totalPacks, totalRefund, projectedCredit };
  }, [returnCart, brands, currentSeller]);

  const handleExecuteReturn = () => {
    if (returnTotals.totalPacks <= 0) return;

    const returnItems = Object.entries(returnCart)
      .filter(([_, qty]) => qty > 0)
      .map(([brandId, qty]) => {
        const brand = brands.find(b => b.id === brandId)!;
        const tierPrice = currentSeller.tier === 'Tier A' ? brand.tierAPrice : brand.tierBPrice;
        return {
          brandName: brand.name,
          packs: qty,
          rate: tierPrice,
          subtotal: qty * brand.stockPerPack * tierPrice
        };
      });

    onConfirmReturn({
      returnItems,
      totalPacks: returnTotals.totalPacks,
      totalRefund: returnTotals.totalRefund,
      reason: returnReason,
      batchRef: returnSerialBatch
    });

    setReturnCart({});
    setReturnSerialBatch('');
  };

  // --------------------------------------------------------------------------
  // ACTION 3.3 STATE & LOGIC: WINNING TICKETS
  // --------------------------------------------------------------------------
  const [winningAmounts, setWinningAmounts] = useState<Record<string, string>>({
    tier40: '',
    tier100: '',
    tier500: '',
    tier1000: '',
    tier5000: '',
    customPrize: ''
  });
  const [winningEnvelopeNo, setWinningEnvelopeNo] = useState(`ENV-${Math.floor(100 + Math.random() * 900)}`);
  const [winningTicketCount, setWinningTicketCount] = useState('');

  const totalWinningAmount = useMemo(() => {
    const t40 = (parseInt(winningAmounts.tier40) || 0) * 40;
    const t100 = (parseInt(winningAmounts.tier100) || 0) * 100;
    const t500 = (parseInt(winningAmounts.tier500) || 0) * 500;
    const t1000 = (parseInt(winningAmounts.tier1000) || 0) * 1000;
    const t5000 = (parseInt(winningAmounts.tier5000) || 0) * 5000;
    const custom = parseFloat(winningAmounts.customPrize) || 0;
    return t40 + t100 + t500 + t1000 + t5000 + custom;
  }, [winningAmounts]);

  const handleExecuteWinning = () => {
    if (totalWinningAmount <= 0) return;
    onConfirmWinning({
      totalWinningOffset: totalWinningAmount,
      envelopeNo: winningEnvelopeNo,
      ticketCount: winningTicketCount || 'Assorted Prize Vouchers',
      breakdown: winningAmounts
    });

    setWinningAmounts({ tier40: '', tier100: '', tier500: '', tier1000: '', tier5000: '', customPrize: '' });
    setWinningTicketCount('');
  };

  // --------------------------------------------------------------------------
  // ACTION 3.4 STATE & LOGIC: NON-WINNING STUBS
  // --------------------------------------------------------------------------
  const [nonWinningBrandId, setNonWinningBrandId] = useState(brands[0]?.id || 'b1');
  const [nonWinningStubCount, setNonWinningStubCount] = useState('');
  const [nonWinningReimburseRate, setNonWinningReimburseRate] = useState('1.50');
  const [nonWinningSchemeRef, setNonWinningSchemeRef] = useState('Lottery Board Drawback Claim');

  const totalNonWinningReimbursement = useMemo(() => {
    const stubs = parseInt(nonWinningStubCount) || 0;
    const rate = parseFloat(nonWinningReimburseRate) || 0;
    return stubs * rate;
  }, [nonWinningStubCount, nonWinningReimburseRate]);

  const handleExecuteNonWinning = () => {
    if (totalNonWinningReimbursement <= 0) return;
    const brand = brands.find(b => b.id === nonWinningBrandId);
    onConfirmNonWinning({
      brandName: brand?.name || 'Lottery',
      stubCount: nonWinningStubCount,
      ratePerStub: nonWinningReimburseRate,
      schemeRef: nonWinningSchemeRef,
      totalReimbursement: totalNonWinningReimbursement
    });

    setNonWinningStubCount('');
  };

  // --------------------------------------------------------------------------
  // ACTION 3.5 STATE & LOGIC: PAY BY CASH
  // --------------------------------------------------------------------------
  const [cashAmount, setCashAmount] = useState('');
  const [cashReference, setCashReference] = useState('');
  const parsedCashAmount = parseFloat(cashAmount) || 0;

  const handleExecuteCash = () => {
    if (parsedCashAmount <= 0) return;
    onConfirmCash({
      cashAmount: parsedCashAmount,
      reference: cashReference || 'Route Cash Collection'
    });

    setCashAmount('');
    setCashReference('');
  };

  // If viewing dedicated Recent Ledger Activity Page
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
    <div className="h-full flex flex-col min-h-0 overflow-hidden gap-2.5 animate-in fade-in duration-300 text-[#26201D]">
      
      {/* ---------------------------------------------------------------- */}
      {/* 1. TOP HEADER BANNER (FIGMA MATCHING WARM CREAM CARD)             */}
      {/* ---------------------------------------------------------------- */}
      <div className="figma-card rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3 border border-[#E6DDD4] bg-[#FAF8F5] shrink-0">
        
        {/* RETAILER INFO */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToDirectory}
              className="px-3 py-1 rounded-xl bg-white hover:bg-[#F5EFEB] text-[#26201D] flex items-center gap-1.5 border border-[#E6DDD4] text-xs font-bold transition-all shadow-xs"
              title="Back to Directory"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#26201D]" />
              <span>Directory</span>
            </button>

            <div className="w-8 h-8 rounded-xl bg-[#FAF0E9] border border-[#F4DEC9] text-[#D68A64] flex items-center justify-center shrink-0">
              <Store className="w-4 h-4" />
            </div>

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

        {/* TOP RIGHT FINANCIAL METRICS (3 DISTINCT CARDS AS IN FIGMA) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
          {/* Card 1: Debt */}
          <div className="bg-[#FDF2F0] border border-[#F9C9C2] rounded-xl p-2.5 min-w-[140px]">
            <span className="text-[9px] font-bold text-[#D64933] uppercase tracking-wider block">
              Current Debt Balance
            </span>
            <div className="text-base sm:text-lg font-black text-[#D64933] tracking-tight font-mono mt-0.5">
              <span className="text-xs font-bold mr-1">LKR</span>-{formatLKR(currentCredit).replace('LKR', '').trim()}
            </div>
          </div>

          {/* Card 2: Credit Limit */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-2.5 min-w-[140px]">
            <span className="text-[9px] font-bold text-[#16A34A] uppercase tracking-wider block">
              Assigned Credit Limit
            </span>
            <div className="text-base sm:text-lg font-black text-[#16A34A] tracking-tight font-mono mt-0.5">
              <span className="text-xs font-bold mr-1">LKR</span>{formatLKR(creditLimit).replace('LKR', '').trim()}
            </div>
          </div>

          {/* Card 3: Available Room + Progress */}
          <div className="bg-white border border-[#E6DDD4] rounded-xl p-2.5 min-w-[140px] flex flex-col justify-between">
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
      {/* 2. HORIZONTAL ACTION NAVIGATION BAR (MATCHING FIGMA PILLS)        */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 select-none shrink-0">
        {/* 3.1 Sale & Dispatch */}
        <button
          onClick={() => setActiveAction('3.1')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
            activeAction === '3.1'
              ? 'bg-[#D64933] text-white shadow-sm shadow-[#D64933]/20 font-extrabold'
              : 'bg-white hover:bg-[#F5EFEB] text-[#26201D] border border-[#E6DDD4]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>3.1 Sale & Dispatch</span>
          {activeAction === '3.1' && (
            <span className="bg-white/20 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase ml-1">
              Active
            </span>
          )}
        </button>

        {/* 3.2 Pack Return */}
        <button
          onClick={() => setActiveAction('3.2')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
            activeAction === '3.2'
              ? 'bg-[#D64933] text-white shadow-sm shadow-[#D64933]/20 font-extrabold'
              : 'bg-white hover:bg-[#F5EFEB] text-[#26201D] border border-[#E6DDD4]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>3.2 Pack Return</span>
          {activeAction === '3.2' && (
            <span className="bg-white/20 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase ml-1">
              Active
            </span>
          )}
        </button>

        {/* 3.3 Winning Tickets */}
        <button
          onClick={() => setActiveAction('3.3')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
            activeAction === '3.3'
              ? 'bg-[#D64933] text-white shadow-sm shadow-[#D64933]/20 font-extrabold'
              : 'bg-white hover:bg-[#F5EFEB] text-[#26201D] border border-[#E6DDD4]'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>3.3 Winning Tickets</span>
          {activeAction === '3.3' && (
            <span className="bg-white/20 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase ml-1">
              Active
            </span>
          )}
        </button>

        {/* 3.4 Non-Winning Audit */}
        <button
          onClick={() => setActiveAction('3.4')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
            activeAction === '3.4'
              ? 'bg-[#D64933] text-white shadow-sm shadow-[#D64933]/20 font-extrabold'
              : 'bg-white hover:bg-[#F5EFEB] text-[#26201D] border border-[#E6DDD4]'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>3.4 Non-Winning Audit</span>
          {activeAction === '3.4' && (
            <span className="bg-white/20 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase ml-1">
              Active
            </span>
          )}
        </button>

        {/* 3.5 Pay by Cash */}
        <button
          onClick={() => setActiveAction('3.5')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
            activeAction === '3.5'
              ? 'bg-[#D64933] text-white shadow-sm shadow-[#D64933]/20 font-extrabold'
              : 'bg-white hover:bg-[#F5EFEB] text-[#26201D] border border-[#E6DDD4]'
          }`}
        >
          <Banknote className="w-3.5 h-3.5" />
          <span>3.5 Pay by Cash</span>
          {activeAction === '3.5' && (
            <span className="bg-white/20 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase ml-1">
              Active
            </span>
          )}
        </button>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 3. TWO-COLUMN WORKSPACE BODY (MATCHING FIGMA 2-COLUMN LAYOUT)     */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-stretch overflow-hidden">
        
        {/* ============================================================= */}
        {/* COLUMN LEFT (LG:COL-SPAN-8): ACTIVE ACTION FORM               */}
        {/* ============================================================= */}
        <div className="lg:col-span-8 w-full min-w-0 border border-[#E6DDD4] shadow-xs bg-[#FAF8F5] rounded-2xl p-3 sm:p-4 h-full flex flex-col min-h-0 overflow-hidden relative z-0">
            
            {/* SUB-PAGE 3.1: SALE & DISPATCH */}
            {activeAction === '3.1' && (
              <div className="h-full flex flex-col min-h-0 gap-2.5 animate-in fade-in duration-200">
                {/* Header Card */}
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF0E9] border border-[#F4DEC9] text-[#D68A64] flex items-center justify-center font-bold shadow-xs">
                      <ShoppingBag className="w-4 h-4 text-[#D68A64]" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-[#26201D]">
                        Action 3.1 • Ticket Sale & Dispatch
                      </h4>
                      <p className="text-[11px] text-[#7F7266] font-medium">
                        Allocate daily lottery draw packs & instant scratch cards for retailer distribution
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSaleTicketCounts({});
                      setSaleDispatchNote('');
                    }}
                    className="p-1.5 rounded-lg text-[#9F9184] hover:text-[#26201D] hover:bg-[#F5EFEB] transition-colors"
                    title="Reset Form"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Category Switcher (2 Wide Tabs as in Figma) */}
                <div className="grid grid-cols-2 gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSaleCategory('daily')}
                    className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      saleCategory === 'daily'
                        ? 'border-2 border-[#D64933] bg-white text-[#D64933] shadow-xs'
                        : 'border border-[#E6DDD4] bg-white text-[#7F7266] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <Calendar className={`w-4 h-4 ${saleCategory === 'daily' ? 'text-[#D64933]' : 'text-[#7F7266]'}`} />
                    <span>Daily Draw Lotteries (100-pack)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSaleCategory('scratch')}
                    className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      saleCategory === 'scratch'
                        ? 'border-2 border-[#D64933] bg-white text-[#D64933] shadow-xs'
                        : 'border border-[#E6DDD4] bg-white text-[#7F7266] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <Zap className={`w-4 h-4 ${saleCategory === 'scratch' ? 'text-[#D64933]' : 'text-[#D68A64]'}`} />
                    <span>Instant Scratch Cards</span>
                  </button>
                </div>

                {/* Draw Date Allocation - ONLY for Daily Draw! (Hidden for Instant Scratch Cards) */}
                {saleCategory === 'daily' && (
                  <div className="space-y-1.5 shrink-0">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[10px] text-[#7F7266] uppercase tracking-wider">
                        Draw Date Allocation
                      </span>
                      <span className="text-xs text-[#D64933] font-bold">
                        Selected: {selectedSaleDay.isToday ? 'Today' : `Today + ${selectedSaleDay.dayIndex - 1}`} ({selectedSaleDay.weekday}, {selectedSaleDay.dayMonthStr})
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {forwardDays.slice(0, 7).map((d, idx) => {
                        const isSelected = selectedSaleDay.dayIndex === d.dayIndex;
                        const labelTop = idx === 0 ? 'Today' : `Today + ${idx}`;
                        return (
                          <button
                            key={d.dayIndex}
                            type="button"
                            onClick={() => setSelectedSaleDay(d)}
                            className={`py-1.5 px-1 rounded-xl text-center border transition-all flex flex-col items-center justify-center leading-tight ${
                              isSelected
                                ? 'bg-[#D64933] text-white border-[#D64933] shadow-sm shadow-[#D64933]/20 font-black'
                                : 'bg-white hover:bg-[#F5EFEB] border-[#E6DDD4] text-[#26201D]'
                            }`}
                          >
                            <span className={`text-[10px] font-extrabold tracking-tight ${isSelected ? 'text-white' : 'text-[#D64933]'}`}>
                              {labelTop}
                            </span>
                            <span className="text-xs font-black tracking-tight my-0.5">
                              {d.dayMonthStr}
                            </span>
                            <span className={`text-[9px] font-semibold ${isSelected ? 'text-white/80' : 'text-[#7F7266]'}`}>
                              {d.weekday.slice(0, 3)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Brands Pack Allocator Header */}
                <div className="flex items-center justify-between text-xs font-bold shrink-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#7F7266] uppercase tracking-wider font-extrabold">
                      Select Brands & Pack Quantities
                    </span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#FAF0E9] text-[#D64933] border border-[#F4DEC9]">
                      {categoryBrands.length} Brands Available
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#7F7266]">
                    Depot Batch: #COL-2024-04F
                  </span>
                </div>
                
                {/* Scrollable Brands List inside Left Column (Scrollable for 10+ tickets) */}
                <div 
                  className="flex-1 min-h-[220px] max-h-[360px] sm:max-h-[420px] lg:max-h-[480px] overflow-y-scroll space-y-2 pr-2 custom-scrollbar rounded-xl focus:outline-none"
                  tabIndex={0}
                  style={{ scrollbarGutter: 'stable' }}
                >
                  {categoryBrands.map((brand) => {
                    const tierPrice = currentSeller.tier === 'Tier A' ? brand.tierAPrice : brand.tierBPrice;
                    const count = saleTicketCounts[brand.id] || 0;
                    const subtotal = count * brand.stockPerPack * tierPrice;

                    return (
                      <div
                        key={brand.id}
                        className="p-3 rounded-2xl bg-white border border-[#E6DDD4] hover:border-[#D68A64] flex items-center justify-between gap-3 shadow-2xs transition-all"
                      >
                        {/* Left: Brand Emblem + Details */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-8 rounded-full bg-gradient-to-r from-purple-800 to-indigo-900 border-2 border-amber-400 text-amber-300 flex items-center justify-center font-bold text-[9px] shadow-xs shrink-0 tracking-tighter">
                            {brand.name.slice(0, 8)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-sm text-[#26201D] truncate">{brand.name}</h5>
                              <span className="text-[9px] text-[#7F7266] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF0E9] border border-[#E6DDD4]">
                                {brand.stockPerPack} TIX/PACK
                              </span>
                            </div>
                            <span className="text-[11px] text-[#7F7266] block font-medium mt-0.5">
                              Rate: <strong className="text-[#26201D]">{formatLKR(tierPrice)}/tix</strong> • Pack: {formatLKR(tierPrice * brand.stockPerPack)}
                            </span>
                          </div>
                        </div>

                        {/* Right: Counter + Line Subtotal */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#E6DDD4] rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => setSaleTicketCounts(prev => ({ ...prev, [brand.id]: Math.max(0, count - 1) }))}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-[#F2ECE4] text-[#26201D] flex items-center justify-center font-bold text-sm border border-[#E6DDD4] shadow-xs transition-all"
                            >
                              –
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={count === 0 ? '' : count}
                              placeholder="0"
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setSaleTicketCounts(prev => ({ ...prev, [brand.id]: Math.max(0, val) }));
                              }}
                              className="w-9 text-center text-xs font-black text-[#26201D] bg-transparent focus:outline-none font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setSaleTicketCounts(prev => ({ ...prev, [brand.id]: count + 1 }))}
                              className="w-7 h-7 rounded-lg bg-[#D64933] hover:bg-[#BE3823] text-white flex items-center justify-center font-bold text-sm transition-colors shadow-xs"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right min-w-[80px]">
                            <span className="text-[8px] font-bold text-[#7F7266] uppercase block">
                              Line Subtotal
                            </span>
                            <span className="font-mono font-black text-xs text-[#26201D] block mt-0.5">
                              {formatLKR(subtotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom of Action 3.1: Note + Warning (shrink-0) */}
                <div className="shrink-0 space-y-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Optional dispatch note / route reference..."
                    value={saleDispatchNote}
                    onChange={(e) => setSaleDispatchNote(e.target.value)}
                    className="w-full bg-white border border-[#E6DDD4] rounded-xl px-3 py-1.5 text-xs text-[#26201D] placeholder-[#9F9184] focus:outline-none focus:border-[#D64933] transition-colors shadow-xs"
                  />

                  {saleMath.isProjectedExceeded && (
                    <div className="p-2.5 rounded-xl bg-[#FDF2F0] border border-[#F9C9C2] text-[#D64933] text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#D64933]" />
                      <span>
                        <strong>Credit Ceilings Exceeded!</strong> This dispatch exceeds limit by{' '}
                        <strong>{formatLKR(saleMath.excess)}</strong>.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-PAGE 3.2: PACK RETURN */}
            {activeAction === '3.2' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center font-bold shadow-sm">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900">
                        Action 3.2 • Unsold Pack Return
                      </h4>
                      <p className="text-xs text-gray-500 font-medium">
                        Accept unsold, un-scratched, or pre-draw ticket packs to credit back the retailer's balance
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setReturnCart({});
                      setReturnSerialBatch('');
                    }}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Reset Form"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Packs Returning by Brand
                  </span>
                  
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {brands.map((brand) => {
                      const tierPrice = currentSeller.tier === 'Tier A' ? brand.tierAPrice : brand.tierBPrice;
                      const count = returnCart[brand.id] || 0;
                      const subtotal = count * brand.stockPerPack * tierPrice;

                      return (
                        <div
                          key={brand.id}
                          className="p-3.5 rounded-2xl bg-white border border-gray-200 flex items-center justify-between gap-3 text-gray-900 shadow-sm"
                        >
                          <div className="min-w-0">
                            <h5 className="font-bold text-sm text-gray-900 truncate">{brand.name}</h5>
                            <span className="text-[10px] text-gray-500 block font-medium">
                              Refund Rate: {formatLKR(tierPrice)}/tix
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
                              <button
                                type="button"
                                onClick={() => setReturnCart(prev => ({ ...prev, [brand.id]: Math.max(0, count - 1) }))}
                                className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm border border-gray-200"
                              >
                                –
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={count === 0 ? '' : count}
                                placeholder="0"
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setReturnCart(prev => ({ ...prev, [brand.id]: Math.max(0, val) }));
                                }}
                                className="w-12 text-center text-xs font-bold text-gray-900 bg-transparent focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setReturnCart(prev => ({ ...prev, [brand.id]: count + 1 }))}
                                className="w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center font-bold text-sm"
                              >
                                +
                              </button>
                            </div>

                            <span className="w-24 text-right font-mono font-bold text-xs text-cyan-700">
                              -{formatLKR(subtotal)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Batch / Serial barcode verification..."
                    value={returnSerialBatch}
                    onChange={(e) => setReturnSerialBatch(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 shadow-sm"
                  />
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-orange-500 shadow-sm"
                  >
                    <option value="Unsold pre-draw return">Unsold pre-draw return</option>
                    <option value="Draw cutoff reached">Draw cutoff reached</option>
                    <option value="Damaged / Weather spoiled">Damaged / Weather spoiled</option>
                    <option value="Stock reallocation">Stock reallocation</option>
                  </select>
                </div>

                {/* Bottom Confirmation Bar */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                      TOTAL CREDIT REDUCTION
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-cyan-400">
                      -{formatLKR(returnTotals.totalRefund)}
                      <span className="text-xs text-slate-400 font-medium ml-2">
                        ({returnTotals.totalPacks} packs returned)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteReturn}
                    disabled={returnTotals.totalPacks <= 0}
                    className={`px-6 py-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md ${
                      returnTotals.totalPacks > 0
                        ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white shadow-cyan-600/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Pack Return (–Debt Offset)</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUB-PAGE 3.3: WINNING TICKETS */}
            {activeAction === '3.3' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold shadow-sm">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900">
                        Action 3.3 • Pay by Winning Tickets Offset
                      </h4>
                      <p className="text-xs text-gray-500 font-medium">
                        Retailer hands over verified customer prize vouchers. Amount offsets retailer debt and is added to handover vouchers.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setWinningAmounts({ tier40: '', tier100: '', tier500: '', tier1000: '', tier5000: '', customPrize: '' });
                      setWinningTicketCount('');
                    }}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Reset Form"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Denomination Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'tier40', label: 'LKR 40 Prize', multiplier: 40 },
                    { key: 'tier100', label: 'LKR 100 Prize', multiplier: 100 },
                    { key: 'tier500', label: 'LKR 500 Prize', multiplier: 500 },
                    { key: 'tier1000', label: 'LKR 1,000 Prize', multiplier: 1000 },
                    { key: 'tier5000', label: 'LKR 5,000 Prize', multiplier: 5000 },
                  ].map((denom) => {
                    const count = parseInt(winningAmounts[denom.key]) || 0;
                    return (
                      <div key={denom.key} className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase block">{denom.label}</span>
                        <div className="flex items-center justify-between">
                          <input
                            type="number"
                            min="0"
                            placeholder="Qty"
                            value={winningAmounts[denom.key]}
                            onChange={(e) => setWinningAmounts(prev => ({ ...prev, [denom.key]: e.target.value }))}
                            className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-orange-500"
                          />
                          <span className="text-xs font-mono font-bold text-orange-600">
                            {formatLKR(count * denom.multiplier)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-200 space-y-1">
                    <span className="text-[10px] font-bold text-orange-700 uppercase block">High Tier / Custom</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="LKR Amount"
                      value={winningAmounts.customPrize}
                      onChange={(e) => setWinningAmounts(prev => ({ ...prev, customPrize: e.target.value }))}
                      className="w-full bg-white border border-orange-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-orange-700 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Envelope No. & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Sealed Depot Envelope No.
                    </label>
                    <input
                      type="text"
                      value={winningEnvelopeNo}
                      onChange={(e) => setWinningEnvelopeNo(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 font-mono font-bold focus:outline-none focus:border-orange-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Batch Description / Ticket Summary
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 35 Govisetha + 10 Scratch prize tickets"
                      value={winningTicketCount}
                      onChange={(e) => setWinningTicketCount(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-orange-500 shadow-sm"
                    />
                  </div>
                </div>

                {/* Bottom Confirmation Bar */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                      TOTAL PRIZE CLAIM OFFSET
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-amber-400">
                      -{formatLKR(totalWinningAmount)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteWinning}
                    disabled={totalWinningAmount <= 0}
                    className={`px-6 py-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md ${
                      totalWinningAmount > 0
                        ? 'neon-gradient-btn text-white shadow-orange-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Prize Offset (–Debt Offset)</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUB-PAGE 3.4: NON-WINNING STUBS */}
            {activeAction === '3.4' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold shadow-sm">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900">
                        Action 3.4 • Non-Winning Stubs Drawback
                      </h4>
                      <p className="text-xs text-gray-500 font-medium">
                        Lottery board drawback promotional reimbursement credited directly against seller debt
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setNonWinningStubCount('');
                    }}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Reset Form"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Lottery Brand
                    </label>
                    <select
                      value={nonWinningBrandId}
                      onChange={(e) => setNonWinningBrandId(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-orange-500 shadow-sm"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id} className="text-gray-900">{b.name} ({b.type === 'daily' ? 'Daily' : 'Scratch'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Returned Stub Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 500"
                      value={nonWinningStubCount}
                      onChange={(e) => setNonWinningStubCount(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 font-bold focus:outline-none focus:border-orange-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Reimbursement Rate / Stub (LKR)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={nonWinningReimburseRate}
                      onChange={(e) => setNonWinningReimburseRate(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 font-bold focus:outline-none focus:border-orange-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Scheme Reference / Batch Code
                    </label>
                    <input
                      type="text"
                      value={nonWinningSchemeRef}
                      onChange={(e) => setNonWinningSchemeRef(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-orange-500 shadow-sm"
                    />
                  </div>
                </div>

                {/* Bottom Confirmation Bar */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                      TOTAL REIMBURSEMENT CREDIT
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-rose-400">
                      -{formatLKR(totalNonWinningReimbursement)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteNonWinning}
                    disabled={totalNonWinningReimbursement <= 0}
                    className={`px-6 py-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md ${
                      totalNonWinningReimbursement > 0
                        ? 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white shadow-rose-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Stub Drawback (–Debt Offset)</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUB-PAGE 3.5: PAY BY CASH */}
            {activeAction === '3.5' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shadow-sm">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900">
                        Action 3.5 • Pay by Cash Direct Collection
                      </h4>
                      <p className="text-xs text-gray-500 font-medium">
                        Physical route cash collection. Directly clears retailer debt and records into {currentAssistant.shortName}'s handover balance.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCashAmount('');
                      setCashReference('');
                    }}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Reset Form"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Quick Settlement Presets
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCashAmount(currentSeller.currentCredit.toString())}
                      className="px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
                    >
                      Clear Full Debt ({formatLKR(currentSeller.currentCredit)})
                    </button>
                    {['10000', '25000', '50000', '100000'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCashAmount(val)}
                        className="px-4 py-2 rounded-full bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 transition-colors shadow-xs"
                      >
                        +{formatLKR(parseFloat(val))}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Tender Input & Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Cash Amount Tendered (LKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-lg font-black text-emerald-600 focus:outline-none focus:border-orange-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Cash Receipt / Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Field receipt #RC-491 or Cashier Handover"
                      value={cashReference}
                      onChange={(e) => setCashReference(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 shadow-sm"
                    />
                  </div>
                </div>

                {/* Balance Impact Strip */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">Current Debt</span>
                    <span className="font-extrabold text-rose-600">{formatLKR(currentCredit)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">New Debt After Payment</span>
                    <span className="font-extrabold text-emerald-600">
                      {formatLKR(Math.max(0, currentCredit - parsedCashAmount))}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">Rep Handover in Hand</span>
                    <span className="font-extrabold text-gray-900">
                      {formatLKR(currentAssistant.cashInHand + parsedCashAmount)}
                    </span>
                  </div>
                </div>

                {/* Bottom Confirmation Bar */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                      TOTAL CASH COLLECTED
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400">
                      -{formatLKR(parsedCashAmount)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteCash}
                    disabled={parsedCashAmount <= 0}
                    className={`px-6 py-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md ${
                      parsedCashAmount > 0
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Cash Collection (–Debt Clear)</span>
                  </button>
                </div>
              </div>
            )}

        </div>

        {/* ============================================================= */}
        {/* COLUMN RIGHT (LG:COL-SPAN-4): FIGMA CHECKOUT & ACTIONS CARD   */}
        {/* ============================================================= */}
        <div className="w-full lg:col-span-4 shrink-0 h-full flex flex-col min-h-0 overflow-y-auto space-y-2.5 pr-0.5 custom-scrollbar">
          
          {/* Top: Recent Ledger Activity Pill Button (Matching Figma Screenshot) */}
          <button
            type="button"
            onClick={() => setShowLedgerPage(true)}
            className="w-full py-2 px-4 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E6DDD4] text-[#26201D] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all hover:border-[#D64933] cursor-pointer shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-[#D68A64]" />
            <span>Recent Ledger Activity</span>
          </button>

          {/* TOTAL DISPATCH VALUE CARD (FIGMA MATCHING CHECKOUT CARD) */}
          {activeAction === '3.1' && (
            <div className="space-y-2 flex-1 flex flex-col justify-between">
              <div className="figma-card rounded-2xl p-3.5 border border-[#E6DDD4] bg-[#FAF8F5] text-[#26201D] space-y-2 shadow-xs shrink-0">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F7266]">
                      Total Dispatch Value
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E6DDD4] text-[#7F7266]">
                      {saleMath.totalPacks} packs • {saleMath.totalTickets} tickets
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#26201D] tracking-tight mt-0.5 font-mono">
                    <span className="text-base font-bold mr-1 text-[#7F7266]">LKR</span>
                    {formatLKR(saleMath.totalBill).replace('LKR', '').trim()}
                  </div>
                </div>

                {/* Debt & Ceiling Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-[#E6DDD4] text-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#7F7266] font-medium">Current Outstanding Debt</span>
                    <span className="font-extrabold text-[#D64933] font-mono">LKR {formatLKR(currentCredit).replace('LKR', '').trim()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#7F7266] font-medium">Assigned Maximum Ceiling</span>
                    <span className="font-bold text-[#26201D] font-mono">LKR {formatLKR(creditLimit).replace('LKR', '').trim()}</span>
                  </div>
                  <div className="pt-1.5 border-t border-[#E6DDD4] flex justify-between items-center">
                    <span className="font-bold text-[#26201D]">Projected Post-Dispatch</span>
                    <span className="font-black text-xs sm:text-sm text-[#D64933] font-mono">
                      LKR {formatLKR(currentCredit + saleMath.totalBill).replace('LKR', '').trim()}
                    </span>
                  </div>
                </div>

                {/* Credit Status Card (Green Pass or Red Exceeded) */}
                {!saleMath.isProjectedExceeded ? (
                  <div className="p-2 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5 font-black">
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Credit Check Passed</span>
                    </div>
                    <p className="text-[10px] font-semibold text-[#16A34A] pl-5">
                      Remaining room: LKR {formatLKR(Math.max(0, creditLimit - (currentCredit + saleMath.totalBill))).replace('LKR', '').trim()}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-[#FDF2F0] border border-[#F9C9C2] text-[#D64933] text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5 font-black">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#D64933]" />
                      <span>Credit Limit Exceeded</span>
                    </div>
                    <p className="text-[10px] font-semibold text-[#D64933] pl-5">
                      Excess: LKR {formatLKR(saleMath.excess).replace('LKR', '').trim()}
                    </p>
                  </div>
                )}

                {/* Primary CTA: Confirm & Issue Packs */}
                <button
                  type="button"
                  onClick={handleExecuteSale}
                  disabled={saleMath.totalBill <= 0 || saleMath.isProjectedExceeded}
                  className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
                    saleMath.totalBill > 0 && !saleMath.isProjectedExceeded
                      ? 'bg-[#D64933] hover:bg-[#BE3823] text-white shadow-[#D64933]/25 cursor-pointer'
                      : 'bg-[#E6DDD4] text-[#9F9184] cursor-not-allowed shadow-none'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Issue Packs</span>
                </button>

                {/* Secondary CTA: Print 80mm Dispatch Slip */}
                <button
                  type="button"
                  onClick={onOpenFinalReceipt}
                  className="w-full py-2 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-[#FAF8F5] border border-[#E6DDD4] text-[#26201D] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#7F7266]" />
                  <span>Print 80mm Dispatch Slip</span>
                </button>

                {/* Cancel Dispatch Link */}
                <button
                  type="button"
                  onClick={() => {
                    setSaleTicketCounts({});
                    setSaleDispatchNote('');
                  }}
                  className="w-full text-center text-xs font-bold text-[#7F7266] hover:text-[#26201D] transition-colors cursor-pointer py-1"
                >
                  Cancel Dispatch
                </button>
              </div>

              {/* OVERALL ORDER AMOUNT & FULL BILL CARD (ALL ORDERING ELEMENTS PLACED AS REQUESTED) */}
              <div className="figma-card rounded-2xl p-4 border border-[#E6DDD4] bg-white text-[#26201D] space-y-3.5 shadow-xs my-1">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF0E9] border border-[#F4DEC9] text-[#D64933] flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4 text-[#D64933]" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-[#26201D] block">
                        Full Order & Bill Breakdown
                      </span>
                      <span className="text-[11px] text-[#7F7266] font-medium">
                        Live Session Reconciliation
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#FAF0E9] text-[#D64933] border border-[#F4DEC9]">
                    {saleMath.totalPacks} Packs
                  </span>
                </div>

                {/* Big Prominent Full Bill Amount Highlight */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6DDD4] space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-black uppercase tracking-wider text-[#7F7266]">
                      Full Bill Amount (Net):
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-[#26201D] font-mono tracking-tight">
                      <span className="text-sm font-bold text-[#7F7266] mr-1">LKR</span>
                      {formatLKR(Math.max(0, saleMath.totalBill - (returnTotals.totalRefund + totalWinningAmount + totalNonWinningReimbursement + parsedCashAmount))).replace('LKR', '').trim()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#7F7266] font-medium pt-0.5 border-t border-[#E6DDD4]/60">
                    <span>Gross: LKR {formatLKR(saleMath.totalBill).replace('LKR', '').trim()}</span>
                    <span>Offsets: -LKR {formatLKR(returnTotals.totalRefund + totalWinningAmount + totalNonWinningReimbursement + parsedCashAmount).replace('LKR', '').trim()}</span>
                  </div>
                </div>

                {/* ALL ORDERING ELEMENTS PERMANENTLY PLACED */}
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#7F7266] block">
                    All Ordering Elements
                  </span>

                  {/* 1. Ticket Dispatch */}
                  <div 
                    onClick={() => setActiveAction('3.1')}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F5EFEB] border border-[#E6DDD4] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#D64933] shrink-0" />
                      <div>
                        <span className="font-bold text-[#26201D] block leading-tight">1. Gross Dispatch</span>
                        <span className="text-[10px] text-[#7F7266]">{saleMath.totalPacks} packs ({saleMath.totalTickets} tix)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-[#26201D] font-mono block">
                        +LKR {formatLKR(saleMath.totalBill).replace('LKR', '').trim()}
                      </span>
                      <span className="text-[9px] font-bold text-[#D64933]">3.1 Sale ›</span>
                    </div>
                  </div>

                  {/* 2. Returning */}
                  <div 
                    onClick={() => setActiveAction('3.2')}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F5EFEB] border border-[#E6DDD4] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <div>
                        <span className="font-bold text-[#26201D] block leading-tight">2. Unsold Pack Returns</span>
                        <span className="text-[10px] text-[#7F7266]">{returnTotals.totalPacks} packs returned</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-black font-mono block ${returnTotals.totalRefund > 0 ? 'text-cyan-700' : 'text-[#7F7266]'}`}>
                        -LKR {formatLKR(returnTotals.totalRefund).replace('LKR', '').trim()}
                      </span>
                      <span className="text-[9px] font-bold text-cyan-700">{returnTotals.totalPacks > 0 ? 'Edit ›' : '+ Add ›'}</span>
                    </div>
                  </div>

                  {/* 3. Winning */}
                  <div 
                    onClick={() => setActiveAction('3.3')}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F5EFEB] border border-[#E6DDD4] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold text-[#26201D] block leading-tight">3. Winning Tickets Offset</span>
                        <span className="text-[10px] text-[#7F7266]">{totalWinningAmount > 0 ? 'Prize claims added' : '0 vouchers claimed'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-black font-mono block ${totalWinningAmount > 0 ? 'text-amber-700' : 'text-[#7F7266]'}`}>
                        -LKR {formatLKR(totalWinningAmount).replace('LKR', '').trim()}
                      </span>
                      <span className="text-[9px] font-bold text-amber-700">{totalWinningAmount > 0 ? 'Edit ›' : '+ Add ›'}</span>
                    </div>
                  </div>

                  {/* 4. Non-Winning Stubs */}
                  <div 
                    onClick={() => setActiveAction('3.4')}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F5EFEB] border border-[#E6DDD4] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <div>
                        <span className="font-bold text-[#26201D] block leading-tight">4. Non-Winning Drawback</span>
                        <span className="text-[10px] text-[#7F7266]">{nonWinningStubCount || 0} stubs returned</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-black font-mono block ${totalNonWinningReimbursement > 0 ? 'text-rose-700' : 'text-[#7F7266]'}`}>
                        -LKR {formatLKR(totalNonWinningReimbursement).replace('LKR', '').trim()}
                      </span>
                      <span className="text-[9px] font-bold text-rose-700">{totalNonWinningReimbursement > 0 ? 'Edit ›' : '+ Add ›'}</span>
                    </div>
                  </div>

                  {/* 5. Cash */}
                  <div 
                    onClick={() => setActiveAction('3.5')}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F5EFEB] border border-[#E6DDD4] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-[#26201D] block leading-tight">5. Cash Payment</span>
                        <span className="text-[10px] text-[#7F7266]">{parsedCashAmount > 0 ? 'Cash settlement' : 'No cash tendered'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-black font-mono block ${parsedCashAmount > 0 ? 'text-emerald-700' : 'text-[#7F7266]'}`}>
                        -LKR {formatLKR(parsedCashAmount).replace('LKR', '').trim()}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700">{parsedCashAmount > 0 ? 'Edit ›' : '+ Add ›'}</span>
                    </div>
                  </div>

                  {/* Summary Debt Impact */}
                  <div className="pt-2 border-t border-[#E6DDD4] space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#7F7266] font-medium">Previous Balance:</span>
                      <span className="font-extrabold text-[#26201D] font-mono">
                        LKR {formatLKR(currentCredit).replace('LKR', '').trim()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-[#26201D]">Post-Order Debt:</span>
                      <span className="font-black text-sm text-[#D64933] font-mono">
                        LKR {formatLKR(Math.max(0, currentCredit + saleMath.totalBill - (returnTotals.totalRefund + totalWinningAmount + totalNonWinningReimbursement + parsedCashAmount))).replace('LKR', '').trim()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Red Button: Preview and Print Final Slip (Matching Figma Screenshot) */}
              <button
                type="button"
                onClick={onOpenFinalReceipt}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#D64933] hover:bg-[#BE3823] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md shadow-[#D64933]/25 transition-all cursor-pointer shrink-0 min-h-[48px]"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Preview and Print Final Slip</span>
              </button>
            </div>
          )}

          {/* DYNAMIC CARD FOR RETURN 3.2 */}
          {activeAction === '3.2' && (
            <div className="glass-panel-elevated rounded-3xl p-5 border border-gray-200 text-gray-900 space-y-3.5 shadow-sm">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                  Total Return Credit
                </span>
                <div className="text-xl sm:text-2xl font-black text-cyan-600 mt-0.5">
                  -{formatLKR(returnTotals.totalRefund)}
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  ({returnTotals.totalPacks} packs returned)
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>New Debt:</span>
                  <span className="font-bold text-gray-900">{formatLKR(Math.max(0, currentCredit - returnTotals.totalRefund))}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteReturn}
                disabled={returnTotals.totalRefund <= 0}
                className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md ${
                  returnTotals.totalRefund > 0
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white shadow-cyan-600/20'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirm Return</span>
              </button>
            </div>
          )}

          {/* DYNAMIC CARD FOR WINNING 3.3 */}
          {activeAction === '3.3' && (
            <div className="glass-panel-elevated rounded-3xl p-5 border border-gray-200 text-gray-900 space-y-3.5 shadow-sm">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                  Total Prize Offset
                </span>
                <div className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">
                  -{formatLKR(totalWinningAmount)}
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  Winning Voucher Claims
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>New Debt:</span>
                  <span className="font-bold text-gray-900">{formatLKR(Math.max(0, currentCredit - totalWinningAmount))}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteWinning}
                disabled={totalWinningAmount <= 0}
                className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md ${
                  totalWinningAmount > 0
                    ? 'neon-gradient-btn text-white'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirm Winning</span>
              </button>
            </div>
          )}

          {/* DYNAMIC CARD FOR NON-WINNING 3.4 */}
          {activeAction === '3.4' && (
            <div className="glass-panel-elevated rounded-3xl p-5 border border-gray-200 text-gray-900 space-y-3.5 shadow-sm">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                  Total Drawback Credit
                </span>
                <div className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">
                  -{formatLKR(totalNonWinningReimbursement)}
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  ({nonWinningStubCount || 0} stubs returned)
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>New Debt:</span>
                  <span className="font-bold text-gray-900">{formatLKR(Math.max(0, currentCredit - totalNonWinningReimbursement))}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteNonWinning}
                disabled={totalNonWinningReimbursement <= 0}
                className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md ${
                  totalNonWinningReimbursement > 0
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirm Drawback</span>
              </button>
            </div>
          )}

          {/* DYNAMIC CARD FOR CASH 3.5 */}
          {activeAction === '3.5' && (
            <div className="glass-panel-elevated rounded-3xl p-5 border border-gray-200 text-gray-900 space-y-3.5 shadow-sm">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                  Total Cash Settlement
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
                  -{formatLKR(parsedCashAmount)}
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  Direct Cash Handover
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>New Debt:</span>
                  <span className="font-bold text-gray-900">{formatLKR(Math.max(0, currentCredit - parsedCashAmount))}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteCash}
                disabled={parsedCashAmount <= 0}
                className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md ${
                  parsedCashAmount > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirm Cash</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
