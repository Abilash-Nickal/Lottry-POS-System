import { LotteryBrand, Assistant, Seller, Transaction } from '../types';

export const INITIAL_BRANDS: LotteryBrand[] = [
  // Daily Draw Lotteries (Standard 100-ticket packs - 12 Brands)
  { id: 'b1', name: 'Govisetha', type: 'daily', faceValue: 40, tierAPrice: 33.50, tierBPrice: 35.00, stockPerPack: 100, active: true, drawDays: 'Daily', color: 'from-amber-500 to-orange-500' },
  { id: 'b2', name: 'Mahajana Sampatha', type: 'daily', faceValue: 40, tierAPrice: 33.50, tierBPrice: 35.00, stockPerPack: 100, active: true, drawDays: 'Daily', color: 'from-blue-500 to-cyan-500' },
  { id: 'b3', name: 'Shanida', type: 'daily', faceValue: 40, tierAPrice: 34.00, tierBPrice: 35.20, stockPerPack: 100, active: true, drawDays: 'Wed, Sat', color: 'from-purple-500 to-indigo-500' },
  { id: 'b4', name: 'Lagna Wasana', type: 'daily', faceValue: 40, tierAPrice: 33.80, tierBPrice: 35.00, stockPerPack: 100, active: true, drawDays: 'Daily', color: 'from-emerald-500 to-teal-500' },
  { id: 'b5', name: 'Mega Power', type: 'daily', faceValue: 50, tierAPrice: 42.00, tierBPrice: 44.00, stockPerPack: 100, active: true, drawDays: 'Sun, Tue, Fri', color: 'from-rose-500 to-red-600' },
  { id: 'b6', name: 'Dhana Nidhanaya', type: 'daily', faceValue: 40, tierAPrice: 33.50, tierBPrice: 35.00, stockPerPack: 100, active: true, drawDays: 'Mon, Thu', color: 'from-indigo-500 to-purple-600' },
  { id: 'b7', name: 'Handahana', type: 'daily', faceValue: 40, tierAPrice: 33.80, tierBPrice: 35.00, stockPerPack: 100, active: true, drawDays: 'Daily', color: 'from-teal-500 to-emerald-600' },
  { id: 'b8', name: 'Ada Kotipathi', type: 'daily', faceValue: 50, tierAPrice: 42.00, tierBPrice: 44.00, stockPerPack: 100, active: true, drawDays: 'Daily', color: 'from-yellow-500 to-amber-600' },
  { id: 'b9', name: 'Kotipathi Shanida', type: 'daily', faceValue: 40, tierAPrice: 34.00, tierBPrice: 35.20, stockPerPack: 100, active: true, drawDays: 'Sat', color: 'from-cyan-500 to-blue-600' },
  { id: 'b10', name: 'Kapruka', type: 'daily', faceValue: 40, tierAPrice: 33.50, tierBPrice: 35.00, stockPerPack: 100, active: true, drawDays: 'Wed, Sun', color: 'from-orange-500 to-amber-600' },
  { id: 'b11', name: 'Jayoda', type: 'daily', faceValue: 40, tierAPrice: 33.80, tierBPrice: 35.00, stockPerPack: 100, active: true, drawDays: 'Tue, Fri', color: 'from-lime-500 to-emerald-600' },
  { id: 'b12', name: 'Supiri Vasana', type: 'daily', faceValue: 50, tierAPrice: 42.00, tierBPrice: 44.00, stockPerPack: 100, active: true, drawDays: 'Daily', color: 'from-violet-500 to-purple-600' },
  
  // Instant Scratch Cards (25 / 50 ticket books)
  { id: 'b13', name: 'Gold Fortune Scratch', type: 'scratch', faceValue: 100, tierAPrice: 84.00, tierBPrice: 87.50, stockPerPack: 50, active: true, drawDays: 'Instant Win', color: 'from-yellow-500 to-amber-600' },
  { id: 'b14', name: 'Cash Bonanza 50', type: 'scratch', faceValue: 50, tierAPrice: 41.50, tierBPrice: 43.50, stockPerPack: 50, active: true, drawDays: 'Instant Win', color: 'from-green-500 to-emerald-600' },
  { id: 'b15', name: 'Diamond 200 Rush', type: 'scratch', faceValue: 200, tierAPrice: 170.00, tierBPrice: 176.00, stockPerPack: 25, active: true, drawDays: 'Instant Win', color: 'from-sky-500 to-blue-600' },
  { id: 'b16', name: 'Lucky 7s Scratch', type: 'scratch', faceValue: 100, tierAPrice: 85.00, tierBPrice: 88.00, stockPerPack: 50, active: true, drawDays: 'Instant Win', color: 'from-amber-500 to-orange-600' },
  { id: 'b17', name: 'Silver Super 100', type: 'scratch', faceValue: 100, tierAPrice: 84.50, tierBPrice: 87.50, stockPerPack: 50, active: true, drawDays: 'Instant Win', color: 'from-slate-400 to-zinc-600' },
  { id: 'b18', name: 'Mega Millions Scratch', type: 'scratch', faceValue: 250, tierAPrice: 212.50, tierBPrice: 220.00, stockPerPack: 20, active: true, drawDays: 'Instant Win', color: 'from-purple-500 to-indigo-700' },
];

