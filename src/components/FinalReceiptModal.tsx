import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Receipt, 
  Smartphone, 
  Download, 
  FileText, 
  Send, 
  Check, 
  Loader2,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import { CompletedSlip } from '../types';
import { formatLKR } from '../utils/formatters';
import { SendBillMessageModal } from './SendBillMessageModal';
import { 
  downloadReceiptImage, 
  downloadReceiptPDF,
  shareReceiptToWhatsApp
} from '../utils/receiptExporter';

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
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!completedSlip) return null;

  const creditsOld = completedSlip.creditsOld ?? completedSlip.previousCredit ?? 0;
  const salesItems = completedSlip.salesItems || [];
  const totalSalesAmount = salesItems.reduce((sum, item) => sum + (parseFloat(item.subtotal as any) || 0), 0);
  const totalPacks = salesItems.reduce((sum, item) => sum + (item.packs || 0), 0);
  const totalTickets = salesItems.reduce((sum, item) => sum + (item.tickets || (item.packs * 100)), 0);
  
  const returningAmount = completedSlip.returningAmount || 0;
  const winningAmount = completedSlip.winningAmount || 0;
  const cashPayingAmount = completedSlip.cashPayingAmount || 0;
  const nonWinningAmount = completedSlip.nonWinningAmount || 0;
  const totalDeductions = returningAmount + winningAmount + cashPayingAmount + nonWinningAmount;
  const netBill = Math.max(0, totalSalesAmount - totalDeductions);
  const finalBalance = completedSlip.finalCredit ?? completedSlip.newCredit ?? Math.max(0, creditsOld + totalSalesAmount - totalDeductions);
  const creditLimit = completedSlip.seller?.creditLimit || 350000;
  const availableRoom = Math.max(0, creditLimit - finalBalance);

  const receiptSummaryText = [
    `🧾 *OFFICIAL LOTTERY DISTRIBUTION RECEIPT*`,
    `🏪 Retailer: ${completedSlip.sellerName} (${completedSlip.seller?.owner || 'Retailer'})`,
    `📄 Invoice #${completedSlip.id} | Date: ${completedSlip.date}`,
    `👮 Field Officer: ${completedSlip.assistantName}`,
    `----------------------------------------`,
    `*Gross Dispatches:* +LKR ${formatLKR(totalSalesAmount).replace('LKR', '').trim()} (${totalPacks} packs)`,
    `*Total Returns & Offsets:* -LKR ${formatLKR(totalDeductions).replace('LKR', '').trim()}`,
    `*Net Session Bill:* LKR ${formatLKR(netBill).replace('LKR', '').trim()}`,
    `*Previous Debt Balance:* LKR ${formatLKR(creditsOld).replace('LKR', '').trim()}`,
    `*TOTAL OUTSTANDING DEBT:* LKR ${formatLKR(finalBalance).replace('LKR', '').trim()}`,
    `*Available Credit Room:* LKR ${formatLKR(availableRoom).replace('LKR', '').trim()}`,
    `----------------------------------------`,
    `Thank you! Dehiattakandiya Lottery Distribution Depot.`
  ].join('\n');

  // Direct share real slip to WhatsApp (as Image PNG or PDF)
  const handleShareToWhatsApp = async (format: 'image' | 'pdf' = 'image') => {
    if (!receiptRef.current) return;
    setShowWhatsAppMenu(false);
    setIsExporting(`whatsapp-${format}`);
    try {
      const ext = format === 'pdf' ? 'pdf' : 'png';
      const result = await shareReceiptToWhatsApp(
        receiptRef.current,
        completedSlip.seller?.phone || '',
        receiptSummaryText,
        {
          format,
          filename: `Receipt-${completedSlip.id}.${ext}`
        }
      );
      if (result.mode === 'download_and_web') {
        setExportNotice(`Real ${format.toUpperCase()} slip downloaded! Opening WhatsApp chat...`);
        setTimeout(() => setExportNotice(null), 4000);
      } else {
        setExportNotice(`Sharing 80mm ${format.toUpperCase()} slip to WhatsApp...`);
        setTimeout(() => setExportNotice(null), 3000);
      }
    } catch (err) {
      console.error('Error sharing receipt:', err);
    } finally {
      setIsExporting(null);
    }
  };

  // Direct download real continuous image (.png)
  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    setIsExporting('image');
    try {
      await downloadReceiptImage(receiptRef.current, `Receipt-${completedSlip.id}.png`);
      setExportNotice('Real dimension continuous slip saved (.PNG)');
      setTimeout(() => setExportNotice(null), 3000);
    } catch (err) {
      console.error('Error downloading image:', err);
    } finally {
      setIsExporting(null);
    }
  };

  // Direct download real continuous 80mm PDF
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsExporting('pdf');
    try {
      await downloadReceiptPDF(receiptRef.current, `Receipt-${completedSlip.id}.pdf`);
      setExportNotice('Real 80mm continuous thermal PDF saved (.PDF)');
      setTimeout(() => setExportNotice(null), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#1C1917] text-stone-900 rounded-3xl w-full max-w-2xl max-h-[96vh] flex flex-col shadow-2xl relative border border-stone-800 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header: Clean Official Title with Dark Lottery Balls Background & Blur */}
        <div className="relative p-4 sm:p-5 text-white flex items-center justify-between shrink-0 overflow-hidden rounded-t-3xl border-b border-white/10">
          <div 
            className="absolute inset-0 bg-cover bg-center pointer-events-none scale-105"
            style={{
              backgroundImage: `url('/background/popup_bg.png')`,
              filter: 'blur(3px)'
            }}
          />
          <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-xs pointer-events-none" />

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 text-white flex items-center justify-center font-bold text-base shadow-xs">
              <Receipt className="w-5 h-5 text-[#D68A64]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  80mm Thermal Receipt Slip
                </h3>
                <span className="bg-[#FAF0E9]/15 text-[#D68A64] border border-[#F4DEC9]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  80mm Roll
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-mono">
                SLIP #{completedSlip.id} • {completedSlip.date}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Receipt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice alert if exported */}
        {exportNotice && (
          <div className="bg-emerald-900/90 text-emerald-200 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 border-b border-emerald-700/50 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Modal Body: Center Stage Real Dimension 80mm Slip */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-[#141210]/90">
          
          {/* THE REAL 80MM CONTINUOUS THERMAL RECEIPT SLIP */}
          <div 
            ref={receiptRef}
            id="printable-receipt" 
            className="bg-white text-black w-full max-w-[340px] p-4 sm:p-5 font-mono text-[11px] leading-tight space-y-3.5 shadow-2xl relative select-text"
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', Courier, monospace",
              filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.4))'
            }}
          >
            {/* Top Zigzag Serrated Tear Edge Simulation */}
            <div className="text-center text-[10px] tracking-widest text-stone-400 select-none pb-1 border-b border-dashed border-stone-300">
              ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^
            </div>

            {/* Header Branding (Sinhala & English) */}
            <div className="text-center space-y-0.5 pt-1">
              <h2 className="text-sm font-black tracking-tight text-black uppercase">
                ශ්‍රී ලංකා ජාතික ලොතරැයි බෙදාහැරීම
              </h2>
              <h3 className="text-xs font-extrabold text-stone-900">
                ලොතරැයි බෙදාහැරීම් කාර්යාලය
              </h3>
              <p className="text-[11px] font-bold text-stone-800">
                W.M.G. චිත්රා වීරකෝන්
              </p>
              <p className="text-[10px] text-stone-600">
                බස් නැවතුම්පළ අසල, දෙහිඅත්තකණ්ඩිය
              </p>
              <p className="text-[10px] text-stone-500 font-bold">
                Tel: +94 77 123 4567 • Depot Code: DH-01
              </p>
              <div className="pt-1.5 text-[10px] text-stone-400">
                ================================================
              </div>
              <div className="flex justify-between items-center text-[10px] font-black text-black pt-0.5">
                <span>INVOICE #{completedSlip.id}</span>
                <span>{completedSlip.date}</span>
              </div>
              <div className="text-[10px] text-stone-400 pb-0.5">
                ================================================
              </div>
            </div>

            {/* Retailer & Officer Details */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-stone-300 pb-2.5">
              <div className="flex justify-between items-start">
                <span className="text-stone-500 font-bold">RETAILER:</span>
                <span className="text-black font-black text-right max-w-[190px]">{completedSlip.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-bold">OWNER:</span>
                <span className="text-black font-bold">{completedSlip.seller?.owner || 'Authorized Dealer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-bold">LOCATION:</span>
                <span className="text-black font-semibold truncate max-w-[180px]">{completedSlip.seller?.location || 'Route Location'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-bold">CATEGORY:</span>
                <span className="text-black font-black">{completedSlip.seller?.tier || 'Wholesale Tier A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-bold">FIELD OFFICER:</span>
                <span className="text-black font-bold">{completedSlip.assistantName}</span>
              </div>
            </div>

            {/* 1. CREDITS OLD (Brought Forward Debt) */}
            <div className="p-2 rounded bg-stone-100 border border-stone-200 flex justify-between items-center text-xs">
              <span className="font-bold text-stone-700 uppercase tracking-wider">
                CREDITS OLD (B/F):
              </span>
              <span className="font-black text-black font-mono">
                LKR {formatLKR(creditsOld).replace('LKR', '').trim()}
              </span>
            </div>

            {/* 2. TICKET SALES BY DATES (Itemized Table) */}
            <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-2.5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-stone-700 bg-stone-100 px-1.5 py-1 rounded">
                <span>ITEMIZED TICKET DISPATCH</span>
                <span>SUBTOTAL</span>
              </div>

              <div className="space-y-1 text-[11px]">
                {salesItems.length > 0 ? (
                  salesItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start py-0.5 border-b border-stone-100">
                      <div>
                        <div className="font-black text-black">
                          {item.brandName || 'Daily Draw'}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {item.dateStr || 'Today'} • {item.packs} pk ({item.tickets || (item.packs * 100)} tix) @ {formatLKR(item.rate)}
                        </div>
                      </div>
                      <div className="font-black text-black font-mono text-right pt-0.5">
                        +{formatLKR(item.subtotal).replace('LKR', '').trim()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-stone-400 italic py-1 text-center">
                    No new ticket allocations in this session
                  </div>
                )}
              </div>

              {salesItems.length > 0 && (
                <div className="flex justify-between text-xs font-black text-black pt-1 border-t border-stone-200">
                  <span>TOTAL GROSS SALES:</span>
                  <span className="font-mono text-black">
                    +{formatLKR(totalSalesAmount).replace('LKR', '').trim()}
                  </span>
                </div>
              )}
            </div>

            {/* 3. DEDUCTIONS & SETTLEMENTS */}
            <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-2.5 text-[11px]">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-stone-700 bg-stone-100 px-1.5 py-1 rounded">
                <span>DEDUCTIONS & OFFSETS</span>
                <span>REDUCTION</span>
              </div>

              {/* Return by Winning */}
              <div className="flex justify-between items-center py-0.5">
                <div>
                  <span className="font-bold text-stone-800">(-) Winning Vouchers:</span>
                  {completedSlip.winningTicketsCount && (
                    <span className="text-[10px] text-stone-500 ml-1">({completedSlip.winningTicketsCount})</span>
                  )}
                </div>
                <span className={`font-black font-mono ${winningAmount > 0 ? 'text-black' : 'text-stone-400'}`}>
                  -{formatLKR(winningAmount).replace('LKR', '').trim()}
                </span>
              </div>

              {/* Returning (Unsold packs) */}
              <div className="flex justify-between items-center py-0.5">
                <div>
                  <span className="font-bold text-stone-800">(-) Unsold Pack Returns:</span>
                  {(completedSlip.returningPacksCount || 0) > 0 && (
                    <span className="text-[10px] text-stone-500 ml-1">({completedSlip.returningPacksCount} pk)</span>
                  )}
                </div>
                <span className={`font-black font-mono ${returningAmount > 0 ? 'text-black' : 'text-stone-400'}`}>
                  -{formatLKR(returningAmount).replace('LKR', '').trim()}
                </span>
              </div>

              {/* Non-Winning Stubs */}
              <div className="flex justify-between items-center py-0.5">
                <span className="font-bold text-stone-800">(-) Non-Winning Stubs:</span>
                <span className={`font-black font-mono ${nonWinningAmount > 0 ? 'text-black' : 'text-stone-400'}`}>
                  -{formatLKR(nonWinningAmount).replace('LKR', '').trim()}
                </span>
              </div>

              {/* Cash Paying */}
              <div className="flex justify-between items-center py-0.5">
                <div>
                  <span className="font-bold text-stone-800">(-) Direct Cash Collected:</span>
                  {completedSlip.cashRef && (
                    <span className="text-[10px] text-stone-500 ml-1">({completedSlip.cashRef})</span>
                  )}
                </div>
                <span className={`font-black font-mono ${cashPayingAmount > 0 ? 'text-black' : 'text-stone-400'}`}>
                  -{formatLKR(cashPayingAmount).replace('LKR', '').trim()}
                </span>
              </div>

              <div className="flex justify-between text-xs font-black text-black pt-1 border-t border-stone-200">
                <span>TOTAL DEDUCTIONS:</span>
                <span className="font-mono text-black">
                  -{formatLKR(totalDeductions).replace('LKR', '').trim()}
                </span>
              </div>
            </div>

            {/* 4. NET RECONCILIATION & TOTAL OUTSTANDING DEBT */}
            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Net Session Bill:</span>
                <span className="font-bold font-mono">LKR {formatLKR(netBill).replace('LKR', '').trim()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Previous Balance B/F:</span>
                <span className="font-bold font-mono">LKR {formatLKR(creditsOld).replace('LKR', '').trim()}</span>
              </div>

              <div className="pt-2 border-t border-dashed border-stone-300">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-black uppercase text-black tracking-wider">
                    CURRENT OUTSTANDING:
                  </span>
                  <span className="text-base font-black text-black font-mono">
                    LKR {formatLKR(finalBalance).replace('LKR', '').trim()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-stone-500 pt-0.5">
                <span>Available Credit Room:</span>
                <span className="font-bold font-mono text-stone-700">LKR {formatLKR(availableRoom).replace('LKR', '').trim()}</span>
              </div>
            </div>

            {/* High-Resolution Thermal Barcode Simulation */}
            <div className="text-center pt-2 space-y-1">
              <div className="text-[10px] text-stone-400">
                ------------------------------------------------
              </div>
              
              {/* Thermal Barcode Bars */}
              <div className="flex items-center justify-center gap-[2px] h-9 px-4 select-none">
                {[3,1,2,4,1,3,2,1,4,2,3,1,2,4,1,2,3,1,4,2,1,3,2,4,1,3,2,1,4,2,3,1,2,4,1,3,2,4,1,2].map((w, i) => (
                  <div
                    key={i}
                    className="h-full bg-black"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>

              <div className="text-[10px] font-mono font-bold tracking-widest text-black">
                *{completedSlip.id}-VERIFIED-FINAL*
              </div>

              <div className="text-[9px] text-stone-500 uppercase tracking-wider pt-0.5">
                THANK YOU FOR YOUR BUSINESS
              </div>
              <div className="text-[8px] text-stone-400">
                LankaLotto Cloud POS v2.4 • System Generated Slip
              </div>
            </div>

            {/* Bottom Zigzag Serrated Tear Edge Simulation */}
            <div className="text-center text-[10px] tracking-widest text-stone-400 select-none pt-1 border-t border-dashed border-stone-300">
              v v v v v v v v v v v v v v v v v v v v v v v v
            </div>

          </div>

        </div>

        {/* Modal Bottom Controls: Full-Feature Thermal Actions */}
        <div className="p-3 sm:p-5 border-t border-stone-800 bg-[#141210] rounded-b-3xl flex flex-wrap items-center justify-between gap-2.5">
          
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* 1. Share Real Slip on WhatsApp (Image / PDF dropdown) */}
            <div className="relative">
              <div className="inline-flex rounded-xl shadow-md shadow-emerald-900/30 overflow-hidden">
                <button
                  type="button"
                  disabled={isExporting !== null}
                  onClick={() => handleShareToWhatsApp('image')}
                  className="px-3.5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Share the real 80mm thermal receipt PNG image directly to WhatsApp"
                >
                  {isExporting?.startsWith('whatsapp') ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Preparing Slip...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>WhatsApp Slip</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isExporting !== null}
                  onClick={() => setShowWhatsAppMenu(!showWhatsAppMenu)}
                  className="px-2 py-2.5 bg-[#1fa851] hover:bg-[#188e44] text-white border-l border-white/20 transition-colors cursor-pointer"
                  title="Select WhatsApp export format (PNG Image or PDF Document)"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* WhatsApp Dropdown Options */}
              {showWhatsAppMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-48 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => handleShareToWhatsApp('image')}
                    className="w-full px-3.5 py-2 text-left text-xs font-bold text-stone-200 hover:bg-stone-800 flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>Send Slip (PNG Image)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareToWhatsApp('pdf')}
                    className="w-full px-3.5 py-2 text-left text-xs font-bold text-stone-200 hover:bg-stone-800 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-rose-400" />
                    <span>Send Slip (PDF Document)</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Download Image (PNG) */}
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={handleDownloadImage}
              className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold border border-stone-700 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Download long 80mm continuous thermal receipt as high-res PNG image"
            >
              {isExporting === 'image' ? (
                <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
              ) : (
                <Download className="w-4 h-4 text-stone-400" />
              )}
              <span>Save PNG</span>
            </button>

            {/* 3. Download PDF (80mm Continuous Roll) */}
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={handleDownloadPDF}
              className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold border border-stone-700 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Download real 80mm continuous roll PDF without page margins"
            >
              {isExporting === 'pdf' ? (
                <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
              ) : (
                <FileText className="w-4 h-4 text-stone-400" />
              )}
              <span>Save PDF</span>
            </button>

            {/* 4. Print 80mm Thermal */}
            {canPrint && (
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-[#D64933] hover:bg-[#be3e2a] text-white rounded-xl text-xs font-black shadow-md shadow-[#D64933]/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="Print directly to 80mm thermal POS printer"
              >
                <Printer className="w-4 h-4" />
                <span>Print 80mm</span>
              </button>
            )}

            {/* 5. Text Message Modal Option */}
            <button
              type="button"
              onClick={() => setShowMsgModal(true)}
              className="px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold border border-stone-700 flex items-center gap-1 transition-all cursor-pointer"
              title="Open text messaging options"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Text Bill</span>
            </button>

          </div>

        </div>

      </div>

      {/* Send Message Modal */}
      {showMsgModal && completedSlip.seller && completedSlip.assistant && (
        <SendBillMessageModal
          seller={completedSlip.seller}
          assistant={completedSlip.assistant}
          completedSlip={completedSlip}
          onClose={() => setShowMsgModal(false)}
        />
      )}
    </div>
  );
};
