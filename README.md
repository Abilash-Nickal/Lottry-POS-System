# 🎟️ Lottery Ticket Distribution POS & Credit Management System

A high-performance, real-time web application prototype designed for regional Lottery Distributors, Field Sales Reps, and Wholesale/Retail Lottery Dealers.

---

## 🚀 Live Development Server
Run in terminal:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🗺️ Step-by-Step Application Navigation Flow

```
[01 - Role Gate]
   ├── Admin Dashboard (Rate Matrix Config, Seller Limits, Audit Ledger, Assistant Reports)
   └── Assistant Select (Assistant 1, 2, 3, or 4)
            │
            ▼
[02 - Seller Directory]
   (Filtered by route/assistant; shows Current Balance, Credit Status, Limit Progress)
            │
            ▼
[03 - Seller Workspace (Main POS Terminal)]
   ┌────────────────────────────────────────────────────────┐
   │ SELLER NAME: City Center Lotto (Tier A - Wholesale)    │
   │ CURRENT CREDIT: LKR 42,500 / LIMIT: LKR 100,000        │
   │ AVAILABLE CREDIT: LKR 57,500                           │
   └────────────────────────────────────────────────────────┘
   │
   ├── [3.1] 🛒 Sale (Issue new Daily / Scratch Card packs on credit)
   ├── [3.2] 🔄 Return (Return unsold packs before draw cutoff)
   ├── [3.3] 🏆 Pay by Winning Tickets (Offset credit with prize vouchers)
   ├── [3.4] ❌ Non-Winning Returning Tickets (Lottery scheme draw-backs/reimbursements)
   └── [3.5] 💵 Pay by Cash (Direct cash collection reducing credit)
```

---

## ⚡ Interface Breakdown & Ledger Math

Every button directly impacts the seller's credit ledger according to these exact rules:

| Interface Action | What Happens in the App | Ledger Math | Safeguard / Rule |
| :--- | :--- | :--- | :--- |
| **3.1 Sale** | Assistant selects ticket brands (Daily / Scratch) and pack quantities. Uses the seller's specific tier price (Wholesale Tier A vs. Retail Tier B). | **+ Credit Balance** *(Increases debt)* | **System blocks the transaction** if `Current Credit + Bill Total > Credit Limit`. |
| **3.2 Return** | Assistant accepts unsold, un-scratched, or pre-draw packs returned by the seller before cutoff. | **– Credit Balance** *(Reduces debt)* | Verified at original tier issue rate. Logs serial/batch number and return reason. |
| **3.3 Pay by Winning Tickets** | Retailer hands over verified prize-winning tickets they paid out to end-customers. Assistant enters prize amounts, counts & envelope batch. | **– Credit Balance** *(Reduces debt)* | Generates a digital claim slip. Physical tickets are sealed in an envelope for depot handover. Added to assistant's winning vouchers in hand. |
| **3.4 Non-Winning Returning Tickets** | Lottery boards offer promotional reimbursement or special draw-backs for collected non-winning ticket stubs. | **– Credit Balance** *(Reduces debt)* | Quantity is recorded per brand scheme rate (e.g., LKR 1.50/stub) and credited directly to the seller's balance. |
| **3.5 Pay by Cash** | Assistant collects physical cash from the seller to clear part or all of their outstanding balance. | **– Credit Balance** *(Reduces debt)* | Cash is logged into the **Assistant’s Handover Balance** so the distributor head can reconcile it at end-of-day. |

---

## 🖨️ Bluetooth Thermal Printing
All operations generate a printable thermal slip (`#printable-receipt`) formatted for 80mm thermal receipt printers with `window.print()` integration.

---

## 📊 Database & Cloud Storage (Google Sheets & Excel)

The system now runs on a **resilient, zero-pause hybrid architecture** that replaces Supabase:

1. **Google Sheets Cloud Database (Never Pauses, 100% Free Forever)**:
   - Supabase free tier pauses after 7 days of inactivity. Google Sheets **never pauses or goes to sleep**.
   - Syncs across field tablets, phones, and PCs in real-time.
   - The business owner can open the spreadsheet on their phone anytime to view sales and debts.
   - Powered by a simple Google Apps Script (`google-sheets-backend.js`).

2. **Microsoft Excel Direct Export**:
   - One-click export for the entire **Audit Ledger & Transactions** to `.csv` / `.xlsx`.
   - One-click export for the **Retailers Directory & Outstanding Balances**.

3. **Offline-First Local Storage**:
   - Zero-latency optimistic UI with automatic local storage backup.
   - If an assistant is on a remote road with no cellular coverage, transactions still succeed without freezing.

### 🚀 2-Minute Google Sheets Setup:
1. Open [Google Sheets](https://sheets.new) and name it **Lottery POS Database**.
2. Click **Extensions > Apps Script**.
3. Copy all contents of [google-sheets-backend.js](./google-sheets-backend.js) and paste it into the editor.
4. Click **Deploy > New deployment > Web app** (Execute as: *Me*, Who has access: *Anyone*).
5. Copy the generated Web App URL and paste it into the POS App under **Admin Dashboard > Database & Cloud Sync** (or into `.env` as `VITE_GOOGLE_SHEETS_URL`).
