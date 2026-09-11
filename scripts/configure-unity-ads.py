import os
import glob

print("==> Mengonfigurasi Unity Ads SDK untuk Android...")

# 1. Update android/app/build.gradle untuk menambahkan dependency Unity Ads
app_gradle = "android/app/build.gradle"
if os.path.exists(app_gradle):
    with open(app_gradle, "r", encoding="utf-8") as f:
        content = f.read()

    unity_dep = "    implementation 'com.unity3d.ads:unity-ads:4.12.5'\n"
    if "com.unity3d.ads:unity-ads" not in content:
        if "dependencies {" in content:
            content = content.replace("dependencies {", "dependencies {\n" + unity_dep)
            with open(app_gradle, "w", encoding="utf-8") as f:
                f.write(content)
            print("✓ Unity Ads dependency berhasil ditambahkan ke android/app/build.gradle")
        else:
            print("! Block dependencies { tidak ditemukan di build.gradle")
    else:
        print("✓ Unity Ads dependency sudah terpasang di android/app/build.gradle")

# 2. Update MainActivity.java dengan Bridge JavascriptInterface AndroidUnityAds
main_activities = glob.glob("android/app/src/main/java/**/MainActivity.java", recursive=True)
if main_activities:
    main_activity_path = main_activities[0]
    print(f"Menemukan MainActivity di: {main_activity_path}")

    main_activity_code = """package com.onemilionsgame.astrocade;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;

public class MainActivity extends BridgeActivity {
    private static final String UNITY_GAME_ID = "800370501";
    private static final String PLACEMENT_ID = "Rewarded_Android";
    private static final boolean TEST_MODE = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideSystemUI();

        try {
            UnityAds.initialize(getApplicationContext(), UNITY_GAME_ID, TEST_MODE, new IUnityAdsInitializationListener() {
                @Override
                public void onInitializationComplete() {
                    loadAd();
                }

                @Override
                public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String message) {
                }
            });

            this.bridge.getWebView().addJavascriptInterface(new UnityAdsBridge(), "AndroidUnityAds");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        hideSystemUI();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }

    private void hideSystemUI() {
        try {
            android.view.View decorView = getWindow().getDecorView();
            decorView.setSystemUiVisibility(
                android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void loadAd() {
        try {
            UnityAds.load(PLACEMENT_ID, new IUnityAdsLoadListener() {
                @Override
                public void onUnityAdsAdLoaded(String placementId) {}

                @Override
                public void onUnityAdsFailedToLoad(String placementId, UnityAds.UnityAdsLoadError error, String message) {}
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public class UnityAdsBridge {
        @JavascriptInterface
        public void showRewardedAd(String placement) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        String targetPlacement = (placement != null && !placement.isEmpty()) ? placement : PLACEMENT_ID;
                        UnityAds.show(MainActivity.this, targetPlacement, new UnityAdsShowOptions(), new IUnityAdsShowListener() {
                            @Override
                            public void onUnityAdsShowComplete(String placementId, UnityAds.UnityAdsShowCompletionState state) {
                                if (state == UnityAds.UnityAdsShowCompletionState.COMPLETED) {
                                    bridge.getWebView().post(new Runnable() {
                                        @Override
                                        public void run() {
                                            bridge.getWebView().evaluateJavascript("if (window.onUnityAdRewarded) { window.onUnityAdRewarded(); }", null);
                                        }
                                    });
                                }
                                loadAd();
                            }

                            @Override
                            public void onUnityAdsShowFailure(String placementId, UnityAds.UnityAdsShowError error, String message) {
                                bridge.getWebView().post(new Runnable() {
                                    @Override
                                    public void run() {
                                        bridge.getWebView().evaluateJavascript("if (window.onUnityAdError) { window.onUnityAdError('" + message + "'); }", null);
                                    }
                                });
                                loadAd();
                            }

                            @Override
                            public void onUnityAdsShowStart(String placementId) {}

                            @Override
                            public void onUnityAdsShowClick(String placementId) {}
                        });
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }

        @JavascriptInterface
        public boolean isAdReady(String placement) {
            return true;
        }
    }
}
"""
    with open(main_activity_path, "w", encoding="utf-8") as f:
        f.write(main_activity_code)
    print("✓ MainActivity.java berhasil diperbarui dengan Unity Ads Native Bridge!")
else:
    print("! MainActivity.java belum ditemukan (akan dibuat saat npx cap add android).")
