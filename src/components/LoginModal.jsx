import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Lock, User, AlertCircle, ArrowRight, Laptop, Crown, Eye, EyeOff } from 'lucide-react';

export const LoginModal = () => {
  const { login } = useClub();
  
  const [memberCodeInput, setMemberCodeInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!memberCodeInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Vui lòng nhập Mã Thành Viên và Mật khẩu!');
      return;
    }

    const success = await login(memberCodeInput.trim(), passwordInput.trim());
    if (!success) {
      setErrorMessage('Mã Thành Viên hoặc Mật khẩu không chính xác!');
    }
  };

  const handleAdminQuickLogin = async () => {
    setMemberCodeInput('ADMIN');
    setPasswordInput('admin123');
    setErrorMessage('');
    await login('ADMIN', 'admin123');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0f172a] text-slate-200 relative overflow-hidden font-sans">
      
      {/* Ambient Radial Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />

      {/* Main Login Card (max-w-md w-full) */}
      <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* 1. Header Branding & Logo */}
        <div className="text-center space-y-3">
          {/* VMC Brand Badge */}
          <div className="w-20 h-20 mx-auto rounded-full bg-[#0a1128] border-2 border-cyan-400/80 shadow-xl shadow-cyan-500/20 overflow-hidden p-1">
            <img src="/vmc-logo.jpg" alt="VMC Logo" className="w-full h-full object-cover rounded-full" />
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              CỔNG ĐĂNG NHẬP NỘI BỘ
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              CLB Truyền Thông Trường THPT Vĩnh Bảo (VMC Portal)
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2 animate-slide-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 3. Form Đăng Nhập */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Mã Thành Viên *
            </label>
            <input
              type="text"
              required
              value={memberCodeInput}
              onChange={(e) => setMemberCodeInput(e.target.value)}
              placeholder="Nhập Mã Thành Viên..."
              className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-100 text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Mật Khẩu *
              </label>
              <button
                type="button"
                onClick={() => setShowForgotNotice(!showForgotNotice)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl pl-4 pr-12 py-3 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-slate-400 hover:text-slate-200 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Notice */}
          {showForgotNotice && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1 animate-slide-up">
              <div className="font-bold">🆘 Cấp lại mật khẩu:</div>
              <p className="text-slate-300 leading-relaxed">
                Vui lòng liên hệ <strong>Ban Đối Ngoại - Nhân Sự</strong> để được cấp lại mật khẩu mới.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all text-xs uppercase tracking-wider cursor-pointer"
          >
            <span>Đăng Nhập VMC Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
