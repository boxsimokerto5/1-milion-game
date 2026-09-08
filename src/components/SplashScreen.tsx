import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Sparkles, Play, Flame } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 2800,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        onComplete();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [durationMs, onComplete]);

  return (
    <motion.div
      id="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 select-none overflow-hidden"
    >
      {/* Background ambient lighting effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse delay-700" />

      {/* Grid line pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* Animated Studio Logo Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-600 via-slate-900 to-emerald-600 p-[2px] shadow-2xl shadow-red-950/60">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
              {/* Subtle sweep highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse" />
              <Gamepad2 className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
              <Sparkles className="w-4 h-4 text-emerald-400 absolute top-3 right-3 animate-ping" />
            </div>
          </div>
        </motion.div>

        {/* 1 MILIONS GAME Title Branding */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-1.5"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-[11px] font-bold text-red-400 uppercase tracking-widest mb-1">
            <Flame className="w-3 h-3 text-red-500" />
            <span>Game Studio</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-white drop-shadow-md">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-300 to-emerald-400">
              1 MILIONS
            </span>{' '}
            GAME
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
            Presents • Astrocade
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full mt-8 space-y-2"
        >
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-[1px]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 shadow-lg shadow-red-500/50"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
            <span>Memuat game...</span>
            <span className="text-slate-400 font-semibold">{progress}%</span>
          </div>
        </motion.div>

        {/* Instant Skip / Play Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onComplete}
          className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-900/40 transition active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Mulai Sekarang</span>
        </motion.button>
      </div>

      {/* Footer credits */}
      <div className="absolute bottom-6 text-[10px] text-slate-600 tracking-wider uppercase">
        © 1 Milions Game • Fullscreen WebGL Edition
      </div>
    </motion.div>
  );
};
