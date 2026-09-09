import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles, CheckCircle2, ShieldAlert, Award, X } from 'lucide-react';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (points: number) => void;
  rewardPoints: number;
}

const AD_SPONSORS = [
  {
    title: 'DANA Indonesia - Dompet Digital Terpercaya',
    tagline: 'Kirim uang, bayar tagihan, dan kumpulkan saldo cashback setiap hari!',
    cta: 'Install Sekarang',
    badge: 'Sponsor Resmi DANA',
    color: 'from-[#108EE9] to-blue-700',
    iconBg: 'bg-white text-[#108EE9]',
    stars: '4.8 ★ (10jt+ Unduhan)',
  },
  {
    title: 'Turnamen Game Saldo DANA',
    tagline: 'Mainkan game setiap hari, raih skor tertinggi, dan tarik reward saldo DANA asli!',
    cta: 'Mainkan Gratis',
    badge: 'Game Saldo DANA',
    color: 'from-sky-500 to-indigo-600',
    iconBg: 'bg-white text-sky-600',
    stars: '4.9 ★ (Komunitas DANA)',
  },
  {
    title: 'CashZilla - Reward Saldo DANA',
    tagline: 'Kumpulkan ribuan poin setiap hari dengan bermain game santai dan tonton video.',
    cta: 'Dapatkan Bonus',
    badge: 'Trending Reward DANA',
    color: 'from-amber-500 to-emerald-600',
    iconBg: 'bg-white text-emerald-600',
    stars: '4.7 ★ (3jt+ Unduhan)',
  },
];

export const AdModal: React.FC<AdModalProps> = ({
  isOpen,
  onClose,
  onClaimReward,
  rewardPoints,
}) => {
  const AD_DURATION = 15; // 15 seconds ad countdown
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION);
  const [isMuted, setIsMuted] = useState(false);
  const [sponsorIndex, setSponsorIndex] = useState(0);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(AD_DURATION);
      setHasClaimed(false);
      setSponsorIndex(Math.floor(Math.random() * AD_SPONSORS.length));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, secondsLeft]);

  if (!isOpen) return null;

  const currentSponsor = AD_SPONSORS[sponsorIndex];
  const isFinished = secondsLeft === 0;

  const handleClaim = () => {
    if (!isFinished || hasClaimed) return;
    setHasClaimed(true);
    onClaimReward(rewardPoints);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div
        id="ad-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 backdrop-blur-[3px] p-4 select-none"
      >
        <motion.div
          id="ad-modal-card"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white/85 hover:bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-colors duration-300"
        >
          {/* Header Ad Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300 text-[10px]">
                IKLAN BERHADIAH
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-[#108EE9] font-bold border border-sky-300 text-[10px]">
                Unity Ads (800370501)
              </span>
              <span className="text-slate-600 text-[11px] font-medium hidden sm:inline">{currentSponsor.badge}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {isFinished ? (
                <button
                  onClick={onClose}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
                  title="Tutup Iklan"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1 font-mono text-[#108EE9] font-bold">
                  <span className="text-slate-500 font-sans text-[11px]">Klaim dalam:</span>
                  <span className="w-6 text-center text-xs bg-sky-50 px-1 py-0.5 rounded border border-sky-200">{secondsLeft}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Ad Visual Screen (Simulation) */}
          <div className={`relative h-64 bg-gradient-to-br ${currentSponsor.color} p-6 flex flex-col justify-between text-white overflow-hidden`}>
            {/* Background Decorative Pattern */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <div className="absolute w-72 h-72 rounded-full bg-white blur-3xl -top-20 -right-20" />
              <div className="absolute w-72 h-72 rounded-full bg-black blur-3xl -bottom-20 -left-20" />
            </div>

            {/* Top Info */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${currentSponsor.iconBg} flex items-center justify-center shadow-lg border border-white/40 font-black text-xl`}>
                  DANA
                </div>
                <div>
                  <h3 className="font-bold text-base text-white drop-shadow leading-tight">
                    {currentSponsor.title}
                  </h3>
                  <p className="text-xs text-white/90">{currentSponsor.stars}</p>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-xs font-bold text-amber-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                +{rewardPoints} Poin
              </div>
            </div>

            {/* Center Simulation Showcase */}
            <div className="relative z-10 my-auto text-center py-4">
              <p className="text-sm font-medium text-white/95 max-w-sm mx-auto drop-shadow-md">
                "{currentSponsor.tagline}"
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold">
                <span>Tonton hingga selesai untuk mendapatkan poin</span>
              </div>
            </div>

            {/* Progress Bar of Video */}
            <div className="relative z-10 w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-300 transition-all duration-1000 ease-linear"
                style={{ width: `${((AD_DURATION - secondsLeft) / AD_DURATION) * 100}%` }}
              />
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>
                {isFinished
                  ? 'Video selesai! Silakan klaim poin Anda.'
                  : `Tunggu ${secondsLeft} detik lagi untuk mengklaim poin.`}
              </span>
            </div>

            {isFinished ? (
              <button
                id="btn-claim-ad-reward"
                onClick={handleClaim}
                disabled={hasClaimed}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  hasClaimed
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-[#108EE9] hover:bg-[#0c7ac9] text-white shadow-sky-500/25 animate-bounce'
                }`}
              >
                {hasClaimed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Poin Diterima! (+{rewardPoints})
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Klaim +{rewardPoints} Poin DANA
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-sm cursor-not-allowed border border-slate-300"
              >
                Menonton ({secondsLeft}s)...
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
