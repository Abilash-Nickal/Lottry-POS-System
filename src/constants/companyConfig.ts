/**
 * COMPANY CONFIGURATION & BRANDING SETTINGS
 * 
 * Edit this file to easily change company details, branding, logos,
 * and splash screen loading duration across the entire POS system!
 */

export const COMPANY_CONFIG = {
  // Brand & Company Information
  companyName: 'ලොතරැයි බෙදාහැරීම් කාර්යාලය',
  distributorName: 'W.M.G. චිත්රා වීරකෝන්',
  shortName: 'ලොතරැයි POS',
  systemName: 'LOTTO POS',
  tagline: 'තොග ලොතරැයි බෙදාහැරීමේ හා ණය කළමනාකරණ පද්ධතිය',
  legalRegistration: 'බස් නැවතුම්පළ අසල, දෙහිඅත්තකණ්ඩිය',
  taxNumber: 'Reg: DL-DEHI-01',
  hotline: '+94 27 225 0000',
  email: 'chithra.lottery@gmail.com',
  address: 'බස් නැවතුම්පළ අසල, දෙහිඅත්තකණ්ඩිය',
  city: 'දෙහිඅත්තකණ්ඩිය',

  // Start / Splash Loading Screen Configuration
  splash: {
    enabled: true,
    durationMs: 1200, // Fast and responsive loading screen (1.2 seconds)
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
