import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Seller, Assistant } from '../../types';
import { formatLKR } from '../../utils/formatters';

interface CashModalProps {
  currentSeller: Seller;
  currentAssistant: Assistant;
  onClose: () => void;
  onConfirm: (data: {
    cashAmount: number;
    reference: string;
  }) => void;
}

export const CashModal: React.FC<CashModalProps> = ({
  currentSeller,
  currentAssistant,
  onClose,
  onConfirm
}) => {
  const [cashAmount, setCashAmount] = useState('');
  const [cashReference, setCashReference] = useState('');

  const parsedAmount = parseFloat(cashAmount) || 0;

  const handleConfirm = () => {
    if (parsedAmount <= 0) return;
    onConfirm({
      cashAmount: parsedAmount,
      reference: cashReference || 'Physical Cash Handover'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200/80 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-900 font-bold text-lg">
              💵
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                Action 3.5: Pay by Cash Direct Collection
              </h3>
              <p className="text-xs text-stone-500">
                Physical cash collected by {currentAssistant.shortName} • Handover Balance
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
              <span className="text-emerald-700 font-bold text-sm block">Reduces Outstanding Debt</span>
              <span className="text-stone-600">
                Current Balance Owed: <strong>{formatLKR(currentSeller.currentCredit)}</strong>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Rep Cash in Hand</span>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {formatLKR(currentAssistant.cashInHand)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              Quick Payment Presets
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCashAmount(currentSeller.currentCredit.toString())}
                className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-300 text-xs font-bold text-stone-900 transition-colors"
              >
                Clear Full Balance
              </button>
              <button
                type="button"
                onClick={() => setCashAmount('10000')}
                className="p-2.5 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-800 transition-colors"
              >
                LKR 10,000
              </button>
              <button
                type="button"
                onClick={() => setCashAmount('25000')}
                className="p-2.5 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-800 transition-colors"
              >
                LKR 25,000
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Physical Cash Amount Collected (LKR):</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-stone-400 font-bold text-sm">LKR</span>
              <input
                type="number"
                placeholder="0.00"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-14 pr-4 py-2.5 text-lg font-black text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Receipt Ref / Description:</label>
            <input
              type="text"
              placeholder="e.g. Morning route cash collection"
              value={cashReference}
              onChange={(e) => setCashReference(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <div className="p-5 border-t border-stone-200/80 bg-stone-50 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs text-stone-500 block">Deduct from Seller Credit:</span>
            <span className="text-xl font-black text-emerald-700">
              -{formatLKR(parsedAmount)}
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
              disabled={parsedAmount <= 0}
              onClick={handleConfirm}
              className={`w-1/2 sm:w-auto px-6 py-2.5 rounded-full text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 ${
                parsedAmount <= 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                  : 'bg-[#18181B] hover:bg-black text-white shadow-stone-900/10'
              }`}
            >
              <Check className="w-4 h-4" />
              Confirm Cash (–Debt)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
