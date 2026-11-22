import { LotteryBrand, Assistant, Seller, Transaction, AdminProfile } from '../types';
import { 
  INITIAL_BRANDS, 
  INITIAL_ASSISTANTS, 
  INITIAL_SELLERS, 
  INITIAL_TRANSACTIONS,
  INITIAL_ADMIN_PROFILE
} from '../data/initialData';

// Storage keys for persistent local storage
const STORAGE_KEYS = {
  SELLERS: 'LOTTERY_POS_SELLERS_V2',
  ASSISTANTS: 'LOTTERY_POS_ASSISTANTS_V2',
  BRANDS: 'LOTTERY_POS_BRANDS_V2',
  TRANSACTIONS: 'LOTTERY_POS_TRANSACTIONS_V2',
  ADMIN_PROFILE: 'LOTTERY_POS_ADMIN_PROFILE_V2',
  SHEETS_URL: 'LOTTERY_POS_GOOGLE_SHEETS_URL'
};

/**
 * Get configured Google Sheets Web App URL from environment or localStorage
 */
export function getGoogleSheetsUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_GOOGLE_SHEETS_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  return localStorage.getItem(STORAGE_KEYS.SHEETS_URL) || '';
}

/**
 * Set Google Sheets Web App URL in localStorage
 */
export function setGoogleSheetsUrl(url: string): void {
  if (url && url.trim().length > 0) {
    localStorage.setItem(STORAGE_KEYS.SHEETS_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.SHEETS_URL);
  }
}

// ----------------------------------------------------------------------------
// LOCAL STORAGE HELPERS (Guarantees zero-pause, offline-first reliability)
// ----------------------------------------------------------------------------
function getLocalData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`Error reading local storage key ${key}:`, e);
    return fallback;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing local storage key ${key}:`, e);
  }
}

// Initialize default data into LocalStorage if not present
function initializeLocalStorageIfEmpty() {
  // Clear legacy mock V1 caches if any
  const legacyKeys = [
    'LOTTERY_POS_SELLERS_V1',
    'LOTTERY_POS_ASSISTANTS_V1',
    'LOTTERY_POS_BRANDS_V1',
    'LOTTERY_POS_TRANSACTIONS_V1',
    'LOTTERY_POS_ADMIN_PROFILE_V1'
  ];
  legacyKeys.forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch (_) {}
  });

  if (!localStorage.getItem(STORAGE_KEYS.SELLERS)) {
    setLocalData(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ASSISTANTS)) {
    setLocalData(STORAGE_KEYS.ASSISTANTS, INITIAL_ASSISTANTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
    setLocalData(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    setLocalData(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PROFILE)) {
    setLocalData(STORAGE_KEYS.ADMIN_PROFILE, INITIAL_ADMIN_PROFILE);
  }
}

// ----------------------------------------------------------------------------
// FETCH ALL DATA (Checks Google Sheets first, falls back to LocalStorage)
// ----------------------------------------------------------------------------
export async function fetchAllData(): Promise<{
  sellers: Seller[];
  assistants: Assistant[];
  brands: LotteryBrand[];
  transactions: Transaction[];
  adminProfile: AdminProfile;
}> {
  initializeLocalStorageIfEmpty();

  const localSellers = getLocalData<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
  const localAssistants = getLocalData<Assistant[]>(STORAGE_KEYS.ASSISTANTS, INITIAL_ASSISTANTS);
  const localBrands = getLocalData<LotteryBrand[]>(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
  const localTxns = getLocalData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  const localAdmin = getLocalData<AdminProfile>(STORAGE_KEYS.ADMIN_PROFILE, INITIAL_ADMIN_PROFILE);

  const sheetsUrl = getGoogleSheetsUrl();

  // If no Google Sheets URL configured, return local data immediately
  if (!sheetsUrl) {
    return {
      sellers: localSellers,
      assistants: localAssistants,
      brands: localBrands,
      transactions: localTxns,
      adminProfile: localAdmin
    };
  }

  // Fetch from Google Sheets Web App
  try {
    const fetchUrl = `${sheetsUrl}${sheetsUrl.includes('?') ? '&' : '?'}action=fetchAll&t=${Date.now()}`;
    const res = await fetch(fetchUrl, {
      method: 'GET',
      mode: 'cors'
    });

    if (!res.ok) {
      throw new Error(`Google Sheets HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json && json.success) {
      const rawSellers: Seller[] = (json.sellers && json.sellers.length > 0) ? json.sellers : localSellers;
      const rawAssistants: Assistant[] = (json.assistants && json.assistants.length > 0) ? json.assistants : localAssistants;
      const brands: LotteryBrand[] = (json.brands && json.brands.length > 0) ? json.brands : localBrands;
      const transactions: Transaction[] = (json.transactions && json.transactions.length > 0) ? json.transactions : localTxns;
      const adminProfile: AdminProfile = json.adminProfile || localAdmin;

      // Ensure avatar IDs are populated
      const sellers = rawSellers.map(s => ({
        ...s,
        avatarId: s.avatarId || (s as any).avatar_id || 'char-06'
      }));

      const assistants = rawAssistants.map(a => ({
        ...a,
        avatarId: a.avatarId || (a as any).avatar_id || 'char-02'
      }));

      // Update local storage cache
      setLocalData(STORAGE_KEYS.SELLERS, sellers);
      setLocalData(STORAGE_KEYS.ASSISTANTS, assistants);
      setLocalData(STORAGE_KEYS.BRANDS, brands);
      setLocalData(STORAGE_KEYS.TRANSACTIONS, transactions);
      setLocalData(STORAGE_KEYS.ADMIN_PROFILE, adminProfile);

      return { sellers, assistants, brands, transactions, adminProfile };
    }
  } catch (err) {
    console.warn('Google Sheets fetch failed, running seamlessly from local storage:', err);
  }

  // Graceful fallback to local storage
  return {
    sellers: localSellers,
    assistants: localAssistants,
    brands: localBrands,
    transactions: localTxns,
    adminProfile: localAdmin
  };
}

