import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  User, 
  ShieldCheck, 
  LogOut, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Globe, 
  GraduationCap,
  Briefcase,
  Hash,
  Save,
  CheckCircle,
  Laptop,
  Sparkles,
  Edit3,
  History,
  Award,
  UserPlus,
  Clock,
  Lock,
  Check
} from 'lucide-react';

export const InternalProfile = () => {
  const { currentUser, logout, updateSelfProfile } = useClub();

  // Self-editable fields state: Phone, Email, Address, Facebook
  const [selfData, setSelfData] = useState({
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    address: currentUser.address || '',
    facebook: currentUser.facebook || ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelfUpdate = (e) => {
    e.preventDefault();
    updateSelfProfile(selfData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const techOnlyFields = [
    { label: "Mã Thành Viên", value: currentUser.memberCode, icon: Hash, isMono: true, color: "text-cyan-400 font-bold" },
    { label: "Họ và Tên", value: currentUser.name, icon: User, isMono: false, color: "text-white font-extrabold" },
    { label: "Lớp Học", value: currentUser.class, icon: GraduationCap, isMono: false, color: "text-slate-200 font-medium" },
    { label: "Ban Chuyên Môn", value: currentUser.deptName, icon: Briefcase, isMono: false, color: "text-indigo-400 font-semibold" },
    { label: "Chức Vụ Trong CLB", value: currentUser.roleTitle, icon: ShieldCheck, isMono: false, color: "text-amber-400 font-bold" },
    { label: "Ngày Sinh", value: currentUser.dob, icon: Calendar, isMono: true, color: "text-emerald-400 font-semibold" }
  ];

  // Core Milestones: Lịch Sử Chức Vụ & Trạng Thái Thành Viên
  const roleHistoryMilestones = [
    {
      id: 'm1',
      date: '20/09/2024',
      title: `Gia nhập VMC (Thành viên Ban Kỹ thuật / Ban ĐN-NS)`,
      badgeText: '[Gia nhập]',
      badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: UserPlus,
      iconBorder: 'border-emerald-500 text-emerald-400'
    },
    {
      id: 'm2',
      date: '15/08/2025',
      title: `Thăng chức: Phó Ban Kỹ Thuật (Ban Đối Ngoại - Nhân Sự)`,
      badgeText: '[Chuyển chức vụ]',
      badgeStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      icon: Award,
      iconBorder: 'border-blue-500 text-blue-400'
    },
    {
      id: 'm3',
      date: '01/06/2026',
      title: `Nhận nhiệm vụ: ${currentUser.roleTitle || 'Chủ Nhiệm CLB VMC'}`,
      badgeText: '[Thăng chức]',
      badgeStyle: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      icon: Sparkles,
      iconBorder: 'border-indigo-500 text-indigo-400'
    },
    {
      id: 'm4',
      date: '30/08/2027',
      title: 'Dự kiến kết thúc nhiệm kỳ CLB',
      badgeText: '[Dự kiến kết thúc]',
      badgeStyle: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      icon: Calendar,
      iconBorder: 'border-purple-500 text-purple-400'
    },
    {
      id: 'm5',
      date: '21/07/2026 (Hiện Tại)',
      title: `Trạng Thái Hoạt Động: ${currentUser.status === 'Active' ? 'Đang Hoạt Động' : 'Tạm Nghỉ'}`,
      badgeText: '[ĐANG HOẠT ĐỘNG]',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold',
      icon: ShieldCheck,
      iconBorder: 'border-emerald-400 text-emerald-300'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#0f172a] text-slate-200 p-6 sm:p-8 flex flex-col gap-6 font-sans">
      
      {/* 1. Top Header Banner Card */}
      <div className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              HỒ SƠ THÀNH VIÊN VMC
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Thông Tin Cá Nhân & <span className="text-cyan-400">Tài Khoản VMC</span>
          </h1>
          <p className="text-xs text-slate-400">
            Hệ thống quản lý thông tin thành viên CLB Truyền Thông THPT Vĩnh Bảo
          </p>
        </div>

        <button
          onClick={logout}
          className="px-5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 text-xs font-semibold flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng Xuất Tài Khoản</span>
        </button>
      </div>

      {/* 2. Main Layout Grid (lg:grid-cols-12 gap-6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        
        {/* Left Column: Avatar & Personal Card (lg:col-span-4) */}
        <div className="lg:col-span-4 w-full space-y-6">
          
          <div className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center gap-5">
            
            {/* Avatar Circle */}
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-500 shadow-md shrink-0">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>

            {/* Profile Identity Details */}
            <div className="flex flex-col items-center gap-2 w-full">
              <h2 className="text-xl font-bold text-white tracking-tight">{currentUser.name}</h2>
              <span className="px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold">
                {currentUser.roleTitle}
              </span>
              <p className="text-xs text-slate-400 font-medium pt-0.5">
                Lớp {currentUser.class} • THPT Vĩnh Bảo
              </p>
            </div>

            {/* Member Code Block */}
            <div className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mã Thành Viên</span>
              <span className="text-lg font-mono font-bold text-cyan-400 tracking-widest">{currentUser.memberCode}</span>
            </div>

            {/* Current Status Badge */}
            <div className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                <span>Trạng Thái Hoạt Động</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40">
                {currentUser.status === 'Active' ? 'Đang Hoạt Động' : 'Tạm Nghỉ'}
              </span>
            </div>

          </div>

        </div>

        {/* Right Column: Information & Timeline Cards (lg:col-span-8 space-y-6) */}
        <div className="lg:col-span-8 w-full space-y-6">
          
          {/* Card 1: Thông tin do kỹ thuật quản lý */}
          <div className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-white">Thông Tin Do Kỹ Thuật Quản Lý</h3>
                <p className="text-xs text-slate-400">Các trường thông tin cố định do Tổ Kỹ thuật cấp</p>
              </div>
            </div>

            {/* Grid 2 Cột (grid grid-cols-1 md:grid-cols-2 gap-4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {techOnlyFields.map((field, idx) => {
                const Icon = field.icon;
                return (
                  <div 
                    key={idx} 
                    className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-1 transition-all"
                  >
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                      {field.label}
                    </span>
                    <div className={`text-sm sm:text-base font-bold text-slate-100 truncate ${field.isMono ? 'font-mono' : ''} ${field.color}`}>
                      {field.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Thông tin tự cập nhật */}
          <div className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-white">Thông Tin Tự Cập Nhật</h3>
                  <p className="text-xs text-slate-400">Số Điện Thoại, Email, Địa Chỉ & Facebook cá nhân</p>
                </div>
              </div>

              <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                ✏️ Cho phép sửa
              </span>
            </div>

            {savedSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-slide-up">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Đã lưu cập nhật thành công thông tin cá nhân mới!</span>
              </div>
            )}

            <form onSubmit={handleSelfUpdate} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Số Điện Thoại / Zalo *
                  </label>
                  <input
                    type="tel"
                    required
                    value={selfData.phone}
                    onChange={(e) => setSelfData({ ...selfData, phone: e.target.value })}
                    placeholder="0981 234 567..."
                    className="w-full bg-slate-950/50 border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Email Học Sinh *
                  </label>
                  <input
                    type="email"
                    required
                    value={selfData.email}
                    onChange={(e) => setSelfData({ ...selfData, email: e.target.value })}
                    placeholder="hoanglong.vmc@vinhbao.edu.vn..."
                    className="w-full bg-slate-950/50 border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Địa Chỉ Thường Trú *
                </label>
                <input
                  type="text"
                  required
                  value={selfData.address}
                  onChange={(e) => setSelfData({ ...selfData, address: e.target.value })}
                  placeholder="Khu 3, Thị trấn Vĩnh Bảo, Vĩnh Bảo, Hải Phòng..."
                  className="w-full bg-slate-950/50 border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Liên Hệ Facebook Cá Nhân *
                </label>
                <input
                  type="url"
                  required
                  value={selfData.facebook}
                  onChange={(e) => setSelfData({ ...selfData, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-slate-950/50 border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>LƯU CẬP NHẬT THÔNG TIN</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 3: Lịch Sử Chức Vụ & Trạng Thái Thành Viên (Vertical Timeline) */}
          <div className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            
            {/* Header Khối với Badge Phân Quyền */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-white">Lịch Sử Chức Vụ & Trạng Thái Thành Viên</h3>
                  <p className="text-xs text-slate-400">Ghi nhận tiến trình tham gia, chuyển đổi chức vụ và trạng thái hoạt động tại VMC</p>
                  <p className="text-[11px] text-amber-300/80 font-medium italic mt-0.5">
                    * Thành viên không thể tự chỉnh sửa phần này. Mọi thay đổi về chức vụ và trạng thái vui lòng liên hệ Ban ĐN-NS.
                  </p>
                </div>
              </div>

              {/* Header Badge Phân Quyền */}
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-medium shrink-0 w-fit flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>🔒 Dữ liệu do Ban Đối ngoại - Nhân sự quản lý</span>
              </span>
            </div>

            {/* UI Vertical Timeline với Đường Gạch Nối Border */}
            <div className="relative border-l-2 border-slate-700/80 space-y-6 ml-3 pl-6 py-2">
              {roleHistoryMilestones.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.id} className="relative group">
                    {/* Node Bullet Icon trên đường gạch nối */}
                    <div className={`absolute -left-[37px] top-0.5 p-1.5 rounded-full bg-slate-900 border-2 ${m.iconBorder} shadow-md transition-transform group-hover:scale-110`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {/* Nội dung Mốc Thời Gian */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 transition-all hover:border-slate-700 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        
                        {/* Thời gian */}
                        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{m.date}</span>
                        </div>

                        {/* Tag Trạng Thái (Right Badge) */}
                        <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-md border shrink-0 w-fit ${m.badgeStyle}`}>
                          {m.badgeText}
                        </span>
                      </div>

                      {/* Tên Sự Kiện / Chức Vụ In Đậm */}
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {m.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