export const INITIAL_ASSISTANTS: Assistant[] = [
  { id: 'ast1', name: 'Nuwan Perera', shortName: 'Nuwan Perera', username: 'nuwan', defaultPass: '1234', phone: '+94 77 123 4567', route: 'Colombo Fort Route', cashInHand: 42500, winningVouchers: 12400, totalOrdersToday: 8, avatarBg: 'bg-orange-500 text-white' },
  { id: 'ast2', name: 'Mohamed Rizwan', shortName: 'Mohamed Rizwan', username: 'rizwan', defaultPass: '1234', phone: '+94 71 987 6543', route: 'Kollupitiya Route', cashInHand: 18200, winningVouchers: 8500, totalOrdersToday: 5, avatarBg: 'bg-emerald-600 text-white' },
  { id: 'ast3', name: 'Mohamed Rizwan', shortName: 'Mohamed Rizwan', username: 'rizwan2', defaultPass: '1234', phone: '+94 76 555 4321', route: 'Maradana Route', cashInHand: 31000, winningVouchers: 14200, totalOrdersToday: 7, avatarBg: 'bg-blue-600 text-white' },
  { id: 'ast4', name: 'Mohamed Rizwan', shortName: 'Mohamed Rizwan', username: 'rizwan3', defaultPass: '1234', phone: '+94 75 444 3322', route: 'Dehiwala Route', cashInHand: 24800, winningVouchers: 6900, totalOrdersToday: 6, avatarBg: 'bg-purple-600 text-white' },
];

