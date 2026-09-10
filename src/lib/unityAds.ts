import { RewardConfig } from '../types';

declare global {
  interface Window {
    unityAds?: {
      showRewardedAd?: (placementId: string, options?: { testMode?: boolean }) => Promise<boolean>;
      isReady?: (placementId: string) => boolean;
    };
    // Unity Ads Android Javascript bridge when running inside Capacitor or Android WebView
    AndroidUnityAds?: {
      showRewardedAd: (placementId: string) => void;
      isAdReady: (placementId: string) => boolean;
    };
    onUnityAdRewarded?: () => void;
    onUnityAdError?: (msg?: string) => void;
  }
}

export class UnityAdsService {
  private static isInitialized = false;

  static initialize(config: RewardConfig) {
    if (this.isInitialized) return;
    const gameId = config.unityGameId || '800370501';
    const testMode = config.unityTestMode || false;

    console.log(`[UnityAds] Inisialisasi Game ID: ${gameId}, Test Mode: ${testMode}`);
    this.isInitialized = true;
  }

  static isNativeAndroidAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.AndroidUnityAds;
  }

  static async showRewardedAd(config: RewardConfig): Promise<boolean> {
    const placementId = config.unityPlacementId || 'Rewarded_Android';

    // 1. If running inside Android Native wrapper with Unity Ads Bridge
    if (typeof window !== 'undefined' && window.AndroidUnityAds) {
      try {
        window.AndroidUnityAds.showRewardedAd(placementId);
        return true;
      } catch (err) {
        console.warn('[UnityAds] Gagal memanggil native bridge:', err);
      }
    }

    // 2. If running with custom window.unityAds plugin
    if (typeof window !== 'undefined' && window.unityAds?.showRewardedAd) {
      try {
        return await window.unityAds.showRewardedAd(placementId, {
          testMode: config.unityTestMode,
        });
      } catch (err) {
        console.warn('[UnityAds] Plugin error:', err);
      }
    }

    // Fallback: Web player simulated environment
    return false;
  }
}
