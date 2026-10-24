import { supabase } from './supabase';
import { LotteryBrand, Assistant, Seller, Transaction } from '../types';
import { 
  INITIAL_BRANDS, 
  INITIAL_ASSISTANTS, 
  INITIAL_SELLERS, 
  INITIAL_TRANSACTIONS 
} from '../data/initialData';

// ----------------------------------------------------------------------------
// SEED DATABASE ON FIRST RUN IF EMPTY
// ----------------------------------------------------------------------------
export async function seedDatabaseIfEmpty() {
  try {
    // 1. Check & Seed Assistants
    const { count: astCount } = await supabase.from('assistants').select('*', { count: 'exact', head: true });
    if (!astCount || astCount === 0) {
      console.log('🌱 Seeding assistants table...');
      const mappedAssistants = INITIAL_ASSISTANTS.map(a => ({
        id: a.id,
        name: a.name,
        short_name: a.shortName,
        username: a.username,
        default_pass: a.defaultPass,
        phone: a.phone,
        route: a.route,
        cash_in_hand: a.cashInHand,
        winning_vouchers: a.winningVouchers,
        total_orders_today: a.totalOrdersToday,
        avatar_bg: a.avatarBg
      }));
      await supabase.from('assistants').insert(mappedAssistants);
    }

    // 2. Check & Seed Brands
    const { count: brandCount } = await supabase.from('lottery_brands').select('*', { count: 'exact', head: true });
    if (!brandCount || brandCount === 0) {
      console.log('🌱 Seeding lottery_brands table...');
      const mappedBrands = INITIAL_BRANDS.map(b => ({
        id: b.id,
        name: b.name,
        type: b.type,
        face_value: b.faceValue,
        tier_a_price: b.tierAPrice,
        tier_b_price: b.tierBPrice,
        stock_per_pack: b.stockPerPack,
        active: b.active,
        draw_days: b.drawDays,
        color: b.color
      }));
      await supabase.from('lottery_brands').insert(mappedBrands);
    }

    // 3. Check & Seed Sellers
    const { count: sellerCount } = await supabase.from('sellers').select('*', { count: 'exact', head: true });
    if (!sellerCount || sellerCount === 0) {
      console.log('🌱 Seeding sellers table...');
      const mappedSellers = INITIAL_SELLERS.map(s => ({
        id: s.id,
        name: s.name,
        owner: s.owner,
        phone: s.phone,
        location: s.location,
        tier: s.tier,
        credit_limit: s.creditLimit,
        current_credit: s.currentCredit,
        assigned_assistant: s.assignedAssistant,
        is_frozen: s.isFrozen
      }));
      await supabase.from('sellers').insert(mappedSellers);
    }

    // 4. Check & Seed Transactions
    const { count: txnCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
    if (!txnCount || txnCount === 0) {
      console.log('🌱 Seeding transactions table...');
      const mappedTxns = INITIAL_TRANSACTIONS.map(t => ({
        id: t.id,
        seller_id: t.sellerId,
        seller_name: t.sellerName,
        assistant_id: t.assistantId,
        assistant_name: t.assistantName,
        date: t.date,
        type: t.actionType || 'TXN',
        action_type: t.actionType,
        type_label: t.typeLabel,
        amount: Math.abs(t.deltaCredit || 0),
        old_credit: t.previousCredit || 0,
        new_credit: t.newCredit || 0,
        details: t.details || {}
      }));
      await supabase.from('transactions').insert(mappedTxns);
    }
  } catch (err) {
    console.error('Error during auto-seed:', err);
  }
}

// ----------------------------------------------------------------------------
// FETCH METHODS
// ----------------------------------------------------------------------------
export async function fetchAllData() {
  await seedDatabaseIfEmpty();

  const [sellersRes, assistantsRes, brandsRes, txnsRes] = await Promise.all([
    supabase.from('sellers').select('*').order('name', { ascending: true }),
    supabase.from('assistants').select('*').order('id', { ascending: true }),
    supabase.from('lottery_brands').select('*').order('id', { ascending: true }),
    supabase.from('transactions').select('*').order('date', { ascending: false })
  ]);

  const sellers: Seller[] = (sellersRes.data && sellersRes.data.length > 0)
    ? sellersRes.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        owner: s.owner,
        phone: s.phone || '',
        location: s.location,
        tier: s.tier,
        creditLimit: Number(s.credit_limit),
        currentCredit: Number(s.current_credit),
        assignedAssistant: s.assigned_assistant || 'ast1',
        isFrozen: Boolean(s.is_frozen)
      }))
    : INITIAL_SELLERS;

  const assistants: Assistant[] = (assistantsRes.data && assistantsRes.data.length > 0)
    ? assistantsRes.data.map((a: any) => ({
        id: a.id,
        name: a.name,
        shortName: a.short_name,
        username: a.username,
        defaultPass: a.default_pass,
        phone: a.phone || '',
        route: a.route,
        cashInHand: Number(a.cash_in_hand),
        winningVouchers: Number(a.winning_vouchers),
        totalOrdersToday: Number(a.total_orders_today),
        avatarBg: a.avatar_bg || 'bg-orange-500 text-white'
      }))
    : INITIAL_ASSISTANTS;

  const brands: LotteryBrand[] = (brandsRes.data && brandsRes.data.length > 0)
    ? brandsRes.data.map((b: any) => ({
        id: b.id,
        name: b.name,
        type: b.type,
        faceValue: Number(b.face_value),
        tierAPrice: Number(b.tier_a_price),
        tierBPrice: Number(b.tier_b_price),
        stockPerPack: Number(b.stock_per_pack),
        active: Boolean(b.active),
        drawDays: b.draw_days || 'Daily',
        color: b.color || 'from-orange-500 to-amber-600'
      }))
    : INITIAL_BRANDS;

  const transactions: Transaction[] = (txnsRes.data && txnsRes.data.length > 0)
    ? txnsRes.data.map((t: any) => ({
        id: t.id,
        date: t.date,
        sellerId: t.seller_id,
        sellerName: t.seller_name,
        assistantId: t.assistant_id,
        assistantName: t.assistant_name,
        actionType: t.action_type || t.type,
        typeLabel: t.type_label || 'Transaction',
        deltaCredit: Number(t.new_credit) - Number(t.old_credit),
        previousCredit: Number(t.old_credit),
        newCredit: Number(t.new_credit),
        notes: (t.details && t.details.notes) || '',
        details: t.details || {}
      }))
    : INITIAL_TRANSACTIONS;

  return { sellers, assistants, brands, transactions };
}

