import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff, Globe, Mail, Key, ArrowLeft, CheckCircle2, Sun, Moon } from 'lucide-react';
import { forgotPasswordAPI } from '../services/api';

export const LoginModal = ({ onExploreHome }) => {
  const { login, theme, toggleTheme, setActiveTab } = useClub();

  // Mode: 'login' | 'forgot'
  const [viewMode, setViewMode] = useState('login');

  // Login form state
  const [memberCodeInput, setMemberCodeInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password form state
  const [forgotMemberCode, setForgotMemberCode] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');
  const [forgotErrorMessage, setForgotErrorMessage] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!memberCodeInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Vui lòng nhập Mã Thành Viên và Mật khẩu!');
      return;
    }

    const result = await login(memberCodeInput.trim(), passwordInput.trim());
    if (!result?.success) {
      setErrorMessage(result?.message || 'Mã Thành Viên hoặc Mật khẩu không chính xác!');
    } else {
      setErrorMessage('');
      setActiveTab('dashboard');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotErrorMessage('');
    setForgotSuccessMessage('');

    if (!forgotMemberCode.trim() || !forgotEmail.trim()) {
      setForgotErrorMessage('Vui lòng nhập đầy đủ Mã Thành Viên và Địa chỉ Email!');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await forgotPasswordAPI(forgotMemberCode.trim(), forgotEmail.trim());
      if (res && res.success) {
        setForgotSuccessMessage(res.message || 'Mật khẩu mới đã được tạo và gửi thành công tới email của bạn!');
        setMemberCodeInput(forgotMemberCode.trim());
        setPasswordInput('');
      } else {
        setForgotErrorMessage(res?.message || 'Không thể khôi phục mật khẩu! Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      setForgotErrorMessage('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden font-sans">

      {/* Ambient Radial Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 dark:bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />

      {/* Main Card */}
      <div className="relative w-full max-w-md mx-auto ds-card p-8 sm:p-10 shadow-2xl">

        {/* Nút chuyển đổi giao diện Sáng / Tối */}
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-default)] transition-all cursor-pointer"
          title="Chuyển đổi giao diện Sáng / Tối"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
        </button>

        {/* Header: Logo + Title */}
        <div className="mb-7 flex flex-col items-center text-center gap-3.5">
          {/* VMC Brand Logo */}
          <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-blue-500/30">
            <img src="/vmc-logo.jpg" alt="VMC Logo" className="w-full h-full object-cover rounded-full bg-[var(--bg-input)]" />
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <h2 className="text-2xl font-bold tracking-wide uppercase text-[var(--text-primary)] leading-tight">
              {viewMode === 'login' ? 'CỔNG ĐĂNG NHẬP NỘI BỘ' : 'KHÔI PHỤC MẬT KHẨU'}
            </h2>
            <p className="text-2xs text-[var(--text-muted)] font-normal">
              {viewMode === 'login'
                ? 'CLB Truyền Thông Trường THPT Vĩnh Bảo (VMC Portal)' : ''}
            </p>
          </div>
        </div>

        {/* ================= VIEW 1: ĐĂNG NHẬP ================= */}
        {viewMode === 'login' && (
          <>
            {/* Error Alert */}
            {errorMessage && (
              <div className="ds-card p-3.5 border border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-semibold flex items-center gap-2 animate-slide-up mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Đăng Nhập */}
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
              {/* Mã Thành Viên */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">
                  Mã Thành Viên <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center w-full">
                  <User className="absolute left-4 z-10 w-5 h-5 text-cyan-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={memberCodeInput}
                    onChange={(e) => setMemberCodeInput(e.target.value)}
                    placeholder="NHẬP MÃ THÀNH VIÊN"
                    className="ds-input !pl-14 w-full placeholder:text-xs placeholder:tracking-wider placeholder:text-slate-500 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Mật Khẩu */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Mật Khẩu <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot');
                      setForgotMemberCode(memberCodeInput);
                      setErrorMessage('');
                      setForgotErrorMessage('');
                      setForgotSuccessMessage('');
                    }}
                    className="text-xs text-blue-500 hover:text-blue-600 dark:text-cyan-400 dark:hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative flex items-center w-full">
                  <Lock className="absolute left-4 z-10 w-4 h-4 text-cyan-500 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="ds-input !pl-12 !pr-10 w-full placeholder:text-xs placeholder:tracking-wider placeholder:text-slate-400 text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 z-20 flex items-center justify-center p-1.5 rounded-lg text-[var(--text-muted)] hover:text-blue-500 dark:hover:text-cyan-400 hover:bg-[var(--bg-tertiary)] focus:outline-none cursor-pointer transition-colors"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="ds-btn ds-btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer shadow-lg shadow-blue-500/20"
              >
                <span>Đăng Nhập</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        {/* ================= VIEW 2: QUÊN MẬT KHẨU ================= */}
        {viewMode === 'forgot' && (
          <div className="space-y-5 animate-fade-in">
            {/* Error Alert */}
            {forgotErrorMessage && (
              <div className="ds-card p-3.5 border border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-semibold flex items-center gap-2 animate-slide-up">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotErrorMessage}</span>
              </div>
            )}

            {/* Success Alert */}
            {forgotSuccessMessage ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs space-y-2 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Khôi phục thành công!</span>
                  </div>
                  <p>{forgotSuccessMessage}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setForgotSuccessMessage('');
                  }}
                  className="ds-btn ds-btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay Lại Đăng Nhập Ngay</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">

                {/* Mã Thành Viên */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">
                    Mã Thành Viên <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center w-full">
                    <User className="absolute left-4 z-10 w-5 h-5 text-cyan-500 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={forgotMemberCode}
                      onChange={(e) => setForgotMemberCode(e.target.value)}
                      placeholder="VD: VMC-1057..."
                      className="ds-input !pl-14 w-full placeholder:text-xs placeholder:tracking-wider placeholder:text-slate-400 text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">
                    Địa Chỉ Email Đã Đăng Ký <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center w-full">
                    <Mail className="absolute left-4 z-10 w-5 h-5 text-cyan-500 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="ds-input !pl-14 w-full placeholder:text-xs placeholder:tracking-wider placeholder:text-slate-400 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="ds-btn ds-btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm mt-1 cursor-pointer disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <span>Đang kiểm tra & gửi mail...</span>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Tạo Mật Khẩu Mới</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setForgotErrorMessage('');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay Lại Đăng Nhập</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Khám Phá Trang Chủ Giới Thiệu (Không cần đăng nhập) */}
        {onExploreHome && (
          <div className="mt-6 pt-5 border-t border-[var(--border-default)] text-center">
            <p className="text-2xs text-[var(--text-muted)] mb-2.5">
              Bạn là học sinh hoặc khách muốn tìm hiểu về CLB?
            </p>
            <button
              type="button"
              onClick={onExploreHome}
              className="w-full py-2.5 px-4 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-cyan-300 hover:text-blue-700 dark:hover:text-cyan-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
              <span>Xem Trang Giới Thiệu VMC</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};