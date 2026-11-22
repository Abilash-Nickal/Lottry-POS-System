/**
 * ============================================================================
 * 🎟️ LOTTERY POS & CREDIT MANAGEMENT SYSTEM - GOOGLE APPS SCRIPT BACKEND
 * ============================================================================
 * 
 * This Google Apps Script turns your Google Spreadsheet into a 100% FREE,
 * 24/7 cloud database that NEVER pauses or sleeps (unlike Supabase).
 * 
 * 📋 SETUP INSTRUCTIONS (Takes only 2 minutes):
 * ----------------------------------------------------------------------------
 * 1. Open Google Sheets (https://sheets.new) and create a new blank spreadsheet.
 * 2. Name your spreadsheet: "Lottery POS Database"
 * 3. In the top menu, click: Extensions > Apps Script
 * 4. Delete any code in the Apps Script editor, and PASTE THIS ENTIRE FILE.
 * 5. Click the Save icon (💾) or press Ctrl+S.
 * 6. Click the blue "Deploy" button (top right) > "New deployment"
 * 7. Click the gear icon (⚙️) next to "Select type" and select "Web app".
 * 8. Set the following options:
 *    - Description: "Lottery POS API"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone"  <-- IMPORTANT! Allows your POS app to connect.
 * 9. Click "Deploy". Grant permissions if prompted by Google.
 * 10. COPY the "Web app URL" (it looks like: https://script.google.com/macros/s/AKfy.../exec)
 * 11. Paste this URL into your POS app (in Admin Dashboard > Database Settings, or in .env)!
 * ============================================================================
 */

const SHEET_NAMES = {
  SELLERS: 'sellers',
  ASSISTANTS: 'assistants',
  BRANDS: 'brands',
  TRANSACTIONS: 'transactions',
  ADMIN_PROFILE: 'admin_profile'
};

/**
 * Handle GET requests (e.g. Fetching all data for the POS system)
 */
function doGet(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.tryLock(15000);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheetsInitialized(ss);

    const action = (e && e.parameter && e.parameter.action) || 'fetchAll';

    if (action === 'fetchAll') {
      const sellers = getSheetData(ss.getSheetByName(SHEET_NAMES.SELLERS));
      const assistants = getSheetData(ss.getSheetByName(SHEET_NAMES.ASSISTANTS));
      const brands = getSheetData(ss.getSheetByName(SHEET_NAMES.BRANDS));
      const transactions = getSheetData(ss.getSheetByName(SHEET_NAMES.TRANSACTIONS));
      const adminRows = getSheetData(ss.getSheetByName(SHEET_NAMES.ADMIN_PROFILE));

      // Parse JSON details if any
      transactions.forEach(t => {
        if (t.details && typeof t.details === 'string') {
          try { t.details = JSON.parse(t.details); } catch (err) {}
        }
      });

      const response = {
        success: true,
        sellers: sellers.map(formatSeller),
        assistants: assistants.map(formatAssistant),
        brands: brands.map(formatBrand),
        transactions: transactions.map(formatTransaction),
        adminProfile: adminRows.length > 0 ? formatAdminProfile(adminRows[0]) : null
      };

      lock.releaseLock();
      return jsonResponse(response);
    }

    lock.releaseLock();
    return jsonResponse({ success: true, message: 'Lottery POS API is active' });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Handle POST requests (e.g. Recording transactions, updating credit, modifying sellers)
 */
function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.tryLock(30000); // Wait up to 30s for concurrent transactions

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheetsInitialized(ss);

    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action;
    const data = payload.data;

    let result = { success: true };

    switch (action) {
      case 'recordTransaction':
        result = handleRecordTransaction(ss, data);
        break;

      case 'upsertSeller':
        result = handleUpsertSeller(ss, data);
        break;

      case 'deleteSeller':
        result = handleDeleteSeller(ss, data);
        break;

      case 'upsertAssistant':
        result = handleUpsertAssistant(ss, data);
        break;

      case 'upsertBrand':
        result = handleUpsertBrand(ss, data);
        break;

      case 'upsertAdminProfile':
        result = handleUpsertAdminProfile(ss, data);
        break;

      default:
        result = { success: false, error: 'Unknown action: ' + action };
        break;
    }

    lock.releaseLock();
    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// ----------------------------------------------------------------------------
// HANDLERS FOR DATABASE ACTIONS
// ----------------------------------------------------------------------------

function handleRecordTransaction(ss, data) {
  const txn = data.transaction;
  const sellerId = data.sellerId;
  const newCredit = Number(data.newCredit);

  // 1. Append to Transactions sheet
  const txnSheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  const detailsStr = txn.details ? JSON.stringify(txn.details) : '';
  txnSheet.appendRow([
    txn.id,
    txn.date,
    txn.sellerId,
    txn.sellerName,
    txn.assistantId,
    txn.assistantName,
    txn.actionType || '',
    txn.typeLabel || '',
    txn.deltaCredit || 0,
    txn.previousCredit || 0,
    newCredit,
    txn.notes || '',
    detailsStr
  ]);

  // 2. Update Seller's credit in Sellers sheet
  const sellerSheet = ss.getSheetByName(SHEET_NAMES.SELLERS);
  const sellersData = sellerSheet.getDataRange().getValues();
  // sellers headers: id, name, owner, phone, location, tier, credit_limit, current_credit, assigned_assistant, is_frozen
  for (let i = 1; i < sellersData.length; i++) {
    if (String(sellersData[i][0]) === String(sellerId)) {
      sellerSheet.getRange(i + 1, 8).setValue(newCredit); // Column 8 is current_credit
      const creditLimit = Number(sellersData[i][6]);
      if (newCredit > creditLimit) {
        sellerSheet.getRange(i + 1, 10).setValue(true); // Column 10 is is_frozen
      }
      break;
    }
  }

  return { success: true };
}

function handleUpsertSeller(ss, seller) {
  const sheet = ss.getSheetByName(SHEET_NAMES.SELLERS);
  const data = sheet.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(seller.id)) {
      foundRow = i + 1;
      break;
    }
  }

  const rowValues = [
    seller.id,
    seller.name,
    seller.owner || '',
    seller.phone || '',
    seller.location || '',
    seller.tier || 'Tier A',
    Number(seller.creditLimit) || 0,
    Number(seller.currentCredit) || 0,
    seller.assignedAssistant || '',
    Boolean(seller.isFrozen),
    seller.avatarId || 'char-06'
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { success: true };
}

