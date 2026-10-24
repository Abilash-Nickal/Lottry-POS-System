import React from 'react';
import { X, Printer, Receipt } from 'lucide-react';
import { CompletedSlip } from '../types';
import { formatLKR } from '../utils/formatters';

interface FinalReceiptModalProps {
  completedSlip: CompletedSlip | null;
  onClose: () => void;
  canPrint?: boolean;
}

export const FinalReceiptModal: React.FC<FinalReceiptModalProps> = ({
  completedSlip,
  onClose,
  canPrint = true
}) => {
  if (!completedSlip) return null;

  const creditsOld = completedSlip.creditsOld ?? completedSlip.previousCredit ?? 0;
  const salesItems = completedSlip.salesItems || [];
  const totalSalesAmount = salesItems.reduce((sum, item) => sum + (parseFloat(item.subtotal as any) || 0), 0);
  const returningAmount = completedSlip.returningAmount || 0;
  const winningAmount = completedSlip.winningAmount || 0;
  const cashPayingAmount = completedSlip.cashPayingAmount || 0;
  const nonWinningAmount = completedSlip.nonWinningAmount || 0;
  const totalDeductions = returningAmount + winningAmount + cashPayingAmount + nonWinningAmount;
  const finalBalance = completedSlip.finalCredit ?? completedSlip.newCredit ?? Math.max(0, creditsOld + totalSalesAmount - totalDeductions);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl relative border border-stone-300/80 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header: Clean Official Title, NO Edit Button */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between gap-3 bg-stone-50/80 rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#18181B] text-white flex items-center justify-center font-bold text-base shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 flex items-center gap-1.5">
                All-In-One Wholesale Receipt Slip
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                SLIP #{completedSlip.id} • {completedSlip.date}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
            title="Close Receipt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Unified All-In-One Slip (Printable) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div 
            id="printable-receipt" 
            className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-300 font-mono text-xs space-y-4 shadow-xs"
          >
            {/* Header Branding */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h2 className="text-base font-black tracking-tight text-slate-950">ලොතරැයි බෙදාහැරීම් කාර්යාලය</h2>
              <p className="text-xs font-bold text-slate-800">W.M.G. චිත්රා වීරකෝන්</p>
              <p className="text-[10px] text-slate-600">බස් නැවතුම්පළ අසල, දෙහිඅත්තකණ්ඩිය</p>
              <p className="text-xs font-black mt-1 text-slate-900">INVOICE #{completedSlip.id}</p>
              <p className="text-[10px] text-slate-500">{completedSlip.date}</p>
            </div>

            {/* Retailer & Sales Rep Info */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Retailer:</span>
                <strong className="text-slate-900 text-right">{completedSlip.sellerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tier Category:</span>
                <strong className="text-slate-900">{completedSlip.seller?.tier || 'Wholesale Tier A'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Field Sales Rep:</span>
                <strong className="text-slate-900">{completedSlip.assistantName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Type:</span>
                <strong className="text-slate-900">All-In-One Consolidated Settlement</strong>
              </div>
            </div>

            {/* 1. CREDITS OLD (Brought Forward Debt) */}
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">
                Credits Old:
              </span>
              <span className="font-black text-slate-900 text-sm">
                {formatLKR(creditsOld)}
              </span>
            </div>

            {/* 2. TICKET SALES BY DATES (Itemized lines: Date = Count = Amount) */}
            <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-700 bg-slate-100 p-1.5 rounded">
                <span>Ticket Sales by Dates:</span>
                <span className="text-slate-500">Date = Count = Amount</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {salesItems.length > 0 ? (
                  salesItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{item.dateStr || '10/15/2026'}</span>
                        <span className="text-slate-400">=</span>
                        <span className="font-bold text-amber-800">{item.tickets || (item.packs * 100)}</span>
                        {item.brandName && (
                          <span className="text-[10px] text-slate-500">({item.brandName})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">=</span>
                        <span className="font-black text-slate-900">{formatLKR(item.subtotal)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-slate-400 italic py-1 text-center">
                    No ticket sales recorded
                  </div>
                )}
              </div>

              {salesItems.length > 0 && (
                <div className="flex justify-between text-xs font-black text-slate-900 pt-1">
                  <span>Total Ticket Sales:</span>
                  <span className="text-amber-700">
                    +{formatLKR(totalSalesAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* 3. DEDUCTIONS & SETTLEMENTS */}
            <div className="space-y-2 border-b border-dashed border-slate-300 pb-3 text-xs">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-700 bg-slate-100 p-1.5 rounded">
                <span>Returns & Settlements:</span>
                <span className="text-slate-500">Deductions (–Debt)</span>
              </div>

              {/* Return by Winning */}
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div>
                  <span className="font-bold text-slate-800">Return by Winning:</span>
                  {completedSlip.winningTicketsCount && (
                    <span className="text-[10px] text-slate-500 ml-1.5">({completedSlip.winningTicketsCount})</span>
                  )}
                </div>
                <span className={`font-black ${winningAmount > 0 ? 'text-purple-700' : 'text-slate-400'}`}>
                  {winningAmount > 0 ? `-${formatLKR(winningAmount)}` : formatLKR(0)}
                </span>
              </div>

              {/* Returning (Unsold packs) */}
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div>
                  <span className="font-bold text-slate-800">Returning (Unsold):</span>
                  {(completedSlip.returningPacksCount || 0) > 0 && (
                    <span className="text-[10px] text-slate-500 ml-1.5">({completedSlip.returningPacksCount} packs)</span>
                  )}
                </div>
                <span className={`font-black ${returningAmount > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                  {returningAmount > 0 ? `-${formatLKR(returningAmount)}` : formatLKR(0)}
                </span>
              </div>

              {/* Cash Paying */}
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div>
                  <span className="font-bold text-slate-800">Cash Paying:</span>
                  {completedSlip.cashRef && (
                    <span className="text-[10px] text-slate-500 ml-1.5">({completedSlip.cashRef})</span>
                  )}
                </div>
                <span className={`font-black ${cashPayingAmount > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {cashPayingAmount > 0 ? `-${formatLKR(cashPayingAmount)}` : formatLKR(0)}
                </span>
              </div>

              {/* Non-Winning Stubs Drawback (if any) */}
              {nonWinningAmount > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="font-bold text-slate-800">Non-Winning Stubs Return:</span>
                  <span className="font-black text-rose-700">
                    -{formatLKR(nonWinningAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* 4. SUMMARY CALCULATION & FINAL OUTSTANDING BALANCE */}
            <div className="bg-slate-100 p-3.5 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Credits Old:</span>
                <span>{formatLKR(creditsOld)}</span>
              </div>
              
              {totalSalesAmount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>(+) Ticket Sales:</span>
                  <span>+{formatLKR(totalSalesAmount)}</span>
                </div>
              )}

              {totalDeductions > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>(–) Total Returns & Cash Paid:</span>
                  <span>-{formatLKR(totalDeductions)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="text-[11px] font-black uppercase text-slate-900 tracking-wider">
                  Current Outstanding Balance:
                </span>
                <span className="text-base font-black text-slate-950 font-mono">
                  {formatLKR(finalBalance)}
                </span>
              </div>
            </div>

            {/* Barcode & Verification */}
            <div className="text-center pt-2">
              <div className="font-mono text-[9px] tracking-widest text-slate-400">
                ||| | | |||| | ||| |||| | || | ||| |||| | | |||
              </div>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                AUTH CODE: {completedSlip.id}-VERIFIED-FINAL
              </span>
            </div>

          </div>
        </div>

        {/* Modal Bottom Controls: NO EDIT BUTTON, strictly Close & Print Bluetooth Slip */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 rounded-b-3xl flex items-center justify-between gap-3">
          <div className="text-[11px] text-stone-500 font-mono hidden sm:block">
            Official All-In-One Wholesale Slip
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-300 transition-colors"
            >
              Close
            </button>
            {canPrint ? (
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-[#18181B] hover:bg-black text-white rounded-full text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" />
                Print Bluetooth Slip
              </button>
            ) : (
              <span className="px-4 py-2.5 rounded-full bg-stone-100 text-stone-400 text-xs font-bold border border-stone-200 italic">
                Printing restricted to field assistants
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