// ----------------------------------------------------------------------------
// GOOGLE SHEETS POST HELPER
// ----------------------------------------------------------------------------
async function postToGoogleSheets(action: string, payload: any): Promise<boolean> {
  const sheetsUrl = getGoogleSheetsUrl();
  if (!sheetsUrl) return false;

  try {
    // We send payload as text/plain to avoid CORS preflight issues with Google Apps Script
    await fetch(sheetsUrl, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script handles no-cors cleanly
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({ action, data: payload, timestamp: new Date().toISOString() })
    });
    return true;
  } catch (err) {
    console.warn(`Failed to sync action "${action}" to Google Sheets:`, err);
    return false;
  }
}

// ----------------------------------------------------------------------------
// MUTATION METHODS (Immediate Local Storage save + Background Google Sheets sync)
// ----------------------------------------------------------------------------

export function getAdminProfile(): AdminProfile {
  return getLocalData<AdminProfile>(STORAGE_KEYS.ADMIN_PROFILE, INITIAL_ADMIN_PROFILE);
}

export async function dbUpsertAdminProfile(profile: AdminProfile) {
  try {
    setLocalData(STORAGE_KEYS.ADMIN_PROFILE, profile);
    postToGoogleSheets('upsertAdminProfile', profile);
  } catch (err) {
    console.error('dbUpsertAdminProfile error:', err);
  }
}

export async function dbUpsertSeller(seller: Seller) {
  try {
    // 1. Update LocalStorage
    const current = getLocalData<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    const existingIdx = current.findIndex(s => s.id === seller.id);
    let updated: Seller[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = seller;
    } else {
      updated = [seller, ...current];
    }
    setLocalData(STORAGE_KEYS.SELLERS, updated);

    // 2. Sync to Google Sheets
    postToGoogleSheets('upsertSeller', seller);
  } catch (err) {
    console.error('dbUpsertSeller error:', err);
  }
}

export async function dbDeleteSeller(sellerId: string) {
  try {
    // 1. Update LocalStorage
    const current = getLocalData<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    const updated = current.filter(s => s.id !== sellerId);
    setLocalData(STORAGE_KEYS.SELLERS, updated);

    // 2. Sync to Google Sheets
    postToGoogleSheets('deleteSeller', { id: sellerId });
  } catch (err) {
    console.error('dbDeleteSeller error:', err);
  }
}

export async function dbUpsertAssistant(assistant: Assistant) {
  try {
    // 1. Update LocalStorage
    const current = getLocalData<Assistant[]>(STORAGE_KEYS.ASSISTANTS, INITIAL_ASSISTANTS);
    const existingIdx = current.findIndex(a => a.id === assistant.id);
    let updated: Assistant[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = assistant;
    } else {
      updated = [...current, assistant];
    }
    setLocalData(STORAGE_KEYS.ASSISTANTS, updated);

    // 2. Sync to Google Sheets
    postToGoogleSheets('upsertAssistant', assistant);
  } catch (err) {
    console.error('dbUpsertAssistant error:', err);
  }
}

