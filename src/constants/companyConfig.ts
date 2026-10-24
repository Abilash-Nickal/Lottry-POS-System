/**
 * COMPANY CONFIGURATION & BRANDING SETTINGS
 * 
 * Edit this file to easily change company details, branding, logos,
 * and splash screen loading duration across the entire POS system!
 */

export const COMPANY_CONFIG = {
  // Brand & Company Information
  companyName: 'Lanka Lottery Distributors (Pvt) Ltd',
  shortName: 'LankaLotto',
  systemName: 'LOTTO POS',
  tagline: 'Wholesale Ticket Dispatch & Credit Management Terminal',
  legalRegistration: 'Reg: PV-98241 / Authorized National Lottery Distributor',
  taxNumber: 'VAT-49201948-LKR',
  hotline: '+94 11 234 5678',
  email: 'distributor@lankalotto.lk',
  address: 'No. 45, D.R. Wijewardena Mawatha, Colombo 10, Sri Lanka',

  // Start / Splash Loading Screen Configuration
  splash: {
    enabled: true,
    durationMs: 2000, // Duration in milliseconds (2.0 seconds)
    logoIcon: '🎟️',
    badgeText: 'Official Distributor Terminal',
    loadingSteps: [
      { progress: 15, text: 'Initializing Secure POS Engine...' },
      { progress: 45, text: 'Fetching Active Lottery Brands & Draw Dates...' },
      { progress: 75, text: 'Verifying Dealer Credit Ceilings & Ledger...' },
      { progress: 95, text: 'Finalizing Terminal Security Tokens...' },
      { progress: 100, text: 'System Ready! Loading User Profiles...' }
    ]
  }
};
