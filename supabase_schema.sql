-- =========================================================================
-- ASTROCADE: SUPABASE SCHEMA UNTUK SISTEM POIN, IKLAN & PENUKARAN SALDO DANA
-- Salin dan jalankan seluruh skrip SQL ini di SQL Editor di dashboard Supabase Anda.
-- =========================================================================

-- 1. Tabel Profil Pengguna (User Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  username TEXT NOT NULL,
  points BIGINT NOT NULL DEFAULT 0,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_guest BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Permintaan Penarikan Saldo DANA (Withdrawal Requests)
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  dana_phone TEXT NOT NULL,
  dana_name TEXT NOT NULL,
  points_spent BIGINT NOT NULL,
  amount_rp BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Riwayat Poin (Point History)
CREATE TABLE IF NOT EXISTS public.point_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gameplay', 'ad_reward', 'withdrawal', 'bonus')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabel Pengaturan Reward (Reward Configuration)
CREATE TABLE IF NOT EXISTS public.system_configs (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Nilai Konfigurasi Awal
INSERT INTO public.system_configs (key, value)
VALUES (
  'reward_config',
  '{"intervalSeconds": 120, "adRewardPoints": 75, "playRewardPoints": 15, "pointsToRpRatio": 1, "minWithdrawalRp": 2000}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Aktifkan Row Level Security (RLS) dengan kebijakan publik untuk kemudahan integrasi Web & Mobile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses:
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public Read Withdrawals" ON public.withdrawals FOR SELECT USING (true);
CREATE POLICY "Public Insert Withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Withdrawals" ON public.withdrawals FOR UPDATE USING (true);

CREATE POLICY "Public Read Point History" ON public.point_history FOR SELECT USING (true);
CREATE POLICY "Public Insert Point History" ON public.point_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read System Configs" ON public.system_configs FOR SELECT USING (true);
CREATE POLICY "Public Update System Configs" ON public.system_configs FOR UPDATE USING (true);
