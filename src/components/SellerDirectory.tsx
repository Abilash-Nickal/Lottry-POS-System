import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  MapPin,
  Building2,
  Store,
  SlidersHorizontal
} from 'lucide-react';
import { Assistant, Seller } from '../types';
import { formatLKR } from '../utils/formatters';

interface SellerDirectoryProps {
  sellers: Seller[];
  currentAssistant: Assistant;
  onBack: () => void;
  onSwitchUser?: () => void;
  onLogoClick?: () => void;
  onSelectSeller: (sellerId: string) => void;
}

export const SellerDirectory: React.FC<SellerDirectoryProps> = ({
  sellers,
  currentAssistant,
  onBack,
  onSwitchUser,
  onLogoClick,
  onSelectSeller
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'Tier A' | 'Tier B'>('ALL');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const filteredSellers = useMemo(() => {
    return sellers.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTier = tierFilter === 'ALL' || s.tier === tierFilter;
      return matchSearch && matchTier;
    });
  }, [sellers, searchQuery, tierFilter]);

  return (
    <div 
      className="h-full w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 flex flex-col overflow-hidden text-[#1E1915] select-none"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
    >
      
      {/* 1. TOP HEADER BAR */}
      <div className="shrink-0 flex items-center justify-between gap-3 pb-6">
        {/* Left: Back button + Brand Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#E6DDD4] flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#D64933]" />
          </button>

          <div
            onClick={onLogoClick}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E6DDD4] shadow-xs cursor-pointer group"
            title="LankaLotto POS"
          >
            <div className="w-5 h-4 rounded bg-[#E25C5C] flex items-center justify-center text-[10px] text-white shadow-2xs">
              🎟️
            </div>
            <span className="font-extrabold text-xs text-[#1E1915] tracking-tight">
              LankaLotto <span className="text-[#D64933] font-black">POS</span>
            </span>
          </div>
        </div>

        {/* Right Controls: Field Rep & Switch User */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-[#7F7266] font-medium">
            Field Rep: <strong className="text-[#1E1915] font-bold">{currentAssistant.name}</strong>
          </span>

          <button
            onClick={onSwitchUser || onBack}
            className="px-4 py-1.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#E6DDD4] text-xs font-bold text-[#6E645D] hover:text-[#1E1915] transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            Switch User
          </button>
        </div>
      </div>

      {/* 2. TITLE ROW */}
      <div className="shrink-0 flex items-baseline justify-between pb-3.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1915] tracking-tight">
          Retailer Directory
        </h1>
        <span className="text-xs sm:text-sm text-[#7F7266] font-medium">
          Select a retailer to open POS terminal
        </span>
      </div>

      {/* 3. SEARCH & FILTERS BAR — Unified single box */}
      <div className="shrink-0 pb-5">
        <div className="flex items-center w-full bg-white border border-[#E6DDD4] rounded-2xl shadow-xs overflow-hidden focus-within:border-[#C25838] focus-within:ring-1 focus-within:ring-[#C25838]/15 transition-all duration-200">
          {/* Search Icon */}
          <div className="pl-4 pr-1.5 flex items-center justify-center shrink-0">
            <Search className="w-[18px] h-[18px] text-[#B5A99D]" />
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by retailer name, code, street, or license..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent py-3 sm:py-3.5 pr-2 text-xs sm:text-sm font-medium text-[#1E1915] placeholder-[#B5A99D] focus:outline-none min-w-0"
          />

          {/* Divider + Filters Button inside the box */}
          <div className="flex items-center shrink-0 pr-1.5 sm:pr-2 gap-2.5">
            <div className="w-px h-7 bg-[#E6DDD4]" />
            <button
              type="button"
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-150 cursor-pointer whitespace-nowrap ${
                showFiltersModal || tierFilter !== 'ALL'
                  ? 'bg-[#8B2519] text-white shadow-sm shadow-[#8B2519]/25'
                  : 'bg-[#F5EFE9] hover:bg-[#EDE5DD] text-[#6E645D] hover:text-[#1E1915]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Filters</span>
              {tierFilter !== 'ALL' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filter Badges if toggled */}
      {showFiltersModal && (
        <div className="shrink-0 mb-4 p-2.5 rounded-2xl bg-white border border-[#E6DDD4] flex items-center gap-2 shadow-xs animate-in fade-in duration-150">
          <span className="text-[11px] font-bold text-[#7F7266] uppercase tracking-wider mr-1">
            Filter Tiers:
          </span>
          {(['ALL', 'Tier A', 'Tier B'] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                tierFilter === tier
                  ? 'bg-[#8B2519] text-white shadow-xs'
                  : 'bg-[#F5EFE9] hover:bg-[#EDE5DD] text-[#26201D] border border-[#E6DDD4]'
              }`}
            >
              {tier === 'ALL' ? 'All Retailers' : tier}
            </button>
          ))}
        </div>
      )}

      {/* 4. RETAILER CARDS LIST (SMOOTH INTERNAL SCROLL) */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1.5 pb-6 custom-scrollbar">
        {filteredSellers.map((seller, index) => {
          const percent = Math.min(100, Math.round((seller.currentCredit / (seller.creditLimit || 1)) * 100));
          const availableCredit = Math.max(0, seller.creditLimit - seller.currentCredit);
          const isSelected = activeCardId === seller.id || (!activeCardId && index === 0);

          return (
            <div
              key={seller.id}
              onClick={() => {
                setActiveCardId(seller.id);
                onSelectSeller(seller.id);
              }}
              onMouseEnter={() => setActiveCardId(seller.id)}
              className={`p-3.5 sm:p-4 rounded-[22px] bg-white transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer shadow-xs ${
                isSelected
                  ? 'border-2 border-[#52B7E8]'
                  : 'border border-[#E6DDD4] hover:border-[#D68A64]'
              }`}
            >
              {/* Left: Store Icon + Retailer Details */}
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FAF0E9] border border-[#F4DEC9] text-[#C25838] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#C25838]" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-[#1E1915] truncate">
                    {seller.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#7F7266] mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C25838] shrink-0" />
                    <span className="truncate">{seller.location}</span>
                  </div>


                </div>
              </div>

              {/* Right: Outstanding Credit Progress + Open POS Button */}
              <div className="flex items-center gap-5 sm:gap-7 shrink-0 self-end md:self-auto">
                <div className="w-40 sm:w-56 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-[#8C827A] uppercase tracking-wider">
                      OUTSTANDING
                    </span>
                    <span className="text-[#1E1915] font-mono">
                      LKR {formatLKR(seller.currentCredit).replace('LKR', '').trim()} / {(seller.creditLimit / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <div className="w-full bg-[#E8DFD5] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#C25838]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-[#7F7266] font-medium">
                    Available: LKR {(availableCredit / 1000).toFixed(1)}k
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSeller(seller.id);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-[#FAF0E9] hover:bg-[#F3E2D5] text-[#C25838] border border-[#ECD7C7] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Store className="w-4 h-4 text-[#C25838]" />
                  <span>Open POS</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
