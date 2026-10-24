import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Grid3X3, 
  IdCard, 
  Wifi, 
  ArrowRight, 
  CreditCard, 
  Fingerprint, 
  Database, 
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Assistant } from '../types';

interface UserLoginModalProps {
  pendingUserRole: 'admin' | 'assistant' | null;
  pendingAssistantId: string | null;
  assistants: Assistant[];
  onBack: () => void;
  onSuccess: (role: 'admin' | 'assistant', assistantId?: string) => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  pendingUserRole,
  pendingAssistantId,
  assistants,
  onBack,
  onSuccess
}) => {
  const currentAst = assistants.find(a => a.id === pendingAssistantId) || assistants[0];
  const [authMode, setAuthMode] = useState<'pin' | 'password'>('pin');
  
  // PIN State
  const [pin, setPin] = useState('');
  
  // Username / Password State
  const [username, setUsername] = useState(
    pendingUserRole === 'admin' ? 'admin' : (currentAst?.username || 'assistant')
  );
  const [password, setPassword] = useState(
    pendingUserRole === 'admin' ? 'admin123' : (currentAst?.defaultPass || '1234')
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [nfcSuccessAnimation, setNfcSuccessAnimation] = useState(false);

  // Keypad Handlers
  const handleDigitPress = (digit: string) => {
    setError('');
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleNfcSimulate = () => {
    setNfcSuccessAnimation(true);
    setPin('1234');
    setTimeout(() => {
      setNfcSuccessAnimation(false);
      verifyPin('1234');
    }, 300);
  };

  const verifyPin = (pinToTest: string) => {
    if (pendingUserRole === 'admin') {
      if (pinToTest === '1234' || pinToTest === '0000') {
        onSuccess('admin');
      } else {
        setError('Invalid Supervisor PIN (Demo: 1234)');
        setTimeout(() => setPin(''), 600);
      }
    } else {
      const targetPass = currentAst?.defaultPass || '1234';
      if (pinToTest === targetPass || pinToTest === '1234') {
        onSuccess('assistant', currentAst?.id);
      } else {
        setError(`Invalid PIN! Demo PIN is ${targetPass}`);
        setTimeout(() => setPin(''), 600);
      }
    }
  };

  const handleUnlockClick = () => {
    if (authMode === 'pin') {
      if (pin.length === 0) {
        // Auto-fill default demo PIN and unlock
        setPin(currentAst?.defaultPass || '1234');
        verifyPin(currentAst?.defaultPass || '1234');
      } else {
        verifyPin(pin);
      }
    } else {
      // Validate Username and Password
      if (pendingUserRole === 'admin') {
        if (username === 'admin' && (password === 'admin123' || password === '1234')) {
          onSuccess('admin');
        } else {
          setError('Invalid Admin Credentials (admin / admin123)');
        }
      } else {
        const correctUser = currentAst?.username || 'assistant';
        const correctPass = currentAst?.defaultPass || '1234';
        if ((username === correctUser || username === 'assistant') && (password === correctPass || password === '1234')) {
          onSuccess('assistant', currentAst?.id);
        } else {
          setError(`Invalid credentials (Demo: ${correctUser} / ${correctPass})`);
        }
      }
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto py-2 sm:py-4 px-3 animate-in fade-in duration-300">
      
      {/* Back to Step 1 */}
      <div className="mb-2.5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#E6DDD4] text-xs font-bold text-[#26201D] transition-colors shadow-2xs cursor-pointer min-h-[36px]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D64933]" />
          <span>Switch Operator</span>
        </button>
        <span className="text-[11px] font-bold text-[#9F9184] uppercase tracking-wider">
          Step 2 of 2
        </span>
      </div>

      {/* Main White Card - Compact and Sleek */}
      <div className="rounded-[28px] p-5 sm:p-6 bg-white border border-[#E6DDD4] shadow-lg text-center space-y-3 text-[#26201D] relative">
        
        {/* Top Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E9] border border-[#F4DEC9] text-[#9E2A1E] text-[10px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9E2A1E]" />
          <span>Lottery Field Distribution & POS</span>
        </div>

        {/* Welcome Back Header */}
        <div>
          <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#1E1915] tracking-tight">
            Welcome Back
          </h2>
          <p className="text-[#7F7266] text-xs font-medium mt-0.5 leading-snug">
            Sign in to access route ledgers, cash drawers, and terminal POS
          </p>
        </div>

        {/* Segmented Auth Mode Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F2ECE4] border border-[#E6DDD4] text-xs font-bold gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setAuthMode('pin')}
            className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] ${
              authMode === 'pin'
                ? 'bg-white text-[#9E2A1E] shadow-2xs font-bold'
                : 'text-[#7F7266] hover:text-[#26201D]'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Quick PIN & Badge</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('password')}
            className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] ${
              authMode === 'password'
                ? 'bg-white text-[#9E2A1E] shadow-2xs font-bold'
                : 'text-[#7F7266] hover:text-[#26201D]'
            }`}
          >
            <IdCard className="w-3.5 h-3.5" />
            <span>Depot ID & Password</span>
          </button>
        </div>

        {/* Selected User / Distributor Profile Pill */}
        <div className="w-full py-1.5 px-3 rounded-lg bg-[#FAF8F5] border border-[#E6DDD4] flex items-center justify-center gap-2 text-xs font-bold text-[#26201D]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {pendingUserRole === 'admin' 
              ? 'W.M.G. චිත්රා වීරකෝන් (Admin)' 
              : `${currentAst?.name || 'Distributor'} (${currentAst?.id || 'COL-01'})`
            }
          </span>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-2.5 rounded-lg bg-[#FDF2F0] border border-[#F9C9C2] text-[#D64933] text-xs font-bold flex items-center justify-center gap-2 animate-shake">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#D64933]" />
            <span>{error}</span>
          </div>
        )}

        {/* MODE A: QUICK PIN & KEYPAD */}
        {authMode === 'pin' && (
          <div className="space-y-3 pt-0.5">
            {/* 4 PIN Dots */}
            <div className="flex items-center justify-center gap-3 py-1">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                      isFilled
                        ? 'bg-[#26201D] scale-110 shadow-xs'
                        : 'bg-[#E6DDD4] border border-[#D5C9BD]'
                    }`}
                  />
                );
              })}
            </div>

            {/* NFC Reader Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E9] border border-[#F4DEC9] text-[#D68A64] text-[11px] font-semibold">
              <Wifi className={`w-3 h-3 text-[#D68A64] ${nfcSuccessAnimation ? 'animate-bounce text-[#9E2A1E]' : ''}`} />
              <span>NFC Ready - Tap badge or enter 4-digit PIN</span>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[290px] mx-auto pt-0.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigitPress(digit)}
                  className="py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] active:scale-95 border border-[#E6DDD4] text-xl font-bold text-[#26201D] shadow-2xs transition-all cursor-pointer min-h-[46px]"
                >
                  {digit}
                </button>
              ))}

              {/* Row 4: CLR, 0, Badge Icon */}
              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 rounded-xl bg-[#F2ECE4] hover:bg-[#EAE2D8] active:scale-95 text-xs font-bold text-[#7F7266] uppercase tracking-wider transition-all cursor-pointer min-h-[46px]"
              >
                CLR
              </button>

              <button
                type="button"
                onClick={() => handleDigitPress('0')}
                className="py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] active:scale-95 border border-[#E6DDD4] text-xl font-bold text-[#26201D] shadow-2xs transition-all cursor-pointer min-h-[46px]"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleNfcSimulate}
                className="py-2.5 rounded-xl bg-[#FAF0E9] hover:bg-[#F5DEC9] active:scale-95 text-[#D68A64] hover:text-[#9E2A1E] flex items-center justify-center transition-all cursor-pointer border border-[#F4DEC9] min-h-[46px]"
                title="Simulate NFC Badge Tap"
              >
                <CreditCard className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* MODE B: DEPOT ID & PASSWORD FORM */}
        {authMode === 'password' && (
          <div className="space-y-3 pt-1 text-left">
            <div>
              <label className="text-[11px] font-bold text-[#7F7266] uppercase tracking-wider block mb-1">
                Depot Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E6DDD4] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#26201D] focus:outline-none focus:border-[#9E2A1E] min-h-[42px]"
                placeholder="Enter username"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-[#7F7266] uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-[#9F9184] font-mono">
                  Default: {pendingUserRole === 'admin' ? 'admin123' : (currentAst?.defaultPass || '1234')}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DDD4] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#26201D] focus:outline-none focus:border-[#9E2A1E] min-h-[42px]"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9F9184] hover:text-[#26201D]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main CTA: Unlock POS Terminal */}
        <button
          type="button"
          onClick={handleUnlockClick}
          className="w-full py-3 rounded-xl bg-[#9E2A1E] hover:bg-[#852318] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-[#9E2A1E]/20 transition-all cursor-pointer mt-1 min-h-[46px]"
        >
          <span>Unlock POS Terminal</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>

      {/* Footer Links under the Card */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[#7F7266] px-1">
        <button
          type="button"
          onClick={() => {
            setAuthMode('pin');
            setPin('1234');
            setTimeout(() => verifyPin('1234'), 150);
          }}
          className="inline-flex items-center gap-1.5 hover:text-[#26201D] transition-colors cursor-pointer"
        >
          <Fingerprint className="w-3.5 h-3.5 text-[#D68A64]" />
          <span>Emergency Override</span>
        </button>

        <div className="inline-flex items-center gap-1.5 text-[#9F9184]">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local SQLite Active</span>
        </div>
      </div>

    </div>
  );
};
