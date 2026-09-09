import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Coins,
  Sparkles,
  ShieldCheck,
  User,
  ChevronUp,
  ChevronDown,
  Gift,
  Tv,
} from 'lucide-react';
import { CircularTimer } from './CircularTimer';
import { UserProfile } from '../types';

interface GameHUDProps {
  user: UserProfile;
  remainingSeconds: number;
  totalSeconds: number;
  isAdReady: boolean;
  onOpenAd: () => void;
  onOpenWallet: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  user,
  remainingSeconds,
  totalSeconds,
  isAdReady,
  onOpenAd,
  onOpenWallet,
  onOpenAuth,
  onOpenAdmin,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <header
      id="game-hud-container"
      className="fixed top-0 left-0 right-0 z-30 pointer-events-none flex flex-col items-center p-2 select-none"
    >
      <AnimatePresence mode="wait">
        {!isCollapsed ? (
          /* Full HUD Bar (Soft Light) */
          <motion.div
            key="full-hud"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="pointer-events-auto flex flex-wrap items-center justify-between gap-2 max-w-5xl w-full px-3 py-1.5 rounded-2xl bg-white/85 hover:bg-white/95 border border-slate-200/90 shadow-md backdrop-blur-md transition-colors duration-300"
          >
            {/* Left: User Profile & Points Badge */}
            <div className="flex items-center gap-2">
              <button
                id="hud-user-profile-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-700 transition text-xs shadow-xs"
                title="Profil & Masuk Akun"
              >
                <div className="w-5 h-5 rounded-full bg-[#108EE9] flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold max-w-[90px] truncate text-slate-700">
                  {user.username}
                </span>
              </button>

              {/* Points Badge (Penghitung Point Terang Lembut) */}
              <button
                id="hud-points-badge-btn"
                onClick={onOpenWallet}
                className="group flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300/80 text-amber-800 transition shadow-xs"
                title="Klik untuk membuka Dompet Saldo DANA"
              >
                <Coins className="w-4 h-4 text-amber-600 group-hover:rotate-12 transition-transform" />
                <span className="font-mono font-black text-xs text-amber-700 tracking-tight">
                  {user.points.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-amber-600 font-bold uppercase">Poin</span>
              </button>
            </div>

            {/* Center: 2-Minute Circular Timer Ring */}
            <div className="flex items-center justify-center">
              <CircularTimer
                remainingSeconds={remainingSeconds}
                totalSeconds={totalSeconds}
                onTriggerAd={onOpenAd}
                isReady={isAdReady}
              />
            </div>

            {/* Right: Actions (Tarik DANA, Tonton Iklan, Admin, Collapse) */}
            <div className="flex items-center gap-2">
              {/* Tarik Saldo DANA Button */}
              <button
                id="hud-btn-tarik-dana"
                onClick={onOpenWallet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#108EE9] hover:bg-[#0c7ac9] text-white font-bold text-xs shadow-sm border border-sky-400/40 transition active:scale-95"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Tarik DANA</span>
              </button>

              {/* Fast Watch Ad Button */}
              <button
                id="hud-btn-fast-ad"
                onClick={onOpenAd}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#108EE9] font-semibold text-xs border border-sky-200 transition active:scale-95 shadow-xs"
                title="Tonton Iklan Kapan Saja untuk Bonus Poin"
              >
                <Tv className="w-3.5 h-3.5 text-[#108EE9]" />
                <span>+75 Poin</span>
              </button>

              {/* Admin Panel Button (if admin) */}
              {user.isAdmin && (
                <button
                  id="hud-btn-admin-dashboard"
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs transition shadow-xs cursor-pointer"
                  title="Buka Dashboard Admin"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin</span>
                </button>
              )}

              {/* Collapse HUD Button */}
              <button
                id="hud-btn-collapse"
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Sembunyikan Menu ke Atas"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Compact Minimalist Pill (Soft Light) */
          <motion.div
            key="compact-hud"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="pointer-events-auto flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 shadow-md backdrop-blur-md text-xs transition-colors duration-300 text-slate-700"
          >
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-1 text-amber-700 font-mono font-bold"
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>{user.points.toLocaleString('id-ID')}</span>
            </button>

            <span className="text-slate-300">|</span>

            <button
              onClick={onOpenAd}
              className={`flex items-center gap-1 font-mono font-bold ${
                isAdReady ? 'text-amber-600 animate-pulse' : 'text-slate-700'
              }`}
            >
              {isAdReady ? (
                <span className="text-amber-600 flex items-center gap-1">
                  <Gift className="w-3 h-3 animate-bounce" />
                  Iklan Siap!
                </span>
              ) : (
                <span>
                  ⏱️ {Math.floor(remainingSeconds / 60)}:
                  {String(remainingSeconds % 60).padStart(2, '0')}
                </span>
              )}
            </button>

            <span className="text-slate-300">|</span>

            <button
              onClick={onOpenWallet}
              className="px-2 py-0.5 rounded-full bg-[#108EE9] hover:bg-[#0c7ac9] text-white font-bold text-[10px] shadow-xs"
            >
              DANA
            </button>

            {user.isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="p-1 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                title="Buka Panel Admin"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              </button>
            )}

            <button
              onClick={() => setIsCollapsed(false)}
              className="p-0.5 rounded text-slate-400 hover:text-slate-700"
              title="Buka Menu Lengkap"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
