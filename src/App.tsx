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
import { GAME_DATA } from './data/gameConfig';
import { Maximize } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showStartPopup, setShowStartPopup] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

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

  // Handle splash completion: switch to floating Start Popup
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    setShowStartPopup(true);
  }, []);

  // Handle start button click on the floating popup
  const handleStartGame = useCallback(() => {
    setShowStartPopup(false);
    enterFullscreen();
  }, [enterFullscreen]);

  // Global one-time interaction listeners to trigger fullscreen on any touch
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!showSplash && !showStartPopup) {
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
  }, [enterFullscreen, showSplash, showStartPopup]);

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
      className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none"
    >
      {/* 1 Milions Game Studio Splash Screen */}
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

      {/* Auto Fullscreen Subtle Notification / One-tap trigger if exited */}
      {!isFullscreen && !showSplash && !showStartPopup && showTapHint && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            enterFullscreen();
            setShowTapHint(false);
          }}
          className="cursor-pointer fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-slate-900/90 border border-slate-700/80 px-4 py-1.5 text-xs text-slate-200 shadow-2xl backdrop-blur-md transition-opacity duration-300 hover:bg-slate-800"
        >
          <Maximize className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Sentuh layar untuk mode Full Screen</span>
        </div>
      )}

      {/* Direct Fullscreen Game Frame */}
      <GameFrame
        url={GAME_DATA.url}
        iframeRef={iframeRef}
        onReload={handleReload}
        keyTrigger={reloadKey}
      />
    </main>
  );
}
