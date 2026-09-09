import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  ListOrdered,
  Save,
  DollarSign,
  AlertCircle,
  Database,
  X,
  RefreshCw,
  Copy,
  Check,
  PlusCircle,
  Inbox,
  Trash2,
} from 'lucide-react';
import { PointService } from '../lib/pointService';
import { WithdrawalRequest, RewardConfig } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutAdmin: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'settings' | 'sql'>('withdrawals');
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<RewardConfig>(PointService.getRewardConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await PointService.getAllWithdrawals();
      setWithdrawals(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setConfig(PointService.getRewardConfig());
    }
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    await PointService.updateWithdrawalStatus(id, status);
    loadData();
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    await PointService.saveRewardConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length;
  const approvedCount = withdrawals.filter((w) => w.status === 'approved').length;
  const totalApprovedRp = withdrawals
    .filter((w) => w.status === 'approved')
    .reduce((sum, item) => sum + item.amountRp, 0);

  const handleCopySql = () => {
    const sqlText = `-- Salin skrip SQL ini ke SQL Editor di Supabase:
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, email TEXT, username TEXT NOT NULL, points BIGINT NOT NULL DEFAULT 0,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE, is_guest BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL, user_name TEXT NOT NULL,
  dana_phone TEXT NOT NULL, dana_name TEXT NOT NULL, points_spent BIGINT NOT NULL, amount_rp BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', admin_note TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.point_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL, amount BIGINT NOT NULL,
  type TEXT NOT NULL, description TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
);`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <AnimatePresence>
      <div
        id="admin-dashboard-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 backdrop-blur-[3px] p-4 select-none"
      >
        <motion.div
          id="admin-dashboard-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white/85 hover:bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/70 border-b border-slate-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800 tracking-wide">Panel Admin Game Saldo DANA</h2>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-white">
                    ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Kelola Saldo DANA, Iklan, dan Data Supabase</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onLogoutAdmin}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition border border-slate-200"
              >
                Keluar Admin
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 px-5 py-3 bg-slate-50/60 border-b border-slate-200 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500">Menunggu Proses:</span>
              <div className="text-base font-bold text-amber-600 font-mono">{pendingCount} Permintaan</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500">Total Berhasil Ditransfer:</span>
              <div className="text-base font-bold text-emerald-600 font-mono">{approvedCount} Selesai</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500">Total Nilai Penarikan:</span>
              <div className="text-base font-bold text-[#108EE9] font-mono">
                Rp {totalApprovedRp.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs">
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`flex-1 py-2.5 px-4 font-bold flex items-center justify-center gap-2 border-b-2 transition ${
                activeTab === 'withdrawals'
                  ? 'border-amber-500 text-amber-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              Permintaan Saldo DANA ({withdrawals.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2.5 px-4 font-bold flex items-center justify-center gap-2 border-b-2 transition ${
                activeTab === 'settings'
                  ? 'border-amber-500 text-amber-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              Pengaturan Poin & Iklan
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`flex-1 py-2.5 px-4 font-bold flex items-center justify-center gap-2 border-b-2 transition ${
                activeTab === 'sql'
                  ? 'border-amber-500 text-amber-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              Supabase SQL
            </button>
          </div>

          {/* Content Area */}
          <div className="p-5 flex-1 overflow-y-auto">
            {activeTab === 'withdrawals' && (
              <div className="space-y-4">
                {/* Filters and Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        filter === 'all'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      onClick={() => setFilter('pending')}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        filter === 'pending'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Menunggu ({pendingCount})
                    </button>
                    <button
                      onClick={() => setFilter('approved')}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        filter === 'approved'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Disetujui ({approvedCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        PointService.seedSampleWithdrawals();
                        loadData();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 text-[#108EE9] hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1 transition"
                      title="Tambahkan 3 data contoh penarikan untuk simulasi"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Demo Penarikan</span>
                    </button>

                    {withdrawals.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm('Hapus semua riwayat penarikan (reset)?')) {
                            PointService.clearWithdrawals();
                            loadData();
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Bersihkan Data"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={loadData}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Segarkan Data"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* List of Withdrawals */}
                {loading ? (
                  <div className="py-12 text-center text-xs text-slate-400">Memuat data penarikan...</div>
                ) : filteredWithdrawals.length === 0 ? (
                  <div className="py-10 px-4 text-center rounded-2xl bg-white/70 border border-slate-200 max-w-md mx-auto my-3 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Belum Ada Permintaan Penarikan
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Daftar masih kosong karena pemain belum ada yang mengajukan pencairan saldo DANA. Klik tombol di bawah untuk langsung menambahkan data simulasi uji coba verifikasi.
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          PointService.seedSampleWithdrawals();
                          loadData();
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#108EE9] hover:bg-[#0c7ac9] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Muat Data Contoh Penarikan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredWithdrawals.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">
                              Rp {item.amountRp.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[11px] text-amber-700 font-mono font-bold">
                              ({item.pointsSpent.toLocaleString('id-ID')} Poin)
                            </span>
                            <span className="text-slate-500">• {item.userName}</span>
                          </div>

                          <div className="text-[11px] text-slate-600 mt-1 flex flex-wrap gap-x-3">
                            <span>
                              No DANA: <strong className="text-[#108EE9] font-mono">{item.danaPhone}</strong>
                            </span>
                            <span>
                              Nama Akun: <strong className="text-slate-800">{item.danaName}</strong>
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 mt-1">
                            Diajukan: {new Date(item.createdAt).toLocaleString('id-ID')}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {item.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleStatusChange(item.id, 'approved')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Setujui / Transfer
                              </button>
                              <button
                                onClick={() => handleStatusChange(item.id, 'rejected')}
                                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs flex items-center gap-1 transition"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Tolak
                              </button>
                            </>
                          ) : item.status === 'approved' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Sudah Ditransfer
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              Ditolak (Poin Dikembalikan)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <form onSubmit={handleSaveConfig} className="space-y-4 max-w-lg mx-auto text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Durasi Jeda Iklan Otomatis (Detik):
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="600"
                    value={config.intervalSeconds}
                    onChange={(e) => setConfig({ ...config, intervalSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Default: 120 detik (2 menit). Timer loading memutar akan muncul sesuai durasi ini.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bonus Poin Menonton Iklan:
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={config.adRewardPoints}
                    onChange={(e) => setConfig({ ...config, adRewardPoints: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Poin yang didapatkan pemain setiap kali menonton video iklan hingga selesai.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bonus Poin Bermain Game (per 1 Menit):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={config.playRewardPoints}
                    onChange={(e) => setConfig({ ...config, playRewardPoints: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Poin yang otomatis bertambah saat pemain aktif bermain game di layar.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Minimal Penarikan Saldo DANA (Rupiah):
                  </label>
                  <input
                    type="number"
                    min="500"
                    max="50000"
                    step="500"
                    value={config.minWithdrawalRp}
                    onChange={(e) => setConfig({ ...config, minWithdrawalRp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Unity Ads Integration Config */}
                <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sky-900 flex items-center gap-1.5">
                        <span>🎮</span> Konfigurasi Unity Ads Android
                      </h4>
                      <p className="text-[10px] text-sky-700">Terhubung ke akun Unity Monetization Game ID</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-600 text-white">
                      Aktif
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Unity Game ID (Android):
                    </label>
                    <input
                      type="text"
                      placeholder="800370501"
                      value={config.unityGameId || ''}
                      onChange={(e) => setConfig({ ...config, unityGameId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#108EE9]"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      ID Game Unity resmi Anda dari dashboard Unity Monetization.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Placement ID Iklan Berhadiah (Rewarded):
                    </label>
                    <input
                      type="text"
                      placeholder="Rewarded_Android"
                      value={config.unityPlacementId || ''}
                      onChange={(e) => setConfig({ ...config, unityPlacementId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#108EE9]"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Default: <code className="bg-sky-100 px-1 py-0.5 rounded">Rewarded_Android</code>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="font-semibold text-slate-700">Mode Uji Coba (Test Mode):</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.unityTestMode || false}
                        onChange={(e) => setConfig({ ...config, unityTestMode: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#108EE9]"></div>
                    </label>
                  </div>
                </div>

                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pengaturan berhasil disimpan!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan Pengaturan
                </button>
              </form>
            )}

            {activeTab === 'sql' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-slate-700 font-medium">
                    Skrip SQL Schema Supabase (Untuk Penyimpanan Cloud Permanen):
                  </p>
                  <button
                    onClick={handleCopySql}
                    className="px-3 py-1 rounded-lg bg-[#108EE9] hover:bg-[#0c7ac9] text-white font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSql ? 'Tersalin!' : 'Salin SQL'}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-60">
                  <pre>{`-- File lengkap ada di /supabase_schema.sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  username TEXT NOT NULL,
  points BIGINT NOT NULL DEFAULT 0,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_guest BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  dana_phone TEXT NOT NULL,
  dana_name TEXT NOT NULL,
  points_spent BIGINT NOT NULL,
  amount_rp BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
                </div>
                <p className="text-[11px] text-slate-500">
                  Buka dashboard Supabase Anda di <strong className="text-emerald-600">supabase.com</strong> &gt; pilih project Anda &gt; menu <strong className="text-emerald-600">SQL Editor</strong> &gt; New query &gt; tempelkan skrip di atas dan klik <strong>Run</strong>.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
