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
  Check, 
  Camera, 
  Upload, 
  X 
} from 'lucide-react';

const Loading = () => (
  <div className="w-full min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
    <div className="text-slate-400 text-sm font-mono animate-pulse">Đang tải...</div>
  </div>
);

const safeCurrentUser = (currentUser) => {
  if (!currentUser) return {
    name: 'Thành Viên VMC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    roleTitle: 'Thành Viên VMC',
    memberCode: 'VMC-MEMBER',
    class: 'N/A',
    deptName: 'Chưa cập nhật',
    phone: '',
    email: '',
    dob: '',
    address: '',
    facebook: '',
    status: 'Active',
    milestones: []
  };
  return currentUser;
};

export const InternalProfile = () => {
  const { currentUser, isHRMember, logout, updateSelfProfile, addMemberMilestone, showToast } = useClub();

  if (!currentUser) {
    return <Loading />;
  }

  const cu = safeCurrentUser(currentUser);

  // Avatar Modal State & Handlers
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    date: new Date().toLocaleDateString('vi-VN'),
    title: '',
    badgeText: '[Chức vụ]'
  });
  const [avatarPreview, setAvatarPreview] = useState(cu.avatar || '');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Vui lòng chọn file ảnh dung lượng dưới 5MB!', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async (e) => {
    e.preventDefault();
    if (!avatarPreview) {
      showToast('Vui lòng chọn file ảnh từ máy tính!', 'warning');
      return;
    }
    await updateSelfProfile({ ...selfData, avatar: avatarPreview });
    setIsAvatarModalOpen(false);
  };

  // Self-editable fields state: Phone, Email, DOB, Address, Facebook
  const [selfData, setSelfData] = useState({
    phone: cu.phone || '',
    email: cu.email || '',
    dob: cu.dob || '',
    address: cu.address || '',
    facebook: cu.facebook || ''
  });

  // Keep selfData in sync ONLY when active logged-in user changes (e.g. account switch)
  React.useEffect(() => {
    setSelfData({
      phone: cu.phone || '',
      email: cu.email || '',
      dob: cu.dob || '',
      address: cu.address || '',
      facebook: cu.facebook || ''
    });
  }, [cu.id, cu.memberCode]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelfUpdate = async (e) => {
    e.preventDefault();
    await updateSelfProfile(selfData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const techOnlyFields = [
    { label: "Mã Thành Viên", value: cu.memberCode, icon: Hash, isMono: true, color: "text-cyan-400 font-bold" },
    { label: "Họ và Tên", value: cu.name, icon: User, isMono: false, color: "text-white font-extrabold" },
    { label: "Lớp Học", value: cu.class, icon: GraduationCap, isMono: false, color: "text-slate-200 font-medium" },
    { label: "Ban Chuyên Môn", value: cu.deptName, icon: Briefcase, isMono: false, color: "text-indigo-400 font-semibold" },
    { label: "Chức Vụ Trong CLB", value: cu.roleTitle, icon: ShieldCheck, isMono: false, color: "text-amber-400 font-bold" }
  ];

  // Core Milestones: Lịch Sử Chức Vụ & Trạng Thái Thành Viên
  const roleHistoryMilestones = [
    {
      id: 'm1',
      date: '20/09/2024',
      title: `Gia nhập VMC (Thành viên Ban Đối Ngoại - Nhân Sự)`,
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
      title: `Nhận nhiệm vụ: ${cu.roleTitle || 'Chủ Nhiệm CLB VMC'}`,
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
      title: `Trạng Thái Hoạt Động: ${cu.status === 'Active' ? 'Đang Hoạt Động' : 'Tạm Nghỉ'}`,
      badgeText: '[ĐANG HOẠT ĐỘNG]',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold',
      icon: ShieldCheck,
      iconBorder: 'border-emerald-400 text-emerald-300'
    }
  ];

  return (
    <div className="page-wrap space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="ds-card ds-card-elevated p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="ds-badge ds-badge-cyan flex items-center gap-1.5 text-[11px]">
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
          className="ds-btn ds-btn-danger text-xs shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng Xuất Tài Khoản</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="ds-grid-12">
        
        {/* Left Column */}
        <div className="ds-col-span-4 space-y-6">
          
          <div className="w-full bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border-default)] rounded-2xl p-6 shadow-xl flex flex-col items-center text-center gap-5">
            
            {/* Avatar Circle with Interactive Edit Trigger */}
            <div 
              className="relative group cursor-pointer"
              onClick={() => setIsAvatarModalOpen(true)}
              title="Click để đổi ảnh đại diện"
            >
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-500 shadow-md shrink-0 relative overflow-hidden">
                <img 
                  src={cu.avatar} 
                  alt={cu.name} 
                  className="w-full h-full object-cover rounded-full group-hover:opacity-75 transition-opacity" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-full">
                  <Camera className="w-6 h-6 mb-0.5" />
                  <span className="text-[10px] font-bold">Đổi ảnh</span>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg border-2 border-slate-900 transition-transform group-hover:scale-110">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Profile Identity Details */}
            <div className="flex flex-col items-center gap-2 w-full">
              <h2 className="text-xl font-bold text-white tracking-tight">{cu.name}</h2>
              <span className="px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold">
                {cu.roleTitle}
              </span>
              <p className="text-xs text-slate-400 font-medium pt-0.5">
                Lớp {cu.class} • THPT Vĩnh Bảo
              </p>
            </div>

            {/* Member Code Block */}
            <div className="w-full p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-default)] text-center flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mã Thành Viên</span>
              <span className="text-lg font-mono font-bold text-cyan-400 tracking-widest">{cu.memberCode}</span>
            </div>

            {/* Current Status Badge */}
            <div className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                <span>Trạng Thái Hoạt Động</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40">
                {cu.status === 'Active' ? 'Đang Hoạt Động' : 'Tạm Nghỉ'}
              </span>
            </div>

          </div>

        </div>

        {/* Right Column: Information & Timeline Cards */}
        <div className="ds-col-span-8 space-y-6">
          
          {/* Card 1: Tech Info */}
          <div className="ds-card p-6 space-y-4">
            <div className="ds-card-header">
              <div className="ds-card-header-icon bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="ds-card-header-content flex-1">
                <div className="ds-card-title">Thông Tin Do Kỹ Thuật Quản Lý</div>
                <div className="ds-card-subtitle">Các trường thông tin cố định do Tổ Kỹ thuật cấp</div>
              </div>
            </div>

            <div className="ds-grid-2">
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
          {/* Card 2: Self-Update Info */}
          <div className="ds-card p-6 space-y-4">
            <div className="ds-card-header">
              <div className="ds-card-header-icon bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Edit3 className="w-5 h-5" />
              </div>
              <div className="ds-card-header-content flex-1">
                <div className="ds-card-title">Thông Tin Tự Cập Nhật</div>
                <div className="ds-card-subtitle">Số Điện Thoại, Email, Địa Chỉ & Facebook cá nhân</div>
              </div>
              <span className="ds-badge ds-badge-emerald shrink-0">
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
              
              <div className="ds-grid-2">
                <div>
                  <label className="ds-field-label flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Số Điện Thoại / Zalo *
                  </label>
                  <input
                    type="tel"
                    required
                    value={selfData.phone}
                    onChange={(e) => setSelfData({ ...selfData, phone: e.target.value })}
                    placeholder="0981 234 567..."
                    className="ds-input"
                  />
                </div>

                <div>
                  <label className="ds-field-label flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Email Học Sinh *
                  </label>
                  <input
                    type="email"
                    required
                    value={selfData.email}
                    onChange={(e) => setSelfData({ ...selfData, email: e.target.value })}
                    placeholder="hoanglong.vmc@vinhbao.edu.vn..."
                    className="ds-input"
                  />
                </div>

                <div>
                  <label className="ds-field-label flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Ngày Sinh (DD/MM/YYYY) *
                  </label>
                  <input
                    type="text"
                    required
                    value={selfData.dob}
                    onChange={(e) => setSelfData({ ...selfData, dob: e.target.value })}
                    placeholder="01/01/2009..."
                    className="ds-input"
                  />
                </div>
              </div>

              <div className="ds-grid-2">
                <div>
                  <label className="ds-field-label flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Địa Chỉ Thường Trú *
                  </label>
                  <input
                    type="text"
                    required
                    value={selfData.address}
                    onChange={(e) => setSelfData({ ...selfData, address: e.target.value })}
                    placeholder="Khu 3, Thị trấn Vĩnh Bảo, Vĩnh Bảo, Hải Phòng..."
                    className="ds-input"
                  />
                </div>

                <div>
                  <label className="ds-field-label flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Liên Hệ Facebook Cá Nhân *
                  </label>
                  <input
                    type="url"
                    required
                    value={selfData.facebook}
                    onChange={(e) => setSelfData({ ...selfData, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="ds-input"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="ds-btn ds-btn-primary"
                >
                  <Save className="w-4 h-4" />
                  <span>LƯU CẬP NHẬT THÔNG TIN</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 3: Lịch Sử Chức Vụ & Trạng Thái Thành Viên (Vertical Timeline) */}
          <div className="w-full bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border-default)] rounded-2xl p-6 shadow-xl space-y-6">
            
            {/* Header Khối với Badge Phân Quyền */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-default)] pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-white">Lịch Sử Chức Vụ & Trạng Thái Thành Viên</h3>
                  <p className="text-xs text-slate-400">Ghi nhận tiến trình tham gia, chuyển đổi chức vụ và trạng thái hoạt động tại VMC</p>
                </div>
              </div>

              {/* Action Button */}
              {isHRMember && (
                <button
                  onClick={() => setIsMilestoneModalOpen(true)}
                  className="bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Thêm Cột Mốc Mới</span>
                </button>
              )}
            </div>

            {/* UI Vertical Timeline với Đường Gạch Nối Border */}
            <div className="relative border-l-2 border-slate-700/80 space-y-6 ml-3 pl-6 py-2">
              {(() => {
                const rawList = (Array.isArray(cu.milestones) && cu.milestones.length > 0)
                  ? cu.milestones
                  : [
                      {
                        id: 'm1',
                        date: '12/10/2021',
                        title: `Gia nhập VMC (Thành viên ${cu.deptName || 'Ban Chuyên Môn'})`,
                        badgeText: '[Gia Nhập]'
                      },
                      {
                        id: 'm2',
                        date: '01/06/2022',
                        title: `Cập nhật chức vụ: ${cu.roleTitle || 'Thành Viên VMC'}`,
                        badgeText: '[Thăng Chức]'
                      }
                    ];

                // Filter out previous status node if present to prevent duplicate status entries
                const baseList = rawList.filter(m => {
                  const b = (m.badgeText || '').toLowerCase();
                  const t = (m.title || '').toLowerCase();
                  return !b.includes('đang hoạt động') && !b.includes('tạm nghỉ') && !b.includes('ngừng') && !t.includes('trạng thái:');
                });

                const isSuspended = cu.status === 'Suspended';
                const finalStatusNode = {
                  id: 'final-status-node',
                  date: isSuspended 
                    ? `Ngừng từ ${cu.suspendedAt || new Date().toLocaleDateString('vi-VN')}` 
                    : 'Hiện tại',
                  title: isSuspended 
                    ? 'Trạng Thái: Đã Tạm Nghỉ / Ngừng Hoạt Động tại CLB VMC' 
                    : 'Trạng Thái: Đang Hoạt Động Tích Cực tại VMC',
                  badgeText: isSuspended ? '[Tạm Nghỉ]' : '[Đang Hoạt Động]'
                };

                const fullList = [...baseList, finalStatusNode];

                return fullList.map((m, index) => {
                  const b = (m.badgeText || '').toLowerCase();
                  const t = (m.title || '').toLowerCase();

                  let badgeStyle = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 font-mono font-bold';
                  let iconBorder = 'border-cyan-500 text-cyan-400 bg-slate-900';
                  let Icon = m.icon || Clock;

                  if (b.includes('đang hoạt động') || t.includes('đang hoạt động')) {
                    badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 font-mono font-bold shadow-sm shadow-emerald-500/20';
                    iconBorder = 'border-emerald-400 text-emerald-300 bg-emerald-950/80';
                    Icon = ShieldCheck;
                  } else if (b.includes('tạm nghỉ') || b.includes('ngừng') || b.includes('khóa') || t.includes('tạm nghỉ') || t.includes('ngừng')) {
                    badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-mono font-bold shadow-sm shadow-rose-500/20';
                    iconBorder = 'border-rose-500 text-rose-400 bg-rose-950/80';
                    Icon = AlertCircle;
                  } else if (b.includes('gia nhập') || t.includes('gia nhập')) {
                    badgeStyle = 'bg-teal-500/15 text-teal-300 border-teal-500/40 font-mono font-bold';
                    iconBorder = 'border-teal-500 text-teal-400 bg-teal-950/80';
                    Icon = UserPlus;
                  } else if (b.includes('thăng chức') || b.includes('chức vụ') || t.includes('thăng chức') || t.includes('chức vụ')) {
                    badgeStyle = 'bg-purple-500/15 text-purple-300 border-purple-500/40 font-mono font-bold';
                    iconBorder = 'border-purple-500 text-purple-400 bg-purple-950/80';
                    Icon = Award;
                  } else if (b.includes('khen thưởng') || b.includes('cột mốc') || t.includes('khen thưởng')) {
                    badgeStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-mono font-bold';
                    iconBorder = 'border-amber-500 text-amber-400 bg-amber-950/80';
                    Icon = Sparkles;
                  }

                  return (
                    <div key={m.id || index} className="relative group">
                      {/* Node Bullet Icon trên đường gạch nối */}
                      <div className={`absolute -left-[37px] top-0.5 p-1.5 rounded-full border-2 ${iconBorder} shadow-md transition-transform group-hover:scale-110`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      {/* Nội dung Mốc Thời Gian */}
                      <div className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-default)]/80 transition-all hover:border-slate-700 space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          
                          {/* Thời gian */}
                          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{m.date}</span>
                          </div>

                          {/* Tag Trạng Thái (Right Badge) */}
                          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md border shrink-0 w-fit ${badgeStyle}`}>
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
                });
              })()}
            </div>

          </div>

        </div>

      </div>

      {/* Modal: Chỉnh Sửa Ảnh Đại Diện Thành Viên */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white animate-slide-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <h3 className="font-heading font-bold text-base text-white">Chỉnh Sửa Ảnh Đại Diện</h3>
              </div>
              <button 
                onClick={() => setIsAvatarModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAvatar} className="space-y-5 text-xs">
              
              {/* Live Preview Circle */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md overflow-hidden">
                  <img 
                    src={avatarPreview || cu.avatar} 
                    alt="Avatar Preview" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-[11px] text-slate-400">Xem trước ảnh đại diện</span>
              </div>

              {/* Upload File từ thiết bị */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold text-center">Tải Ảnh Mới Từ Thiết Bị</label>
                <label className="w-full py-4 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border-2 border-dashed border-blue-500/50 hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-white transition-all group">
                  <div className="p-3 rounded-full bg-blue-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-xs">Nhấp vào đây để chọn file ảnh từ máy tính</span>
                  <span className="text-[10px] text-slate-400">Định dạng JPG, PNG, WEBP (Tối đa 5MB)</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-all"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Lưu Ảnh Đại Diện</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Thêm Cột Mốc Lịch Sử Chức Vụ (Ban ĐN-NS / Admin) */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white animate-slide-up">
            
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-base text-white">Thêm Cột Mốc Chức Vụ Mới</h3>
              </div>
              <button 
                onClick={() => setIsMilestoneModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newMilestone.title.trim()) {
                showToast('Vui lòng nhập nội dung cột mốc chức vụ!', 'warning');
                return;
              }
              addMemberMilestone(cu.id, newMilestone);
              setIsMilestoneModalOpen(false);
              setNewMilestone({ date: new Date().toLocaleDateString('vi-VN'), title: '', badgeText: '[Chức vụ]' });
            }} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-400 font-semibold mb-1">1. Ngày Ghi Nhận (Ngày/Tháng/Năm) *</label>
                <input
                  type="text"
                  required
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                  placeholder="vd: 15/08/2025"
                  className="w-full px-3 py-2 bg-slate-950 border border-[var(--border-default)] rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">2. Nội Dung Cột Mốc / Chức Vụ Mới *</label>
                <input
                  type="text"
                  required
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder="vd: Thăng chức Trưởng Ban Đối Ngoại - Nhân Sự"
                  className="w-full px-3 py-2 bg-slate-950 border border-[var(--border-default)] rounded-xl text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">3. Nhãn Thẻ (Badge Text)</label>
                <input
                  type="text"
                  required
                  value={newMilestone.badgeText}
                  onChange={(e) => setNewMilestone({ ...newMilestone, badgeText: e.target.value })}
                  placeholder="vd: [Thăng chức] / [Gia nhập]"
                  className="w-full px-3 py-2 bg-slate-950 border border-[var(--border-default)] rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-all"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Xác Nhận Thêm Cột Mốc</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
