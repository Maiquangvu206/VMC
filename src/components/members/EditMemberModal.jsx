import React from 'react';
import { X, User, Mail, Hash, GraduationCap, Briefcase, Phone, Calendar, MapPin, Globe, Save, ShieldCheck, RefreshCw } from 'lucide-react';

export const EditMemberModal = ({ show, onClose, member, formData, setFormData, onSubmit, loading, canManageAccount, onResetPassword }) => {
  if (!show || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
      <div className="ds-card p-4 sm:p-6 w-full max-w-2xl shadow-2xl text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col my-auto">
        <div className="flex justify-between items-center pb-3 border-b border-[var(--border-default)] shrink-0">
          <div>
            <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">Chỉnh Sửa Thông Tin Thành Viên</h3>
          </div>
          <button onClick={onClose} className="ds-btn ds-btn-ghost p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {/* Thông tin nhận diện thành viên (Chỉ xem - Ảnh đại diện do chính chủ tài khoản cập nhật tại Trang Hồ Sơ) */}
          <div className="p-5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] flex flex-col items-center justify-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-4 border-cyan-500/40 shadow-md">
              <img
                src={formData.avatar || formData.avatar_url || '/vmc-logo.jpg'}
                alt="Avatar"
                onError={(e) => { e.currentTarget.src = '/vmc-logo.jpg'; }}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ds-field-label text-[var(--text-secondary)] font-medium">Mã thành viên</label>
              <div className="relative flex items-center w-full">
                <Hash className="absolute left-4 w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 pointer-events-none z-10" />
                <input
                  type="text"
                  readOnly
                  disabled
                  value={formData.memberCode || formData.member_code || formData.username || ''}
                  className="ds-input w-full font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-[var(--bg-tertiary)] border-[var(--border-default)] cursor-not-allowed opacity-90"
                  style={{ paddingLeft: '2.75rem' }}
                  title="Mã thành viên cố định, không được phép sửa đổi"
                />
              </div>
            </div>
            <div>
              <label className="ds-field-label text-[var(--text-secondary)] font-medium">Họ và tên</label>
              <div className="relative flex items-center w-full">
                <User className="absolute left-4 w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none z-10" />
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="ds-input w-full"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ds-field-label text-[var(--text-secondary)] font-medium">Email</label>
              <div className="relative flex items-center w-full">
                <Mail className="absolute left-4 w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none z-10" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="ds-input w-full"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>
            <div>
              <label className="ds-field-label text-[var(--text-secondary)] font-medium">Lớp</label>
              <div className="relative flex items-center w-full">
                <GraduationCap className="absolute left-4 w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none z-10" />
                <input
                  type="text"
                  value={formData.class || ''}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="ds-input w-full"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ds-field-label text-[var(--text-secondary)] font-medium">Ban *</label>
              <div className="relative flex items-center w-full">
                <Briefcase className="absolute left-4 w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none z-10" />
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
              <label className="ds-field-label text-[var(--text-secondary)] font-medium">Chức vụ / Chức danh *</label>
              <div className="relative flex items-center w-full">
                <ShieldCheck className="absolute left-4 w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none z-10" />
                <select
                  value={formData.roleTitle || 'Thành viên'}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="ds-input ds-select w-full cursor-pointer"
                  style={{ paddingLeft: '2.75rem' }}
                >
                  <option value="Chủ Nhiệm">Chủ Nhiệm</option>
                  <option value="Phó Chủ Nhiệm">Phó Chủ Nhiệm</option>
                  <option value="Trưởng Ban">Trưởng Ban</option>
                  <option value="Phó Ban">Phó Ban</option>
                  <option value="Thành viên">Thành viên</option>
                  <option value="Kỹ thuật">Kỹ thuật</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ds-field-label text-[var(--text-secondary)] font-medium">Số điện thoại</label>
              <div className="relative flex items-center w-full">
                <Phone className="absolute left-4 w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none z-10" />
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="ds-input w-full"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>
            <div>
              <label className="ds-field-label text-[var(--text-secondary)] font-medium">Ngày sinh</label>
              <div className="relative flex items-center w-full">
                <Calendar className="absolute left-4 w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none z-10" />
                <input
                  type="text"
                  value={formData.dob || ''}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="ds-input w-full"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="ds-field-label text-[var(--text-secondary)] font-medium">Địa chỉ</label>
            <div className="relative flex items-center w-full">
              <MapPin className="absolute left-4 w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none z-10" />
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="ds-input w-full"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div>
            <label className="ds-field-label text-[var(--text-secondary)] font-medium">Facebook</label>
            <div className="relative flex items-center w-full">
              <Globe className="absolute left-4 w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none z-10" />
              <input
                type="text"
                value={formData.facebook || ''}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                className="ds-input w-full"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--border-default)] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div>
            {canManageAccount && onResetPassword && (
              <button
                type="button"
                onClick={onResetPassword}
                className="ds-btn ds-btn-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all flex items-center gap-1.5"
                title="Đặt lại mật khẩu ngẫu nhiên cho thành viên và gửi email thông báo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Mật Khẩu</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
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
    </div>
  );
};
