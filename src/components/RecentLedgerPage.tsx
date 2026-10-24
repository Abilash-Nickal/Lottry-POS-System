import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  FileText, 
  Printer, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Filter,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Seller, Assistant, Transaction } from '../types';
import { formatLKR } from '../utils/formatters';

interface RecentLedgerPageProps {
  currentSeller: Seller;
  currentAssistant: Assistant;
  sellerTransactions: Transaction[];
  onBack: () => void;
  onOpenFinalReceipt: () => void;
}

export const RecentLedgerPage: React.FC<RecentLedgerPageProps> = ({
  currentSeller,
  currentAssistant,
  sellerTransactions,
  onBack,
  onOpenFinalReceipt
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredTransactions = useMemo(() => {
    return sellerTransactions.filter(txn => {
      const matchSearch = 
        txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (txn.notes && txn.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (txn.assistantName && txn.assistantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (txn.typeLabel && txn.typeLabel.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchType = true;
      if (filterType === 'SALE') matchType = txn.actionType?.includes('SALE');
      else if (filterType === 'RETURN') matchType = txn.actionType?.includes('RETURN');
      else if (filterType === 'WINNING') matchType = txn.actionType?.includes('WINNING');
      else if (filterType === 'NON_WINNING') matchType = txn.actionType?.includes('NON_WINNING');
      else if (filterType === 'CASH') matchType = txn.actionType?.includes('CASH');

      return matchSearch && matchType;
    });
  }, [sellerTransactions, searchQuery, filterType]);

  const currentCredit = currentSeller.currentCredit;
  const creditLimit = currentSeller.creditLimit;
  const availableCredit = Math.max(0, creditLimit - currentCredit);
  const percent = Math.min(100, Math.round((currentCredit / (creditLimit || 1)) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-[#26201D]">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="figma-card rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 border border-[#E6DDD4] bg-[#FAF8F5]">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#F5EFEB] text-[#26201D] flex items-center gap-2 border border-[#E6DDD4] text-xs font-bold transition-all shadow-xs shrink-0"
            title="Back to Terminal"
          >
            <ArrowLeft className="w-4 h-4 text-[#26201D]" />
            <span>Back to Terminal</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FAF0E9] text-[#D68A64] border border-[#F4DEC9] text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                Full Audit Trail
              </span>
              <span className="text-xs text-[#7F7266] font-medium">
                Retailer: <strong className="text-[#26201D]">{currentSeller.name}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#26201D] mt-1 tracking-tight">
              Recent Ledger Activity
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenFinalReceipt}
            className="px-5 py-2.5 rounded-2xl bg-[#D64933] hover:bg-[#BE3823] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-[#D64933]/25"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print All-In-One Receipt</span>
          </button>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Stat 1: Current Debt */}
        <div className="bg-[#FDF2F0] border border-[#F9C9C2] rounded-2xl p-4">
          <span className="text-[10px] font-bold text-[#D64933] uppercase tracking-wider block">
            Current Debt Balance
          </span>
          <div className="text-2xl font-black text-[#D64933] tracking-tight mt-1 font-mono">
            -{formatLKR(currentCredit)}
          </div>
        </div>

        {/* Stat 2: Credit Limit */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4">
          <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider block">
            Credit Ceiling
          </span>
          <div className="text-2xl font-black text-[#16A34A] tracking-tight mt-1 font-mono">
            {formatLKR(creditLimit)}
          </div>
        </div>

        {/* Stat 3: Available Room */}
        <div className="bg-white border border-[#E6DDD4] rounded-2xl p-4">
          <span className="text-[10px] font-bold text-[#7F7266] uppercase tracking-wider block">
            Available Buffer ({100 - percent}% free)
          </span>
          <div className="text-2xl font-black text-[#26201D] tracking-tight mt-1 font-mono">
            {formatLKR(availableCredit)}
          </div>
        </div>

        {/* Stat 4: Transaction Count */}
        <div className="bg-[#FAF8F5] border border-[#E6DDD4] rounded-2xl p-4">
          <span className="text-[10px] font-bold text-[#D68A64] uppercase tracking-wider block">
            Recorded Transactions
          </span>
          <div className="text-2xl font-black text-[#D68A64] tracking-tight mt-1 font-mono">
            {sellerTransactions.length} TXNs
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#9F9184] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search TXN ID, notes, category, or officer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full figma-input pl-11 pr-4 py-2.5 text-xs sm:text-sm text-[#26201D] placeholder-[#9F9184] focus:outline-none transition-all shadow-xs"
          />
        </div>

        {/* Operation Filter Chips */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Operations' },
            { id: 'SALE', label: 'Dispatches' },
            { id: 'RETURN', label: 'Returns' },
            { id: 'WINNING', label: 'Winnings' },
            { id: 'NON_WINNING', label: 'Stubs' },
            { id: 'CASH', label: 'Cash Payments' }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setFilterType(chip.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                filterType === chip.id
                  ? 'bg-[#D64933] text-white shadow-[#D64933]/20 font-extrabold'
                  : 'bg-white hover:bg-[#F5EFEB] text-[#26201D] border border-[#E6DDD4]'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. FULL TRANSACTION AUDIT TABLE */}
      <div className="figma-card rounded-3xl p-6 border border-[#E6DDD4] bg-[#FAF8F5] shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[#7F7266] font-bold uppercase tracking-wider text-[10px] border-b border-[#E6DDD4] pb-3">
              <tr>
                <th className="py-3 px-3">TXN Reference</th>
                <th className="py-3 px-3">Operation Category</th>
                <th className="py-3 px-3">Field Officer</th>
                <th className="py-3 px-3">Transaction Details</th>
                <th className="py-3 px-3 text-right">Credit Impact</th>
                <th className="py-3 px-3 text-right">New Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DDD4]/60 text-[#26201D]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7F7266]">
                    <FileText className="w-8 h-8 text-[#9F9184] mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm">No ledger transactions found</p>
                    <p className="text-xs text-[#9F9184] mt-0.5">Try searching with different keywords or filter categories</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const isDebtIncrease = txn.deltaCredit > 0;
                  return (
                    <tr key={txn.id} className="hover:bg-white/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-[#26201D] block">{txn.id}</span>
                        <span className="text-[10px] text-[#7F7266]">{txn.date}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          txn.actionType?.includes('SALE') 
                            ? 'bg-[#FCE4E1] text-[#D64933] border-[#F9C9C2]' 
                            : txn.actionType?.includes('RETURN')
                            ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                            : txn.actionType?.includes('WINNING')
                            ? 'bg-[#FAF0E9] text-[#D68A64] border-[#F4DEC9]'
                            : txn.actionType?.includes('NON_WINNING')
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                        }`}>
                          {txn.typeLabel || txn.actionType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#26201D]">
                        {txn.assistantName}
                      </td>
                      <td className="py-3.5 px-3 text-[#7F7266] max-w-xs truncate font-medium">
                        {txn.notes || '—'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold">
                        {isDebtIncrease ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FDF2F0] text-[#D64933] border border-[#F9C9C2] text-xs inline-block">
                            +{formatLKR(txn.deltaCredit)}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] text-xs inline-block">
                            -{formatLKR(Math.abs(txn.deltaCredit))}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-extrabold text-[#26201D]">
                        {formatLKR(txn.newCredit)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
