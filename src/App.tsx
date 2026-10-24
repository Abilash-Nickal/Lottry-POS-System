import React from 'react';
import { usePOSState } from './hooks/usePOSState';

// Modular UI Components
import { HeaderNav } from './components/HeaderNav';
import { Toast } from './components/Toast';
import { SplashScreen } from './components/SplashScreen';
import { UserSelection } from './components/UserSelection';
import { DistributorSelection } from './components/DistributorSelection';
import { UserLoginModal } from './components/UserLoginModal';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { AdminDashboard } from './components/AdminDashboard';
import { SellerDirectory } from './components/SellerDirectory';
import { SellerWorkspace } from './components/SellerWorkspace';
import { SaleFlowModal } from './components/SaleFlowModal';
import { ReturnModal } from './components/ActionModals/ReturnModal';
import { WinningModal } from './components/ActionModals/WinningModal';
import { NonWinningModal } from './components/ActionModals/NonWinningModal';
import { CashModal } from './components/ActionModals/CashModal';
import { FinalReceiptModal } from './components/FinalReceiptModal';

/**
 * ============================================================================
 * MAIN APPLICATION CONTROLLER: LOTTERY POS & CREDIT MANAGEMENT SYSTEM
 * ============================================================================
 * 
 * Cleanly separated into distinct cases so you can locate and modify any flow:
 * 
 * - CASE 0: Start Page Loading (Company Logo Splash Screen)
 * - CASE 1: User Profile Selection (Admin vs Field Assistant)
 * - CASE 2: User Login & PIN Authentication
 * - CASE 3: Distributor Head Admin Dashboard
 * - CASE 4: Field Assistant Dealer Selection Directory
 * - CASE 5: Dealer Active POS Terminal Workspace
 * - CASE 6: Ticket Sale & Dispatch Modal
 * - CASE 7: Return Unsold Packs Modal
 * - CASE 8: Winning Prize Vouchers Offset Modal
 * - CASE 9: Non-Winning Stubs Reimbursement Modal
 * - CASE 10: Direct Route Cash Settlement Modal
 * - CASE 11: Consolidated All-In-One Thermal Receipt Slip
 */
