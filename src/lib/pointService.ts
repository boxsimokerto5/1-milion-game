import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, PointTransaction, WithdrawalRequest, RewardConfig } from '../types';

const STORAGE_KEY_USER = 'astrocade_user_profile';
const STORAGE_KEY_CONFIG = 'astrocade_reward_config';
const STORAGE_KEY_HISTORY = 'astrocade_point_history';
const STORAGE_KEY_WITHDRAWALS = 'astrocade_withdrawals';

export const DEFAULT_CONFIG: RewardConfig = {
  intervalSeconds: 120, // 2 minutes
  adRewardPoints: 75,
  playRewardPoints: 15,
  pointsToRpRatio: 1, // 1 point = Rp 1
  minWithdrawalRp: 2000,
  unityGameId: '800370501',
  unityPlacementId: 'Rewarded_Android',
  unityTestMode: false,
  allowSimulatedAds: true, // Diaktifkan untuk Web Browser Preview agar pengujian reward berjalan lancar
  bottomSpacingPx: 56, // Standar tinggi navigation bar HP Android (56px) agar menu Home & My Arcade tidak tertimpa tombol HP
};

// Generate random guest ID
function createGuestUser(): UserProfile {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return {
    id: `guest_${Date.now()}_${randomSuffix}`,
    email: `player${randomSuffix}@guest.astrocade`,
    username: `Player #${randomSuffix}`,
    points: 100, // Welcome bonus points!
    isAdmin: false,
    isGuest: true,
    createdAt: new Date().toISOString(),
  };
}

