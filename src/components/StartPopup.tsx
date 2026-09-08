import React from 'react';
import { motion } from 'motion/react';
import { Play, Gamepad2, Maximize2, Sparkles } from 'lucide-react';

interface StartPopupProps {
  onStart: () => void;
}

export const StartPopup: React.FC<StartPopupProps> = ({ onStart }) => {
  return (
    <motion.div
      id="start-popup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none"
    >
      {/* Background ambient neon glow */}
      <div className="absolute w-72 h-72 rounded-full bg-red-600/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none translate-x-20 translate-y-20 animate-pulse delay-500" />

      {/* Floating Card Container */}
      <motion.div
        initial={{ scale: 0.85, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 15, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm rounded-3xl bg-slate-900/95 border border-slate-700/80 p-6 sm:p-8 text-center shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden"
      >
        {/* Top subtle highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />

        {/* Floating Gamepad Icon */}
        <div className="relative mx-auto mb-5 flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600/30 via-slate-800 to-emerald-600/20 border border-slate-700 shadow-inner">
          <Gamepad2 className="w-10 h-10 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-bounce" />
          <Sparkles className="w-4 h-4 text-emerald-400 absolute top-2 right-2 animate-ping" />
        </div>

        {/* Brand & Subtitle */}
        <div className="space-y-1 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            1 Milions Game Studio
          </p>
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">
            Astrocade
          </h2>
          <p className="text-xs text-slate-400 pt-1">
            Tekan mulai untuk meluncurkan game ke layar penuh.
          </p>
        </div>

        {/* Floating Start Button */}
        <button
          id="btn-start-game"
          onClick={onStart}
          className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base uppercase tracking-widest shadow-xl shadow-red-600/30 transition-all duration-200 active:scale-95 hover:shadow-red-600/50 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:scale-110">
            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
          </div>
          <span>Mulai</span>
        </button>

        {/* Fullscreen indicator badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Otomatis Full Screen & Layar Tetap Aktif</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
