import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Lock, Eye, EyeOff, Key, AlertCircle, LogOut, CheckCircle2 } from 'lucide-react';

export const MandatoryChangePasswordModal = () => {
  const { currentUser, changePassword, logout, showToast } = useClub();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Kiểm tra cờ bắt buộc đổi mật khẩu (hỗ trợ cả boolean, numeric 1 và string)
  const isFirstLoginRequired = Boolean(
    currentUser && (
      currentUser.isFirstLogin === true ||
      currentUser.isFirstLogin === 1 ||
      currentUser.isFirstLogin === '1' ||
      currentUser.isFirstLogin === 'true' ||
      currentUser.is_first_login === true ||
      currentUser.is_first_login === 1 ||
      currentUser.is_first_login === '1' ||
      currentUser.is_first_login === 'true'
    )
  );

  // Chỉ hiển thị khi đã đăng nhập và bắt buộc phải đổi mật khẩu
  if (!currentUser || !isFirstLoginRequired) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ Mật khẩu mới và Xác nhận mật khẩu!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có độ dài tối thiểu 6 ký tự!');
      return;
    }

    const mCode = String(currentUser.memberCode || currentUser.username || '').toLowerCase();
    if (newPassword.toLowerCase() === mCode) {
      setError('Mật khẩu mới không được trùng với Mã Thành Viên!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword('', newPassword);
      if (res) {
        if (showToast) showToast('🎉 Đổi mật khẩu cá nhân thành công! Bạn có thể sử dụng VMC Portal ngay bây giờ.', 'success');
      } else {
        setError('Không thể cập nhật mật khẩu vào CSDL máy chủ! Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-[var(--text-primary)]">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Key className="w-8 h-8 animate-pulse" />
          </div>
          <span className="px-3 py-1 rounded-full text-3xs font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 inline-block mb-2">
            Bảo Mật Bắt Buộc
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Đổi Mật Khẩu Khởi Tạo
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
            Tài khoản của bạn đang dùng mật khẩu tạm thời (đăng nhập lần đầu hoặc vừa khôi phục sau khi quên mật khẩu). Để bảo vệ an toàn thông tin cá nhân, bạn <strong>bắt buộc phải đổi sang mật khẩu riêng tư mới</strong> ngay sau khi đăng nhập.
          </p>
        </div>

        {/* Member Info Card */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-xs mb-5 flex items-center justify-between">
          <div>
            <span className="text-3xs text-[var(--text-muted)] uppercase tracking-wider block">Thành viên:</span>
            <span className="font-bold text-[var(--text-primary)] text-sm">{currentUser.name}</span>
          </div>
          <div className="text-right">
            <span className="text-3xs text-[var(--text-muted)] uppercase tracking-wider block">Mã TV:</span>
            <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{currentUser.memberCode || currentUser.username}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs flex items-center gap-2 mb-4 animate-slide-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
              Mật Khẩu Mới (Tối thiểu 6 ký tự) *
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-cyan-500 dark:text-cyan-400 pointer-events-none" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="ds-input w-full !pl-10 !pr-10 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-2xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
              Xác Nhận Mật Khẩu Mới *
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-cyan-500 dark:text-cyan-400 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="ds-input w-full !pl-10 !pr-10 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Đang lưu mật khẩu...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác Nhận Đổi Mật Khẩu & Bắt Đầu Sử Dụng</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[var(--border-default)] text-center">
          <button
            type="button"
            onClick={logout}
            className="text-xs text-[var(--text-muted)] hover:text-rose-500 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Thoát và đăng nhập lại bằng tài khoản khác</span>
          </button>
        </div>

      </div>
    </div>
  );
};
