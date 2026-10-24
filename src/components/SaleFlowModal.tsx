import React, { useState, useMemo } from 'react';
import { ArrowLeft, CalendarDays, Zap, Calendar, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { LotteryBrand, Seller, ForwardDay } from '../types';
import { formatLKR, getForward7Days } from '../utils/formatters';

interface SaleFlowModalProps {
  currentSeller: Seller;
  brands: LotteryBrand[];
  onBack: () => void;
  onConfirmDispatch: (data: {
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
}

export const SaleFlowModal: React.FC<SaleFlowModalProps> = ({
  currentSeller,
  brands,
  onBack,
  onConfirmDispatch
}) => {
  const [subStep, setSubStep] = useState<'CATEGORY' | 'DATES_AND_TICKETS'>('CATEGORY');
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
    const isExceeded = projectedCredit > currentSeller.creditLimit;
    const excess = isExceeded ? projectedCredit - currentSeller.creditLimit : 0;

    return { totalPacks, totalTickets, totalBill, projectedCredit, isExceeded, excess };
  }, [saleTicketCounts, brands, currentSeller]);

  const handleConfirm = () => {
    if (saleMath.totalPacks <= 0 || saleMath.isExceeded) return;

    const itemSnapshots = Object.entries(saleTicketCounts)
      .filter(([_, qty]) => qty > 0)
      .map(([brandId, qty]) => {
        const brand = brands.find(b => b.id === brandId)!;
        const tierPrice = currentSeller.tier === 'Tier A' ? brand.tierAPrice : brand.tierBPrice;
        return {
          dateStr: selectedSaleDay.dateStr,
          brandName: brand.name,
          packs: qty,
          tickets: qty * brand.stockPerPack,
          rate: tierPrice,
          subtotal: qty * brand.stockPerPack * tierPrice
        };
      });

    const typeDesc = saleCategory === 'daily' ? 'Draw Sale Tickets' : 'Instant Scratch Tickets';

    onConfirmDispatch({
      categoryDesc: typeDesc,
      targetDayStr: `${selectedSaleDay.label} (${selectedSaleDay.dateStr} - ${selectedSaleDay.weekday})`,
      items: itemSnapshots,
      totalPacks: saleMath.totalPacks,
      totalTickets: saleMath.totalTickets,
      totalBill: saleMath.totalBill,
      dispatchNote: saleDispatchNote
    });
  };

  if (subStep === 'CATEGORY') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Action 3.1 Sale • Category Selection
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Select Ticket Type for {currentSeller.name}
              </h2>
              <p className="text-xs text-slate-500">
                Pricing Applied: <strong className="text-amber-600">{currentSeller.tier} Rates</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Category 1: Draw Sale Tickets */}
          <div
            onClick={() => {
              setSaleCategory('daily');
              setSaleTicketCounts({});
              setSubStep('DATES_AND_TICKETS');
            }}
            className="bg-white border-2 border-slate-200 hover:border-amber-500 rounded-3xl p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                  Option A
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1 group-hover:text-amber-600 transition-colors">
                  🎟️ Draw Sale Tickets
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Daily national draw lotteries (Govisetha, Mahajana Sampatha, Shanida, Lagna Wasana, Mega Power). Standard 100-ticket packs with forward 7-day draw scheduling.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-700 block">Available Daily Brands:</span>
                <div className="flex flex-wrap gap-1">
                  {brands.filter(b => b.type === 'daily').map(b => (
                    <span key={b.id} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {b.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-amber-600 font-bold text-xs">
              <span>Choose Forward Draw Dates & Quantities</span>
              <span>→</span>
            </div>
          </div>

          {/* Category 2: Instant Tickets */}
          <div
            onClick={() => {
              setSaleCategory('scratch');
              setSaleTicketCounts({});
              setSubStep('DATES_AND_TICKETS');
            }}
            className="bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                  Option B
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1 group-hover:text-emerald-600 transition-colors">
                  ⚡ Instant Scratch Tickets
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Fast scratch cards (Gold Fortune, Cash Bonanza, Diamond Rush). Immediate win books (25/50 tickets) with forward 7-day delivery batches.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-700 block">Available Instant Brands:</span>
                <div className="flex flex-wrap gap-1">
                  {brands.filter(b => b.type === 'scratch').map(b => (
                    <span key={b.id} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {b.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-emerald-600 font-bold text-xs">
              <span>Choose Batch Dates & Pack Counts</span>
              <span>→</span>
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setSubStep('CATEGORY')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Step 3.1 • {saleCategory === 'daily' ? 'Draw Sale Tickets' : 'Instant Scratch Tickets'}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              Select Schedule Date & Add Ticket Quantities
            </h2>
          </div>
        </div>
      </div>

      {/* FORWARD 7 DAYS SELECTOR: 1, 2, 3, 4, 5, 6, 7 */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-500" />
            Select Schedule Date (Forward 7 Days):
          </label>
          <span className="text-[11px] font-bold text-amber-600">
            Selected: {selectedSaleDay.label} ({selectedSaleDay.dateStr} - {selectedSaleDay.weekday})
          </span>
        </div>

        {/* 7 Day Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {forwardDays.map((day) => {
            const isSelected = selectedSaleDay.dayIndex === day.dayIndex;
            return (
              <button
                key={day.dayIndex}
                type="button"
                onClick={() => setSelectedSaleDay(day)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isSelected 
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md font-bold' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`text-[10px] uppercase font-bold block ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                  {day.label} {day.isToday && '• Today'}
                </span>
                <span className="text-xs font-black block mt-0.5">
                  {day.dateStr}
                </span>
                <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                  {day.weekday.substring(0, 3)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ADD TICKETS COUNT FOR THE CHOSEN BRANDS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            Add Ticket Packs for {selectedSaleDay.label} ({selectedSaleDay.dateStr})
          </h3>
          <p className="text-xs text-slate-500">
            Enter number of packs / books to dispatch. Price is automatically calculated at {currentSeller.tier} rate.
          </p>
        </div>

        {/* Brands Grid with Steppers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {categoryBrands.map((brand) => {
            const tierPrice = currentSeller.tier === 'Tier A' ? brand.tierAPrice : brand.tierBPrice;
            const packCost = brand.stockPerPack * tierPrice;
            const currentCount = saleTicketCounts[brand.id] || 0;
            const totalTicketsInPack = currentCount * brand.stockPerPack;

            return (
              <div 
                key={brand.id}
                className={`p-4 rounded-2xl border transition-all ${
                  currentCount > 0 
                    ? 'bg-amber-50/50 border-amber-400 shadow-xs' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-slate-900">{brand.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        {brand.drawDays}
                      </span>
                    </div>
                    
                    <div className="text-xs text-slate-600 mt-1">
                      Pack size: <strong>{brand.stockPerPack} tickets</strong> • Face: Rs. {brand.faceValue}
                    </div>
                    
                    <div className="text-xs font-bold text-amber-700 mt-1">
                      {formatLKR(packCost)} / pack ({formatLKR(tierPrice)}/tix)
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl p-1 shadow-xs">
                      <button
                        type="button"
                        onClick={() => {
                          const newCount = Math.max(0, currentCount - 1);
                          setSaleTicketCounts({ ...saleTicketCounts, [brand.id]: newCount });
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={currentCount}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setSaleTicketCounts({ ...saleTicketCounts, [brand.id]: val });
                        }}
                        className="w-12 text-center font-bold text-sm text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSaleTicketCounts({ ...saleTicketCounts, [brand.id]: currentCount + 1 });
                        }}
                        className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-600 font-bold text-white flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>

                    {currentCount > 0 && (
                      <span className="text-[10px] font-bold text-slate-500">
                        = {totalTicketsInPack} tickets ({formatLKR(currentCount * packCost)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional dispatch notes */}
        <div className="space-y-1 pt-2">
          <label className="text-xs font-bold text-slate-700">Dispatch Notes (Optional):</label>
          <input
            type="text"
            placeholder={`e.g. Dispatched for ${selectedSaleDay.label} draw morning supply`}
            value={saleDispatchNote}
            onChange={(e) => setSaleDispatchNote(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Credit Calculation & Limit Safeguard Box */}
        <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          saleMath.isExceeded 
            ? 'bg-red-50 border-red-300 text-red-700' 
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div>
            <div className="font-bold flex items-center gap-1.5 text-sm">
              {saleMath.isExceeded ? (
                <span className="text-red-600 flex items-center gap-1 font-extrabold">
                  <AlertTriangle className="w-4 h-4" /> SAFEGUARD BLOCKED: Exceeds Limit by {formatLKR(saleMath.excess)}!
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1 font-extrabold">
                  <ShieldCheck className="w-4 h-4" /> Credit Check Approved
                </span>
              )}
            </div>
            <div className="text-slate-600 mt-0.5">
              Current Credit: <strong>{formatLKR(currentSeller.currentCredit)}</strong> • Bill Total: <strong>+{formatLKR(saleMath.totalBill)}</strong>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Projected New Balance</span>
            <span className={`text-base font-black ${saleMath.isExceeded ? 'text-red-600' : 'text-slate-900'}`}>
              {formatLKR(saleMath.projectedCredit)}
            </span>
          </div>
        </div>

        {/* Confirmation Buttons */}
        <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs text-stone-500 block">Total Dispatch Bill:</span>
            <span className="text-2xl font-black text-amber-600">
              {formatLKR(saleMath.totalBill)}
            </span>
            <span className="text-xs text-stone-500 ml-2">
              ({saleMath.totalPacks} packs / {saleMath.totalTickets} tickets)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-full bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saleMath.isExceeded || saleMath.totalPacks === 0}
              onClick={handleConfirm}
              className={`w-1/2 sm:w-auto px-6 py-2.5 rounded-full text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 ${
                saleMath.isExceeded || saleMath.totalPacks === 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                  : 'bg-[#18181B] hover:bg-black text-white shadow-stone-900/10'
              }`}
            >
              <Check className="w-4 h-4" />
              Confirm & Dispatch on Credit (+Debt)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
