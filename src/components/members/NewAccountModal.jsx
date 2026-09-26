import React, { useEffect } from 'react';
import { X, User, Mail, Hash, GraduationCap, Briefcase, Phone, Calendar, MapPin, Globe, ShieldCheck, RefreshCw, Award } from 'lucide-react';

export const generateRandomVmcUsername = (existingMembers = []) => {
  const existingCodes = new Set(
    (existingMembers || []).map(m => (m.memberCode || m.username || m.member_code || '').toUpperCase())
  );
  let randomNum;
  let code;
  let attempts = 0;
  do {
    randomNum = Math.floor(1000 + Math.random() * 9000);
    code = `VMC-${randomNum}`;
    attempts++;
  } while (existingCodes.has(code.toUpperCase()) && attempts < 10000);
  return code;
};

export const NewAccountModal = ({ show, onClose, formData, setFormData, onSubmit, loading, generations = [], existingMembers = [] }) => {
  if (!show) return null;

  const handleGenerateNewUsername = () => {
    setFormData(prev => ({ ...prev, username: generateRandomVmcUsername(existingMembers) }));
  };

  useEffect(() => {
    if (show && (!formData.username || !formData.username.startsWith('VMC-'))) {
      handleGenerateNewUsername();
    }
  }, [show]);

  const genOptions = generations && generations.length > 0
    ? generations.map(g => (typeof g === 'object' ? (g.name || g.termName || g.id) : g))
    : ['Gen 8', 'Gen 7', 'Gen 6', 'Gen 5', 'Gen 4', 'Gen 3', 'Gen 2', 'Gen 1'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
      <div className="ds-card p-5 sm:p-7 w-full max-w-4xl shadow-2xl text-white flex flex-col my-auto border border-blue-500/30">

        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#1f2937] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Cấp Tài Khoản Thành Viên Mới</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="ds-btn ds-btn-ghost p-1.5 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Column Form Body */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-y-auto py-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CỘT 1: THÔNG TIN CÁ NHÂN */}
            <div className="space-y-4 bg-[#0f172a]/60 p-4 sm:p-5 rounded-xl border border-[#1f2937]">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#1f2937]/80">
                <User className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">1. Thông Tin Cá Nhân</h4>
              </div>

              {/* Username (VMC-XXXX) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Mã Thành Viên</label>
                  <button
                    type="button"
                    onClick={handleGenerateNewUsername}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
                    title="Đổi mã ngẫu nhiên mới"
                  >
                    <RefreshCw className="w-3 h-3" /> Đổi mã khác
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Hash className="absolute left-3.5 w-4 h-4 text-cyan-400 shrink-0 pointer-events-none z-10" />
                  <input
                    type="text"
                    required
                    readOnly
                    disabled
                    value={formData.username || ''}
                    className="ds-input w-full font-mono font-bold text-cyan-300 tracking-wider !pl-10 text-sm bg-slate-900/90 border-slate-700/80 cursor-not-allowed opacity-90"
                    placeholder="VD: VMC-8294"
                    title="Mã thành viên được hệ thống tự động tạo cố định (dạng VMC-XXXX), không được phép sửa đổi trực tiếp"
                  />
                </div>
              </div>

              {/* Họ và tên */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Họ và tên <span className="text-rose-500">*</span></label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="ds-input w-full !pl-10 text-sm"
                    placeholder="Họ tên đầy đủ"
                  />
                </div>
              </div>

              {/* Email & SĐT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Email</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="ds-input w-full !pl-10 text-xs"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Số điện thoại <span className="text-rose-500">*</span></label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
                    <input
                      type="text"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="ds-input w-full !pl-10 text-xs"
                      placeholder="Số điện thoại"
                    />
                  </div>
                </div>
              </div>

              {/* Lớp & Ngày sinh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Lớp</label>
                  <div className="relative flex items-center">
                    <GraduationCap className="absolute left-3.5 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
                    <input
                      type="text"
                      value={formData.class || ''}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="ds-input w-full !pl-10 text-xs"
                      placeholder="VD: 10A1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Ngày sinh</label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3.5 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
                    <input
                      type="text"
                      value={formData.dob || ''}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="ds-input w-full !pl-10 text-xs"
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Địa chỉ</label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="ds-input w-full !pl-10 text-xs"
                    placeholder="Địa chỉ cư trú"
                  />
                </div>
              </div>

              {/* Facebook */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Facebook</label>
                <div className="relative flex items-center">
                  <Globe className="absolute left-3.5 w-4 h-4 text-slate-400 shrink-0 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={formData.facebook || ''}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    className="ds-input w-full !pl-10 text-xs"
                    placeholder="Link trang cá nhân Facebook"
                  />
                </div>
              </div>
            </div>

            {/* CỘT 2: BAN CHUYÊN MÔN & CHỨC VỤ */}
            <div className="space-y-4 bg-[#0f172a]/60 p-4 sm:p-5 rounded-xl border border-[#1f2937] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[#1f2937]/80">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">2. Ban Chuyên Môn & Chức Vụ</h4>
                </div>

                {/* Thống kê Gen */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Thế hệ <span className="text-rose-500">*</span></label>
                  <div className="relative flex items-center w-full">
                    <Award className="absolute left-3.5 w-4 h-4 text-amber-400 shrink-0 pointer-events-none z-10" />
                    <select
                      value={formData.termName || formData.term || 'Gen 8'}
                      onChange={(e) => setFormData({ ...formData, term: e.target.value, termName: e.target.value })}
                      className="ds-input ds-select w-full cursor-pointer !pl-10 text-sm font-semibold text-amber-300"
                    >
                      {genOptions.map((g, idx) => (
                        <option key={idx} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ban Chuyên Môn */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Ban Chuyên Môn <span className="text-rose-500">*</span></label>
                  <div className="relative flex items-center w-full">
                    <Briefcase className="absolute left-3.5 w-4 h-4 text-blue-400 shrink-0 pointer-events-none z-10" />
                    <select
                      value={formData.deptName || ''}
                      onChange={(e) => setFormData({ ...formData, deptName: e.target.value })}
                      className="ds-input ds-select w-full cursor-pointer !pl-10 text-sm font-medium"
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

                {/* Chức vụ */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Chức Vụ <span className="text-rose-500">*</span></label>
                  <div className="relative flex items-center w-full">
                    <ShieldCheck className="absolute left-3.5 w-4 h-4 text-emerald-400 shrink-0 pointer-events-none z-10" />
                    <select
                      value={formData.roleTitle || 'Thành viên'}
                      onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                      className="ds-input ds-select w-full cursor-pointer !pl-10 text-sm font-medium text-emerald-300"
                    >
                      <option value="Chủ Nhiệm">Chủ Nhiệm</option>
                      <option value="Phó Chủ Nhiệm">Phó Chủ Nhiệm</option>
                      <option value="Trưởng Ban">Trưởng Ban</option>
                      <option value="Phó Ban">Phó Ban</option>
                      <option value="Thành viên">Thành viên</option>
                      <option value="Kỹ thuật">Kỹ thuật</option>
                      <option value="Cố Vấn">Cố Vấn</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Nút tác vụ chân trang */}
              <div className="pt-4 border-t border-[#1f2937] flex justify-end gap-3 shrink-0 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="ds-btn ds-btn-secondary py-2 px-4 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="ds-btn ds-btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
                >
                  {loading ? 'Đang tạo...' : 'Xác Nhận Tạo Tài Khoản'}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};