function handleDeleteSeller(ss, data) {
  const sheet = ss.getSheetByName(SHEET_NAMES.SELLERS);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(data.id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return { success: true };
}

function handleUpsertAssistant(ss, assistant) {
  const sheet = ss.getSheetByName(SHEET_NAMES.ASSISTANTS);
  const data = sheet.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(assistant.id)) {
      foundRow = i + 1;
      break;
    }
  }

  const rowValues = [
    assistant.id,
    assistant.name,
    assistant.shortName || assistant.name,
    assistant.username || '',
    assistant.defaultPass || '1234',
    assistant.phone || '',
    assistant.route || '',
    Number(assistant.cashInHand) || 0,
    Number(assistant.winningVouchers) || 0,
    Number(assistant.totalOrdersToday) || 0,
    assistant.avatarBg || 'bg-orange-500 text-white',
    assistant.avatarId || 'char-02'
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { success: true };
}

function handleUpsertAdminProfile(ss, profile) {
  const sheet = ss.getSheetByName(SHEET_NAMES.ADMIN_PROFILE);
  const data = sheet.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(profile.id || 'admin_1')) {
      foundRow = i + 1;
      break;
    }
  }

  const rowValues = [
    profile.id || 'admin_1',
    profile.name || 'W.M.G. චිත්රා වීරකෝන්',
    profile.title || 'ලොතරැයි බෙදාහැරීම් කාර්යාලය • දෙහිඅත්තකණ්ඩිය',
    profile.phone || '+94 77 123 4567',
    profile.avatarId || 'char-01'
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { success: true };
}

function handleUpsertBrand(ss, brand) {
  const sheet = ss.getSheetByName(SHEET_NAMES.BRANDS);
  const data = sheet.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(brand.id)) {
      foundRow = i + 1;
      break;
    }
  }

  const rowValues = [
    brand.id,
    brand.name,
    brand.type || 'daily',
    Number(brand.faceValue) || 40,
    Number(brand.tierAPrice) || 33.5,
    Number(brand.tierBPrice) || 35.0,
    Number(brand.stockPerPack) || 100,
    Boolean(brand.active),
    brand.drawDays || 'Daily',
    brand.color || 'from-amber-500 to-orange-500'
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { success: true };
}

// ----------------------------------------------------------------------------
// DATA FORMATTERS & SHEET HELPERS
// ----------------------------------------------------------------------------

function formatSeller(row) {
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    owner: String(row.owner || ''),
    phone: String(row.phone || ''),
    location: String(row.location || ''),
    tier: row.tier || 'Tier A',
    creditLimit: Number(row.credit_limit || row.creditLimit || 0),
    currentCredit: Number(row.current_credit || row.currentCredit || 0),
    assignedAssistant: String(row.assigned_assistant || row.assignedAssistant || ''),
    isFrozen: Boolean(row.is_frozen === true || row.is_frozen === 'true' || row.isFrozen === true),
    avatarId: String(row.avatar_id || row.avatarId || 'char-06')
  };
}