export default function LotteryDistributorPOS() {
  const {
    // Navigation & Roles
    currentStep,
    setCurrentStep,
    pendingUserRole,
    pendingAssistantId,
    authenticatedRole,

    // Selections
    selectedAssistantId,
    setSelectedAssistantId,
    selectedSellerId,
    setSelectedSellerId,

    // Master Data
    brands,
    sellers,
    setSellers,
    assistants,
    transactions,

    // Active Objects & Aggregates
    currentAssistant,
    currentSeller,
    sellerTransactions,
    totalMarketCredit,

    // Modals & Slips
    activeActionModal,
    setActiveActionModal,
    completedSlip,
    setCompletedSlip,

    // Notifications
    toast,
    showToast,

    // Action Handlers
    handleSelectRole,
    handleSelectAdmin,
    handleSelectDistributors,
    handleSelectDistributorProfile,
    handleLoginBack,
    handleLoginSuccess,
    handleConfirmSaleDispatch,
    handleConfirmReturn,
    handleConfirmWinning,
    handleConfirmNonWinning,
    handleConfirmCash,
    openAllInOneReceipt,
    handleToggleFreeze
  } = usePOSState();

  // Active Action Tab for Master-Detail Split View (3.1 to 3.5)
  const [selectedActionId, setSelectedActionId] = React.useState<'3.1' | '3.2' | '3.3' | '3.4' | '3.5'>('3.1');
  
  // Active Admin Tab for Admin Dashboard Navigation via Left Panel
  const [selectedAdminTab, setSelectedAdminTab] = React.useState<'overview' | 'pricing' | 'sellers' | 'assistants' | 'ledger'>('overview');

  // ==========================================================================
  // CASE 0: STARTUP SPLASH SCREEN / LOADING PAGE
  // ==========================================================================
  // When the app opens, this screen displays the company logo, animated loader,
  // and smoothly transitions to Case 1 (User Selection) upon completion.
  if (currentStep === 'SPLASH') {
    return (
      <SplashScreen 
        onFinish={() => setCurrentStep('USER_SELECT')} 
      />
    );
  }

  const isAuthPhase = 
    currentStep === 'USER_SELECT' || 
    currentStep === 'DISTRIBUTOR_SELECT' || 
    currentStep === 'USER_LOGIN';

  // --------------------------------------------------------------------------
  // AUTHENTICATION PHASE (MINIMAL 2-BUTTON ACCESS PORTAL)
  // --------------------------------------------------------------------------
  if (isAuthPhase) {
    return (
      <div 
        className="min-h-screen bg-[#F7F4F0] flex flex-col justify-center items-center py-5 sm:py-8 lg:py-10 px-3 sm:px-6 antialiased text-[#26201D] selection:bg-[#D68A64]/30"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
      >
        {/* Google Fonts: Plus Jakarta Sans for Headline, Body, and Label */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap" 
          rel="stylesheet" 
        />

        {/* Minimal top bar with logo only for login step */}
        {currentStep === 'USER_LOGIN' && (
          <header className="absolute top-4 left-6 z-10 flex items-center justify-between">
            <div 
              onClick={() => setCurrentStep('SPLASH')}
              className="flex items-center gap-2 cursor-pointer group"
              title="Replay startup loading screen"
            >
              <div className="w-8 h-8 rounded-xl glass-panel-elevated text-gray-900 flex items-center justify-center text-sm shadow-sm border border-gray-200 group-hover:scale-105 transition-transform">
                🎟️
              </div>
              <span className="font-black text-xs text-gray-900 tracking-tight">
                LankaLotto <span className="text-orange-500 font-extrabold">POS</span>
              </span>
            </div>
          </header>
        )}

        <main className="w-full flex-1 flex items-center justify-center">
          {currentStep === 'USER_SELECT' && (
            <UserSelection
              assistants={assistants}
              onSelectAssistant={handleSelectDistributorProfile}
              onSelectAdmin={handleSelectAdmin}
            />
          )}

          {currentStep === 'DISTRIBUTOR_SELECT' && (
            <UserSelection
              assistants={assistants}
              onSelectAssistant={handleSelectDistributorProfile}
              onSelectAdmin={handleSelectAdmin}
            />
          )}

          {currentStep === 'USER_LOGIN' && (
            <UserLoginModal
              pendingUserRole={pendingUserRole}
              pendingAssistantId={pendingAssistantId}
              assistants={assistants}
              onBack={handleLoginBack}
              onSuccess={handleLoginSuccess}
            />
          )}
        </main>

        <Toast toast={toast} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STANDALONE RETAILER SELECTION PAGE (SEPARATE PAGE WITHOUT SIDEBAR)
  // --------------------------------------------------------------------------
  // Appears after distributor login. No sidebar is shown here.
  // Once a retailer is selected, it launches the full dashboard UI.
  if (currentStep === 'SELLER_SELECT') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#EFE8E1] text-[#26201D] flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-950">
        <SellerDirectory
          sellers={sellers}
          currentAssistant={currentAssistant}
          onBack={() => setCurrentStep('DISTRIBUTOR_SELECT')}
          onSwitchUser={() => setCurrentStep('USER_SELECT')}
          onLogoClick={() => setCurrentStep('SPLASH')}
          onSelectSeller={(sellerId) => {
            setSelectedSellerId(sellerId);
            setCurrentStep('SELLER_WORKSPACE'); // Once selected -> opens the full dashboard UI!
          }}
        />
        <Toast toast={toast} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED SELLER WORKSPACE (WIREFRAME 3-COLUMN MASTER-DETAIL LAYOUT)
  // --------------------------------------------------------------------------
  if (currentStep === 'SELLER_WORKSPACE' && currentSeller) {
    return (
      <div className="h-screen overflow-hidden bg-transparent text-gray-900 p-2 sm:p-2.5 font-sans selection:bg-orange-500/20 selection:text-orange-950 flex flex-col">
        <div className="max-w-[1680px] w-full mx-auto flex-1 min-h-0 flex flex-col overflow-hidden">
          <SellerWorkspace
            currentSeller={currentSeller}
            currentAssistant={currentAssistant}
            sellerTransactions={sellerTransactions}
            brands={brands}
            onBackToDirectory={() => setCurrentStep('SELLER_SELECT')}
            onOpenFinalReceipt={() => openAllInOneReceipt()}
            onConfirmSaleDispatch={handleConfirmSaleDispatch}
            onConfirmReturn={handleConfirmReturn}
            onConfirmWinning={handleConfirmWinning}
            onConfirmNonWinning={handleConfirmNonWinning}
            onConfirmCash={handleConfirmCash}
            activeActionId={selectedActionId}
            onSelectActionId={setSelectedActionId}
          />
        </div>
        <Toast toast={toast} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED ADMIN CONSOLE
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-transparent text-gray-900 flex font-sans selection:bg-orange-500/20 selection:text-orange-950">
      
      {/* 1. Full-Height Curved Dark Indigo Sidebar on the Left */}
      <Sidebar
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        authenticatedRole={authenticatedRole}
        currentAssistant={currentAssistant}
        onSwitchUser={() => setCurrentStep('USER_SELECT')}
        activeActionId={selectedActionId}
        onSelectAction={(id) => {
          setSelectedActionId(id);
          setCurrentStep('SELLER_WORKSPACE');
        }}
        onOpenFinalReceipt={() => openAllInOneReceipt()}
        activeAdminTab={selectedAdminTab}
        onSelectAdminTab={(tab) => setSelectedAdminTab(tab)}
      />

      {/* 2. Main Viewport & Top Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Clean Minimal Top Navigation Bar */}
        <TopHeader
          currentStep={currentStep}
          currentSeller={currentSeller}
          currentAssistant={currentAssistant}
          authenticatedRole={authenticatedRole}
          onSwitchRetailer={() => setCurrentStep('SELLER_SELECT')}
          onOpenFinalReceipt={() => openAllInOneReceipt()}
          onSwitchUser={() => setCurrentStep('USER_SELECT')}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 px-6 sm:px-8 pb-12 max-w-7xl w-full">
          
          {/* Case 3: Admin Console & Dashboard */}
          {currentStep === 'ADMIN_DASHBOARD' && (
            <AdminDashboard
              brands={brands}
              assistants={assistants}
              sellers={sellers}
              transactions={transactions}
              onToggleFreeze={handleToggleFreeze}
              onOpenSellerPOS={(sellerId, assistantId) => {
                setSelectedSellerId(sellerId);
                setSelectedAssistantId(assistantId);
                setCurrentStep('SELLER_WORKSPACE');
              }}
              onOpenAssistantPOS={(assistantId) => {
                setSelectedAssistantId(assistantId);
                setCurrentStep('SELLER_SELECT');
              }}
              onSwitchToPOSMode={() => setCurrentStep('USER_SELECT')}
              onOpenSlipModal={(txn) => {
                const sObj = sellers.find(s => s.id === txn.sellerId) || currentSeller;
                openAllInOneReceipt(sObj);
              }}
              activeTab={selectedAdminTab}
              onTabChange={(tab) => setSelectedAdminTab(tab)}
              onUpdateSellers={setSellers}
              onUpdateAssistants={setAssistants}
              onUpdateBrands={setBrands}
              showToast={showToast}
            />
          )}

          {/* Case 6: Ticket Sale & Dispatch Modal */}
          {(currentStep === 'SALE_CATEGORY_SELECT' || currentStep === 'SALE_DATE_AND_TICKETS') && currentSeller && (
            <SaleFlowModal
              currentSeller={currentSeller}
              brands={brands}
              onBack={() => setCurrentStep('SELLER_WORKSPACE')}
              onConfirmDispatch={handleConfirmSaleDispatch}
            />
          )}

        </main>
      </div>

      {/* ==================================================================== */}
      {/* CASE 7: MODAL - PACK RETURN (Pre-draw / Unsold)                      */}
      {/* ==================================================================== */}
      {activeActionModal === 'RETURN' && currentSeller && (
        <ReturnModal
          currentSeller={currentSeller}
          brands={brands}
          onClose={() => setActiveActionModal(null)}
          onConfirm={handleConfirmReturn}
        />
      )}

      {/* ==================================================================== */}
      {/* CASE 8: MODAL - WINNING VOUCHERS CLAIM & OFFSET                      */}
      {/* ==================================================================== */}
      {activeActionModal === 'WINNING' && currentSeller && (
        <WinningModal
          currentSeller={currentSeller}
          onClose={() => setActiveActionModal(null)}
          onConfirm={handleConfirmWinning}
        />
      )}

      {/* ==================================================================== */}
      {/* CASE 9: MODAL - NON-WINNING STUBS DRAWBACK                           */}
      {/* ==================================================================== */}
      {activeActionModal === 'NON_WINNING' && currentSeller && (
        <NonWinningModal
          currentSeller={currentSeller}
          brands={brands}
          onClose={() => setActiveActionModal(null)}
          onConfirm={handleConfirmNonWinning}
        />
      )}

      {/* ==================================================================== */}
      {/* CASE 10: MODAL - DIRECT CASH ROUTE SETTLEMENT                        */}
      {/* ==================================================================== */}
      {activeActionModal === 'CASH' && currentSeller && (
        <CashModal
          currentSeller={currentSeller}
          currentAssistant={currentAssistant}
          onClose={() => setActiveActionModal(null)}
          onConfirm={handleConfirmCash}
        />
      )}

      {/* ==================================================================== */}
      {/* CASE 11: MODAL - ALL-IN-ONE CONSOLIDATED THERMAL RECEIPT SLIP        */}
      {/* ==================================================================== */}
      <FinalReceiptModal
        completedSlip={completedSlip}
        onClose={() => setCompletedSlip(null)}
      />

      {/* System Toast Alerts */}
      <Toast toast={toast} />

    </div>
  );
}
