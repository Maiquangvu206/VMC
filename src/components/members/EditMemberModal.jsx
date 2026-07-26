import React from 'react';
import { X, User, Mail, Hash, GraduationCap, Briefcase, Phone, Calendar, MapPin, Globe, Save } from 'lucide-react';

export const EditMemberModal = ({ show, onClose, member, formData, setFormData, onSubmit, loading }) => {
  if (!show || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
       <div className="ds-card p-4 sm:p-6 w-full max-w-2xl shadow-2xl text-white flex flex-col my-auto">
         <div className="flex justify-between items-center pb-3 border-b border-[var(--border-default)] shrink-0">
           <div>
             <h3 className="font-heading text-lg font-bold text-white">Chỉnh Sửa Thông Tin Thành Viên</h3>
             <span className="text-xs text-slate-400">Cập nhật thông tin chi tiết</span>
           </div>
           <button onClick={onClose} className="ds-btn ds-btn-ghost p-1">
             <X className="w-5 h-5" />
           </button>
         </div>

         <div className="flex-1 overflow-y-auto py-4 space-y-3">
           <div className="grid grid-cols-2 gap-3">
             <div>
               <label className="ds-field-label">Mã thành viên</label>
               <div className="relative">
                 <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                   type="text"
                   value={formData.memberCode}
                   onChange={(e) => setFormData({ ...formData, memberCode: e.target.value })}
                   className="ds-input pl-10"
                 />
               </div>
             </div>
             <div>
               <label className="ds-field-label">Họ và tên</label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                   type="text"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   className="ds-input pl-10"
                 />
               </div>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
             <div>
               <label className="ds-field-label">Email</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                   type="email"
                   value={formData.email}
                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                   className="ds-input pl-10"
                 />
               </div>
             </div>
             <div>
               <label className="ds-field-label">Lớp</label>
               <div className="relative">
                 <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                   type="text"
                   value={formData.class}
                   onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                   className="ds-input pl-10"
                 />
               </div>
             </div>
           </div>

           <div>
             <label className="ds-field-label">Ban</label>
             <div className="relative">
               <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input
                 type="text"
                 value={formData.deptName}
                 onChange={(e) => setFormData({ ...formData, deptName: e.target.value })}
                 className="ds-input pl-10"
               />
             </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
             <div>
               <label className="ds-field-label">Số điện thoại</label>
               <div className="relative">
                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                   type="text"
                   value={formData.phone}
                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                   className="ds-input pl-10"
                 />
               </div>
             </div>
             <div>
               <label className="ds-field-label">Ngày sinh</label>
               <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                   type="text"
                   value={formData.dob}
                   onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                   className="ds-input pl-10"
                 />
               </div>
             </div>
           </div>

           <div>
             <label className="ds-field-label">Địa chỉ</label>
             <div className="relative">
               <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input
                 type="text"
                 value={formData.address}
                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                 className="ds-input pl-10"
               />
             </div>
           </div>

           <div>
             <label className="ds-field-label">Facebook</label>
             <div className="relative">
               <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input
                 type="text"
                 value={formData.facebook}
                 onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                 className="ds-input pl-10"
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
             <Save className="w-3.5 h-3.5" />
             {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
           </button>
         </div>
       </div>
     </div>
  );
};