function formatAssistant(row) {
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    shortName: String(row.short_name || row.shortName || row.name || ''),
    username: String(row.username || ''),
    defaultPass: String(row.default_pass || row.defaultPass || '1234'),
    phone: String(row.phone || ''),
    route: String(row.route || ''),
    cashInHand: Number(row.cash_in_hand || row.cashInHand || 0),
    winningVouchers: Number(row.winning_vouchers || row.winningVouchers || 0),
    totalOrdersToday: Number(row.total_orders_today || row.totalOrdersToday || 0),
    avatarBg: String(row.avatar_bg || row.avatarBg || 'bg-orange-500 text-white'),
    avatarId: String(row.avatar_id || row.avatarId || 'char-02')
  };
}

function formatAdminProfile(row) {
  return {
    id: String(row.id || 'admin_1'),
    name: String(row.name || 'W.M.G. චිත්රා වීරකෝන්'),
    title: String(row.title || 'ලොතරැයි බෙදාහැරීම් කාර්යාලය • දෙහිඅත්තකණ්ඩිය'),
    phone: String(row.phone || '+94 77 123 4567'),
    avatarId: String(row.avatar_id || row.avatarId || 'char-01')
  };
}

function formatBrand(row) {
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    type: row.type || 'daily',
    faceValue: Number(row.face_value || row.faceValue || 40),
    tierAPrice: Number(row.tier_a_price || row.tierAPrice || 33.5),
    tierBPrice: Number(row.tier_b_price || row.tierBPrice || 35.0),
    stockPerPack: Number(row.stock_per_pack || row.stockPerPack || 100),
    active: Boolean(row.active === true || row.active === 'true'),
    drawDays: String(row.draw_days || row.drawDays || 'Daily'),
    color: String(row.color || 'from-amber-500 to-orange-500')
  };
}

function formatTransaction(row) {
  return {
    id: String(row.id || ''),
    date: String(row.date || ''),
    sellerId: String(row.seller_id || row.sellerId || ''),
    sellerName: String(row.seller_name || row.sellerName || ''),
    assistantId: String(row.assistant_id || row.assistantId || ''),
    assistantName: String(row.assistant_name || row.assistantName || ''),
    actionType: String(row.action_type || row.type || 'TXN'),
    typeLabel: String(row.type_label || row.typeLabel || 'Transaction'),
    deltaCredit: Number(row.amount || row.deltaCredit || 0),
    previousCredit: Number(row.old_credit || row.previousCredit || 0),
    newCredit: Number(row.new_credit || row.newCredit || 0),
    notes: String(row.notes || ''),
    details: row.details || {}
  };
}

function getSheetData(sheet) {
  if (!sheet) return [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length <= 1) return [];

  const headers = values[0].map(h => String(h).trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < values.length; i++) {
    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = values[i][j];
    }
    rows.push(rowObj);
  }
  return rows;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Ensures all required sheets exist with proper headers
 */
function ensureSheetsInitialized(ss) {
  const sheetDefinitions = [
    {
      name: SHEET_NAMES.SELLERS,
      headers: ['id', 'name', 'owner', 'phone', 'location', 'tier', 'credit_limit', 'current_credit', 'assigned_assistant', 'is_frozen', 'avatar_id']
    },
    {
      name: SHEET_NAMES.ASSISTANTS,
      headers: ['id', 'name', 'short_name', 'username', 'default_pass', 'phone', 'route', 'cash_in_hand', 'winning_vouchers', 'total_orders_today', 'avatar_bg', 'avatar_id']
    },
    {
      name: SHEET_NAMES.BRANDS,
      headers: ['id', 'name', 'type', 'face_value', 'tier_a_price', 'tier_b_price', 'stock_per_pack', 'active', 'draw_days', 'color']
    },
    {
      name: SHEET_NAMES.TRANSACTIONS,
      headers: ['id', 'date', 'seller_id', 'seller_name', 'assistant_id', 'assistant_name', 'action_type', 'type_label', 'amount', 'old_credit', 'new_credit', 'notes', 'details']
    },
    {
      name: SHEET_NAMES.ADMIN_PROFILE,
      headers: ['id', 'name', 'title', 'phone', 'avatar_id'],
      defaultRow: ['admin_1', 'W.M.G. චිත්රා වීරකෝන්', 'ලොතරැයි බෙදාහැරීම් කාර්යාලය • දෙහිඅත්තකණ්ඩිය', '+94 77 123 4567', 'char-01']
    }
  ];

  sheetDefinitions.forEach(def => {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
      sheet.appendRow(def.headers);
      sheet.getRange(1, 1, 1, def.headers.length).setFontWeight('bold').setBackground('#E2E8F0');
      sheet.setFrozenRows(1);
      if (def.defaultRow) {
        sheet.appendRow(def.defaultRow);
      }
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
      sheet.getRange(1, 1, 1, def.headers.length).setFontWeight('bold').setBackground('#E2E8F0');
      sheet.setFrozenRows(1);
      if (def.defaultRow) {
        sheet.appendRow(def.defaultRow);
      }
    }
  });
}

