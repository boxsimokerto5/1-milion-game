import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onemilionsgame.astrocade',
  appName: 'Game Saldo DANA',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    backgroundColor: '#090d16',
    allowMixedContent: true,
    captureInput: true,
  },
};

export default config;
