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

    const result = await login(memberCodeInput.trim(), passwordInput.trim());
    if (!result?.success) {
      setErrorMessage(result?.message || 'Mã Thành Viên hoặc Mật khẩu không chính xác!');
    } else {
      setErrorMessage('');
    }
  };

  const handleAdminQuickLogin = async () => {
    setMemberCodeInput('ADMIN');
    setPasswordInput('admin123');
    setErrorMessage('');
    await login('ADMIN', 'admin123');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--bg-primary)] text-slate-200 relative overflow-hidden font-sans">
       
       {/* Ambient Radial Background Glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />

       {/* Main Login Card (max-w-md w-full) */}
       <div className="relative w-full max-w-md ds-card p-6 sm:p-8 shadow-2xl space-y-6">
        
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
           <div className="ds-card p-3.5 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold flex items-center gap-2 animate-slide-up">
             <AlertCircle className="w-4 h-4 shrink-0" />
             <span>{errorMessage}</span>
           </div>
         )}

         {/* 3. Form Đăng Nhập */}
         <form onSubmit={handleFormSubmit} className="space-y-4">
           <div>
             <label className="ds-field-label flex items-center gap-1.5">
               <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Mã Thành Viên *
             </label>
             <input
               type="text"
               required
               value={memberCodeInput}
               onChange={(e) => setMemberCodeInput(e.target.value)}
               placeholder="Nhập Mã Thành Viên..."
               className="ds-input uppercase"
             />
           </div>

           <div>
             <div className="flex justify-between items-center mb-1.5">
               <label className="ds-field-label flex items-center gap-1.5">
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
                 className="ds-input pl-4 pr-12"
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
             <div className="ds-card p-3.5 text-amber-300 text-xs space-y-1 animate-slide-up">
               <div className="font-bold">🆘 Cấp lại mật khẩu:</div>
               <p className="text-slate-300 leading-relaxed">
                 Vui lòng liên hệ <strong>Ban Đối Ngoại - Nhân Sự</strong> để được cấp lại mật khẩu mới.
               </p>
             </div>
           )}

           <button
             type="submit"
             className="ds-btn ds-btn-primary w-full"
           >
             <span>Đăng Nhập VMC Portal</span>
             <ArrowRight className="w-4 h-4" />
           </button>
         </form>

      </div>
    </div>
  );
};
