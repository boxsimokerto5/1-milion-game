import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogIn,
  UserPlus,
  Shield,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  Mail,
  User,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PointService } from '../lib/pointService';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserLoggedIn: (user: UserProfile) => void;
  onOpenAdmin?: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserLoggedIn,
  onOpenAdmin,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [identifier, setIdentifier] = useState(''); // Username or email for login
  const [email, setEmail] = useState(''); // Email for registration
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync mode when modal opens with a specific initialMode
  React.useEffect(() => {
    if (isOpen && initialMode) {
      setMode(initialMode);
      setMessage(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      // 1. REGISTRATION MODE
      if (mode === 'register') {
        const cleanUsername = username.trim();

        // Block registration using the reserved administrator username
        if (cleanUsername.toLowerCase() === 'jenglot') {
          setMessage({
            type: 'error',
            text: "Username 'jenglot' adalah akun Administrator khusus. Silakan masuk langsung melalui tab 'Masuk'.",
          });
          setLoading(false);
          return;
        }

        // Supabase Auth if available
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { username: cleanUsername || email.split('@')[0] },
            },
          });

          if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
            return;
          }

          if (data.user) {
            const newUser: UserProfile = {
              id: data.user.id,
              email: data.user.email || email,
              username: cleanUsername || email.split('@')[0],
              points: currentUser.points, // keep points from guest
              isAdmin: false,
              isGuest: false,
              createdAt: new Date().toISOString(),
            };
            PointService.saveUserLocal(newUser);
            await PointService.syncUserToCloud(newUser);
            onUserLoggedIn(newUser);
            setMessage({ type: 'success', text: 'Pendaftaran berhasil! Akun Anda aktif.' });
            setTimeout(() => onClose(), 1000);
            return;
          }
        }

        // Fallback local registration
        const registeredUser: UserProfile = {
          id: `user_${Date.now()}`,
          email,
          username: cleanUsername || email.split('@')[0],
          points: currentUser.points,
          isAdmin: false,
          isGuest: false,
          createdAt: new Date().toISOString(),
        };
        PointService.saveUserLocal(registeredUser);
        onUserLoggedIn(registeredUser);
        setMessage({ type: 'success', text: 'Akun Anda berhasil disimpan!' });
        setTimeout(() => onClose(), 1000);
        return;
      }

      // 2. LOGIN MODE
      const cleanId = identifier.trim();
      const cleanIdLower = cleanId.toLowerCase();

      // ADMINISTRATOR LOGIN VIA PLAYER FORM:
      // Username: 'jenglot' and Password: 'Woyowoyo12@'
      if (
        (cleanIdLower === 'jenglot' || cleanIdLower === 'jenglot@admin.com') &&
        password === 'Woyowoyo12@'
      ) {
        const adminUser: UserProfile = {
          id: 'admin_jenglot',
          username: 'jenglot',
          email: 'jenglot@admin.com',
          points: currentUser.points,
          isAdmin: true,
          isGuest: false,
          createdAt: currentUser.createdAt || new Date().toISOString(),
        };
        PointService.saveUserLocal(adminUser);
        onUserLoggedIn(adminUser);
        setMessage({
          type: 'success',
          text: 'Selamat datang, Administrator jenglot! Membuka Panel Admin...',
        });
        setTimeout(() => {
          onClose();
          onOpenAdmin?.();
        }, 700);
        return;
      }

      // If user typed 'jenglot' but wrong password
      if (cleanIdLower === 'jenglot' || cleanIdLower === 'jenglot@admin.com') {
        setMessage({
          type: 'error',
          text: 'Kata sandi akun Administrator jenglot salah!',
        });
        setLoading(false);
        return;
      }

      // Regular player login with Supabase
      if (isSupabaseConfigured && supabase) {
        const loginEmail = cleanId.includes('@') ? cleanId : `${cleanId}@player.local`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        if (!error && data.user) {
          const loggedUser: UserProfile = {
            id: data.user.id,
            email: data.user.email || loginEmail,
            username: data.user.user_metadata?.username || cleanId.split('@')[0],
            points: currentUser.points,
            isAdmin: false,
            isGuest: false,
            createdAt: data.user.created_at,
          };
          PointService.saveUserLocal(loggedUser);
          onUserLoggedIn(loggedUser);
          setMessage({ type: 'success', text: 'Berhasil masuk ke akun Anda!' });
          setTimeout(() => onClose(), 1000);
          return;
        }
      }

      // Fallback local player login
      const loggedUser: UserProfile = {
        ...currentUser,
        id: `player_${Date.now()}`,
        email: cleanId.includes('@') ? cleanId : `${cleanId}@pemain.game`,
        username: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
        isAdmin: false,
        isGuest: false,
      };
      PointService.saveUserLocal(loggedUser);
      onUserLoggedIn(loggedUser);
      setMessage({ type: 'success', text: 'Berhasil masuk ke akun pemain!' });
      setTimeout(() => onClose(), 1000);
    } catch {
      setMessage({ type: 'error', text: 'Gagal memproses permintaan autentikasi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="auth-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 backdrop-blur-[3px] p-4 select-none"
      >
        <motion.div
          id="auth-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white/80 hover:bg-white/90 backdrop-blur-md border border-white/60 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-50/70 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#108EE9] border border-sky-100 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                  {mode === 'login' ? 'Masuk Akun Pemain' : 'Daftar Akun Baru'}
                </h2>
                <p className="text-[10px] text-slate-500">Game Saldo DANA</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Tabs (Only 2 Tabs: Masuk and Daftar) */}
          <div className="flex border-b border-slate-200/60 bg-slate-50/50 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setMessage(null);
              }}
              className={`flex-1 py-2.5 font-bold text-center border-b-2 transition cursor-pointer ${
                mode === 'login'
                  ? 'border-[#108EE9] text-[#108EE9] bg-white/80'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setMessage(null);
              }}
              className={`flex-1 py-2.5 font-bold text-center border-b-2 transition cursor-pointer ${
                mode === 'register'
                  ? 'border-[#108EE9] text-[#108EE9] bg-white/80'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar
            </button>
          </div>

          {/* New User Welcome Notice */}
          {currentUser.isGuest && (
            <div className="px-4 py-2.5 bg-sky-50/80 border-b border-sky-100 flex items-center gap-2 text-xs text-sky-900">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 animate-bounce" />
              <p className="text-[11px] leading-tight">
                {mode === 'register'
                  ? 'Pengguna Baru: Buat akun sekarang untuk mengamankan bonus 100 Poin dan penarikan DANA Anda!'
                  : 'Sudah punya akun? Masukkan username atau email Anda untuk melanjutkan.'}
              </p>
            </div>
          )}

          <div className="p-5">
            {/* If user is already logged in, show their active profile summary */}
            {!currentUser.isGuest && (
              <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 mb-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                        currentUser.isAdmin
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-sky-100 text-[#108EE9] border border-sky-300'
                      }`}
                    >
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">{currentUser.username}</span>
                        {currentUser.isAdmin && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-white flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Saldo Poin</span>
                    <p className="font-bold text-amber-600 font-mono">
                      {currentUser.points.toLocaleString('id-ID')} Poin
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 pt-2.5 border-t border-slate-200/60">
                  {currentUser.isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdmin?.();
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Buka Panel Admin
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const guest = PointService.logout();
                      onUserLoggedIn(guest);
                      setMessage({ type: 'success', text: 'Berhasil keluar akun.' });
                    }}
                    className="py-1.5 px-3 rounded-lg border border-slate-300 text-slate-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar / Ganti Akun
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {mode === 'register' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Panggilan / Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: GamerPro99"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/70 border border-slate-300 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-[#108EE9]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/70 border border-slate-300 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-[#108EE9]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="Minimal 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/70 border border-slate-300 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-[#108EE9]"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username atau Email
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Masukkan username atau email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/70 border border-slate-300 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-[#108EE9]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="Masukkan kata sandi"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/70 border border-slate-300 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-[#108EE9]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Message alert */}
              {message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    message.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer bg-[#108EE9] hover:bg-[#0c7ac9] text-white shadow-sky-500/20"
              >
                {loading ? (
                  <span>Memproses...</span>
                ) : mode === 'register' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Buat Akun & Simpan Poin
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Masuk ke Game
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline transition cursor-pointer font-medium"
                >
                  {currentUser.isGuest
                    ? 'Lewati & Coba Main Dulu sebagai Tamu'
                    : 'Tutup & Kembali ke Game'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
