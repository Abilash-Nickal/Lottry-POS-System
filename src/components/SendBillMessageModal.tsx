import React, { useState } from 'react';
import { X, MessageSquare, Smartphone, Copy, Check, Send, Phone } from 'lucide-react';
import { Seller, Assistant, CompletedSlip } from '../types';
import { formatLKR } from '../utils/formatters';

interface SendBillMessageModalProps {
  seller: Seller;
  assistant: Assistant;
  onClose: () => void;
  // Either live session breakdown or completed slip
  sessionData?: {
    grossBill: number;
    grossPacks: number;
    grossTickets: number;
    returnRefund: number;
    returnPacks: number;
    winningOffset: number;
    winningCount: number;
    nonWinningReimburse: number;
    nonWinningStubs: number;
    cashCollected: number;
    netBill: number;
    prevBalance: number;
    postOrderDebt: number;
    availableCredit: number;
  };
  completedSlip?: CompletedSlip | null;
}

export const SendBillMessageModal: React.FC<SendBillMessageModalProps> = ({
  seller,
  assistant,
  onClose,
  sessionData,
  completedSlip
}) => {
  const [phone, setPhone] = useState(seller.phone || '');
  const [copied, setCopied] = useState(false);

  // Compute bill values from sessionData or completedSlip
  const now = new Date();
  const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const grossBill = sessionData?.grossBill ?? (completedSlip?.salesItems?.reduce((a, b) => a + b.subtotal, 0) || 0);
  const grossPacks = sessionData?.grossPacks ?? (completedSlip?.salesItems?.reduce((a, b) => a + b.packs, 0) || 0);
  const returnRefund = sessionData?.returnRefund ?? (completedSlip?.returningAmount || 0);
  const returnPacks = sessionData?.returnPacks ?? (completedSlip?.returningPacksCount || 0);
  const winningOffset = sessionData?.winningOffset ?? (completedSlip?.winningAmount || 0);
  const nonWinningReimburse = sessionData?.nonWinningReimburse ?? (completedSlip?.nonWinningAmount || 0);
  const cashCollected = sessionData?.cashCollected ?? (completedSlip?.cashPayingAmount || 0);
  const totalOffsets = returnRefund + winningOffset + nonWinningReimburse + cashCollected;
  const netBill = sessionData?.netBill ?? Math.max(0, grossBill - totalOffsets);
  const prevBalance = sessionData?.prevBalance ?? (completedSlip?.creditsOld || 0);
  const postOrderDebt = sessionData?.postOrderDebt ?? (completedSlip?.finalCredit || seller.currentCredit);
  const availableCredit = sessionData?.availableCredit ?? Math.max(0, seller.creditLimit - postOrderDebt);

  // Format message text
  const messageBody = [
    `🧾 *LOTTERY DISTRIBUTION RECEIPT*`,
    `🏪 Retailer: ${seller.name} (#${seller.id})`,
    `👤 Owner: ${seller.owner}`,
    `📅 Date: ${dateStr}`,
    `👮 Officer: ${assistant.name} (${assistant.shortName})`,
    `----------------------------------------`,
    `*ORDER ELEMENTS:*`,
    `1. Gross Dispatch: +LKR ${formatLKR(grossBill).replace('LKR', '').trim()} (${grossPacks} packs)`,
    `2. Pack Returns: -LKR ${formatLKR(returnRefund).replace('LKR', '').trim()} (${returnPacks} packs)`,
    `3. Winning Offset: -LKR ${formatLKR(winningOffset).replace('LKR', '').trim()}`,
    `4. Non-Winning Drawback: -LKR ${formatLKR(nonWinningReimburse).replace('LKR', '').trim()}`,
    `5. Cash Payment: -LKR ${formatLKR(cashCollected).replace('LKR', '').trim()}`,
    `----------------------------------------`,
    `*NET BILL AMOUNT:* LKR ${formatLKR(netBill).replace('LKR', '').trim()}`,
    `*PREVIOUS DEBT:* LKR ${formatLKR(prevBalance).replace('LKR', '').trim()}`,
    `*TOTAL POST-ORDER DEBT:* LKR ${formatLKR(postOrderDebt).replace('LKR', '').trim()}`,
    `*AVAILABLE CREDIT ROOM:* LKR ${formatLKR(availableCredit).replace('LKR', '').trim()}`,
    `----------------------------------------`,
    `Thank you! Dehiattakandiya Lottery Depot.`
  ].join('\n');

  // Clean phone number for WhatsApp / SMS URL (digits only, e.g. 94714567890)
  const getCleanPhone = (raw: string) => {
    let clean = raw.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '94' + clean.slice(1);
    }
    return clean;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendWhatsApp = () => {
    const cleanNumber = getCleanPhone(phone);
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageBody)}`;
    window.open(url, '_blank');
  };

  const handleSendSMS = () => {
    const cleanNumber = getCleanPhone(phone);
    const url = `sms:${cleanNumber}?body=${encodeURIComponent(messageBody)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header with Dark Lottery Balls Background & Blur */}
        <div className="relative p-4 sm:p-5 text-white flex items-center justify-between shrink-0 overflow-hidden rounded-t-3xl border-b border-white/10">
          <div 
            className="absolute inset-0 bg-cover bg-center pointer-events-none scale-105"
            style={{
              backgroundImage: `url('/background/popup_bg.png')`,
              filter: 'blur(3px)'
            }}
          />
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 text-emerald-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Send Bill to Customer Phone
              </h3>
              <p className="text-xs text-stone-300">
                Direct SMS & WhatsApp receipt for <strong className="text-white">{seller.name}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Recipient Phone Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Customer Mobile Phone:
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567 or 0771234567"
                className="w-full text-sm font-mono font-bold pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D64933]"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Pre-filled from seller profile. You can change this number if sending to a partner or manager.
            </p>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-stone-600">
              <span className="uppercase tracking-wider">Message Preview:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-[#D64933] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E6DDD4] text-xs font-mono text-stone-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto select-all shadow-inner">
              {messageBody}
            </div>
          </div>

          {/* Quick Info Badge */}
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#D64933] shrink-0" />
            <span>
              Tapping <strong>Send WhatsApp</strong> opens WhatsApp chat with this bill pre-typed and ready to send.
            </span>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-300 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* SMS Button */}
            <button
              type="button"
              onClick={handleSendSMS}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Send SMS</span>
            </button>

            {/* WhatsApp Button */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

