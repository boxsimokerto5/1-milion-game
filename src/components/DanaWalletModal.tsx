import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  ArrowDownCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Smartphone,
  User,
  X,
  History,
  Sparkles,
  Info,
} from 'lucide-react';
import { PointService } from '../lib/pointService';
import { UserProfile, WithdrawalRequest } from '../types';

interface DanaWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUserUpdated: (updatedUser: UserProfile) => void;
}

const PRESET_AMOUNTS = [
  { rp: 2000, points: 2000, label: 'Rp 2.000' },
  { rp: 5000, points: 5000, label: 'Rp 5.000' },
  { rp: 10000, points: 10000, label: 'Rp 10.000' },
  { rp: 25000, points: 25000, label: 'Rp 25.000' },
  { rp: 50000, points: 50000, label: 'Rp 50.000' },
];

export const DanaWalletModal: React.FC<DanaWalletModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');
  const [selectedPoints, setSelectedPoints] = useState<number>(2000);
  const [danaPhone, setDanaPhone] = useState('');
  const [danaName, setDanaName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [historyList, setHistoryList] = useState<WithdrawalRequest[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const config = PointService.getRewardConfig();
  const estimatedRp = Math.floor(user.points * config.pointsToRpRatio);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const list = await PointService.getUserWithdrawals(user.id);
      setHistoryList(list);
    } catch {
      // ignore
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      loadHistory();
    }
  }, [isOpen, loadHistory]);

  if (!isOpen) return null;

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const result = await PointService.requestWithdrawal(danaPhone, danaName, selectedPoints);

      if (result.success && result.user) {
        setFeedback({ type: 'success', message: result.message });
        onUserUpdated(result.user);
        loadHistory();
      } else {
        setFeedback({ type: 'error', message: result.message });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Terjadi kesalahan sistem. Silakan coba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="dana-wallet-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 backdrop-blur-[3px] p-3 sm:p-4 select-none"
      >
        <motion.div
          id="dana-wallet-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white/85 hover:bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[min(92vh,620px)] my-auto transition-colors duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sky-50/70 via-white/80 to-blue-50/50 border-b border-slate-200/60 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-sm shadow-sky-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">Dompet Saldo DANA</h2>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#108EE9] text-white uppercase tracking-wider">
                    DANA
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Tukar Poin Game Jadi Saldo Nyata</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Balance Banner */}
          <div className="px-4 py-3 bg-gradient-to-br from-sky-50/60 via-slate-50/50 to-blue-50/40 border-b border-slate-200/70 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-500">Saldo Poin Anda:</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-amber-600 font-mono tracking-tight">
                    {user.points.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-amber-700 font-bold uppercase">Poin</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-medium text-slate-500">Estimasi Saldo:</span>
                <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">
                  Rp {estimatedRp.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-sky-800 bg-sky-100/70 px-2.5 py-1 rounded-lg border border-sky-200/80">
              <Info className="w-3.5 h-3.5 flex-shrink-0 text-sky-600" />
              <span>1 Poin = Rp 1. Main game & tonton iklan per 2 menit untuk tambah saldo!</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-100/80 flex-shrink-0">
            <button
              id="tab-btn-withdraw"
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'withdraw'
                  ? 'bg-white text-[#108EE9] border-b-2 border-[#108EE9] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4 text-[#108EE9]" />
              Tarik Saldo DANA
            </button>
            <button
              id="tab-btn-history"
              onClick={() => {
                setActiveTab('history');
                loadHistory();
              }}
              className={`flex-1 py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'history'
                  ? 'bg-white text-[#108EE9] border-b-2 border-[#108EE9] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
              }`}
            >
              <History className="w-4 h-4 text-[#108EE9]" />
              Riwayat Penarikan
              {historyList.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">
                  {historyList.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content (Scrollable if viewport is tiny) */}
          <div className="p-4 overflow-y-auto flex-1">
            {activeTab === 'withdraw' ? (
              <form onSubmit={handleSubmitWithdrawal} className="space-y-3">
                {/* Preset Denominations */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Pilih Nominal Penarikan:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((preset) => {
                      const isAffordable = user.points >= preset.points;
                      const isSelected = selectedPoints === preset.points;
                      return (
                        <button
                          key={preset.points}
                          type="button"
                          onClick={() => setSelectedPoints(preset.points)}
                          className={`p-2 rounded-xl border text-left transition flex flex-col justify-between ${
                            isSelected
                              ? 'bg-sky-50 border-[#108EE9] text-[#108EE9] ring-2 ring-sky-200 shadow-sm'
                              : isAffordable
                              ? 'bg-white border-slate-200 text-slate-800 hover:border-sky-300 hover:bg-sky-50/30'
                              : 'bg-slate-50 border-slate-200/60 text-slate-400 opacity-60'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-bold">{preset.label}</span>
                          <span className="text-[10px] font-semibold text-amber-600 font-mono mt-0.5">
                            {preset.points.toLocaleString('id-ID')} Poin
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-2.5 pt-0.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nomor Akun DANA (Format: 08xxxxxxxxxx)
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        id="input-dana-phone"
                        type="tel"
                        required
                        placeholder="Contoh: 081234567890"
                        value={danaPhone}
                        onChange={(e) => setDanaPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-[#108EE9] focus:ring-2 focus:ring-sky-100 font-mono transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Pemilik Akun DANA
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        id="input-dana-name"
                        type="text"
                        required
                        placeholder="Nama lengkap sesuai aplikasi DANA"
                        value={danaName}
                        onChange={(e) => setDanaName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-[#108EE9] focus:ring-2 focus:ring-sky-100 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Alert feedback */}
                {feedback && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                      feedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {feedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                    )}
                    <span>{feedback.message}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  id="btn-submit-withdrawal"
                  type="submit"
                  disabled={isSubmitting || user.points < selectedPoints}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition ${
                    user.points < selectedPoints
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      : 'bg-[#108EE9] hover:bg-[#0c7ac9] text-white shadow-sky-500/20 active:scale-[0.99]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {isSubmitting
                    ? 'Memproses Permintaan...'
                    : user.points < selectedPoints
                    ? 'Poin Tidak Mencukupi'
                    : `Tarik Saldo DANA (${selectedPoints.toLocaleString('id-ID')} Poin)`}
                </button>
              </form>
            ) : (
              /* History Tab */
              <div className="space-y-2.5">
                {isLoadingHistory ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Memuat riwayat penarikan...
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                    <History className="w-8 h-8 text-slate-400" />
                    <span className="font-semibold text-slate-700">Belum ada riwayat penarikan saldo DANA.</span>
                    <span className="text-[11px] text-slate-500">
                      Tarik poin pertama Anda pada tab "Tarik Saldo DANA".
                    </span>
                  </div>
                ) : (
                  historyList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/60 border border-slate-200 flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 font-mono">
                            Rp {item.amountRp.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[11px] text-amber-600 font-semibold font-mono">
                            ({item.pointsSpent.toLocaleString('id-ID')} Poin)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          DANA: <strong className="font-mono">{item.danaPhone}</strong> ({item.danaName})
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="text-right">
                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-700" />
                            Menunggu
                          </span>
                        )}
                        {item.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            Ditransfer
                          </span>
                        )}
                        {item.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-700" />
                            Ditolak
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
