import React, { useState, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { Seller } from '../../types';
import { formatLKR } from '../../utils/formatters';

interface WinningModalProps {
  currentSeller: Seller;
  onClose: () => void;
  onConfirm: (data: {
    totalWinningOffset: number;
    envelopeNo: string;
    ticketCount: string;
    breakdown: Record<string, string>;
  }) => void;
}

export const WinningModal: React.FC<WinningModalProps> = ({
  currentSeller,
  onClose,
  onConfirm
}) => {
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

  const handleConfirm = () => {
    if (totalWinningAmount <= 0) return;
    onConfirm({
      totalWinningOffset: totalWinningAmount,
      envelopeNo: winningEnvelopeNo,
      ticketCount: winningTicketCount || 'Assorted Prize Vouchers',
      breakdown: winningAmounts
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-900 font-bold text-lg">
              🏆
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                Action 3.3: Pay by Winning Tickets Offset
              </h3>
              <p className="text-xs text-stone-500">
                Retailer paid prize claims to customers • Reduces Seller Debt
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
              <span className="text-stone-900 font-bold text-sm block">Digital Claim Slip & Handover</span>
              <span className="text-stone-600">
                Verified tickets are sealed in envelope for Assistant depot handover.
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Total Prize Offset</span>
              <span className="text-base font-black text-amber-700 font-mono">
                -{formatLKR(totalWinningAmount)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Envelope Batch ID:</label>
              <input
                type="text"
                value={winningEnvelopeNo}
                onChange={(e) => setWinningEnvelopeNo(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 font-bold focus:outline-none focus:border-stone-900"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Total Ticket Count:</label>
              <input
                type="number"
                placeholder="e.g. 35 tickets"
                value={winningTicketCount}
                onChange={(e) => setWinningTicketCount(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              Quick Count by Prize Tier
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'tier40', label: 'Rs. 40 Prize', val: 40 },
                { key: 'tier100', label: 'Rs. 100 Prize', val: 100 },
                { key: 'tier500', label: 'Rs. 500 Prize', val: 500 },
                { key: 'tier1000', label: 'Rs. 1,000 Prize', val: 1000 },
                { key: 'tier5000', label: 'Rs. 5,000 Prize', val: 5000 },
              ].map(tier => (
                <div key={tier.key} className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-600 block">{tier.label}</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={winningAmounts[tier.key] || ''}
                    onChange={(e) => setWinningAmounts({ ...winningAmounts, [tier.key]: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-xl p-1.5 text-center font-bold text-xs text-stone-900 mt-1 focus:border-stone-900 outline-none"
                  />
                  {parseInt(winningAmounts[tier.key]) > 0 && (
                    <span className="text-[10px] text-amber-700 font-bold block mt-0.5 text-center font-mono">
                      ={formatLKR(parseInt(winningAmounts[tier.key]) * tier.val)}
                    </span>
                  )}
                </div>
              ))}

              <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-600 block">Custom / Jackpot</span>
                <input
                  type="number"
                  min="0"
                  placeholder="LKR amount"
                  value={winningAmounts.customPrize || ''}
                  onChange={(e) => setWinningAmounts({ ...winningAmounts, customPrize: e.target.value })}
                  className="w-full bg-white border border-stone-300 rounded-xl p-1.5 text-center font-bold text-xs text-stone-900 mt-1 focus:border-stone-900 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-stone-200/80 bg-stone-50 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs text-stone-500 block">Offset Retailer Credit:</span>
            <span className="text-xl font-black text-emerald-700">
              -{formatLKR(totalWinningAmount)}
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
              disabled={totalWinningAmount <= 0}
              onClick={handleConfirm}
              className={`w-1/2 sm:w-auto px-6 py-2.5 rounded-full text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 ${
                totalWinningAmount <= 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                  : 'bg-[#18181B] hover:bg-black text-white shadow-stone-900/10'
              }`}
            >
              <Check className="w-4 h-4" />
              Confirm Prize Offset (–Debt)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
