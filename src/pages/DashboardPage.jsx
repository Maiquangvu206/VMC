import React from 'react';
import { useClub } from '../context/ClubContext';
import { MEMBER_RESOURCES } from '../data/mockData';
import { 
  UserCheck, 
  Award, 
  Download, 
  Bell, 
  CheckCircle, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  FileText,
  TrendingUp,
  Clock,
  Star,
  Target,
  BookOpen,
  Camera,
  Video,
  Palette,
  Music,
  ArrowRight,
  Heart,
  Eye
} from 'lucide-react';

const Loading = () => (
  <div className="page-wrap py-10 flex items-center justify-center min-h-screen">
    <div className="text-slate-400 text-sm font-mono animate-pulse">Đang tải...</div>
  </div>
);

export const DashboardPage = () => {
  const { user, checkinAttendance, resources = [], isHRMember } = useClub();

  if (!user) {
    return <Loading />;
  }

  const handleDownloadResource = (resource) => {
    if (resource.driveUrl) {
      window.open(resource.driveUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Đã bắt đầu tải xuống tài nguyên thành viên: ${resource.name} (${resource.size})`);
    }
  };

  const displayResources = resources.length > 0 ? resources : (MEMBER_RESOURCES || []);

  const statCards = [
    { label: 'Điểm Đóng Góp', value: user?.points || 0, suffix: 'PTS', icon: TrendingUp, color: 'blue', trend: '+12%' },
    { label: 'Cấp Độ', value: 'PRO', suffix: 'CREATOR', icon: Star, color: 'purple', trend: '' },
    { label: 'Huy Hiệu', value: user?.badges?.length ?? 0, suffix: 'Badges', icon: Award, color: 'amber', trend: '' },
    { label: 'Số Buổi Điểm Danh', value: user?.checkins || 0, suffix: 'buổi', icon: Clock, color: 'cyan', trend: '+3' },
  ];

  const committeeDepts = [
    { name: 'Ban Chủ Nhiệm', icon: Crown, color: 'purple', count: 3, lead: 'Chủ Nhiệm CLB' },
    { name: 'Ban Nội Dung - Phát Thanh', icon: Mic, color: 'cyan', count: 12, lead: 'Trưởng Ban ND-PH' },
    { name: 'Ban Sản Xuất', icon: Film, color: 'blue', count: 18, lead: 'Trưởng Ban SX' },
    { name: 'Ban Đối Ngoại - Nhân Sự', icon: Handshake, color: 'emerald', count: 8, lead: 'Trưởng Ban ĐN-NS' },
    { name: 'Ban Cố Vấn', icon: Award, color: 'amber', count: 4, lead: 'Cố Vấn CLB' },
  ];

  const deptIcons = {
    photo: Camera,
    media: Video,
    design: Palette,
    music: Music
  };

  return (
    <div className="page-wrap py-8 space-y-8 pb-20">
      
      {/* Header Profile Card */}
      <div className="ds-card-glass p-6 sm:p-8 rounded-2xl border border-purple-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-purple-500 to-pink-500 shrink-0">
              <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover rounded-[14px]" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <h1 className="font-heading text-2xl font-bold text-white">{user?.name}</h1>
                <span className="ds-badge ds-badge-emerald flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ban Nhiếp Ảnh • Mã thành viên: <span className="font-mono text-purple-400 font-bold">VMC-2026-089</span>
              </p>
            </div>
          </div>

          {/* Quick Check-in Button */}
          <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
            {isHRMember && (
              <button
                onClick={checkinAttendance}
                className="ds-btn ds-btn-primary px-6 py-3 shadow-lg shadow-purple-600/40 text-sm"
              >
                <UserCheck className="w-5 h-5" />
                <span>Điểm Danh Sinh Hoạt (+50 Pts)</span>
              </button>
            )}
            <span className="text-[11px] text-slate-400">
              Đã tham gia: <strong className="text-white font-mono">{user?.checkins} buổi</strong>
            </span>
          </div>

        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                  <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                </div>
                <div className="font-heading font-extrabold text-2xl text-white font-mono mt-1">
                  {stat.value}<span className="text-sm text-slate-400 font-normal ml-1">{stat.suffix}</span>
                </div>
                {stat.trend && (
                  <div className="text-[10px] text-emerald-400 font-medium mt-1">{stat.trend}</div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* 5 Ban Chuyên Môn */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>5 Ban Chuyên Môn</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Tổng cộng {committeeDepts.reduce((a, d) => a + d.count, 0)} thành viên</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {committeeDepts.map((dept, idx) => {
            const Icon = deptIcons[dept.name.toLowerCase().includes('sản xuất') ? 'film' : dept.name.toLowerCase().includes('nội dung') ? 'mic' : dept.name.toLowerCase().includes('đối ngoại') ? 'handshake' : dept.name.toLowerCase().includes('cố vấn') ? 'award' : 'crown'];
            return (
              <div
                key={idx}
                className="ds-card p-5 rounded-2xl hover:border-blue-500/40 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-${dept.color}-500/10 text-${dept.color}-400 flex items-center justify-center border border-${dept.color}-500/20 group-hover:bg-${dept.color}-500 group-hover:text-white transition-all`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="ds-badge ds-badge-blue text-[10px]">
                    {dept.count} TV
                  </span>
                </div>
                <h3 className="font-heading font-bold text-sm text-slate-100 group-hover:text-blue-300 transition-colors mb-1">
                  {dept.name}
                </h3>
                <p className="text-[11px] text-slate-400">{dept.lead}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Huy hiệu & Thành tích */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Huy Hiệu & Danh Hiệu Của Bạn</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(user?.badges || []).map((badge, idx) => (
            <div
              key={idx}
              className="ds-card p-4 rounded-xl border border-white/10 flex items-center gap-3 hover:border-amber-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-sm text-white">{badge}</h4>
                <span className="text-[10px] text-slate-400">Đã cấp bởi BCN VMC</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kho Tài Nguyên */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>Kho Tài Nguyên Sáng Tạo</span>
          </h2>
          <span className="text-xs text-purple-400 font-semibold">Tải miễn phí cho thành viên VMC</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayResources.map(res => (
            <div
              key={res.id}
              className="ds-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-all"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="ds-badge ds-badge-purple">{res.category}</span>
                  <span className="text-[10px] font-mono text-slate-400">{res.type} • {res.size}</span>
                </div>
                <h4 className="font-heading font-semibold text-sm text-white line-clamp-2">
                  {res.name}
                </h4>
              </div>

              <button
                onClick={() => handleDownloadResource(res)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Tải File Này</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Thông báo nội bộ */}
      <div className="ds-card p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-pink-400" />
          <span>Thông Báo Nội Bộ Ban Chủ Nhiệm</span>
        </h3>

        <div className="space-y-3">
          {[
            { date: "Hôm nay", title: "Mở đơn đăng ký mượn thiết bị Studio tuần tới (Máy ảnh, Đèn studio)", tag: "HOT" },
            { date: "Hôm qua", title: "Nhắc nhở nộp tác phẩm cho số Tạp chí Photobook Tháng 8 trước 23:59", tag: "IMPORTANT" },
            { date: "18/07", title: "Kết quả chấm giải Phim Ngắn Fest 2026 đã được cập nhật trên trang chủ", tag: "INFO" }
          ].map((notice, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 text-xs border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-mono shrink-0">{notice.date}</span>
                <span className="text-slate-200 font-medium line-clamp-1">{notice.title}</span>
              </div>
              <span className="ds-badge ds-badge-rose shrink-0">{notice.tag}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