// ----------------------------------------------------------------------------
// MUTATION METHODS
// ----------------------------------------------------------------------------

export async function dbUpsertSeller(seller: Seller) {
  try {
    await supabase.from('sellers').upsert({
      id: seller.id,
      name: seller.name,
      owner: seller.owner,
      phone: seller.phone,
      location: seller.location,
      tier: seller.tier,
      credit_limit: seller.creditLimit,
      current_credit: seller.currentCredit,
      assigned_assistant: seller.assignedAssistant,
      is_frozen: seller.isFrozen
    });
  } catch (err) {
    console.error('dbUpsertSeller error:', err);
  }
}

export async function dbDeleteSeller(sellerId: string) {
  try {
    await supabase.from('sellers').delete().eq('id', sellerId);
  } catch (err) {
    console.error('dbDeleteSeller error:', err);
  }
}

export async function dbUpsertAssistant(assistant: Assistant) {
  try {
    await supabase.from('assistants').upsert({
      id: assistant.id,
      name: assistant.name,
      short_name: assistant.shortName,
      username: assistant.username,
      default_pass: assistant.defaultPass,
      phone: assistant.phone,
      route: assistant.route,
      cash_in_hand: assistant.cashInHand,
      winning_vouchers: assistant.winningVouchers,
      total_orders_today: assistant.totalOrdersToday,
      avatar_bg: assistant.avatarBg
    });
  } catch (err) {
    console.error('dbUpsertAssistant error:', err);
  }
}

export async function dbUpsertBrand(brand: LotteryBrand) {
  try {
    await supabase.from('lottery_brands').upsert({
      id: brand.id,
      name: brand.name,
      type: brand.type,
      face_value: brand.faceValue,
      tier_a_price: brand.tierAPrice,
      tier_b_price: brand.tierBPrice,
      stock_per_pack: brand.stockPerPack,
      active: brand.active,
      draw_days: brand.drawDays,
      color: brand.color
    });
  } catch (err) {
    console.error('dbUpsertBrand error:', err);
  }
}

export async function dbRecordTransaction(txn: Transaction, newCredit: number) {
  try {
    // 1. Insert into transactions table
    await supabase.from('transactions').insert({
      id: txn.id,
      seller_id: txn.sellerId,
      seller_name: txn.sellerName,
      assistant_id: txn.assistantId,
      assistant_name: txn.assistantName,
      date: txn.date,
      type: txn.actionType || 'TXN',
      action_type: txn.actionType,
      type_label: txn.typeLabel,
      amount: Math.abs(txn.deltaCredit || 0),
      old_credit: txn.previousCredit,
      new_credit: newCredit,
      details: txn.details || {}
    });

    // 2. Update seller's credit in sellers table
    await supabase.from('sellers').update({
      current_credit: newCredit
    }).eq('id', txn.sellerId);
  } catch (err) {
    console.error('dbRecordTransaction error:', err);
  }
}
