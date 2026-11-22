import React, { useState, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { LotteryBrand, Seller } from '../../types';
import { formatLKR } from '../../utils/formatters';

interface NonWinningModalProps {
  currentSeller: Seller;
  brands: LotteryBrand[];
  onClose: () => void;
  onConfirm: (data: {
    brandName: string;
    stubCount: string;
    ratePerStub: string;
    schemeRef: string;
    totalReimbursement: number;
  }) => void;
}

export const NonWinningModal: React.FC<NonWinningModalProps> = ({
  currentSeller,
  brands,
  onClose,
  onConfirm
}) => {
  const [nonWinningBrandId, setNonWinningBrandId] = useState(brands[0]?.id || 'b1');
  const [nonWinningStubCount, setNonWinningStubCount] = useState('');
  const [nonWinningReimburseRate, setNonWinningReimburseRate] = useState('1.50');
  const [nonWinningSchemeRef, setNonWinningSchemeRef] = useState('Lottery Board Drawback Claim');

  const totalNonWinningReimbursement = useMemo(() => {
    const stubs = parseInt(nonWinningStubCount) || 0;
    const rate = parseFloat(nonWinningReimburseRate) || 0;
    return stubs * rate;
  }, [nonWinningStubCount, nonWinningReimburseRate]);

  const handleConfirm = () => {
    if (totalNonWinningReimbursement <= 0) return;
    const brand = brands.find(b => b.id === nonWinningBrandId);
    onConfirm({
      brandName: brand?.name || 'Lottery',
      stubCount: nonWinningStubCount,
      ratePerStub: nonWinningReimburseRate,
      schemeRef: nonWinningSchemeRef,
      totalReimbursement: totalNonWinningReimbursement
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200/80 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="relative p-5 text-white flex items-center justify-between shrink-0 overflow-hidden rounded-t-3xl border-b border-white/10">
          {/* Lottery Balls Background with Blur */}
          <div 
            className="absolute inset-0 bg-cover bg-center pointer-events-none scale-105"
            style={{
              backgroundImage: `url('/background/popup_bg.png')`,
              filter: 'blur(3px)'
            }}
          />
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 text-rose-400 flex items-center justify-center font-bold text-lg">
              ❌
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Non-Winning Returning Tickets
              </h3>
              <p className="text-xs text-stone-300">
                Lottery Scheme Draw-backs & Stubs Reimbursement • Reduces Debt
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
            <span className="text-stone-900 font-bold text-sm block">Scheme Promotional Reimbursement</span>
            <span className="text-stone-600 block mt-0.5">
              Lottery boards provide per-ticket reimbursement credits for returned non-winning ticket stubs.
            </span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Select Lottery Brand Scheme:</label>
              <select
                value={nonWinningBrandId}
                onChange={(e) => setNonWinningBrandId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.type === 'daily' ? 'Draw' : 'Instant'})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Number of Ticket Stubs:</label>
                <input
                  type="number"
                  placeholder="e.g. 500 stubs"
                  value={nonWinningStubCount}
                  onChange={(e) => setNonWinningStubCount(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Drawback Rate / Stub (LKR):</label>
                <input
                  type="number"
                  step="0.10"
                  value={nonWinningReimburseRate}
                  onChange={(e) => setNonWinningReimburseRate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-bold text-rose-700 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Drawback Scheme Description:</label>
              <input
                type="text"
                value={nonWinningSchemeRef}
                onChange={(e) => setNonWinningSchemeRef(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-stone-200/80 bg-stone-50 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs text-stone-500 block">Deduct from Seller Credit:</span>
            <span className="text-xl font-black text-emerald-700">
              -{formatLKR(totalNonWinningReimbursement)}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-full bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={totalNonWinningReimbursement <= 0}
              onClick={handleConfirm}
              className={`w-1/2 sm:w-auto px-6 py-2.5 rounded-full text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 ${
                totalNonWinningReimbursement <= 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                  : 'bg-[#18181B] hover:bg-black text-white shadow-stone-900/10'
              }`}
            >
              <Check className="w-4 h-4" />
              Confirm Drawback (–Debt)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
