import React from 'react';
import { motion } from 'motion/react';
import { Play, Sparkles, Gift } from 'lucide-react';

interface CircularTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  onTriggerAd: () => void;
  isReady: boolean;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  onTriggerAd,
  isReady,
}) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  // Progress from 0 to 1
  const progress = Math.max(0, Math.min(1, 1 - remainingSeconds / totalSeconds));
  const strokeDashoffset = circumference - progress * circumference;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <motion.button
      id="hud-circular-timer-btn"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onTriggerAd}
      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 select-none shadow-xs ${
        isReady
          ? 'bg-amber-50 hover:bg-amber-100/90 border-amber-300 text-amber-800 animate-pulse shadow-sm'
          : 'bg-slate-50/90 hover:bg-slate-100 border-slate-200/90 text-slate-700'
      }`}
      title={isReady ? 'Iklan Siap! Klik untuk ambil bonus poin' : `Iklan berikutnya dalam ${formattedTime}`}
    >
      {/* Circular Progress Ring */}
      <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
          {/* Background circle */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-slate-200"
            strokeWidth="3.5"
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            className={`transition-all duration-1000 ${
              isReady ? 'stroke-amber-500' : 'stroke-[#108EE9]'
            }`}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isReady ? (
            <Gift className="w-4 h-4 text-amber-600 animate-bounce" />
          ) : (
            <Play className="w-3.5 h-3.5 text-[#108EE9] ml-0.5 fill-[#108EE9]" />
          )}
        </div>
      </div>

      {/* Text Info */}
      <div className="flex flex-col text-left pr-1">
        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider">
          {isReady ? (
            <span className="text-amber-600 flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              Iklan Siap!
            </span>
          ) : (
            <span className="text-slate-400">Bonus Iklan</span>
          )}
        </div>
        <span className={`text-xs font-mono font-bold leading-tight ${isReady ? 'text-amber-700' : 'text-slate-700'}`}>
          {isReady ? 'Klaim Poin' : formattedTime}
        </span>
      </div>
    </motion.button>
  );
};