export class PointService {
  // Load reward config
  static getRewardConfig(): RewardConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  }

  // Save reward config (Admin)
  static async saveRewardConfig(config: RewardConfig): Promise<boolean> {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
      if (isSupabaseConfigured && supabase) {
        await supabase.from('system_configs').upsert({
          key: 'reward_config',
          value: config,
          updated_at: new Date().toISOString(),
        });
      }
      return true;
    } catch (err) {
      console.warn('Error saving reward config:', err);
      return false;
    }
  }

  // Get current active user
  static getCurrentUser(): UserProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    const newGuest = createGuestUser();
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newGuest));
    return newGuest;
  }

  // Save user locally
  static saveUserLocal(user: UserProfile) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }

  // Logout user and reset to fresh guest session
  static logout(): UserProfile {
    const newGuest = createGuestUser();
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newGuest));
    return newGuest;
  }

  // Sync user with Supabase if configured
  static async syncUserToCloud(user: UserProfile) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        username: user.username,
        points: user.points,
        is_admin: user.isAdmin,
        is_guest: user.isGuest,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not sync user to Supabase:', err);
    }
  }

  // Add points to current user
  static async addPoints(
    amount: number,
    type: 'gameplay' | 'ad_reward' | 'bonus',
    description: string
  ): Promise<UserProfile> {
    const user = this.getCurrentUser();
    user.points += amount;
    this.saveUserLocal(user);

    // Record transaction
    const tx: PointTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      amount,
      type,
      description,
      createdAt: new Date().toISOString(),
    };

    // Save history locally
    try {
      const historyRaw = localStorage.getItem(STORAGE_KEY_HISTORY);
      const history: PointTransaction[] = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift(tx);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 100)));
    } catch {
      // ignore
    }

    // Try cloud sync
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('point_history').insert({
          user_id: user.id,
          amount,
          type,
          description,
        });
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          username: user.username,
          points: user.points,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase addPoints sync error:', err);
      }
    }

    return user;
  }

  // Submit DANA withdrawal request
  static async requestWithdrawal(
    danaPhone: string,
    danaName: string,
    pointsToWithdraw: number
  ): Promise<{ success: boolean; message: string; withdrawal?: WithdrawalRequest; user?: UserProfile }> {
    const user = this.getCurrentUser();
    const config = this.getRewardConfig();
    const amountRp = Math.floor(pointsToWithdraw * config.pointsToRpRatio);

    if (amountRp < config.minWithdrawalRp) {
      return {
        success: false,
        message: `Minimal penarikan adalah Rp ${config.minWithdrawalRp.toLocaleString('id-ID')}.`,
      };
    }

    if (user.points < pointsToWithdraw) {
      return {
        success: false,
        message: `Poin Anda tidak mencukupi (Saldo: ${user.points.toLocaleString('id-ID')} Poin).`,
      };
    }

    if (!danaPhone || !/^08\d{8,12}$/.test(danaPhone.replace(/\s+/g, ''))) {
      return {
        success: false,
        message: 'Nomor DANA tidak valid. Gunakan format 08xxxxxxxxxx.',
      };
    }

    if (!danaName.trim()) {
      return {
        success: false,
        message: 'Nama pemilik akun DANA wajib diisi.',
      };
    }

    // Deduct points
    user.points -= pointsToWithdraw;
    this.saveUserLocal(user);

    const withdrawal: WithdrawalRequest = {
      id: `wd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.username,
      danaPhone: danaPhone.trim(),
      danaName: danaName.trim(),
      pointsSpent: pointsToWithdraw,
      amountRp,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Store withdrawal locally
    try {
      const allWdRaw = localStorage.getItem(STORAGE_KEY_WITHDRAWALS);
      const allWd: WithdrawalRequest[] = allWdRaw ? JSON.parse(allWdRaw) : [];
      allWd.unshift(withdrawal);
      localStorage.setItem(STORAGE_KEY_WITHDRAWALS, JSON.stringify(allWd));
    } catch {
      // ignore
    }

    // Record point deduction history
    const tx: PointTransaction = {
      id: `tx_wd_${Date.now()}`,
      userId: user.id,
      amount: -pointsToWithdraw,
      type: 'withdrawal',
      description: `Tukar saldo DANA Rp ${amountRp.toLocaleString('id-ID')} (${danaPhone})`,
      createdAt: new Date().toISOString(),
    };

    try {
      const historyRaw = localStorage.getItem(STORAGE_KEY_HISTORY);
      const history: PointTransaction[] = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift(tx);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 100)));
    } catch {
      // ignore
    }

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('withdrawals').insert({
          user_id: withdrawal.userId,
          user_name: withdrawal.userName,
          dana_phone: withdrawal.danaPhone,
          dana_name: withdrawal.danaName,
          points_spent: withdrawal.pointsSpent,
          amount_rp: withdrawal.amountRp,
          status: 'pending',
        });

        await supabase.from('profiles').upsert({
          id: user.id,
          points: user.points,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase withdrawal sync error:', err);
      }
    }

    return {
      success: true,
      message: `Permintaan penarikan Rp ${amountRp.toLocaleString('id-ID')} berhasil diajukan! Menunggu persetujuan Admin.`,
      withdrawal,
      user,
    };
  }

  // Get user withdrawals
  static async getUserWithdrawals(userId: string): Promise<WithdrawalRequest[]> {
    // Try Supabase first
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            userId: item.user_id,
            userName: item.user_name,
            danaPhone: item.dana_phone,
            danaName: item.dana_name,
            pointsSpent: Number(item.points_spent),
            amountRp: Number(item.amount_rp),
            status: item.status as any,
            adminNote: item.admin_note,
            createdAt: item.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch withdrawals error:', err);
      }
    }

    // Fallback local
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WITHDRAWALS);
      if (raw) {
        const list: WithdrawalRequest[] = JSON.parse(raw);
        return list.filter((w) => w.userId === userId);
      }
    } catch {
      // ignore
    }

    return [];
  }

  // ADMIN: Get all withdrawals
  static async getAllWithdrawals(): Promise<WithdrawalRequest[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('withdrawals')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((item) => ({
            id: item.id,
            userId: item.user_id,
            userName: item.user_name,
            danaPhone: item.dana_phone,
            danaName: item.dana_name,
            pointsSpent: Number(item.points_spent),
            amountRp: Number(item.amount_rp),
            status: item.status as any,
            adminNote: item.admin_note,
            createdAt: item.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getAllWithdrawals error:', err);
      }
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY_WITHDRAWALS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // ADMIN: Update withdrawal status (Approve or Reject)
  static async updateWithdrawalStatus(
    id: string,
    status: 'approved' | 'rejected',
    note?: string
  ): Promise<boolean> {
    // Update local storage
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WITHDRAWALS);
      if (raw) {
        const list: WithdrawalRequest[] = JSON.parse(raw);
        const item = list.find((w) => w.id === id);
        if (item) {
          item.status = status;
          if (note) item.adminNote = note;
          item.updatedAt = new Date().toISOString();

          // If rejected, refund points to user
          if (status === 'rejected') {
            const currentUser = this.getCurrentUser();
            if (currentUser.id === item.userId) {
              currentUser.points += item.pointsSpent;
              this.saveUserLocal(currentUser);
            }
          }
          localStorage.setItem(STORAGE_KEY_WITHDRAWALS, JSON.stringify(list));
        }
      }
    } catch {
      // ignore
    }

    // Update Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('withdrawals')
          .update({
            status,
            admin_note: note || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase updateWithdrawalStatus error:', err);
      }
    }

    return true;
  }

  // ADMIN: Seed sample/demo withdrawal requests for testing verification
  static seedSampleWithdrawals(): WithdrawalRequest[] {
    const samples: WithdrawalRequest[] = [
      {
        id: `wd_demo_1_${Date.now()}`,
        userId: 'usr_demo_budi',
        userName: 'Budi Santoso',
        danaPhone: '081288997766',
        danaName: 'BUDI SANTOSO',
        pointsSpent: 5000,
        amountRp: 5000,
        status: 'pending',
        createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
      {
        id: `wd_demo_2_${Date.now()}`,
        userId: 'usr_demo_siti',
        userName: 'Siti Rahmawati',
        danaPhone: '085712345678',
        danaName: 'SITI RAHMAWATI',
        pointsSpent: 10000,
        amountRp: 10000,
        status: 'pending',
        createdAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
      },
      {
        id: `wd_demo_3_${Date.now()}`,
        userId: 'usr_demo_reza',
        userName: 'Reza Pratama',
        danaPhone: '082199881122',
        danaName: 'REZA PRATAMA',
        pointsSpent: 20000,
        amountRp: 20000,
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    try {
      const raw = localStorage.getItem(STORAGE_KEY_WITHDRAWALS);
      const existing: WithdrawalRequest[] = raw ? JSON.parse(raw) : [];
      const combined = [...samples, ...existing];
      localStorage.setItem(STORAGE_KEY_WITHDRAWALS, JSON.stringify(combined));
      return combined;
    } catch {
      return samples;
    }
  }

  // ADMIN: Clear all withdrawals (reset)
  static clearWithdrawals(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_WITHDRAWALS);
    } catch {
      // ignore
    }
  }
}
