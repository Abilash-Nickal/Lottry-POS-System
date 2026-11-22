import { LotteryBrand, Assistant, Seller, Transaction, AdminProfile } from '../types';

export const INITIAL_ADMIN_PROFILE: AdminProfile = {
  id: 'admin_1',
  name: 'W.M.G. චිත්රා වීරකෝන්',
  title: 'ලොතරැයි බෙදාහැරීම් කාර්යාලය • දෙහිඅත්තකණ්ඩිය',
  phone: '+94 77 123 4567',
  avatarId: 'char-01'
};

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
  { id: 'ast1', name: 'Nuwan Perera', shortName: 'Nuwan Perera', username: 'nuwan', defaultPass: '1234', phone: '+94 77 123 4567', route: 'Colombo Fort Route', cashInHand: 0, winningVouchers: 0, totalOrdersToday: 0, avatarBg: 'bg-orange-500 text-white', avatarId: 'char-02' },
  { id: 'ast2', name: 'Mohamed Rizwan', shortName: 'Mohamed Rizwan', username: 'rizwan', defaultPass: '1234', phone: '+94 71 987 6543', route: 'Kollupitiya Route', cashInHand: 0, winningVouchers: 0, totalOrdersToday: 0, avatarBg: 'bg-emerald-600 text-white', avatarId: 'char-10' },
  { id: 'ast3', name: 'Mohamed Rizwan', shortName: 'Mohamed Rizwan', username: 'rizwan2', defaultPass: '1234', phone: '+94 76 555 4321', route: 'Maradana Route', cashInHand: 0, winningVouchers: 0, totalOrdersToday: 0, avatarBg: 'bg-blue-600 text-white', avatarId: 'char-07' },
  { id: 'ast4', name: 'Mohamed Rizwan', shortName: 'Mohamed Rizwan', username: 'rizwan3', defaultPass: '1234', phone: '+94 75 444 3322', route: 'Dehiwala Route', cashInHand: 0, winningVouchers: 0, totalOrdersToday: 0, avatarBg: 'bg-purple-600 text-white', avatarId: 'char-04' },
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
    currentCredit: 0, 
    assignedAssistant: 'ast4',
    isFrozen: false,
    avatarId: 'char-06'
  },
  { 
    id: 's2', 
    name: 'Lakshmi Lottery Mart', 
    owner: 'Mrs. Jayasinghe', 
    phone: '+94 77 234 5678', 
    location: 'Nugegoda Supermarket Arcade', 
    tier: 'Tier A', 
    creditLimit: 250000, 
    currentCredit: 0, 
    assignedAssistant: 'ast4',
    isFrozen: false,
    avatarId: 'char-01'
  },
  { 
    id: 's3', 
    name: 'Gamini Agency & Bakery', 
    owner: 'Gamini Fonseka', 
    phone: '+94 78 876 5432', 
    location: 'Dehiwala Station Rd', 
    tier: 'Tier B', 
    creditLimit: 120000, 
    currentCredit: 0, 
    assignedAssistant: 'ast2',
    isFrozen: false,
    avatarId: 'char-14'
  },
  { 
    id: 's4', 
    name: 'City Corner Kiosk', 
    owner: 'A. Rahman', 
    phone: '+94 70 334 1122', 
    location: 'Moratuwa Bus Stand', 
    tier: 'Tier B', 
    creditLimit: 90000, 
    currentCredit: 0, 
    assignedAssistant: 'ast2',
    isFrozen: false,
    avatarId: 'char-08'
  },
  { 
    id: 's5', 
    name: 'Apex News & Lottery Hub', 
    owner: 'Sunil Priyantha', 
    phone: '+94 72 990 0112', 
    location: 'Kiribathgoda Cross Rd', 
    tier: 'Tier B', 
    creditLimit: 150000, 
    currentCredit: 0, 
    assignedAssistant: 'ast3',
    isFrozen: false,
    avatarId: 'char-12'
  },
  { 
    id: 's6', 
    name: 'Golden Fortune Stall', 
    owner: 'K. Vignesh', 
    phone: '+94 77 665 4433', 
    location: 'Peliyagoda Market', 
    tier: 'Tier A', 
    creditLimit: 400000, 
    currentCredit: 0, 
    assignedAssistant: 'ast1',
    isFrozen: false,
    avatarId: 'char-07'
  },
  { 
    id: 's7', 
    name: 'City Center Lotto', 
    owner: 'Dharmasena Bros', 
    phone: '+94 71 888 9900', 
    location: 'Negombo Town Hall', 
    tier: 'Tier A', 
    creditLimit: 100000, 
    currentCredit: 0, 
    assignedAssistant: 'ast1',
    isFrozen: false,
    avatarId: 'char-09'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
