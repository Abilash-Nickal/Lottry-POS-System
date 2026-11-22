/**
 * DATABASE SERVICE WRAPPER
 * 
 * Re-exports from databaseService.ts to support Google Sheets & Local-First storage
 * while preserving full backwards compatibility across the application.
 */

export {
  fetchAllData,
  dbUpsertSeller,
  dbDeleteSeller,
  dbUpsertAssistant,
  dbUpsertBrand,
  dbRecordTransaction,
  getGoogleSheetsUrl,
  setGoogleSheetsUrl,
  exportTransactionsToExcel,
  exportSellersToExcel,
  exportAssistantsToExcel,
  getAdminProfile,
  dbUpsertAdminProfile,
  dbResetSellerTransactions
} from './databaseService';

// Re-export seedDatabaseIfEmpty as a no-op / compatibility helper
export async function seedDatabaseIfEmpty() {
  // Handled automatically by databaseService
  return Promise.resolve();
}
