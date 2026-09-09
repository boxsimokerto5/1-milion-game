import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Gamepad2, Maximize2, Sparkles, Database, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured, checkSupabaseConnection } from '../lib/supabase';

interface StartPopupProps {
  onStart: () => void;
}

export const StartPopup: React.FC<StartPopupProps> = ({ onStart }) => {
  const [supabaseStatus, setSupabaseStatus] = useState<{ checked: boolean; connected: boolean }>({
    checked: false,
    connected: false,
  });

  useEffect(() => {
    if (isSupabaseConfigured) {
      checkSupabaseConnection().then((res) => {
        setSupabaseStatus({ checked: true, connected: res.connected });
      });
    } else {
      setSupabaseStatus({ checked: true, connected: false });
    }
  }, []);
  return (
    <motion.div
      id="start-popup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-[3px] select-none"
    >
      {/* Background ambient subtle glow */}
      <div className="absolute w-72 h-72 rounded-full bg-sky-300/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full bg-emerald-300/15 blur-3xl pointer-events-none translate-x-20 translate-y-20 animate-pulse delay-500" />

      {/* Floating Card Container with subtle transparency */}
      <motion.div
        initial={{ scale: 0.85, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 15, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm rounded-3xl bg-white/75 hover:bg-white/85 backdrop-blur-md border border-white/60 shadow-xl p-6 sm:p-8 text-center overflow-hidden transition-colors duration-300"
      >
        {/* Top subtle highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-400 via-[#108EE9] to-emerald-400 opacity-80" />

        {/* Floating Gamepad Icon */}
        <div className="relative mx-auto mb-5 flex items-center justify-center w-20 h-20 rounded-2xl bg-white/80 border border-sky-100 shadow-sm backdrop-blur-sm">
          <Gamepad2 className="w-10 h-10 text-[#108EE9] drop-shadow-xs animate-bounce" />
          <Sparkles className="w-4 h-4 text-amber-500 absolute top-2 right-2 animate-ping" />
        </div>

        {/* Brand & Subtitle */}
        <div className="space-y-1.5 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#108EE9]">
            Game Saldo DANA
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 drop-shadow-xs">
            Game Saldo DANA
          </h2>
          <p className="text-xs text-slate-600 pt-0.5 leading-relaxed font-medium">
            Mainkan game, kumpulkan poin reward setiap menit, dan tarik langsung ke akun DANA Anda!
          </p>
        </div>

        {/* Floating Start Button */}
        <button
          id="btn-start-game"
          onClick={onStart}
          className="group relative w-full flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-[#108EE9]/90 hover:bg-[#108EE9] text-white font-bold text-base uppercase tracking-wider shadow-md shadow-sky-500/20 transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-sm"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:scale-110">
            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
          </div>
          <span>Mulai Main Game</span>
        </button>

        {/* Fullscreen indicator badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-600 font-medium">
          <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Layar Penuh Otomatis & Layar Tetap Aktif</span>
        </div>

        {/* Supabase Status Indicator */}
        <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-center gap-1.5 text-[11px]">
          <Database className="w-3 h-3 text-slate-500" />
          {supabaseStatus.connected ? (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Supabase Terhubung
            </span>
          ) : isSupabaseConfigured ? (
            <span className="text-amber-600 font-medium">Supabase Menghubungkan...</span>
          ) : (
            <span className="text-slate-500 font-medium">Penyimpanan Lokal Aktif (Supabase Siap)</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
