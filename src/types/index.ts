export interface LotteryBrand {
  id: string;
  name: string;
  type: 'daily' | 'scratch';
  faceValue: number;
  tierAPrice: number;
  tierBPrice: number;
  stockPerPack: number;
  active: boolean;
  drawDays: string;
  color: string;
}

export interface Assistant {
  id: string;
  name: string;
  shortName: string;
  username: string;
  defaultPass: string;
  phone: string;
  route: string;
  cashInHand: number;
  winningVouchers: number;
  totalOrdersToday: number;
  avatarBg: string;
}

export interface Seller {
  id: string;
  name: string;
  owner: string;
  phone: string;
  location: string;
  tier: 'Tier A' | 'Tier B';
  creditLimit: number;
  currentCredit: number;
  assignedAssistant: string;
  isFrozen: boolean;
}

export interface SalesItem {
  dateStr?: string;
  brandName: string;
  packs: number;
  tickets: number;
  rate: number;
  subtotal: number;
}

export interface ReturnItem {
  brandName: string;
  packs: number;
  rate: number;
  subtotal: number;
}

export interface TransactionDetails {
  category?: string;
  targetDay?: string;
  returnDate?: string;
  items?: SalesItem[];
  returnItems?: ReturnItem[];
  totalPacks?: number;
  totalTickets?: number;
  totalBill?: number;
  totalRefund?: number;
  reason?: string;
  batchRef?: string;
  envelopeNo?: string;
  ticketCount?: string;
  totalWinningOffset?: number;
  breakdown?: Record<string, string>;
  brandName?: string;
  stubCount?: string;
  ratePerStub?: string;
  schemeRef?: string;
  totalReimbursement?: number;
  cashAmount?: number;
  reference?: string;
  assistantName?: string;
}

export interface Transaction {
  id: string;
  date: string;
  sellerId: string;
  sellerName: string;
  assistantId: string;
  assistantName: string;
  actionType: string;
  typeLabel?: string;
  deltaCredit: number;
  previousCredit: number;
  newCredit: number;
  notes?: string;
  details?: TransactionDetails;
}

export interface ForwardDay {
  dayIndex: number;
  label: string;
  dateStr: string;
  isToday: boolean;
  weekday: string;
  relativeLabel?: string;
  dayMonthStr?: string;
  offsetDays?: number;
}

export interface CompletedSlip {
  id: string;
  date: string;
  sellerId: string;
  sellerName: string;
  seller?: Seller;
  assistantId: string;
  assistantName: string;
  assistant?: Assistant;
  actionType?: string;
  typeLabel?: string;
  isConsolidated?: boolean;
  creditsOld: number;
  previousCredit?: number;
  salesItems?: SalesItem[];
  returningAmount?: number;
  returningPacksCount?: number;
  winningAmount?: number;
  winningTicketsCount?: string;
  cashPayingAmount?: number;
  cashRef?: string;
  nonWinningAmount?: number;
  finalCredit: number;
  newCredit?: number;
  deltaCredit?: number;
  notes?: string;
  details?: TransactionDetails;
}

export interface CreditMetrics {
  current: number;
  limit: number;
  available: number;
  percent: number;
  isExceeded: boolean;
}

export interface SaleMath {
  totalPacks: number;
  totalTickets: number;
  totalBill: number;
  projectedCredit: number;
  isExceeded: boolean;
  excess: number;
}

export type StepType = 
  | 'SPLASH'
  | 'USER_SELECT' 
  | 'DISTRIBUTOR_SELECT'
  | 'USER_LOGIN' 
  | 'ADMIN_DASHBOARD' 
  | 'SELLER_SELECT' 
  | 'SELLER_WORKSPACE' 
  | 'SALE_CATEGORY_SELECT' 
  | 'SALE_DATE_AND_TICKETS';

export type ActionModalType = 'RETURN' | 'WINNING' | 'NON_WINNING' | 'CASH' | null;

