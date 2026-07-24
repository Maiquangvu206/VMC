import React from 'react';
import { X, User, Mail, Hash, GraduationCap, Briefcase, Phone, Calendar, MapPin, Globe } from 'lucide-react';

export const NewAccountModal = ({ show, onClose, formData, setFormData, onSubmit, loading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-blue-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl text-white flex flex-col my-auto">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white">Cấp Tài Khoản Thành Viên Mới</h3>
            <span className="text-xs text-slate-400">Dành cho Tổ Kỹ thuật cấp mã và mật khẩu ban đầu</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Username</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="VD: vmc123"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Họ và tên</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Họ tên đầy đủ"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="email@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Lớp</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="VD: 12A1"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Ban</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="VD: Ban Sản Xuất Media"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Số điện thoại"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Ngày sinh</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Địa chỉ</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Địa chỉ"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Facebook</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Link Facebook"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-white/10 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs px-4 py-2"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
          >
            {loading ? 'Đang tạo...' : 'Xác Nhận Tạo'}
          </button>
        </div>
      </div>
    </div>
  );
};