export const INITIAL_SELLERS: Seller[] = [
  { 
    id: 's1', 
    name: 'Saman Stores & Communications', 
    owner: 'Saman Kumara', 
    phone: '+94 71 456 7890', 
    location: 'Maharagama Junction', 
    tier: 'Tier A', 
    creditLimit: 350000, 
    currentCredit: 245000, 
    assignedAssistant: 'ast4',
    isFrozen: false
  },
  { 
    id: 's2', 
    name: 'Lakshmi Lottery Mart', 
    owner: 'Mrs. Jayasinghe', 
    phone: '+94 77 234 5678', 
    location: 'Nugegoda Supermarket Arcade', 
    tier: 'Tier A', 
    creditLimit: 250000, 
    currentCredit: 242000, 
    assignedAssistant: 'ast4',
    isFrozen: false
  },
  { 
    id: 's3', 
    name: 'Gamini Agency & Bakery', 
    owner: 'Gamini Fonseka', 
    phone: '+94 78 876 5432', 
    location: 'Dehiwala Station Rd', 
    tier: 'Tier B', 
    creditLimit: 120000, 
    currentCredit: 65400, 
    assignedAssistant: 'ast2',
    isFrozen: false
  },
  { 
    id: 's4', 
    name: 'City Corner Kiosk', 
    owner: 'A. Rahman', 
    phone: '+94 70 334 1122', 
    location: 'Moratuwa Bus Stand', 
    tier: 'Tier B', 
    creditLimit: 90000, 
    currentCredit: 95000, 
    assignedAssistant: 'ast2',
    isFrozen: true
  },
  { 
    id: 's5', 
    name: 'Apex News & Lottery Hub', 
    owner: 'Sunil Priyantha', 
    phone: '+94 72 990 0112', 
    location: 'Kiribathgoda Cross Rd', 
    tier: 'Tier B', 
    creditLimit: 150000, 
    currentCredit: 38200, 
    assignedAssistant: 'ast3',
    isFrozen: false
  },
  { 
    id: 's6', 
    name: 'Golden Fortune Stall', 
    owner: 'K. Vignesh', 
    phone: '+94 77 665 4433', 
    location: 'Peliyagoda Market', 
    tier: 'Tier A', 
    creditLimit: 400000, 
    currentCredit: 185000, 
    assignedAssistant: 'ast1',
    isFrozen: false
  },
  { 
    id: 's7', 
    name: 'City Center Lotto', 
    owner: 'Dharmasena Bros', 
    phone: '+94 71 888 9900', 
    location: 'Negombo Town Hall', 
    tier: 'Tier A', 
    creditLimit: 100000, 
    currentCredit: 10000, 
    assignedAssistant: 'ast1',
    isFrozen: false
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-9021',
    date: '2026-10-15 10:14 AM',
    sellerId: 's7',
    sellerName: 'City Center Lotto',
    assistantId: 'ast1',
    assistantName: 'Kasun Bandara',
    actionType: '3.1 SALE',
    typeLabel: 'Draw Tickets Sale (10/15/2026)',
    deltaCredit: 3000,
    previousCredit: 10000,
    newCredit: 13000,
    notes: '10/15/2026: 200 tix Govisetha (2000.00) & 100 tix Mahajana (1000.00)',
    details: {
      category: 'Draw Sale Tickets',
      targetDay: '10/15/2026',
      items: [
        { dateStr: '10/15/2026', brandName: 'Govisetha', packs: 2, tickets: 200, rate: 10.00, subtotal: 2000 },
        { dateStr: '10/15/2026', brandName: 'Mahajana Sampatha', packs: 1, tickets: 100, rate: 10.00, subtotal: 1000 }
      ],
      totalPacks: 3,
      totalTickets: 300,
      totalBill: 3000
    }
  },
  {
    id: 'TXN-9022',
    date: '2026-10-15 11:20 AM',
    sellerId: 's7',
    sellerName: 'City Center Lotto',
    assistantId: 'ast1',
    assistantName: 'Kasun Bandara',
    actionType: '3.3 WINNING',
    typeLabel: 'Return by Winning Tickets',
    deltaCredit: -1000,
    previousCredit: 13000,
    newCredit: 12000,
    notes: 'Envelope #ENV-301 | Return by Winning: 1000.00',
    details: {
      envelopeNo: 'ENV-301',
      ticketCount: 'Assorted Prize Vouchers',
      totalWinningOffset: 1000
    }
  },
  {
    id: 'TXN-9023',
    date: '2026-10-15 01:15 PM',
    sellerId: 's7',
    sellerName: 'City Center Lotto',
    assistantId: 'ast1',
    assistantName: 'Kasun Bandara',
    actionType: '3.2 RETURN',
    typeLabel: 'Returning Unsold Packs',
    deltaCredit: -10000,
    previousCredit: 12000,
    newCredit: 2000,
    notes: 'Returning unsold pre-draw packs: 10,000.00',
    details: {
      returnDate: '10/15/2026',
      returnItems: [
        { brandName: 'Govisetha', packs: 10, rate: 10.00, subtotal: 10000 }
      ],
      totalPacks: 10,
      totalRefund: 10000
    }
  },
  {
    id: 'TXN-9024',
    date: '2026-10-15 03:40 PM',
    sellerId: 's7',
    sellerName: 'City Center Lotto',
    assistantId: 'ast1',
    assistantName: 'Kasun Bandara',
    actionType: '3.5 CASH',
    typeLabel: 'Cash Paying Settlement',
    deltaCredit: -15220,
    previousCredit: 17220,
    newCredit: 2000,
    notes: 'Cash paying: LKR 15,220.00 route collection',
    details: {
      cashAmount: 15220,
      reference: 'Direct Cash Payment'
    }
  },
  {
    id: 'TXN-7664',
    date: '2026-10-16 12:36 AM',
    sellerId: 's1',
    sellerName: 'Saman Stores & Communications',
    assistantId: 'ast1',
    assistantName: 'Kasun Bandara',
    actionType: '3.2 RETURN',
    typeLabel: 'Pack Return (Pre-draw / Unsold)',
    deltaCredit: -3350,
    previousCredit: 252600,
    newCredit: 249250,
    notes: 'Unsold pre-draw return | Batch: SN-901 to SN-902 | Returned 1 pack Govisetha',
    details: {
      returnDate: 'Day 1 (Fri, Oct 16)',
      returnItems: [
        { brandName: 'Govisetha', packs: 1, rate: 33.50, subtotal: 3350 }
      ],
      reason: 'Unsold pre-draw return (Draw Cutoff)',
      batchRef: 'SN-901 to SN-902',
      totalPacks: 1,
      totalRefund: 3350
    }
  },
  {
    id: 'TXN-9020',
    date: '2026-10-15 09:30 AM',
    sellerId: 's3',
    sellerName: 'Gamini Agency & Bakery',
    assistantId: 'ast2',
    assistantName: 'Nuwan Perera',
    actionType: '3.5 CASH',
    typeLabel: 'Direct Cash Payment',
    deltaCredit: -15000,
    previousCredit: 80400,
    newCredit: 65400,
    notes: 'Morning route cash collection against ledger balance',
    details: {
      cashAmount: 15000,
      reference: 'Morning route cash collection against ledger balance',
      assistantName: 'Nuwan Perera'
    }
  },
  {
    id: 'TXN-9019',
    date: '2026-10-14 04:45 PM',
    sellerId: 's1',
    sellerName: 'Saman Stores & Communications',
    assistantId: 'ast4',
    assistantName: 'Chaminda Raj',
    actionType: '3.3 WINNING',
    typeLabel: 'Winning Ticket Payout Offset',
    deltaCredit: -12400,
    previousCredit: 257400,
    newCredit: 245000,
    notes: 'Verified 42 winning Govisetha vouchers in Envelope #ENV-884',
    details: {
      envelopeNo: 'ENV-884',
      ticketCount: '42 Assorted Tickets',
      totalWinningOffset: 12400,
      breakdown: { tier40: '35', tier100: '10', tier500: '10', customPrize: '5000' }
    }
  }
];
