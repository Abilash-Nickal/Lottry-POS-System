import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { LotteryBrand, Assistant, Seller, Transaction } from '../types';
import { formatLKR } from '../utils/formatters';

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
          const nextTier = s.tier === 'Tier A' ? 'Tier B' : 'Tier A';
          if (showToast) showToast(`${s.name} switched to ${nextTier}`, 'success');
          return { ...s, tier: nextTier };
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
      prev.map(s => (s.id === editingCreditSeller.id ? { ...s, creditLimit: limit } : s))
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
      prev.map(a => (a.id === editingPinAssistant.id ? { ...a, defaultPass: newPinInput } : a))
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
      prev.map(a =>
        a.id === editingAssistant.id
          ? {
              ...a,
              name: newAssistantForm.name,
              shortName: newAssistantForm.shortName || newAssistantForm.name.split(' ')[0],
              phone: newAssistantForm.phone,
              route: newAssistantForm.route,
              username: newAssistantForm.username,
              defaultPass: newAssistantForm.defaultPass
            }
          : a
      )
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
      // Update existing brand
      if (onUpdateBrands) {
        onUpdateBrands(prev =>
          prev.map(b =>
            b.id === editingBrand.id
              ? {
                  ...b,
                  name: brandForm.name,
                  type: brandForm.type,
                  faceValue: Number(brandForm.faceValue),
                  tierAPrice: Number(brandForm.tierAPrice),
                  tierBPrice: Number(brandForm.tierBPrice),
                  stockPerPack: Number(brandForm.stockPerPack),
                  drawDays: brandForm.drawDays
                }
              : b
          )
        );
      }
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
            Distribution Head Hub
          </h2>
          <p className="text-gray-500 text-sm mt-0.5 font-medium">
            Manage Sellers, Assistant Accounts & Security, and Ticket Catalog & Tier Pricing.
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
                {sellers.map(s => {
                  const percent = Math.min(100, Math.round((s.currentCredit / (s.creditLimit || 1)) * 100));
                  return (
                    <tr key={s.id} className="hover:bg-stone-50/70">
                      <td className="py-3 px-3 font-bold text-stone-900">
                        {s.name}
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
                            className="p-1 rounded-md hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors"
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
                      <button
                        onClick={() => onOpenSlipModal(txn)}
                        className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                        title="View Official Receipt Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
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

    </div>
  );
};
