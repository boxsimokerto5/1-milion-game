/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { GameFrame } from './components/GameFrame';
import { SplashScreen } from './components/SplashScreen';
import { StartPopup } from './components/StartPopup';
import { OfflineBanner } from './components/OfflineBanner';
import { GameHUD } from './components/GameHUD';
import { AdModal } from './components/AdModal';
import { DanaWalletModal } from './components/DanaWalletModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { GAME_DATA } from './data/gameConfig';
import { PointService } from './lib/pointService';
import { UnityAdsService } from './lib/unityAds';
import { UserProfile, RewardConfig } from './types';
import { Maximize, Sparkles } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showStartPopup, setShowStartPopup] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // User & Point Management
  const [user, setUser] = useState<UserProfile>(() => PointService.getCurrentUser());
  const [gameStarted, setGameStarted] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('register');
  const [rewardConfig, setRewardConfig] = useState<RewardConfig>(() => PointService.getRewardConfig());
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => rewardConfig.intervalSeconds);
  const [isAdReady, setIsAdReady] = useState(false);
  const [playSecondsAccumulator, setPlaySecondsAccumulator] = useState(0);
  const [gameplayToast, setGameplayToast] = useState<string | null>(null);

  // Modals
  const [showAdModal, setShowAdModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Sync reward configuration
  useEffect(() => {
    const cfg = PointService.getRewardConfig();
    setRewardConfig(cfg);
  }, [showAdminModal]);

  // Trigger ad presentation (prefer real Unity Ads, respect user preference on simulation)
  const triggerAd = useCallback(async () => {
    const cfg = PointService.getRewardConfig();
    const canShowNative = UnityAdsService.isNativeAndroidAvailable();

    if (canShowNative) {
      // Panggil iklan video berhadiah asli Unity Ads di Android
      const shown = await UnityAdsService.showRewardedAd(cfg);
      if (shown) {
        return;
      }
    }

    // Jika native belum siap atau web fallback:
    // Cek apakah iklan cadangan (simulasi) diizinkan oleh admin/user
    if (cfg.allowSimulatedAds) {
      setShowAdModal(true);
    } else {
      // Iklan simulasi/palsu dimatikan oleh pengguna:
      // Tampilkan toast informatif bahwa iklan asli Unity Ads siap di perangkat Android
      setGameplayToast('Iklan resmi Unity Ads aktif (Game ID: ' + (cfg.unityGameId || '800370501') + ')');
      setTimeout(() => setGameplayToast(null), 3500);
      setRemainingSeconds(cfg.intervalSeconds);
      setIsAdReady(false);
    }
  }, []);

  // Main 2-minute countdown timer & gameplay reward interval
  useEffect(() => {
    // Only tick when player is actively in game (not on splash, not on start popup, and game has started)
    if (showSplash || showStartPopup || showAdModal || !gameStarted) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsAdReady(true);
          // Automatically trigger Ad when 2 minutes reached!
          triggerAd();
          return 0;
        }
        return prev - 1;
      });

      // Play reward: every 60 seconds of active playing, grant bonus play points
      setPlaySecondsAccumulator((prev) => {
        const next = prev + 1;
        if (next >= 60) {
          const cfg = PointService.getRewardConfig();
          PointService.addPoints(cfg.playRewardPoints, 'gameplay', 'Bonus Bermain Game 1 Menit').then((updated) => {
            setUser({ ...updated });
            setGameplayToast(`+${cfg.playRewardPoints} Poin Bermain!`);
            setTimeout(() => setGameplayToast(null), 3000);
          });
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showSplash, showStartPopup, showAdModal, gameStarted, triggerAd]);

  // Handle ad reward claimed
  const handleClaimAdReward = useCallback((points: number) => {
    PointService.addPoints(points, 'ad_reward', 'Menonton Iklan Bonus 2 Menit').then((updated) => {
      setUser({ ...updated });
    });
    // Reset timer to 2 minutes
    const cfg = PointService.getRewardConfig();
    setRemainingSeconds(cfg.intervalSeconds);
    setIsAdReady(false);
    setGameplayToast(`+${points} Poin DANA Berhasil Diklaim!`);
    setTimeout(() => setGameplayToast(null), 3500);
  }, []);

  // Fullscreen state detector
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      );
      setIsFullscreen(active);
      if (active) {
        setShowTapHint(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Request browser full screen
  const enterFullscreen = useCallback(async () => {
    if (
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
    ) {
      return;
    }

    try {
      const docEl = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };

      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
    } catch {
      // Handled gracefully
    }
  }, []);

  // Handle splash completion: switch to floating Start Popup or AuthModal for new users
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    if (user.isGuest) {
      // Pengguna baru: tampilkan modal pendaftaran & login langsung setelah splash screen
      setAuthInitialMode('register');
      setShowAuthModal(true);
    } else {
      setShowStartPopup(true);
    }
  }, [user.isGuest]);

  // Handle start button click on the floating popup
  const handleStartGame = useCallback(() => {
    setShowStartPopup(false);
    setGameStarted(true);
    enterFullscreen();
  }, [enterFullscreen]);

  // Global one-time interaction listeners to trigger fullscreen on any touch
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!showSplash && !showStartPopup && gameStarted && !showAuthModal) {
        enterFullscreen();
      }
    };

    window.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('click', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [enterFullscreen, showSplash, showStartPopup, gameStarted, showAuthModal]);

  // Screen Wake Lock (keep screen awake automatically during game)
  useEffect(() => {
    let isMounted = true;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        try {
          const sentinel = await navigator.wakeLock.request('screen');
          if (isMounted) {
            wakeLockRef.current = sentinel;
            sentinel.addEventListener('release', () => {
              wakeLockRef.current = null;
            });
          }
        } catch {
          // Unsupported or denied
        }
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  const handleReload = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  return (
    <main
      id="app-root"
      className="relative w-screen h-screen overflow-hidden bg-slate-100 select-none"
    >
      {/* Game Saldo DANA Splash Screen */}
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen onComplete={handleSplashComplete} durationMs={2800} />
        )}
      </AnimatePresence>

      {/* Floating Popup "Mulai" before game displays */}
      <AnimatePresence>
        {!showSplash && showStartPopup && (
          <StartPopup onStart={handleStartGame} />
        )}
      </AnimatePresence>

      {/* Offline connectivity warning banner */}
      <OfflineBanner />

      {/* Active Game HUD (Points, 2-Minute Circular Timer, DANA Withdraw, Profile) */}
      {!showSplash && !showStartPopup && gameStarted && (
        <GameHUD
          user={user}
          remainingSeconds={remainingSeconds}
          totalSeconds={rewardConfig.intervalSeconds}
          isAdReady={isAdReady}
          onOpenAd={triggerAd}
          onOpenWallet={() => setShowWalletModal(true)}
          onOpenAuth={() => {
            setAuthInitialMode('login');
            setShowAuthModal(true);
          }}
          onOpenAdmin={() => setShowAdminModal(true)}
        />
      )}

      {/* Dynamic Toast Feedback (Gameplay point tick / Ad claim) */}
      <AnimatePresence>
        {gameplayToast && (
          <div
            id="hud-toast-notification"
            className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-900 font-bold text-xs shadow-lg backdrop-blur-md border border-amber-300 animate-bounce"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{gameplayToast}</span>
          </div>
        )}
      </AnimatePresence>

      {/* Auto Fullscreen Subtle Notification / One-tap trigger if exited */}
      {!isFullscreen && !showSplash && !showStartPopup && gameStarted && showTapHint && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            enterFullscreen();
            setShowTapHint(false);
          }}
          className="cursor-pointer fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-white/90 border border-slate-200 px-4 py-1.5 text-xs text-slate-700 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-white"
        >
          <Maximize className="w-3.5 h-3.5 text-[#108EE9]" />
          <span>Sentuh layar untuk mode Layar Penuh</span>
        </div>
      )}

      {/* Direct Fullscreen Game Frame */}
      <GameFrame
        url={GAME_DATA.url}
        iframeRef={iframeRef}
        onReload={handleReload}
        keyTrigger={reloadKey}
      />

      {/* Ad Modal (Reward ad triggered automatically per 2 minutes or manually) */}
      <AdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onClaimReward={handleClaimAdReward}
        rewardPoints={rewardConfig.adRewardPoints}
      />

      {/* DANA Wallet & Withdrawal Modal */}
      <DanaWalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        user={user}
        onUserUpdated={(updated) => setUser({ ...updated })}
      />

      {/* Player Login / Register / Profile Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authInitialMode}
        onClose={() => {
          setShowAuthModal(false);
          if (!gameStarted) {
            setShowStartPopup(true);
          }
        }}
        currentUser={user}
        onUserLoggedIn={(updated) => {
          setUser({ ...updated });
          if (!gameStarted) {
            setShowStartPopup(true);
          }
        }}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* Admin Dashboard Modal (Review DANA withdrawals & settings) */}
      <AdminDashboardModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onLogoutAdmin={() => {
          const demoted: UserProfile = { ...user, isAdmin: false };
          PointService.saveUserLocal(demoted);
          setUser(demoted);
          setShowAdminModal(false);
        }}
      />
    </main>
  );
}
