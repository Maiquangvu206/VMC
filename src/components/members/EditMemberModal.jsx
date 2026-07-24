import React from 'react';
import { X, User, Mail, Hash, GraduationCap, Briefcase, Phone, Calendar, MapPin, Globe, Save } from 'lucide-react';

export const EditMemberModal = ({ show, onClose, member, formData, setFormData, onSubmit, loading }) => {
  if (!show || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl text-white flex flex-col my-auto">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white">Chỉnh Sửa Thông Tin Thành Viên</h3>
            <span className="text-xs text-slate-400">Cập nhật thông tin chi tiết</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Mã thành viên</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.member_code}
                  onChange={(e) => setFormData({ ...formData, member_code: e.target.value })}
                  className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
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
                  className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Lớp</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.class_name}
                  onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                  className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
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
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
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
                  className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
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
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
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
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
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
            className="btn-primary text-xs px-4 py-2 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};
