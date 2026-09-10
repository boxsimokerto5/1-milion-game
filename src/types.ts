export interface GameConfig {
  title: string;
  url: string;
  gameId: string;
  developer: string;
  genre: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  points: number;
  isAdmin: boolean;
  isGuest: boolean;
  createdAt: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'gameplay' | 'ad_reward' | 'withdrawal' | 'bonus';
  description: string;
  createdAt: string;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  danaPhone: string;
  danaName: string;
  pointsSpent: number;
  amountRp: number;
  status: WithdrawalStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RewardConfig {
  intervalSeconds: number; // default 120 (2 minutes)
  adRewardPoints: number; // default 75 points
  playRewardPoints: number; // default 15 points per minute
  pointsToRpRatio: number; // default 1:1 (1 point = Rp 1)
  minWithdrawalRp: number; // default Rp 2000
  unityGameId?: string; // Unity Ads Game ID (e.g. 800370501)
  unityPlacementId?: string; // e.g. Rewarded_Android
  unityTestMode?: boolean; // Test mode toggle
  allowSimulatedAds?: boolean; // If false, fake simulated ads will never be shown
}
