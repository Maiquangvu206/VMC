import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Key, Lock, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ForcePasswordChangeModal = () => {
  const { currentUser, changePassword } = useClub();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Xác nhận mật khẩu mới không trùng khớp!');
      return;
    }

    if (newPassword === oldPassword) {
      setErrorMessage('Mật khẩu mới không được trùng với mật khẩu khởi tạo cũ!');
      return;
    }

    const success = await changePassword(oldPassword, newPassword);
    if (!success) {
      setErrorMessage('Mật khẩu hiện tại không chính xác!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
       <div className="ds-card p-6 sm:p-8 shadow-2xl text-white space-y-6 my-auto max-w-md w-full">
         
         {/* Warning Badge */}
         <div className="text-center space-y-2">
           <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center animate-bounce">
             <Key className="w-7 h-7" />
           </div>
           <h2 className="font-heading text-xl font-bold text-white">
             ĐỔI MẬT KHẨU LẦN ĐẦU ĐĂNG NHẬP
           </h2>
           <p className="text-xs text-slate-300">
             Xin chào <strong className="text-blue-400">{currentUser?.name}</strong> ({currentUser?.memberCode}). Đây là lần đầu tiên bạn đăng nhập bằng mật khẩu do Bộ Phận Kỹ Thuật cấp.
           </p>
         </div>

         {/* Mandatory Security Banner */}
         <div className="ds-card p-3 border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-2.5">
           <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
           <span>Theo quy định bảo mật của VMC, thành viên BẮT BUỘC phải thay đổi mật khẩu khởi tạo mặc định trước khi truy cập hệ thống.</span>
         </div>

         {/* Error Alert */}
         {errorMessage && (
           <div className="ds-card p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold">
             {errorMessage}
           </div>
         )}

         {/* Password Form */}
         <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
           <div>
             <label className="ds-field-label">Mật khẩu hiện tại (Kỹ Thuật cấp) *</label>
             <input
               type="password"
               required
               value={oldPassword}
               onChange={(e) => setOldPassword(e.target.value)}
               placeholder="Nhập VMC2026@VinhBao..."
               className="ds-input"
             />
           </div>

           <div>
             <label className="ds-field-label">Mật khẩu mới (Của cá nhân bạn) *</label>
             <input
               type="password"
               required
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               placeholder="Nhập ít nhất 6 ký tự..."
               className="ds-input"
             />
           </div>

           <div>
             <label className="ds-field-label">Xác nhận mật khẩu mới *</label>
             <input
               type="password"
               required
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               placeholder="Nhập lại mật khẩu mới..."
               className="ds-input"
             />
           </div>

           <button
             type="submit"
             className="ds-btn ds-btn-primary w-full"
           >
             <ShieldCheck className="w-5 h-5 text-slate-950 shrink-0" />
             <span>Xác Nhận Đổi Mật Khẩu & Truy Cập</span>
           </button>
         </form>

       </div>
     </div>
  );
};
