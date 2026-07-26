import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

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

    const result = await login(memberCodeInput.trim(), passwordInput.trim());
    if (!result?.success) {
      setErrorMessage(result?.message || 'Mã Thành Viên hoặc Mật khẩu không chính xác!');
    } else {
      setErrorMessage('');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--bg-primary)] text-slate-200 relative overflow-hidden font-sans">
       
       {/* Ambient Radial Background Glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />

       {/* Main Login Card */}
       <div className="relative w-full max-w-md mx-auto ds-card p-8 sm:p-10 shadow-2xl">
         
         {/* Header: Logo + Title */}
         <div className="mb-8 flex flex-col items-center text-center">
           {/* VMC Brand Logo */}
           <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-blue-500/30">
             <img src="/vmc-logo.jpg" alt="VMC Logo" className="w-full h-full object-cover rounded-full bg-[var(--bg-input)]" />
           </div>

           <div className="mt-3">
             <h2 className="text-2xl font-bold tracking-wide uppercase text-white mb-2">
               CỔNG ĐĂNG NHẬP NỘI BỘ
             </h2>
             <p className="text-xs text-slate-400 font-normal mb-8">
               CLB Truyền Thông Trường THPT Vĩnh Bảo (VMC Portal)
             </p>
           </div>
         </div>

         {/* Error Alert */}
         {errorMessage && (
           <div className="ds-card p-3.5 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold flex items-center gap-2 animate-slide-up mb-5">
             <AlertCircle className="w-4 h-4 shrink-0" />
             <span>{errorMessage}</span>
           </div>
         )}

         {/* Form Đăng Nhập */}
         <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
           {/* Mã Thành Viên */}
           <div>
             <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">
               Mã Thành Viên <span className="text-rose-500">*</span>
             </label>
             <div className="relative flex items-center w-full">
               <User className="ds-input-icon text-cyan-400" />
               <input
                 type="text"
                 required
                 value={memberCodeInput}
                 onChange={(e) => setMemberCodeInput(e.target.value)}
                 placeholder="NHẬP MÃ THÀNH VIÊN..."
                 className="ds-input pl-12 w-full placeholder:text-xs placeholder:tracking-wider placeholder:text-slate-500"
               />
             </div>
           </div>

           {/* Mật Khẩu */}
           <div>
             <div className="flex items-center justify-between mb-2">
               <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                 Mật Khẩu <span className="text-rose-500">*</span>
               </label>
               <button
                 type="button"
                 onClick={() => setShowForgotNotice(!showForgotNotice)}
                 className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
               >
                 Quên mật khẩu?
               </button>
             </div>
             <div className="relative flex items-center w-full">
               <Lock className="ds-input-icon text-cyan-400" />
               <input
                 type={showPassword ? 'text' : 'password'}
                 required
                 value={passwordInput}
                 onChange={(e) => setPasswordInput(e.target.value)}
                 placeholder="••••••••••••"
                 className="ds-input pl-12 pr-4 w-full placeholder:text-xs placeholder:tracking-wider placeholder:text-slate-500"
               />
               <button
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-4 z-10 flex items-center justify-center text-slate-400 hover:text-slate-200 focus:outline-none"
               >
                 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
               </button>
             </div>
           </div>

           {/* Forgot Password Notice */}
           {showForgotNotice && (
             <div className="ds-card p-3.5 text-amber-300 text-xs space-y-1 animate-slide-up">
               <div className="font-bold">🆘 Cấp lại mật khẩu:</div>
               <p className="text-slate-300 leading-relaxed">
                 Vui lòng liên hệ <strong>Ban Đối Ngoại - Nhân Sự</strong> để được cấp lại mật khẩu mới.
               </p>
             </div>
           )}

           <button
             type="submit"
             className="ds-btn ds-btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm"
           >
             <span>Đăng Nhập VMC Portal</span>
             <ArrowRight className="w-4 h-4" />
           </button>
         </form>

       </div>
    </div>
  );
};