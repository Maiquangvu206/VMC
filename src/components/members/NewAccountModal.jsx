import React from 'react';
import { X, User, Mail, Hash, GraduationCap, Briefcase, Phone, Calendar, MapPin, Globe, ShieldCheck } from 'lucide-react';

export const NewAccountModal = ({ show, onClose, formData, setFormData, onSubmit, loading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
       <div className="ds-card p-4 sm:p-6 w-full max-w-xl shadow-2xl text-white flex flex-col my-auto">
         <div className="flex justify-between items-center pb-3 border-b border-[var(--border-default)] shrink-0">
           <div>
             <h3 className="font-heading text-lg font-bold text-white">Cấp Tài Khoản Thành Viên Mới</h3>
             <span className="text-xs text-slate-400">Dành cho Tổ Kỹ thuật cấp mã và mật khẩu ban đầu</span>
           </div>
           <button onClick={onClose} className="ds-btn ds-btn-ghost p-1">
             <X className="w-5 h-5" />
           </button>
         </div>
         
         <div className="flex-1 overflow-y-auto py-4 space-y-3">
           <div>
             <label className="ds-field-label">Username</label>
             <div className="relative flex items-center">
               <Hash className="absolute left-4 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
               <input
                 type="text"
                 value={formData.username}
                 onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                 className="ds-input w-full" style={{ paddingLeft: '2.75rem' }}
                 placeholder="VD: vmc123"
               />
             </div>
           </div>
           
           <div>
             <label className="ds-field-label">Họ và tên</label>
<div className="relative flex items-center">
                <User className="absolute left-4 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="ds-input w-full" style={{ paddingLeft: '2.75rem' }}
                  placeholder="Họ tên đầy đủ"
                />
              </div>
           </div>
           
           <div>
             <label className="ds-field-label">Email</label>
             <div className="relative flex items-center">
               <Mail className="absolute left-4 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
               <input
                 type="email"
                 value={formData.email}
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 className="ds-input w-full" style={{ paddingLeft: '2.75rem' }}
                 placeholder="email@example.com"
               />
             </div>
           </div>
           
           <div>
             <label className="ds-field-label">Lớp</label>
             <div className="relative flex items-center">
               <GraduationCap className="absolute left-4 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
               <input
                 type="text"
                 value={formData.class}
                 onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                 className="ds-input w-full" style={{ paddingLeft: '2.75rem' }}
                 placeholder="VD: 12A1"
               />
             </div>
           </div>
           
                       <div>
              <label className="ds-field-label">Ban *</label>
              <div className="relative flex items-center w-full">
                <Briefcase className="absolute left-4 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
                <select
                  value={formData.deptName || ''}
                  onChange={(e) => setFormData({ ...formData, deptName: e.target.value })}
                  className="ds-input ds-select w-full cursor-pointer"
                  style={{ paddingLeft: '2.75rem' }}
                >
                  <option value="">-- Chọn Ban --</option>
                  <option value="Ban Sản Xuất Media">Ban Sản Xuất Media</option>
                  <option value="Ban Nội Dung - Phát Thanh">Ban Nội Dung - Phát Thanh</option>
                  <option value="Ban Đối Ngoại - Nhân Sự">Ban Đối Ngoại - Nhân Sự</option>
                  <option value="Ban Chủ Nhiệm">Ban Chủ Nhiệm</option>
                  <option value="Ban Cố Vấn">Ban Cố Vấn</option>
                </select>
              </div>
            </div>

            <div>
              <label className="ds-field-label">Chức vụ *</label>
              <div className="relative flex items-center w-full">
                <ShieldCheck className="absolute left-4 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
                <input
                  type="text"
                  value={formData.roleTitle || ''}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="ds-input w-full"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="VD: Thành Viên VMC, Trưởng Ban, Phó Ban..."
                  list="newAccountRoleTitleOptions"
                />
                <datalist id="newAccountRoleTitleOptions">
                  <option value="Thành Viên VMC" />
                  <option value="Trưởng Ban Sản Xuất" />
                  <option value="Phó Ban Sản Xuất" />
                  <option value="Thành Viên Ban Sản Xuất" />
                  <option value="Trưởng Ban Nội Dung - Phát Thanh" />
                  <option value="Phó Ban Nội Dung - Phát Thanh" />
                  <option value="Thành Viên Ban Nội Dung - Phát Thanh" />
                  <option value="Trưởng Ban Đối Ngoại - Nhân Sự" />
                  <option value="Phó Ban Đối Ngoại - Nhân Sự" />
                  <option value="Kỹ Thuật Ban Đối Ngoại - Nhân Sự" />
                  <option value="Thành Viên Ban Đối Ngoại - Nhân Sự" />
                  <option value="Chủ Nhiệm CLB" />
                  <option value="Phó Chủ Nhiệm CLB" />
                  <option value="Cố Vấn CLB" />
                </datalist>
              </div>
            </div>
           
           <div>
             <label className="ds-field-label">Số điện thoại</label>
             <div className="relative flex items-center">
               <Phone className="absolute left-4 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
               <input
                 type="text"
                 value={formData.phone}
                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                 className="ds-input w-full" style={{ paddingLeft: '2.75rem' }}
                 placeholder="Số điện thoại"
               />
             </div>
           </div>
           
           <div>
             <label className="ds-field-label">Ngày sinh</label>
             <div className="relative flex items-center">
               <Calendar className="absolute left-4 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
               <input
                 type="text"
                 value={formData.dob}
                 onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                 className="ds-input w-full" style={{ paddingLeft: '2.75rem' }}
                 placeholder="DD/MM/YYYY"
               />
             </div>
           </div>
           
           <div>
             <label className="ds-field-label">Địa chỉ</label>
             <div className="relative flex items-center">
               <MapPin className="absolute left-4 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
               <input
                 type="text"
                 value={formData.address}
                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                 className="ds-input w-full" style={{ paddingLeft: '2.75rem' }}
                 placeholder="Địa chỉ"
               />
             </div>
           </div>
           
           <div>
             <label className="ds-field-label">Facebook</label>
             <div className="relative flex items-center">
               <Globe className="absolute left-4 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
               <input
                 type="text"
                 value={formData.facebook}
                 onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                 className="ds-input w-full" style={{ paddingLeft: '2.75rem' }}
                 placeholder="Link Facebook"
               />
             </div>
           </div>
         </div>
         
         <div className="pt-3 border-t border-[var(--border-default)] flex justify-end gap-2 shrink-0">
           <button
             type="button"
             onClick={onClose}
             className="ds-btn ds-btn-secondary ds-btn-xs"
           >
             Hủy
           </button>
           <button
             onClick={onSubmit}
             disabled={loading}
             className="ds-btn ds-btn-primary ds-btn-xs"
           >
             {loading ? 'Đang tạo...' : 'Xác Nhận Tạo'}
           </button>
         </div>
       </div>
     </div>
  );
};
