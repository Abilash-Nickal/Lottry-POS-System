import { useState, useMemo, useEffect } from 'react';
import { 
  LotteryBrand, 
  Assistant, 
  Seller, 
  Transaction, 
  CompletedSlip, 
  StepType, 
  ActionModalType,
  AdminProfile
} from '../types';
import { 
  INITIAL_BRANDS, 
  INITIAL_ASSISTANTS, 
  INITIAL_SELLERS, 
  INITIAL_TRANSACTIONS,
  INITIAL_ADMIN_PROFILE
} from '../data/initialData';
import { formatLKR } from '../utils/formatters';
import { 
  fetchAllData, 
  dbRecordTransaction, 
  dbUpsertSeller,
  getAdminProfile,
  dbUpsertAdminProfile,
  dbResetSellerTransactions
} from '../lib/supabaseService';

/**
 * MASTER STATE HOOK FOR LOTTERY POS SYSTEM
 * 
 * Separates data logic, state persistence, and ledger calculations
 * from the UI view so any changes can be made simply and cleanly.
 */
export function usePOSState() {
  // Navigation & Step State: Initial load starts with simple SPLASH loading screen, then transitions to USER_SELECT
  const [currentStep, setCurrentStep] = useState<StepType>('SPLASH');
  const [pendingUserRole, setPendingUserRole] = useState<'admin' | 'assistant' | null>(null);
  const [pendingAssistantId, setPendingAssistantId] = useState<string | null>(null);
  const [authenticatedRole, setAuthenticatedRole] = useState<'admin' | 'assistant' | null>(null);

  // Active Selections
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>('ast1');
  const [selectedSellerId, setSelectedSellerId] = useState<string>('s7');

  // Master Data State
  const [brands, setBrands] = useState<LotteryBrand[]>(INITIAL_BRANDS);
  const [sellers, setSellers] = useState<Seller[]>(INITIAL_SELLERS);
  const [assistants, setAssistants] = useState<Assistant[]>(INITIAL_ASSISTANTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(getAdminProfile());

  // Initialize and synchronize live data with Supabase
  useEffect(() => {
    let isMounted = true;
    fetchAllData()
      .then((data) => {
        if (!isMounted) return;
        if (data.sellers) setSellers(data.sellers);
        if (data.assistants) setAssistants(data.assistants);
        if (data.brands) setBrands(data.brands);
        if (data.transactions !== undefined) setTransactions(data.transactions);
        if (data.adminProfile) setAdminProfile(data.adminProfile);
      })
      .catch((err) => {
        console.warn('Supabase fetch error, using local fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateAdminProfile = (updated: AdminProfile) => {
    setAdminProfile(updated);
    dbUpsertAdminProfile(updated);
    showToast(`Admin profile updated: ${updated.name}`, 'success');
  };

  // Action Modals & Receipt State
  const [activeActionModal, setActiveActionModal] = useState<ActionModalType>(null);
  const [completedSlip, setCompletedSlip] = useState<CompletedSlip | null>(null);

  // Toast System
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Helper Memoized Objects
  const currentAssistant = useMemo(() => {
    return assistants.find(a => a.id === selectedAssistantId) || assistants[0];
  }, [assistants, selectedAssistantId]);

  const currentSeller = useMemo(() => {
    return sellers.find(s => s.id === selectedSellerId) || sellers[0];
  }, [sellers, selectedSellerId]);

  const sellerTransactions = useMemo(() => {
    if (!currentSeller) return [];
    return transactions.filter(t => t.sellerId === currentSeller.id);
  }, [transactions, currentSeller]);

  const totalMarketCredit = useMemo(() => {
    return sellers.reduce((acc, s) => acc + s.currentCredit, 0);
  }, [sellers]);

  // --------------------------------------------------------------------------
  // ROLE SELECTION & LOGIN HANDLERS
  // --------------------------------------------------------------------------
  const handleSelectRole = (role: 'admin' | 'assistant', assistantId?: string) => {
    setPendingUserRole(role);
    setPendingAssistantId(assistantId || null);
    setCurrentStep('USER_LOGIN');
  };

  // Flow 1: press admin -> opens login page for admin
  const handleSelectAdmin = () => {
    setPendingUserRole('admin');
    setPendingAssistantId(null);
    setCurrentStep('USER_LOGIN');
  };

  // Flow 2: press distributors -> select distributors -> login -> panel
  const handleSelectDistributors = () => {
    setCurrentStep('DISTRIBUTOR_SELECT');
  };

  const handleSelectDistributorProfile = (assistantId: string) => {
    setPendingUserRole('assistant');
    setPendingAssistantId(assistantId);
    setCurrentStep('USER_LOGIN');
  };

  const handleLoginBack = () => {
    setCurrentStep('USER_SELECT');
  };

  const handleLoginSuccess = (role: 'admin' | 'assistant', assistantId?: string) => {
    setAuthenticatedRole(role);
    if (role === 'admin') {
      showToast('Authenticated as Distributor Head (Admin)', 'success');
      setCurrentStep('ADMIN_DASHBOARD');
    } else {
      const astId = assistantId || pendingAssistantId || 'ast1';
      setSelectedAssistantId(astId);
      const ast = assistants.find(a => a.id === astId);
      showToast(`Welcome ${ast?.shortName}! Field POS terminal loaded.`, 'success');
      setCurrentStep('SELLER_SELECT');
    }
  };

  // --------------------------------------------------------------------------
  // TRANSACTION DISPATCH & LEDGER UPDATE
  // --------------------------------------------------------------------------
  const executeLedgerUpdate = (params: {
    actionType: string;
    typeLabel: string;
    deltaCredit: number;
    notes?: string;
    slipDetails?: any;
  }) => {
    const prevCredit = currentSeller.currentCredit;
    const nextCredit = Math.max(0, prevCredit + params.deltaCredit);

    // Update seller debt
    setSellers(prev => prev.map(s => {
      if (s.id === currentSeller.id) {
        return {
          ...s,
          currentCredit: nextCredit,
          isFrozen: nextCredit > s.creditLimit ? true : s.isFrozen
        };
      }
      return s;
    }));

    const txnId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTxn: Transaction = {
      id: txnId,
      date: formattedDate,
      sellerId: currentSeller.id,
      sellerName: currentSeller.name,
      assistantId: currentAssistant.id,
      assistantName: currentAssistant.shortName,
      actionType: params.actionType,
      typeLabel: params.typeLabel,
      deltaCredit: params.deltaCredit,
      previousCredit: prevCredit,
      newCredit: nextCredit,
      notes: params.notes || '',
      details: params.slipDetails
    };

    setTransactions(prev => [newTxn, ...prev]);
    setActiveActionModal(null);
    showToast(`${params.typeLabel} confirmed! Credit updated to ${formatLKR(nextCredit)}`, 'success');

    // Persist transaction & updated seller debt to Supabase in the background
    dbRecordTransaction(newTxn, nextCredit);
  };

  // Case 6: Sale Dispatch Confirmation
  const handleConfirmSaleDispatch = (data: {
    categoryDesc: string;
    targetDayStr: string;
    items: Array<{
      dateStr: string;
      brandName: string;
      packs: number;
      tickets: number;
      rate: number;
      subtotal: number;
    }>;
    totalPacks: number;
    totalTickets: number;
    totalBill: number;
    dispatchNote: string;
  }) => {
    executeLedgerUpdate({
      actionType: '3.1 SALE',
      typeLabel: `${data.categoryDesc} (${data.targetDayStr.split(' ')[0]})`,
      deltaCredit: data.totalBill,
      notes: data.dispatchNote || `${data.categoryDesc} for ${data.targetDayStr} | ${data.totalPacks} packs (${data.totalTickets} tix)`,
      slipDetails: {
        category: data.categoryDesc,
        targetDay: data.targetDayStr,
        items: data.items,
        totalPacks: data.totalPacks,
        totalTickets: data.totalTickets,
        totalBill: data.totalBill
      }
    });
    setCurrentStep('SELLER_WORKSPACE');
  };

  // Case 7: Return Confirmation
  const handleConfirmReturn = (data: {
    returnItems: Array<{ brandName: string; packs: number; rate: number; subtotal: number }>;
    totalPacks: number;
    totalRefund: number;
    reason: string;
    batchRef: string;
  }) => {
    executeLedgerUpdate({
      actionType: '3.2 RETURN',
      typeLabel: 'Pack Return (Pre-draw / Unsold)',
      deltaCredit: -data.totalRefund,
      notes: `${data.reason} | Batch: ${data.batchRef || 'Verified'} | Returned ${data.totalPacks} packs`,
      slipDetails: {
        returnItems: data.returnItems,
        reason: data.reason,
        batchRef: data.batchRef,
        totalPacks: data.totalPacks,
        totalRefund: data.totalRefund
      }
    });
  };

  // Case 8: Winning Confirmation
  const handleConfirmWinning = (data: {
    totalWinningOffset: number;
    envelopeNo: string;
    ticketCount: string;
    breakdown: Record<string, string>;
  }) => {
    setAssistants(prev => prev.map(a => {
      if (a.id === currentAssistant.id) {
        return { ...a, winningVouchers: a.winningVouchers + data.totalWinningOffset };
      }
      return a;
    }));

    executeLedgerUpdate({
      actionType: '3.3 WINNING',
      typeLabel: 'Pay by Winning Tickets Offset',
      deltaCredit: -data.totalWinningOffset,
      notes: `Sealed Envelope #${data.envelopeNo} | ${data.ticketCount} | Prize: ${formatLKR(data.totalWinningOffset)}`,
      slipDetails: {
        envelopeNo: data.envelopeNo,
        ticketCount: data.ticketCount,
        totalWinningOffset: data.totalWinningOffset,
        breakdown: data.breakdown
      }
    });
  };

  // Case 9: Non-Winning Confirmation
  const handleConfirmNonWinning = (data: {
    brandName: string;
    stubCount: string;
    ratePerStub: string;
    schemeRef: string;
    totalReimbursement: number;
  }) => {
    executeLedgerUpdate({
      actionType: '3.4 NON_WINNING',
      typeLabel: 'Non-Winning Stubs Drawback',
      deltaCredit: -data.totalReimbursement,
      notes: `${data.brandName} ${data.stubCount} stubs @ ${formatLKR(data.ratePerStub)}/stub | Scheme: ${data.schemeRef}`,
      slipDetails: {
        brandName: data.brandName,
        stubCount: data.stubCount,
        ratePerStub: data.ratePerStub,
        schemeRef: data.schemeRef,
        totalReimbursement: data.totalReimbursement
      }
    });
  };

  // Case 10: Cash Confirmation
  const handleConfirmCash = (data: {
    cashAmount: number;
    reference: string;
  }) => {
    setAssistants(prev => prev.map(a => {
      if (a.id === currentAssistant.id) {
        return { ...a, cashInHand: a.cashInHand + data.cashAmount };
      }
      return a;
    }));

    executeLedgerUpdate({
      actionType: '3.5 CASH',
      typeLabel: 'Pay by Cash Direct Settlement',
      deltaCredit: -data.cashAmount,
      notes: data.reference ? `Direct cash receipt: ${data.reference}` : 'Field route cash collection',
      slipDetails: {
        cashAmount: data.cashAmount,
        reference: data.reference,
        assistantName: currentAssistant.shortName
      }
    });
  };

  // Case 11: All-In-One Consolidated Receipt Generator
  const openAllInOneReceipt = (customSeller?: Seller) => {
    const targetSeller = customSeller || currentSeller;
    if (!targetSeller) return;

    if (completedSlip && completedSlip.sellerId === targetSeller.id) {
      return;
    }

    const txns = transactions.filter(t => t.sellerId === targetSeller.id);
    const latestTxn = txns[0];

    if (latestTxn && latestTxn.details) {
      const d = latestTxn.details;
      const slipObj: CompletedSlip = {
        id: latestTxn.id.replace('TXN-', 'RCPT-'),
        date: latestTxn.date,
        sellerId: targetSeller.id,
        sellerName: targetSeller.name,
        seller: targetSeller,
        assistantId: currentAssistant.id,
        assistantName: currentAssistant.shortName,
        assistant: currentAssistant,
        isConsolidated: true,
        typeLabel: 'Wholesale Distribution Slip',
        creditsOld: latestTxn.previousCredit,
        previousCredit: latestTxn.previousCredit,
        salesItems: d.items || [],
        returningAmount: d.totalRefund || 0,
        returningPacksCount: d.totalPacks || 0,
        winningAmount: d.totalWinningOffset || 0,
        winningTicketsCount: d.ticketCount || '',
        cashPayingAmount: d.cashAmount || 0,
        cashRef: d.reference || '',
        nonWinningAmount: d.totalReimbursement || 0,
        finalCredit: latestTxn.newCredit,
        newCredit: latestTxn.newCredit
      };
      setCompletedSlip(slipObj);
      return;
    }

    const slipObj: CompletedSlip = {
      id: `RCPT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sellerId: targetSeller.id,
      sellerName: targetSeller.name,
      seller: targetSeller,
      assistantId: currentAssistant.id,
      assistantName: currentAssistant.shortName,
      assistant: currentAssistant,
      isConsolidated: true,
      typeLabel: 'Wholesale Distribution Slip',
      creditsOld: targetSeller.currentCredit,
      previousCredit: targetSeller.currentCredit,
      salesItems: [],
      returningAmount: 0,
      returningPacksCount: 0,
      winningAmount: 0,
      winningTicketsCount: '',
      cashPayingAmount: 0,
      cashRef: '',
      nonWinningAmount: 0,
      finalCredit: targetSeller.currentCredit,
      newCredit: targetSeller.currentCredit
    };
    setCompletedSlip(slipObj);
  };

  const handleToggleFreeze = (sellerId: string) => {
    setSellers(prev => prev.map(s => {
      if (s.id === sellerId) {
        const updated = { ...s, isFrozen: !s.isFrozen };
        dbUpsertSeller(updated);
        return updated;
      }
      return s;
    }));
    const sObj = sellers.find(s => s.id === sellerId);
    showToast(`${sObj?.name} is now ${!sObj?.isFrozen ? 'FROZEN' : 'ACTIVE'}`, 'info');
  };

  // Finalize an active visit bill session
  const handleFinalizeSessionSlip = async (slip: CompletedSlip) => {
    // 1. Update seller in state
    setSellers(prev => prev.map(s => {
      if (s.id === slip.sellerId) {
        return {
          ...s,
          currentCredit: slip.finalCredit,
          isFrozen: slip.finalCredit > s.creditLimit
        };
      }
      return s;
    }));

    // 2. Update assistant collections
    if (slip.cashPayingAmount || slip.winningAmount) {
      setAssistants(prev => prev.map(a => {
        if (a.id === currentAssistant.id) {
          return {
            ...a,
            cashInHand: a.cashInHand + (slip.cashPayingAmount || 0),
            winningVouchers: a.winningVouchers + (slip.winningAmount || 0),
            totalOrdersToday: a.totalOrdersToday + 1
          };
        }
        return a;
      }));
    }

    // 3. Record session transaction in audit history
    const grossTotal = slip.salesItems?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
    const offsetsTotal = (slip.returningAmount || 0) + (slip.winningAmount || 0) + (slip.nonWinningAmount || 0) + (slip.cashPayingAmount || 0);
    const netBill = grossTotal - offsetsTotal;

    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: slip.date,
      sellerId: slip.sellerId,
      sellerName: slip.sellerName,
      assistantId: currentAssistant.id,
      assistantName: currentAssistant.shortName,
      actionType: '3.0 SETTLEMENT',
      typeLabel: `Order Slip #${slip.id}`,
      deltaCredit: netBill,
      previousCredit: slip.creditsOld,
      newCredit: slip.finalCredit,
      notes: `Net Session Bill: ${formatLKR(netBill)} | Prev Debt: ${formatLKR(slip.creditsOld)} | New Total Debt: ${formatLKR(slip.finalCredit)}`,
      details: {
        items: slip.salesItems,
        totalBill: grossTotal,
        totalRefund: slip.returningAmount,
        totalPacks: slip.returningPacksCount,
        totalWinningOffset: slip.winningAmount,
        ticketCount: slip.winningTicketsCount,
        cashAmount: slip.cashPayingAmount,
        reference: slip.cashRef,
        totalReimbursement: slip.nonWinningAmount
      }
    };

    setTransactions(prev => [newTxn, ...prev]);
    setCompletedSlip(slip);

    // 4. Persist to database & cloud
    await dbUpsertSeller({
      ...currentSeller,
      currentCredit: slip.finalCredit,
      isFrozen: slip.finalCredit > currentSeller.creditLimit
    });
    dbRecordTransaction(newTxn, slip.finalCredit);

    showToast(`Order confirmed! Receipt #${slip.id} saved to cloud.`, 'success');
  };

  // Case 13: Reset current bill / order for selected seller
  // Real-world logic: resets ONLY the active unconfirmed session values; leaves past transactions & customer debt intact
  const handleResetSellerOrder = () => {
    showToast('Current bill inputs cleared. Past customer ledger preserved.', 'info');
  };

  return {
    // Navigation & Roles
    currentStep,
    setCurrentStep,
    pendingUserRole,
    setPendingUserRole,
    pendingAssistantId,
    setPendingAssistantId,
    authenticatedRole,
    setAuthenticatedRole,

    // Selections
    selectedAssistantId,
    setSelectedAssistantId,
    selectedSellerId,
    setSelectedSellerId,

    // Master Data
    brands,
    setBrands,
    sellers,
    setSellers,
    assistants,
    setAssistants,
    transactions,
    setTransactions,

    // Active Objects & Aggregates
    currentAssistant,
    currentSeller,
    sellerTransactions,
    totalMarketCredit,

    // Modals & Slips
    activeActionModal,
    setActiveActionModal,
    completedSlip,
    setCompletedSlip,

    // Notifications
    toast,
    showToast,

    // Admin Profile
    adminProfile,
    setAdminProfile,
    handleUpdateAdminProfile,

    // Handlers
    handleSelectRole,
    handleSelectAdmin,
    handleSelectDistributors,
    handleSelectDistributorProfile,
    handleLoginBack,
    handleLoginSuccess,
    handleConfirmSaleDispatch,
    handleConfirmReturn,
    handleConfirmWinning,
    handleConfirmNonWinning,
    handleConfirmCash,
    openAllInOneReceipt,
    handleToggleFreeze,
    handleResetSellerOrder,
    handleFinalizeSessionSlip
  };
};
