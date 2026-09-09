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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-sky-50/80 via-white to-slate-50 text-slate-800 select-none overflow-hidden"
    >
      {/* Background ambient lighting effects (soft light) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-300/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-700" />

      {/* Grid line pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* Animated Studio Logo Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-400 via-[#108EE9] to-blue-600 p-[2px] shadow-xl shadow-sky-500/20">
            <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center relative overflow-hidden shadow-inner p-2">
              <img src="/icon.svg" alt="Game Saldo DANA Logo" className="w-full h-full object-contain rounded-xl" />
              <Sparkles className="w-4 h-4 text-amber-500 absolute top-2 right-2 animate-ping" />
            </div>
          </div>
        </motion.div>

        {/* GAME SALDO DANA Title Branding */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-1.5"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-[11px] font-bold text-[#108EE9] border border-sky-200/80 uppercase tracking-widest mb-1 shadow-sm">
            <Flame className="w-3 h-3 text-amber-500" />
            <span>Game Saldo DANA</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-800 drop-shadow-sm">
            GAME{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#108EE9] via-sky-600 to-emerald-600">
              SALDO DANA
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider">
            Main Game • Kumpulkan Poin • Tarik Saldo DANA
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full mt-7 space-y-2"
        >
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden p-[1px] shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-[#108EE9] to-emerald-500 shadow-sm"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
            <span>Memuat Game Saldo DANA...</span>
            <span className="text-[#108EE9] font-bold font-mono">{progress}%</span>
          </div>
        </motion.div>

        {/* Instant Skip / Play Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onComplete}
          className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#108EE9] hover:bg-[#0c7ac9] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-sky-500/25 transition active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Mulai Sekarang</span>
        </motion.button>
      </div>

      {/* Footer credits */}
      <div className="absolute bottom-6 text-[11px] text-slate-400 font-medium tracking-wide">
        © Game Saldo DANA • Hadiah Nyata Setiap Hari
      </div>
    </motion.div>
  );
};
