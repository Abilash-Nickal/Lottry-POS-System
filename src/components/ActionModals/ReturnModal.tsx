import React, { useState, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { LotteryBrand, Seller } from '../../types';
import { formatLKR } from '../../utils/formatters';

interface ReturnModalProps {
  currentSeller: Seller;
  brands: LotteryBrand[];
  onClose: () => void;
  onConfirm: (data: {
    returnItems: Array<{ brandName: string; packs: number; rate: number; subtotal: number }>;
    totalPacks: number;
    totalRefund: number;
    reason: string;
    batchRef: string;
  }) => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  currentSeller,
  brands,
  onClose,
  onConfirm
}) => {
  const [returnCart, setReturnCart] = useState<Record<string, number>>({});
  const [returnReason, setReturnReason] = useState('Unsold pre-draw return');
  const [returnSerialBatch, setReturnSerialBatch] = useState('');

  const totals = useMemo(() => {
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

  const handleConfirm = () => {
    if (totals.totalPacks <= 0) return;

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

    onConfirm({
      returnItems,
      totalPacks: totals.totalPacks,
      totalRefund: totals.totalRefund,
      reason: returnReason,
      batchRef: returnSerialBatch
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-900 font-bold text-lg">
              🔄
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                Action 3.2: Accept Unsold Pack Returns
              </h3>
              <p className="text-xs text-stone-500">
                Retailer: <strong className="text-stone-900">{currentSeller.name}</strong> • Reduces Debt
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex justify-between items-center">
            <div>
              <span className="text-stone-900 font-bold text-sm block">Credit Ledger Deduction</span>
              <span className="text-stone-600">
                Returns are credited back at the retailer's original {currentSeller.tier} purchase rate.
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-500 uppercase tracking-wider block">New Credit Balance</span>
              <span className="text-base font-black text-emerald-700 font-mono">
                {formatLKR(totals.projectedCredit)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              Select Returned Packs
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {brands.map((brand) => {
                const tierPrice = currentSeller.tier === 'Tier A' ? brand.tierAPrice : brand.tierBPrice;
                const packRefund = brand.stockPerPack * tierPrice;
                const currentQty = returnCart[brand.id] || 0;

                return (
                  <div 
                    key={brand.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      currentQty > 0 
                        ? 'bg-stone-100/80 border-stone-400/80 shadow-xs' 
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-sm block text-stone-900">{brand.name}</span>
                        <span className="text-[10px] text-stone-500">
                          {brand.stockPerPack} tix/pk
                        </span>
                        <div className="text-[11px] font-bold text-stone-900 mt-1 font-mono">
                          Credit: {formatLKR(packRefund)} / pk
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-full p-1 shadow-xs">
                        <button
                          onClick={() => {
                            const newQty = Math.max(0, currentQty - 1);
                            setReturnCart({ ...returnCart, [brand.id]: newQty });
                          }}
                          className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-bold text-sm text-stone-900 font-mono">
                          {currentQty}
                        </span>
                        <button
                          onClick={() => {
                            setReturnCart({ ...returnCart, [brand.id]: currentQty + 1 });
                          }}
                          className="w-7 h-7 rounded-full bg-[#18181B] hover:bg-black text-white font-bold flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Return Reason:</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
              >
                <option value="Unsold pre-draw return">Unsold pre-draw return (Draw Cutoff)</option>
                <option value="Damaged pack exchange">Damaged pack exchange</option>
                <option value="Cancelled order return">Cancelled order return</option>
                <option value="Post-event scratch recall">Post-event scratch recall</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Serial Batch / Seal Reference:</label>
              <input
                type="text"
                placeholder="e.g. SN-9011 to SN-9020"
                value={returnSerialBatch}
                onChange={(e) => setReturnSerialBatch(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-stone-200/80 bg-stone-50 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs text-stone-500 block">Deduct from Seller Credit:</span>
            <span className="text-xl font-black text-emerald-700">
              -{formatLKR(totals.totalRefund)}
            </span>
            <span className="text-xs text-stone-500 ml-2">({totals.totalPacks} packs returned)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-full bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={totals.totalPacks <= 0}
              onClick={handleConfirm}
              className={`w-1/2 sm:w-auto px-6 py-2.5 rounded-full text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 ${
                totals.totalPacks <= 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                  : 'bg-[#18181B] hover:bg-black text-white shadow-stone-900/10'
              }`}
            >
              <Check className="w-4 h-4" />
              Confirm Return (–Debt)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