export async function dbUpsertBrand(brand: LotteryBrand) {
  try {
    // 1. Update LocalStorage
    const current = getLocalData<LotteryBrand[]>(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
    const existingIdx = current.findIndex(b => b.id === brand.id);
    let updated: LotteryBrand[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = brand;
    } else {
      updated = [...current, brand];
    }
    setLocalData(STORAGE_KEYS.BRANDS, updated);

    // 2. Sync to Google Sheets
    postToGoogleSheets('upsertBrand', brand);
  } catch (err) {
    console.error('dbUpsertBrand error:', err);
  }
}

export async function dbRecordTransaction(txn: Transaction, newCredit: number) {
  try {
    // 1. Update Transactions in LocalStorage
    const currentTxns = getLocalData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setLocalData(STORAGE_KEYS.TRANSACTIONS, [txn, ...currentTxns]);

    // 2. Update Seller Credit in LocalStorage
    const currentSellers = getLocalData<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    const updatedSellers = currentSellers.map(s => {
      if (s.id === txn.sellerId) {
        return {
          ...s,
          currentCredit: newCredit,
          isFrozen: newCredit > s.creditLimit ? true : s.isFrozen
        };
      }
      return s;
    });
    setLocalData(STORAGE_KEYS.SELLERS, updatedSellers);

    // 3. Sync to Google Sheets
    postToGoogleSheets('recordTransaction', {
      transaction: txn,
      sellerId: txn.sellerId,
      newCredit: newCredit
    });
  } catch (err) {
    console.error('dbRecordTransaction error:', err);
  }
}

export async function dbResetSellerTransactions(sellerId: string, resetCredit: number, remainingTxns: Transaction[]) {
  try {
    // 1. Update Transactions in LocalStorage
    setLocalData(STORAGE_KEYS.TRANSACTIONS, remainingTxns);

    // 2. Update Seller Credit in LocalStorage
    const currentSellers = getLocalData<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    const updatedSellers = currentSellers.map(s => {
      if (s.id === sellerId) {
        return {
          ...s,
          currentCredit: resetCredit,
          isFrozen: resetCredit > s.creditLimit
        };
      }
      return s;
    });
    setLocalData(STORAGE_KEYS.SELLERS, updatedSellers);

    // 3. Post updated seller credit to Google Sheets
    const seller = updatedSellers.find(s => s.id === sellerId);
    if (seller) {
      postToGoogleSheets('upsertSeller', seller);
    }
  } catch (err) {
    console.error('dbResetSellerTransactions error:', err);
  }
}

// ----------------------------------------------------------------------------
// EXCEL EXPORT UTILITIES (.csv with UTF-8 BOM for Microsoft Excel)
// ----------------------------------------------------------------------------

function downloadCSVFile(filename: string, csvContent: string) {
  const bom = '\uFEFF'; // UTF-8 BOM so Excel opens special characters and symbols correctly
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export all Transactions to Microsoft Excel-compatible CSV file
 */
export function exportTransactionsToExcel(transactions: Transaction[]) {
  const headers = [
    'Transaction ID',
    'Date & Time',
    'Retailer / Seller',
    'Field Rep / Assistant',
    'Action Type',
    'Description',
    'Delta Amount (LKR)',
    'Previous Debt (LKR)',
    'New Debt Balance (LKR)',
    'Notes'
  ];

  const rows = transactions.map(t => [
    escapeCSV(t.id),
    escapeCSV(t.date),
    escapeCSV(t.sellerName),
    escapeCSV(t.assistantName),
    escapeCSV(t.actionType || 'TXN'),
    escapeCSV(t.typeLabel),
    escapeCSV(t.deltaCredit),
    escapeCSV(t.previousCredit),
    escapeCSV(t.newCredit),
    escapeCSV(t.notes || '')
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSVFile(`Lottery_Transactions_Ledger_${dateStr}.csv`, csv);
}

/**
 * Export all Sellers & Credit Status to Microsoft Excel-compatible CSV file
 */
export function exportSellersToExcel(sellers: Seller[]) {
  const headers = [
    'Seller ID',
    'Avatar ID',
    'Retail Shop Name',
    'Owner / Contact Person',
    'Phone',
    'Location / Route',
    'Price Tier',
    'Credit Limit (LKR)',
    'Current Outstanding Debt (LKR)',
    'Available Credit (LKR)',
    'Account Status'
  ];

  const rows = sellers.map(s => [
    escapeCSV(s.id),
    escapeCSV(s.avatarId || 'char-06'),
    escapeCSV(s.name),
    escapeCSV(s.owner),
    escapeCSV(s.phone),
    escapeCSV(s.location),
    escapeCSV(s.tier),
    escapeCSV(s.creditLimit),
    escapeCSV(s.currentCredit),
    escapeCSV(Math.max(0, s.creditLimit - s.currentCredit)),
    escapeCSV(s.isFrozen ? 'FROZEN (Overlimit)' : 'ACTIVE')
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSVFile(`Lottery_Retailers_Credit_Directory_${dateStr}.csv`, csv);
}

/**
 * Export all Field Assistants & Status to Microsoft Excel-compatible CSV file
 */
export function exportAssistantsToExcel(assistants: Assistant[]) {
  const headers = [
    'Assistant ID',
    'Avatar ID',
    'Full Name',
    'Short Name',
    'Username',
    'Phone',
    'Assigned Route',
    'Cash in Hand (LKR)',
    'Winning Vouchers (LKR)',
    'Total Orders Today'
  ];

  const rows = assistants.map(a => [
    escapeCSV(a.id),
    escapeCSV(a.avatarId || 'char-02'),
    escapeCSV(a.name),
    escapeCSV(a.shortName),
    escapeCSV(a.username),
    escapeCSV(a.phone),
    escapeCSV(a.route),
    escapeCSV(a.cashInHand),
    escapeCSV(a.winningVouchers),
    escapeCSV(a.totalOrdersToday)
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSVFile(`Lottery_Assistants_Directory_${dateStr}.csv`, csv);
}

