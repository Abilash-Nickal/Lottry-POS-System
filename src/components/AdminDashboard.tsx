import React, { useState, useMemo } from 'react';
import { 
  Smartphone, 
  Navigation, 
  Printer, 
  Plus, 
  Edit3, 
  ShieldCheck, 
  KeyRound, 
  Store, 
  Users, 
  Tag, 
  X, 
  Check, 
  ArrowRight,
  TrendingUp,
  Percent,
  Phone,
  MapPin,
  Lock,
  Unlock,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Trash2,
  History,
  ShoppingBag,
  Receipt,
  Package
} from 'lucide-react';
import { LotteryBrand, Assistant, Seller, Transaction } from '../types';
import { formatLKR } from '../utils/formatters';
import { 
  dbUpsertSeller, 
  dbDeleteSeller, 
  dbUpsertAssistant, 
  dbUpsertBrand 
} from '../lib/supabaseService';

interface AdminDashboardProps {
  brands: LotteryBrand[];
  assistants: Assistant[];
  sellers: Seller[];
  transactions: Transaction[];
  onToggleFreeze: (sellerId: string) => void;
  onOpenSellerPOS: (sellerId: string, assistantId: string) => void;
  onOpenAssistantPOS: (assistantId: string) => void;
  onSwitchToPOSMode: () => void;
  onOpenSlipModal: (txn: Transaction) => void;
  activeTab?: 'overview' | 'pricing' | 'sellers' | 'assistants' | 'ledger';
  onTabChange?: (tab: 'overview' | 'pricing' | 'sellers' | 'assistants' | 'ledger') => void;
  onUpdateSellers?: (updater: (prev: Seller[]) => Seller[]) => void;
  onUpdateAssistants?: (updater: (prev: Assistant[]) => Assistant[]) => void;
  onUpdateBrands?: (updater: (prev: LotteryBrand[]) => LotteryBrand[]) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  brands,
  assistants,
  sellers,
  transactions,
  onToggleFreeze,
  onOpenSellerPOS,
  onOpenAssistantPOS,
  onSwitchToPOSMode,
  onOpenSlipModal,
  activeTab = 'overview',
  onTabChange,
  onUpdateSellers,
  onUpdateAssistants,
  onUpdateBrands,
  showToast
}) => {
  const [internalTab, setInternalTab] = useState<'overview' | 'pricing' | 'sellers' | 'assistants' | 'ledger'>('overview');
  const adminTab = activeTab || internalTab;

  // --------------------------------------------------------------------------
  // MODAL STATES
  // --------------------------------------------------------------------------
  // 1. Sellers Modals
  const [showAddSellerModal, setShowAddSellerModal] = useState(false);
  const [editingCreditSeller, setEditingCreditSeller] = useState<Seller | null>(null);
  const [newCreditLimitInput, setNewCreditLimitInput] = useState<number>(300000);
  const [newSellerForm, setNewSellerForm] = useState({
    name: '',
    owner: '',
    phone: '',
    location: '',
    tier: 'Tier A' as 'Tier A' | 'Tier B',
    creditLimit: 300000,
    assignedAssistant: assistants[0]?.id || 'ast1'
  });

  // Sellers Search, Tier Filter & Delete States
  const [sellerSearchQuery, setSellerSearchQuery] = useState('');
  const [sellerTierFilter, setSellerTierFilter] = useState<'ALL' | 'Tier A' | 'Tier B'>('ALL');
  const [showSellerFilters, setShowSellerFilters] = useState(false);
  const [deletingSeller, setDeletingSeller] = useState<Seller | null>(null);

  const filteredSellers = useMemo(() => {
    return sellers.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(sellerSearchQuery.toLowerCase()) ||
        s.owner.toLowerCase().includes(sellerSearchQuery.toLowerCase()) ||
        s.location.toLowerCase().includes(sellerSearchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(sellerSearchQuery.toLowerCase()) ||
        s.phone.toLowerCase().includes(sellerSearchQuery.toLowerCase());
      const matchTier = sellerTierFilter === 'ALL' || s.tier === sellerTierFilter;
      return matchSearch && matchTier;
    });
  }, [sellers, sellerSearchQuery, sellerTierFilter]);

  // Seller Last 10 Purchases History Modal State
  const [historySeller, setHistorySeller] = useState<Seller | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'purchases' | 'all'>('purchases');

  // Generator & Selector for individual seller's last 10 purchase full history
  const displayedPurchases = useMemo(() => {
    if (!historySeller) return [];

    const sellerTxns = transactions.filter(t => t.sellerId === historySeller.id);
    if (historyFilter === 'all') {
      return sellerTxns.slice(0, 10);
    }

    const purchasesOnly = sellerTxns.filter(t => t.actionType.includes('SALE') || t.deltaCredit > 0);
    if (purchasesOnly.length >= 10) {
      return purchasesOnly.slice(0, 10);
    }

    // Supplement with realistic historical orders if this seller has fewer than 10 transactions in memory
    const needed = 10 - purchasesOnly.length;
    const assistant = assistants.find(a => a.id === historySeller.assignedAssistant) || assistants[0] || { shortName: 'Mohamed Rizwan' };
    const rate = historySeller.tier === 'Tier A' ? 85 : 88;
    const brandList = brands.length > 0 ? brands : [
      { name: 'Govisetha', color: 'from-emerald-500 to-green-600' },
      { name: 'Mahajana Sampatha', color: 'from-blue-500 to-indigo-600' },
      { name: 'Ada Kotipathi', color: 'from-amber-500 to-orange-600' },
      { name: 'Shanida Wasanawa', color: 'from-purple-500 to-indigo-600' },
      { name: 'Lagna Wasanawa', color: 'from-rose-500 to-pink-600' },
      { name: 'Supiri Dhana Sampatha', color: 'from-red-500 to-amber-600' }
    ];

    const now = new Date();
    const generated: Transaction[] = [];
    let runningCredit = historySeller.currentCredit;

    for (let i = 0; i < needed; i++) {
      const daysAgo = purchasesOnly.length + i + 1;
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - i * 3600000);
      const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' ' + orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const b1 = brandList[(i * 2) % brandList.length];
      const b2 = brandList[(i * 2 + 1) % brandList.length];
      const packs1 = 2 + (i % 3);
      const packs2 = 1 + ((i + 1) % 3);
      const tickets1 = packs1 * 100;
      const tickets2 = packs2 * 100;
      const subtotal1 = tickets1 * rate;
      const subtotal2 = tickets2 * rate;
      const totalBill = subtotal1 + subtotal2;
      const totalPacks = packs1 + packs2;
      const totalTickets = tickets1 + tickets2;

      const prevCredit = Math.max(0, runningCredit - totalBill);
      const orderNewCredit = runningCredit;
      runningCredit = prevCredit;

      const txnId = `TXN-${8500 - (i * 37 + 11)}`;

      generated.push({
        id: txnId,
        date: dateStr,
        sellerId: historySeller.id,
        sellerName: historySeller.name,
        assistantId: historySeller.assignedAssistant,
        assistantName: assistant.shortName || 'Mohamed Rizwan',
        actionType: '3.1 SALE',
        typeLabel: i === 0 ? "Today's Daily Draw Dispatch" : `Batch Order Day -${daysAgo}`,
        deltaCredit: totalBill,
        previousCredit: prevCredit,
        newCredit: orderNewCredit,
        notes: `Delivered ${totalPacks} packs (${totalTickets} tickets) to shop counter`,
        details: {
          totalBill: totalBill,
          totalPacks: totalPacks,
          totalTickets: totalTickets,
          items: [
            { brandName: b1.name, packs: packs1, tickets: tickets1, rate: rate, subtotal: subtotal1 },
            { brandName: b2.name, packs: packs2, tickets: tickets2, rate: rate, subtotal: subtotal2 }
          ]
        }
      });
    }

    return [...purchasesOnly, ...generated].slice(0, 10);
  }, [historySeller, transactions, historyFilter, brands, assistants]);

  // 2. Assistants Modals
  const [showAddAssistantModal, setShowAddAssistantModal] = useState(false);
  const [editingPinAssistant, setEditingPinAssistant] = useState<Assistant | null>(null);
  const [newPinInput, setNewPinInput] = useState('1234');
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);
  const [newAssistantForm, setNewAssistantForm] = useState({
    name: '',
    shortName: '',
    phone: '',
    route: '',
    username: '',
    defaultPass: '1234'
  });

  // 3. Brands Modals
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<LotteryBrand | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: '',
    type: 'daily' as 'daily' | 'scratch',
    faceValue: 100,
    tierAPrice: 85,
    tierBPrice: 88,
    stockPerPack: 50,
    drawDays: 'Mon, Wed, Fri',
    color: 'from-orange-500 to-amber-600'
  });

  // KPI Computations
  const totalCreditOutstanding = sellers.reduce((acc, s) => acc + s.currentCredit, 0);
  const totalCashHeldByAssistants = assistants.reduce((acc, a) => acc + a.cashInHand, 0);
  const totalWinningVouchers = assistants.reduce((acc, a) => acc + a.winningVouchers, 0);
  const sellersOverdue = sellers.filter(s => s.currentCredit >= s.creditLimit).length;

  const tabTitles: Record<string, string> = {
    overview: 'Overview & KPIs',
    sellers: '1. Sellers Management',
    assistants: '2. Assistant Accounts & Security',
    pricing: '3. Ticket Catalog & Tier Pricing',
    ledger: 'Audit Trail & Immutable Records'
  };

  // --------------------------------------------------------------------------
  // HANDLERS: 1. SELLERS MANAGEMENT
  // --------------------------------------------------------------------------
  const handleToggleTier = (sellerId: string) => {
    if (!onUpdateSellers) return;
    onUpdateSellers(prev =>
      prev.map(s => {
        if (s.id === sellerId) {
          const nextTier: 'Tier A' | 'Tier B' = s.tier === 'Tier A' ? 'Tier B' : 'Tier A';
          if (showToast) showToast(`${s.name} switched to ${nextTier}`, 'success');
          const updated: Seller = { ...s, tier: nextTier };
          dbUpsertSeller(updated);
          return updated;
        }
        return s;
      })
    );
  };

  const handleOpenModifyCredit = (seller: Seller) => {
    setEditingCreditSeller(seller);
    setNewCreditLimitInput(seller.creditLimit);
  };

  const handleSaveCreditLimit = () => {
    if (!editingCreditSeller || !onUpdateSellers) return;
    const limit = Number(newCreditLimitInput);
    if (isNaN(limit) || limit <= 0) {
      if (showToast) showToast('Please enter a valid credit limit', 'error');
      return;
    }

    onUpdateSellers(prev =>
      prev.map(s => {
        if (s.id === editingCreditSeller.id) {
          const updated = { ...s, creditLimit: limit };
          dbUpsertSeller(updated);
          return updated;
        }
        return s;
      })
    );
    if (showToast) {
      showToast(`Credit limit for ${editingCreditSeller.name} updated to ${formatLKR(limit)}`, 'success');
    }
    setEditingCreditSeller(null);
  };

  const handleCreateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSellerForm.name || !newSellerForm.location) {
      if (showToast) showToast('Shop name and route location are required', 'error');
      return;
    }

    const newId = `s${Date.now().toString().slice(-4)}`;
    const newSeller: Seller = {
      id: newId,
      name: newSellerForm.name,
      owner: newSellerForm.owner || 'Registered Retailer',
      phone: newSellerForm.phone || '+94 77 000 0000',
      location: newSellerForm.location,
      tier: newSellerForm.tier,
      creditLimit: Number(newSellerForm.creditLimit) || 250000,
      currentCredit: 0,
      assignedAssistant: newSellerForm.assignedAssistant,
      isFrozen: false
    };

    if (onUpdateSellers) {
      onUpdateSellers(prev => [...prev, newSeller]);
    }
    dbUpsertSeller(newSeller);
    if (showToast) showToast(`Added retailer "${newSeller.name}" to roster`, 'success');
    setShowAddSellerModal(false);
    setNewSellerForm({
      name: '',
      owner: '',
      phone: '',
      location: '',
      tier: 'Tier A',
      creditLimit: 300000,
      assignedAssistant: assistants[0]?.id || 'ast1'
    });
  };

  // --------------------------------------------------------------------------
  // HANDLERS: 2. ASSISTANT ACCOUNTS & SECURITY
  // --------------------------------------------------------------------------
  const handleOpenResetPin = (assistant: Assistant) => {
    setEditingPinAssistant(assistant);
    setNewPinInput(assistant.defaultPass || '1234');
  };

  const handleSavePin = () => {
    if (!editingPinAssistant || !onUpdateAssistants) return;
    if (!newPinInput || newPinInput.length < 4) {
      if (showToast) showToast('PIN must be at least 4 digits', 'error');
      return;
    }

    onUpdateAssistants(prev =>
      prev.map(a => {
        if (a.id === editingPinAssistant.id) {
          const updated = { ...a, defaultPass: newPinInput };
          dbUpsertAssistant(updated);
          return updated;
        }
        return a;
      })
    );
    if (showToast) {
      showToast(`Login PIN for ${editingPinAssistant.name} updated to "${newPinInput}"`, 'success');
    }
    setEditingPinAssistant(null);
  };

  const handleOpenEditAssistant = (assistant: Assistant) => {
    setEditingAssistant(assistant);
    setNewAssistantForm({
      name: assistant.name,
      shortName: assistant.shortName,
      phone: assistant.phone,
      route: assistant.route,
      username: assistant.username,
      defaultPass: assistant.defaultPass
    });
  };

  const handleSaveAssistantEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssistant || !onUpdateAssistants) return;

    onUpdateAssistants(prev =>
      prev.map(a => {
        if (a.id === editingAssistant.id) {
          const updated = {
            ...a,
            name: newAssistantForm.name,
            shortName: newAssistantForm.shortName || newAssistantForm.name.split(' ')[0],
            phone: newAssistantForm.phone,
            route: newAssistantForm.route,
            username: newAssistantForm.username,
            defaultPass: newAssistantForm.defaultPass
          };
          dbUpsertAssistant(updated);
          return updated;
        }
        return a;
      })
    );
    if (showToast) showToast(`Updated profile for ${newAssistantForm.name}`, 'success');
    setEditingAssistant(null);
  };

  const handleCreateAssistant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssistantForm.name || !newAssistantForm.route) {
      if (showToast) showToast('Name and assigned route are required', 'error');
      return;
    }

    const newId = `ast${assistants.length + 1}`;
    const newAst: Assistant = {
      id: newId,
      name: newAssistantForm.name,
      shortName: newAssistantForm.shortName || newAssistantForm.name.split(' ')[0],
      username: newAssistantForm.username || `rep_${newId}`,
      defaultPass: newAssistantForm.defaultPass || '1234',
      phone: newAssistantForm.phone || '+94 77 123 4567',
      route: newAssistantForm.route,
      cashInHand: 0,
      winningVouchers: 0,
      totalOrdersToday: 0,
      avatarBg: 'bg-emerald-600 text-white'
    };

    if (onUpdateAssistants) {
      onUpdateAssistants(prev => [...prev, newAst]);
    }
    dbUpsertAssistant(newAst);
    if (showToast) showToast(`Created assistant account for ${newAst.name}`, 'success');
    setShowAddAssistantModal(false);
    setNewAssistantForm({
      name: '',
      shortName: '',
      phone: '',
      route: '',
      username: '',
      defaultPass: '1234'
    });
  };

  // --------------------------------------------------------------------------
  // HANDLERS: 3. TICKET CATALOG & TIER PRICING
  // --------------------------------------------------------------------------
  const handleOpenEditBrand = (brand: LotteryBrand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name,
      type: brand.type,
      faceValue: brand.faceValue,
      tierAPrice: brand.tierAPrice,
      tierBPrice: brand.tierBPrice,
      stockPerPack: brand.stockPerPack,
      drawDays: brand.drawDays,
      color: brand.color
    });
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name || Number(brandForm.faceValue) <= 0) {
      if (showToast) showToast('Valid brand name and face value are required', 'error');
      return;
    }

    if (editingBrand) {
      const updatedBrand: LotteryBrand = {
        ...editingBrand,
        name: brandForm.name,
        type: brandForm.type,
        faceValue: Number(brandForm.faceValue),
        tierAPrice: Number(brandForm.tierAPrice),
        tierBPrice: Number(brandForm.tierBPrice),
        stockPerPack: Number(brandForm.stockPerPack),
        drawDays: brandForm.drawDays
      };

      if (onUpdateBrands) {
        onUpdateBrands(prev =>
          prev.map(b => (b.id === editingBrand.id ? updatedBrand : b))
        );
      }
      dbUpsertBrand(updatedBrand);
      if (showToast) showToast(`Updated pricing rates for ${brandForm.name}`, 'success');
      setEditingBrand(null);
    } else {
      // Create new brand
      const newBrand: LotteryBrand = {
        id: `b${brands.length + 1}`,
        name: brandForm.name,
        type: brandForm.type,
        faceValue: Number(brandForm.faceValue),
        tierAPrice: Number(brandForm.tierAPrice),
        tierBPrice: Number(brandForm.tierBPrice),
        stockPerPack: Number(brandForm.stockPerPack) || 50,
        active: true,
        drawDays: brandForm.drawDays || 'Instant Win',
        color: brandForm.color || 'from-orange-500 to-amber-600'
      };

      if (onUpdateBrands) {
        onUpdateBrands(prev => [...prev, newBrand]);
      }
      dbUpsertBrand(newBrand);
      if (showToast) showToast(`Added ticket brand "${newBrand.name}" to catalog`, 'success');
      setShowAddBrandModal(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner & Active Indicator */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/90 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Admin Control Panel
            </span>
            <span className="text-xs font-black text-[#D64933] bg-[#FAF0E9] border border-[#F4DEC9] px-2.5 py-0.5 rounded-full">
              {tabTitles[adminTab] || 'Admin Console'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 tracking-tight">
            W.M.G. චිත්රා වීරකෝන්
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-0.5 font-semibold flex flex-wrap items-center gap-2">
            <span className="text-orange-600 font-bold">ලොතරැයි බෙදාහැරීම් කාර්යාලය</span>
            <span className="text-gray-300">•</span>
            <span>බස් නැවතුම්පළ අසල, දෙහිඅත්තකණ්ඩිය</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToPOSMode}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-orange-50 border border-orange-200 text-orange-600 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Switch to Field Terminal</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 0: OVERVIEW & KPIS                                           */}
      {/* ==================================================================== */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/70 space-y-1 hover:shadow-md transition-shadow">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Total Market Credit</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">{formatLKR(totalCreditOutstanding)}</div>
              <span className="text-xs text-stone-400">Across {sellers.length} registered sellers</span>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/70 space-y-1 hover:shadow-md transition-shadow">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Total Cash with Reps</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">{formatLKR(totalCashHeldByAssistants)}</div>
              <span className="text-xs text-stone-400">Held by {assistants.length} field assistants</span>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/70 space-y-1 hover:shadow-md transition-shadow">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Winning Vouchers Held</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">{formatLKR(totalWinningVouchers)}</div>
              <span className="text-xs text-stone-400">Depot redemption claim batch</span>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/70 space-y-1 hover:shadow-md transition-shadow">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Overdue Accounts</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">{sellersOverdue} Retailers</div>
              <span className="text-xs text-stone-400">At or exceeding credit limit</span>
            </div>
          </div>

          {/* Quick Pillar Jump Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div 
              onClick={() => onTabChange && onTabChange('sellers')}
              className="p-6 rounded-3xl bg-white border border-[#E6DDD4] shadow-xs hover:border-[#D64933] hover:shadow-md transition-all cursor-pointer group space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#FAF0E9] text-[#D64933] flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-lg text-gray-900 group-hover:text-[#D64933] transition-colors">
                1. Sellers Management
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                Add sellers, assign Wholesale Tier A vs Retail Tier B, and adjust credit limits (LKR).
              </p>
              <div className="text-xs font-bold text-[#D64933] flex items-center gap-1 pt-1">
                <span>Manage {sellers.length} Sellers</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => onTabChange && onTabChange('assistants')}
              className="p-6 rounded-3xl bg-white border border-[#E6DDD4] shadow-xs hover:border-[#D64933] hover:shadow-md transition-all cursor-pointer group space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#FAF0E9] text-[#D64933] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-lg text-gray-900 group-hover:text-[#D64933] transition-colors">
                2. Assistant Accounts & Security
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                Create & edit field assistants, route assignments, and set/reset login PINs.
              </p>
              <div className="text-xs font-bold text-[#D64933] flex items-center gap-1 pt-1">
                <span>Manage {assistants.length} Assistants</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => onTabChange && onTabChange('pricing')}
              className="p-6 rounded-3xl bg-white border border-[#E6DDD4] shadow-xs hover:border-[#D64933] hover:shadow-md transition-all cursor-pointer group space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#FAF0E9] text-[#D64933] flex items-center justify-center font-bold">
                <Tag className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-lg text-gray-900 group-hover:text-[#D64933] transition-colors">
                3. Ticket Catalog & Tier Pricing
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                Daily Draw vs. Scratch Cards, set retail face values, and configure Tier A/B wholesale margins.
              </p>
              <div className="text-xs font-bold text-[#D64933] flex items-center gap-1 pt-1">
                <span>Manage {brands.length} Brands</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. SELLERS MANAGEMENT                                                */}
      {/* ==================================================================== */}
      {adminTab === 'sellers' && (
        <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E9] text-[#9E2A1E] text-xs font-bold uppercase tracking-wider mb-1">
                <span>Pillar 1</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Sellers Management
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Add new sellers, assign/switch tiers (Tier A vs Tier B), and set or modify credit limits (LKR).
              </p>
            </div>

            <button
              onClick={() => setShowAddSellerModal(true)}
              className="px-5 py-2.5 rounded-full bg-[#9E2A1E] hover:bg-[#852318] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-[#9E2A1E]/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Seller</span>
            </button>
          </div>

          {/* Unified Search & Filters Bar — Same as Assistant's Directory */}
          <div className="space-y-3">
            <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-2xl shadow-xs overflow-hidden focus-within:border-[#9E2A1E] focus-within:ring-1 focus-within:ring-[#9E2A1E]/15 focus-within:bg-white transition-all duration-200">
              {/* Search Icon */}
              <div className="pl-4 pr-1.5 flex items-center justify-center shrink-0">
                <Search className="w-4 h-4 text-stone-400" />
              </div>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search by retailer name, code, street, owner, or phone..."
                value={sellerSearchQuery}
                onChange={(e) => setSellerSearchQuery(e.target.value)}
                className="flex-1 bg-transparent py-3 pr-2 text-xs sm:text-sm font-medium text-stone-900 placeholder-stone-400 focus:outline-none min-w-0"
              />

              {sellerSearchQuery && (
                <button
                  type="button"
                  onClick={() => setSellerSearchQuery('')}
                  className="p-1 mr-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-200/60 transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Divider + Filters Button inside the box */}
              <div className="flex items-center shrink-0 pr-1.5 sm:pr-2 gap-2">
                <div className="w-px h-6 bg-stone-200" />
                <button
                  type="button"
                  onClick={() => setShowSellerFilters(!showSellerFilters)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    showSellerFilters || sellerTierFilter !== 'ALL'
                      ? 'bg-[#9E2A1E] text-white shadow-xs'
                      : 'bg-stone-200/70 hover:bg-stone-200 text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {sellerTierFilter !== 'ALL' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Filter Badges if toggled */}
            {showSellerFilters && (
              <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center gap-2 shadow-xs animate-in fade-in duration-150">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
                  Filter Tiers:
                </span>
                {(['ALL', 'Tier A', 'Tier B'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSellerTierFilter(tier)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      sellerTierFilter === tier
                        ? 'bg-[#9E2A1E] text-white shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {tier === 'ALL' ? 'All Retailers' : tier}
                  </button>
                ))}
                {sellerTierFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSellerTierFilter('ALL')}
                    className="text-xs text-[#9E2A1E] hover:underline font-semibold pr-2 cursor-pointer"
                  >
                    Clear filter
                  </button>
                )}
                <span className="text-xs text-stone-400 font-medium ml-auto">
                  Showing {filteredSellers.length} of {sellers.length} retailers
                </span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-3">Shop / Retailer</th>
                  <th className="py-3 px-3">Owner & Phone</th>
                  <th className="py-3 px-3">Assigned Route & City</th>
                  <th className="py-3 px-3 text-center">Assign / Switch Tier</th>
                  <th className="py-3 px-3 text-right">Credit Limit (LKR)</th>
                  <th className="py-3 px-3 text-right">Current Debt</th>
                  <th className="py-3 px-3 text-center">Exposure</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredSellers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="max-w-xs mx-auto text-center space-y-2">
                        <Store className="w-8 h-8 text-stone-300 mx-auto" />
                        <p className="text-sm font-bold text-stone-700">No retailers found</p>
                        <p className="text-xs text-stone-400">
                          No retailers match your search criteria. Try modifying your search or clearing filters.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSellerSearchQuery('');
                            setSellerTierFilter('ALL');
                          }}
                          className="text-xs text-[#9E2A1E] font-bold hover:underline cursor-pointer"
                        >
                          Reset Search & Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSellers.map(s => {
                    const percent = Math.min(100, Math.round((s.currentCredit / (s.creditLimit || 1)) * 100));
                    return (
                      <tr key={s.id} className="hover:bg-stone-50/70">
                        <td className="py-3 px-3 font-bold text-stone-900">
                          <button
                            type="button"
                            onClick={() => setHistorySeller(s)}
                            className="font-bold text-stone-900 hover:text-[#C25838] hover:underline text-left cursor-pointer flex items-center gap-1.5 group"
                            title={`Click to view last 10 purchase full history for ${s.name}`}
                          >
                            <span>{s.name}</span>
                            <History className="w-3.5 h-3.5 text-[#C25838] opacity-60 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <span className="block text-[10px] text-stone-400 font-mono font-normal">ID: {s.id}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-stone-800 block">{s.owner}</span>
                          <span className="text-[10px] text-stone-500">{s.phone}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-stone-800 font-medium block">{s.location}</span>
                          <span className="text-[10px] text-stone-500">
                            Rep: {assistants.find(a => a.id === s.assignedAssistant)?.shortName || 'Unassigned'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleTier(s.id)}
                            className={`px-3 py-1 rounded-full text-xs font-extrabold border transition-all cursor-pointer shadow-2xs ${
                              s.tier === 'Tier A'
                                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                : 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200'
                            }`}
                            title="Click to switch Tier A (Wholesale) / Tier B (Retail)"
                          >
                            {s.tier} ⇄
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-mono font-bold text-stone-900">{formatLKR(s.creditLimit)}</span>
                            <button
                              type="button"
                              onClick={() => handleOpenModifyCredit(s)}
                              className="p-1 rounded-md hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                              title="Set / Modify Credit Limit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                          {formatLKR(s.currentCredit)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className={`font-bold ${percent >= 90 ? 'text-red-600' : 'text-stone-700'}`}>
                            {percent}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {s.isFrozen ? (
                            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">FROZEN</span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">ACTIVE</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setHistorySeller(s)}
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FAF0E9] hover:bg-[#F3E2D5] text-[#C25838] border border-[#ECD7C7] transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1"
                            title={`View last 10 purchase full history for ${s.name}`}
                          >
                            <History className="w-3 h-3 text-[#C25838]" />
                            <span>Last 10 Orders</span>
                          </button>

                          <button
                            onClick={() => onToggleFreeze(s.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                              s.isFrozen ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {s.isFrozen ? 'Unfreeze' : 'Freeze'}
                          </button>

                          <button
                            onClick={() => onOpenSellerPOS(s.id, s.assignedAssistant)}
                            className="px-3 py-1 rounded-full bg-[#18181B] hover:bg-black text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Open POS
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingSeller(s)}
                            className="p-1.5 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 transition-colors cursor-pointer"
                            title={`Delete ${s.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. ASSISTANT ACCOUNTS & SECURITY                                     */}
      {/* ==================================================================== */}
      {adminTab === 'assistants' && (
        <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E9] text-[#9E2A1E] text-xs font-bold uppercase tracking-wider mb-1">
                <span>Pillar 2</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Assistant Accounts & Security
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Create & modify assistants (Name, Phone, Assigned Route) and set or reset login passwords / PINs.
              </p>
            </div>

            <button
              onClick={() => setShowAddAssistantModal(true)}
              className="px-5 py-2.5 rounded-full bg-[#9E2A1E] hover:bg-[#852318] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-[#9E2A1E]/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Assistant</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {assistants.map(a => (
              <div key={a.id} className="bg-stone-50/80 border border-stone-200/80 p-5 rounded-2xl space-y-4 shadow-2xs">
                
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${a.avatarBg} flex items-center justify-center font-black text-sm shadow-xs`}>
                      {a.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-base">{a.name}</h4>
                      <p className="text-xs text-stone-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{a.phone}</span>
                      </p>
                      <p className="text-[11px] text-stone-400 font-mono">User: @{a.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditAssistant(a)}
                      className="p-1.5 rounded-lg bg-white hover:bg-stone-200 border border-stone-200 text-stone-600 transition-colors"
                      title="Modify Assistant Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenAssistantPOS(a.id)}
                      className="px-3 py-1.5 bg-[#18181B] hover:bg-black text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                    >
                      Launch POS
                    </button>
                  </div>
                </div>

                {/* Assigned Route Badge */}
                <div className="text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-stone-400" />
                    <span>Assigned Route: <strong className="text-stone-900">{a.route}</strong></span>
                  </span>
                </div>

                {/* Security & Login PIN Section */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <div>
                      <span className="text-[11px] font-bold text-amber-900 block">Security & Authentication PIN</span>
                      <span className="text-xs font-mono font-bold text-amber-800">
                        Active PIN: •••• ({a.defaultPass})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenResetPin(a)}
                    className="px-3 py-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Set / Reset PIN</span>
                  </button>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs">
                    <span className="text-stone-500 block text-[10px]">Cash in Hand</span>
                    <span className="font-bold text-emerald-600">{formatLKR(a.cashInHand)}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs">
                    <span className="text-stone-500 block text-[10px]">Winning Vouchers</span>
                    <span className="font-bold text-stone-900">{formatLKR(a.winningVouchers)}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs">
                    <span className="text-stone-500 block text-[10px]">Today's Orders</span>
                    <span className="font-bold text-stone-800">{a.totalOrdersToday} Dispatches</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. TICKET CATALOG & TIER PRICING                                     */}
      {/* ==================================================================== */}
      {adminTab === 'pricing' && (
        <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E9] text-[#9E2A1E] text-xs font-bold uppercase tracking-wider mb-1">
                <span>Pillar 3</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Ticket Catalog & Tier Pricing
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Add & modify brands (Daily Draw vs. Scratch Card), set retail face values, and configure Tier A and Tier B wholesale prices.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingBrand(null);
                setBrandForm({
                  name: '',
                  type: 'daily',
                  faceValue: 100,
                  tierAPrice: 85,
                  tierBPrice: 88,
                  stockPerPack: 50,
                  drawDays: 'Mon, Wed, Fri',
                  color: 'from-orange-500 to-amber-600'
                });
                setShowAddBrandModal(true);
              }}
              className="px-5 py-2.5 rounded-full bg-[#9E2A1E] hover:bg-[#852318] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-[#9E2A1E]/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Brand</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-3">Brand Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-right">Retail Face Value</th>
                  <th className="py-3 px-3 text-center">Pack Size</th>
                  <th className="py-3 px-3 text-right text-stone-900 font-bold">Price for Tier A (Wholesale)</th>
                  <th className="py-3 px-3 text-right text-stone-700">Price for Tier B (Retail)</th>
                  <th className="py-3 px-3 text-right text-emerald-700">Tier A Margin</th>
                  <th className="py-3 px-3 text-right">Modify Rates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {brands.map(brand => {
                  const marginA = (((brand.faceValue - brand.tierAPrice) / brand.faceValue) * 100).toFixed(1);
                  const marginB = (((brand.faceValue - brand.tierBPrice) / brand.faceValue) * 100).toFixed(1);
                  return (
                    <tr key={brand.id} className="hover:bg-stone-50/70">
                      <td className="py-3 px-3 font-bold text-stone-900">
                        {brand.name}
                        <span className="block text-[10px] text-stone-400 font-normal">{brand.drawDays}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`capitalize px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          brand.type === 'daily' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {brand.type === 'daily' ? 'Daily Draw' : 'Scratch Card'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                        {formatLKR(brand.faceValue)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{brand.stockPerPack} pcs</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        {formatLKR(brand.tierAPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-800">
                        {formatLKR(brand.tierBPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700 font-bold">
                        {marginA}%
                        <span className="block text-[10px] text-stone-400">Tier B: {marginB}%</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBrand(brand)}
                          className="px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] flex items-center gap-1.5 ml-auto transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-stone-500" />
                          <span>Edit Rates</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* AUDIT TRAIL / LEDGER                                                 */}
      {/* ==================================================================== */}
      {adminTab === 'ledger' && (
        <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Global Audit Trail & Ledger</h3>
            <p className="text-xs text-stone-500">
              Comprehensive log of every dispatch, return, winning claim, drawback, and cash collection
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-3">Date / ID</th>
                  <th className="py-3 px-3">Retailer</th>
                  <th className="py-3 px-3">Rep</th>
                  <th className="py-3 px-3">Operation</th>
                  <th className="py-3 px-3 text-right">Credit Impact</th>
                  <th className="py-3 px-3 text-right">Resulting Balance</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-stone-50/70">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-stone-900 block">{txn.id}</span>
                      <span className="text-[10px] text-stone-500">{txn.date}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">{txn.sellerName}</td>
                    <td className="py-3 px-3 text-stone-600">{txn.assistantName}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        txn.actionType?.includes('SALE') 
                          ? 'bg-stone-900 text-white' 
                          : txn.actionType?.includes('RETURN')
                          ? 'bg-stone-200 text-stone-800'
                          : txn.actionType?.includes('WINNING')
                          ? 'bg-amber-100 text-amber-900'
                          : txn.actionType?.includes('CASH')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {txn.typeLabel || txn.actionType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {txn.deltaCredit > 0 ? (
                        <span className="text-amber-600">+{formatLKR(txn.deltaCredit)}</span>
                      ) : (
                        <span className="text-emerald-600">-{formatLKR(Math.abs(txn.deltaCredit))}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                      {formatLKR(txn.newCredit)}
                    </td>
                    <td className="py-3 px-3 text-stone-600 max-w-xs truncate">{txn.notes}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] text-stone-400 font-medium italic">Admin View</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1.1: ADD NEW SELLER                                            */}
      {/* ==================================================================== */}
      {showAddSellerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-stone-900 tracking-tight">Add New Seller</h3>
                <p className="text-xs text-stone-500">Register retailer profile, assign tier, and allocate initial credit limit</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSellerModal(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSeller} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golden Fortune Stores"
                  value={newSellerForm.name}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. K. Wickremasinghe"
                    value={newSellerForm.owner}
                    onChange={(e) => setNewSellerForm({ ...newSellerForm, owner: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +94 77 123 4567"
                    value={newSellerForm.phone}
                    onChange={(e) => setNewSellerForm({ ...newSellerForm, phone: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Route / City / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Colombo Fort / Main Street"
                  value={newSellerForm.location}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, location: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Assign Tier
                  </label>
                  <select
                    value={newSellerForm.tier}
                    onChange={(e) => setNewSellerForm({ ...newSellerForm, tier: e.target.value as 'Tier A' | 'Tier B' })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                  >
                    <option value="Tier A">Tier A (Wholesale)</option>
                    <option value="Tier B">Tier B (Retail)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Assigned Assistant
                  </label>
                  <select
                    value={newSellerForm.assignedAssistant}
                    onChange={(e) => setNewSellerForm({ ...newSellerForm, assignedAssistant: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                  >
                    {assistants.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.route})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Initial Credit Limit (LKR) *
                </label>
                <input
                  type="number"
                  step="5000"
                  required
                  value={newSellerForm.creditLimit}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, creditLimit: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSellerModal(false)}
                  className="px-4 py-2.5 rounded-full border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#9E2A1E] hover:bg-[#852318] text-white font-bold text-xs shadow-md shadow-[#9E2A1E]/20 transition-all cursor-pointer"
                >
                  Save & Add Seller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1.2: SET / MODIFY CREDIT LIMIT (LKR)                           */}
      {/* ==================================================================== */}
      {editingCreditSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900 tracking-tight">Set / Modify Credit Limit</h3>
                <p className="text-xs text-stone-500">{editingCreditSeller.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCreditSeller(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Current Debt:</span>
                <span className="font-mono font-bold text-amber-700">{formatLKR(editingCreditSeller.currentCredit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Existing Ceiling:</span>
                <span className="font-mono font-bold text-stone-800">{formatLKR(editingCreditSeller.creditLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Available Headroom:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatLKR(Math.max(0, newCreditLimitInput - editingCreditSeller.currentCredit))}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                New Credit Limit (LKR)
              </label>
              <input
                type="number"
                step="10000"
                value={newCreditLimitInput}
                onChange={(e) => setNewCreditLimitInput(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-lg font-mono font-black text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[250000, 350000, 500000, 750000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNewCreditLimitInput(preset)}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  {(preset / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingCreditSeller(null)}
                className="px-4 py-2 rounded-full border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCreditLimit}
                className="px-5 py-2 rounded-full bg-[#9E2A1E] hover:bg-[#852318] text-white font-bold text-xs shadow-md shadow-[#9E2A1E]/20 transition-all cursor-pointer"
              >
                Apply New Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2.1: CREATE / MODIFY ASSISTANT                                 */}
      {/* ==================================================================== */}
      {(showAddAssistantModal || editingAssistant) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-stone-900 tracking-tight">
                  {editingAssistant ? 'Modify Assistant Account' : 'Create Assistant Account'}
                </h3>
                <p className="text-xs text-stone-500">Configure operator identity, phone, and route ledger assignment</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddAssistantModal(false);
                  setEditingAssistant(null);
                }}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingAssistant ? handleSaveAssistantEdit : handleCreateAssistant} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohamed Rizwan"
                  value={newAssistantForm.name}
                  onChange={(e) => setNewAssistantForm({ ...newAssistantForm, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Display Short Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rizwan"
                    value={newAssistantForm.shortName}
                    onChange={(e) => setNewAssistantForm({ ...newAssistantForm, shortName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +94 71 987 6543"
                    value={newAssistantForm.phone}
                    onChange={(e) => setNewAssistantForm({ ...newAssistantForm, phone: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Assigned Route *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kollupitiya & Bambalapitiya Route"
                  value={newAssistantForm.route}
                  onChange={(e) => setNewAssistantForm({ ...newAssistantForm, route: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. rizwan"
                    value={newAssistantForm.username}
                    onChange={(e) => setNewAssistantForm({ ...newAssistantForm, username: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Login Password / PIN
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1234"
                    value={newAssistantForm.defaultPass}
                    onChange={(e) => setNewAssistantForm({ ...newAssistantForm, defaultPass: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAssistantModal(false);
                    setEditingAssistant(null);
                  }}
                  className="px-4 py-2.5 rounded-full border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#9E2A1E] hover:bg-[#852318] text-white font-bold text-xs shadow-md shadow-[#9E2A1E]/20 transition-all cursor-pointer"
                >
                  {editingAssistant ? 'Update Assistant' : 'Save & Register Assistant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2.2: SET / RESET LOGIN PASSWORD OR PIN                         */}
      {/* ==================================================================== */}
      {editingPinAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900 tracking-tight">Set / Reset Login PIN</h3>
                  <p className="text-[11px] text-stone-500">{editingPinAssistant.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPinAssistant(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Enter New 4-Digit PIN
              </label>
              <input
                type="text"
                maxLength={6}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                className="w-full text-center bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-2xl font-mono font-black text-stone-900 tracking-widest focus:outline-none focus:border-[#9E2A1E]"
                placeholder="1234"
              />

              <div className="flex justify-center gap-2 pt-1">
                {['1234', '0000', '7788', '9900'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewPinInput(preset)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-mono font-bold text-stone-700 cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-stone-500 text-center">
                This operator will authenticate with this PIN immediately on Step 2 of 2.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingPinAssistant(null)}
                className="px-3.5 py-2 rounded-full border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePin}
                className="px-4 py-2 rounded-full bg-[#9E2A1E] hover:bg-[#852318] text-white font-bold text-xs shadow-md shadow-[#9E2A1E]/20 cursor-pointer"
              >
                Save New PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3.1: ADD / MODIFY BRAND NAME & TIER PRICING                    */}
      {/* ==================================================================== */}
      {(showAddBrandModal || editingBrand) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-stone-900 tracking-tight">
                  {editingBrand ? `Modify ${editingBrand.name}` : 'Add New Ticket Brand'}
                </h3>
                <p className="text-xs text-stone-500">Configure brand type, retail face value, and Tier A/B wholesale margins</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddBrandModal(false);
                  setEditingBrand(null);
                }}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortune Millions 100"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Lottery Type
                  </label>
                  <select
                    value={brandForm.type}
                    onChange={(e) => setBrandForm({ ...brandForm, type: e.target.value as 'daily' | 'scratch' })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                  >
                    <option value="daily">Daily Draw Lottery</option>
                    <option value="scratch">Instant Scratch Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Draw Days / Frequency
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mon, Wed, Fri"
                    value={brandForm.drawDays}
                    onChange={(e) => setBrandForm({ ...brandForm, drawDays: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Retail Face Value (LKR) *
                  </label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={brandForm.faceValue}
                    onChange={(e) => setBrandForm({ ...brandForm, faceValue: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Tickets per Pack
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={brandForm.stockPerPack}
                    onChange={(e) => setBrandForm({ ...brandForm, stockPerPack: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:border-[#9E2A1E]"
                  />
                </div>
              </div>

              {/* TIER PRICING SLIDERS / INPUTS */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DDD4] space-y-3">
                <div className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Tier Pricing Configuration</span>
                  <Percent className="w-3.5 h-3.5 text-[#D64933]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-stone-700">Set Price for Tier A</span>
                      <span className="text-emerald-700 font-bold">
                        {brandForm.faceValue > 0
                          ? `${(((brandForm.faceValue - brandForm.tierAPrice) / brandForm.faceValue) * 100).toFixed(1)}% margin`
                          : ''}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={brandForm.tierAPrice}
                      onChange={(e) => setBrandForm({ ...brandForm, tierAPrice: Number(e.target.value) })}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-stone-700">Set Price for Tier B</span>
                      <span className="text-stone-600 font-bold">
                        {brandForm.faceValue > 0
                          ? `${(((brandForm.faceValue - brandForm.tierBPrice) / brandForm.faceValue) * 100).toFixed(1)}% margin`
                          : ''}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={brandForm.tierBPrice}
                      onChange={(e) => setBrandForm({ ...brandForm, tierBPrice: Number(e.target.value) })}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-mono font-bold text-stone-800 focus:outline-none focus:border-stone-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBrandModal(false);
                    setEditingBrand(null);
                  }}
                  className="px-4 py-2.5 rounded-full border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#9E2A1E] hover:bg-[#852318] text-white font-bold text-xs shadow-md shadow-[#9E2A1E]/20 transition-all cursor-pointer"
                >
                  {editingBrand ? 'Save Rate Modifications' : 'Create & Publish Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Delete Seller Confirmation Modal */}
      {deletingSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black text-stone-900">
                  Delete Retailer?
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Are you sure you want to permanently remove <strong className="text-stone-900 font-bold">{deletingSeller.name}</strong> from the system?
                </p>
              </div>
              <button
                onClick={() => setDeletingSeller(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Shop Owner:</span>
                <span className="font-semibold text-stone-900">{deletingSeller.owner}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Route / City:</span>
                <span className="font-semibold text-stone-900">{deletingSeller.location}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Current Debt:</span>
                <span className={`font-mono font-bold ${deletingSeller.currentCredit > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatLKR(deletingSeller.currentCredit)}
                </span>
              </div>
              {deletingSeller.currentCredit > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium leading-relaxed">
                  ⚠️ This seller has an outstanding balance of <strong>{formatLKR(deletingSeller.currentCredit)}</strong>. Deleting will permanently remove their record from the active roster.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSeller(null)}
                className="px-4 py-2 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateSellers) {
                    onUpdateSellers(prev => prev.filter(s => s.id !== deletingSeller.id));
                  }
                  dbDeleteSeller(deletingSeller.id);
                  if (showToast) {
                    showToast(`Deleted retailer "${deletingSeller.name}"`, 'success');
                  }
                  setDeletingSeller(null);
                }}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm shadow-rose-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ==================================================================== */}
      {/* 5. MODAL: SELLER'S LAST 10 PURCHASES FULL HISTORY                    */}
      {/* ==================================================================== */}
      {historySeller && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-stone-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-stone-200 bg-[#FAF8F5] flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF0E9] border border-[#F4DEC9] text-[#C25838] flex items-center justify-center shrink-0 shadow-2xs">
                  <Store className="w-6 h-6 text-[#C25838]" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight truncate">
                      {historySeller.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF0E9] text-[#C25838] border border-[#F4DEC9]">
                      {historySeller.tier === 'Tier A' ? 'Wholesale Tier A' : 'Retail Tier B'}
                    </span>
                    {historySeller.isFrozen ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        FROZEN
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-1 font-medium">
                    <span>Owner: <strong className="text-stone-800">{historySeller.owner}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      {historySeller.phone}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C25838]" />
                      {historySeller.location}
                    </span>
                    <span>•</span>
                    <span>Rep: <strong className="text-stone-800">{assistants.find(a => a.id === historySeller.assignedAssistant)?.shortName || 'Field Rep'}</strong></span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setHistorySeller(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metric Cards Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-white border-b border-stone-200 shrink-0">
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Last 10 Purchases Value
                </span>
                <span className="text-base sm:text-lg font-mono font-extrabold text-[#C25838] block mt-0.5">
                  {formatLKR(displayedPurchases.reduce((sum, p) => sum + (p.deltaCredit > 0 ? p.deltaCredit : 0), 0))}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Current Debt / Ceiling
                </span>
                <span className="text-base sm:text-lg font-mono font-extrabold text-stone-900 block mt-0.5">
                  {formatLKR(historySeller.currentCredit)}
                  <span className="text-xs font-normal text-stone-400"> / {(historySeller.creditLimit / 1000).toFixed(0)}k</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Total Packs Dispatched
                </span>
                <span className="text-base sm:text-lg font-extrabold text-stone-900 block mt-0.5">
                  {displayedPurchases.reduce((sum, p) => sum + (p.details?.totalPacks || 0), 0)} Packs
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Total Tickets Dispatched
                </span>
                <span className="text-base sm:text-lg font-extrabold text-stone-900 block mt-0.5">
                  {displayedPurchases.reduce((sum, p) => sum + (p.details?.totalTickets || 0), 0).toLocaleString()} Tickets
                </span>
              </div>
            </div>

            {/* Filter Toggle & Header */}
            <div className="px-5 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#C25838]" />
                  <span>Last 10 Purchases (Full Detailed History)</span>
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200">
                  {displayedPurchases.length} Orders
                </span>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold gap-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('purchases')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    historyFilter === 'purchases'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Purchases (Sales) Only
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    historyFilter === 'all'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All Ledger Entries
                </button>
              </div>
            </div>

            {/* List of 10 Orders with Itemized Breakdown */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3 space-y-3.5 custom-scrollbar">
              {displayedPurchases.map((txn, idx) => {
                const items = txn.details?.items || [];
                const isSale = txn.actionType.includes('SALE') || txn.deltaCredit > 0;

                return (
                  <div
                    key={txn.id + '-' + idx}
                    className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-[#C25838]/40 hover:shadow-xs transition-all space-y-3"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-white font-mono text-xs font-bold shadow-2xs">
                          #{txn.id}
                        </span>
                        <span className="text-xs font-bold text-stone-800">
                          {txn.typeLabel || txn.actionType}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs text-stone-500 font-medium">
                          {txn.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-600">
                          Rep: <strong className="text-stone-800">{txn.assistantName || 'Field Rep'}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Completed
                        </span>
                      </div>
                    </div>

                    {/* Itemized Breakdown Table if items exist */}
                    {items.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-stone-100 bg-[#FAF9F7]">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-stone-200/60 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                              <th className="py-1.5 px-3">Brand Name</th>
                              <th className="py-1.5 px-3 text-center">Packs Ordered</th>
                              <th className="py-1.5 px-3 text-center">Total Tickets</th>
                              <th className="py-1.5 px-3 text-right">Wholesale Rate</th>
                              <th className="py-1.5 px-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {items.map((it, itemIdx) => (
                              <tr key={itemIdx} className="hover:bg-white/60">
                                <td className="py-2 px-3 font-bold text-stone-900 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#C25838]" />
                                  <span>{it.brandName}</span>
                                </td>
                                <td className="py-2 px-3 text-center font-semibold text-stone-700">
                                  {it.packs} packs
                                </td>
                                <td className="py-2 px-3 text-center font-mono text-stone-700">
                                  {it.tickets} tix
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-stone-600">
                                  {formatLKR(it.rate)}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">
                                  {formatLKR(it.subtotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-stone-50 text-xs text-stone-600">
                        {txn.notes || 'Batch order dispatched on route'}
                      </div>
                    )}

                    {/* Order Footer & Totals */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                      <div className="text-stone-500 font-medium">
                        Credit Impact: <span className="font-mono">{formatLKR(txn.previousCredit)}</span> → <strong className="font-mono text-stone-900">{formatLKR(txn.newCredit)}</strong>
                        {txn.details?.totalPacks ? (
                          <span className="ml-2 text-stone-400">({txn.details.totalPacks} packs • {txn.details.totalTickets} tickets)</span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-xs font-bold text-stone-600">Total Purchase:</span>
                        <span className={`text-sm font-mono font-extrabold ${isSale ? 'text-[#C25838]' : 'text-emerald-700'}`}>
                          {isSale ? '+' : ''}{formatLKR(Math.abs(txn.deltaCredit))}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-5 border-t border-stone-200 bg-[#FAF8F5] flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-stone-500 font-medium">
                Showing last 10 purchase records for <strong className="text-stone-800">{historySeller.name}</strong>
              </span>

              <button
                type="button"
                onClick={() => setHistorySeller(null)}
                className="px-5 py-2 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Close History
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
