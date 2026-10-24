import { useState, useMemo, useEffect } from 'react';
import { 
  LotteryBrand, 
  Assistant, 
  Seller, 
  Transaction, 
  CompletedSlip, 
  StepType, 
  ActionModalType 
} from '../types';
import { 
  INITIAL_BRANDS, 
  INITIAL_ASSISTANTS, 
  INITIAL_SELLERS, 
  INITIAL_TRANSACTIONS 
} from '../data/initialData';
import { formatLKR } from '../utils/formatters';
import { 
  fetchAllData, 
  dbRecordTransaction, 
  dbUpsertSeller 
} from '../lib/supabaseService';

/**
 * MASTER STATE HOOK FOR LOTTERY POS SYSTEM
 * 
 * Separates data logic, state persistence, and ledger calculations
 * from the UI view so any changes can be made simply and cleanly.
 */
export function usePOSState() {
  // Navigation & Step State (Defaults directly to ADMIN_DASHBOARD so admin panel is immediately visible)
  const [currentStep, setCurrentStep] = useState<StepType>('ADMIN_DASHBOARD');
  const [pendingUserRole, setPendingUserRole] = useState<'admin' | 'assistant' | null>(null);
  const [pendingAssistantId, setPendingAssistantId] = useState<string | null>(null);
  const [authenticatedRole, setAuthenticatedRole] = useState<'admin' | 'assistant' | null>('admin');

  // Active Selections
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>('ast1');
  const [selectedSellerId, setSelectedSellerId] = useState<string>('s7');

  // Master Data State
  const [brands, setBrands] = useState<LotteryBrand[]>(INITIAL_BRANDS);
  const [sellers, setSellers] = useState<Seller[]>(INITIAL_SELLERS);
  const [assistants, setAssistants] = useState<Assistant[]>(INITIAL_ASSISTANTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Initialize and synchronize live data with Supabase
  useEffect(() => {
    let isMounted = true;
    fetchAllData()
      .then((data) => {
        if (!isMounted) return;
        if (data.sellers.length > 0) setSellers(data.sellers);
        if (data.assistants.length > 0) setAssistants(data.assistants);
        if (data.brands.length > 0) setBrands(data.brands);
        if (data.transactions.length > 0) setTransactions(data.transactions);
      })
      .catch((err) => {
        console.warn('Supabase fetch error, using local fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  // Flow 1: press admin -> direct access to admin Panel
  const handleSelectAdmin = () => {
    setAuthenticatedRole('admin');
    setCurrentStep('ADMIN_DASHBOARD');
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
    if (pendingUserRole === 'admin') {
      setCurrentStep('USER_SELECT');
    } else {
      setCurrentStep('DISTRIBUTOR_SELECT');
    }
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

    // Collect all transactions for this seller
    const txns = transactions.filter(t => t.sellerId === targetSeller.id);
    const sortedTxns = [...txns].reverse(); // Oldest to newest
    
    // Starting credit before today's transactions
    const creditsOld = sortedTxns.length > 0 ? sortedTxns[0].previousCredit : targetSeller.currentCredit;

    const salesItems: Array<{
      dateStr: string;
      brandName: string;
      packs: number;
      tickets: number;
      rate: number;
      subtotal: number;
    }> = [];

    let returningAmount = 0;
    let returningPacksCount = 0;
    let winningAmount = 0;
    let winningTicketsCount = '';
    let cashPayingAmount = 0;
    let cashRef = '';
    let nonWinningAmount = 0;

    txns.forEach(t => {
      if (t.actionType?.includes('SALE') || (t.typeLabel && t.typeLabel.includes('Sale')) || t.deltaCredit > 0) {
        if (t.details?.items && t.details.items.length > 0) {
          t.details.items.forEach(it => {
            const rawDate = it.dateStr || t.details?.targetDay || t.date?.split(' ')[0] || '10/15/2026';
            let dateStr = rawDate;
            if (rawDate.includes('(')) {
              const match = rawDate.match(/\((.*?)\)/);
              if (match) dateStr = match[1].split(' - ')[0];
            } else if (rawDate.includes(' ')) {
              dateStr = rawDate.split(' ')[0];
            }
            salesItems.push({
              dateStr,
              brandName: it.brandName,
              packs: it.packs,
              tickets: it.tickets || (it.packs * 100),
              rate: it.rate,
              subtotal: it.subtotal
            });
          });
        } else {
          salesItems.push({
            dateStr: t.date?.split(' ')[0] || '10/15/2026',
            brandName: 'Govisetha',
            packs: 2,
            tickets: 200,
            rate: 10,
            subtotal: t.deltaCredit
          });
        }
      } else if (t.actionType?.includes('RETURN') || (t.typeLabel && t.typeLabel.includes('Return'))) {
        returningAmount += Math.abs(t.deltaCredit);
        returningPacksCount += (t.details?.totalPacks || 1);
      } else if (t.actionType?.includes('WINNING') || (t.typeLabel && t.typeLabel.includes('Winning'))) {
        winningAmount += Math.abs(t.deltaCredit);
        winningTicketsCount = t.details?.ticketCount || 'Verified Prize Vouchers';
      } else if (t.actionType?.includes('CASH') || (t.typeLabel && t.typeLabel.includes('Cash'))) {
        cashPayingAmount += Math.abs(t.deltaCredit);
        cashRef = t.details?.reference || 'Direct Cash Collection';
      } else if (t.actionType?.includes('NON_WINNING') || (t.typeLabel && t.typeLabel.includes('Non-Winning'))) {
        nonWinningAmount += Math.abs(t.deltaCredit);
      }
    });

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
      typeLabel: 'All-In-One Wholesale Receipt',
      previousCredit: creditsOld,
      creditsOld: creditsOld,
      salesItems,
      returningAmount,
      returningPacksCount,
      winningAmount,
      winningTicketsCount,
      cashPayingAmount,
      cashRef,
      nonWinningAmount,
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
    handleToggleFreeze
  };
}
