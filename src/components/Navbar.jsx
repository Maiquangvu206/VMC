import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  FolderGit2,
  Users,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  UserCheck,
  ShieldCheck,
  UserPlus,
  Search,
  Bell,
  Settings,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const {
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    currentUser,
    checkinAttendance,
    logout,
    tasks,
    drafts,
    isHRMember,
    isAdmin,
    isSuperAdmin,
    isRecruitmentSeasonActive,
    showToast,
  } = useClub();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const safeUser = currentUser || {
    name: 'Thành Viên VMC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    roleTitle: 'Thành Viên VMC',
    memberCode: 'VMC-MEMBER',
    class: '10A1',
  };

  const pendingTasksCount = tasks.filter(t => t.status !== 'done').length;
  const pendingDraftsCount = drafts.filter(d => d.status === 'pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard, badge: 0 },
    { id: 'tasks', label: 'Phân Công', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'drafts', label: 'Duyệt Bài', icon: FileText, badge: pendingDraftsCount },
    { id: 'resources', label: 'Tài Nguyên', icon: FolderGit2, badge: 0 },
    { id: 'members', label: 'Thành Viên', icon: Users, badge: 0 },
    { id: 'profile', label: 'Hồ Sơ', icon: User, badge: 0 },
    { id: 'hr_dashboard', label: 'Thi Đua', icon: Sparkles, badge: 0 },
    ...(isSuperAdmin || isRecruitmentSeasonActive ? [{ id: 'recruitment', label: 'Tuyển Gen', icon: UserPlus, badge: 0 }] : []),
    ...(isSuperAdmin ? [{ id: 'admin_sessions', label: 'Quản Lý', icon: ShieldCheck, badge: 0 }] : []),
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f17]/80 backdrop-blur-2xl border-b border-white/[0.06] supports-[backdrop-filter]:bg-[#0b0f17]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-500/30 shadow-lg shadow-blue-500/20 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-300 overflow-hidden p-0.5 shrink-0">
              <img src="/vmc-logo.jpg" alt="VMC Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-black text-lg tracking-tight text-slate-100 block leading-none">
                VMC PORTAL
              </span>
              <span className="text-[10px] block text-slate-500 font-medium mt-0.5 tracking-widest uppercase">
                THPT Vĩnh Bảo
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1.5 rounded-2xl border border-white/[0.06]">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isRestricted = !isAdmin && ['equipment', 'resources'].includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => !isRestricted && handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs tracking-wide whitespace-nowrap transition-all duration-200 ${
                    isRestricted
                      ? 'opacity-30 blur-[1px] cursor-not-allowed'
                      : ''
                  } ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 shadow-lg shadow-blue-500/10 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                  title={isRestricted ? 'Chức năng chỉ dành cho Admin' : ''}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
              title="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all relative"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0b0f17]" />
            </button>

            {/* User Profile */}
            <div
              className="relative"
              onMouseLeave={() => setIsUserDropdownOpen(false)}
            >
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/30 hover:bg-white/[0.06] transition-all text-sm group"
              >
                <div className="relative">
                  <img
                    src={safeUser.avatar}
                    alt={safeUser.name}
                    className="w-8 h-8 rounded-lg object-cover border-2 border-blue-500/20 group-hover:border-blue-500/50 transition-colors"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0b0f17]" />
                </div>
                <div className="text-left max-w-[120px] truncate hidden md:block">
                  <div className="font-semibold text-slate-200 text-xs truncate leading-tight">{safeUser.name}</div>
                  <div className="text-[10px] text-blue-400 font-medium truncate">{safeUser.roleTitle}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform group-hover:rotate-180" />
              </button>

              {/* Profile Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-3 shadow-2xl z-50 animate-slide-up space-y-1.5">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                    <div className="flex items-center gap-3">
                      <img src={safeUser.avatar} alt={safeUser.name} className="w-10 h-10 rounded-xl object-cover border border-blue-500/20" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-100 text-sm truncate">{safeUser.name}</div>
                        <div className="text-[11px] text-blue-400 font-medium truncate">{safeUser.roleTitle}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">Mã TV: {safeUser.memberCode} • Lớp {safeUser.class}</div>
                  </div>

                  {isHRMember && (
                    <button
                      onClick={() => { checkinAttendance(); setIsUserDropdownOpen(false); }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 font-semibold text-xs transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        <span>Điểm Danh Sinh Hoạt</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold">+50 PTS</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setActiveTab('profile'); setIsUserDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 p-3 rounded-xl hover:bg-white/[0.04] text-slate-300 hover:text-slate-100 transition-all text-xs font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span>Xem Hồ Sơ Thành Viên</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('settings'); setIsUserDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 p-3 rounded-xl hover:bg-white/[0.04] text-slate-300 hover:text-slate-100 transition-all text-xs font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Cài Đặt</span>
                  </button>

                  <div className="border-t border-white/[0.06] my-1" />

                  <button
                    onClick={() => { setIsUserDropdownOpen(false); logout(); }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white font-semibold text-xs transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all shrink-0"
              title="Chuyển chế độ giao diện"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all shrink-0"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar (Expandable) */}
      {isSearchOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#0b0f17]/95 backdrop-blur-2xl px-4 py-3 animate-slide-up">
          <div className="flex items-center gap-3 bg-slate-900/80 border border-white/[0.08] rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm thành viên, công việc..."
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
              autoFocus
            />
            <button onClick={() => setIsSearchOpen(false)} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/95 backdrop-blur-2xl border-t border-white/[0.06] p-4 space-y-1.5 animate-slide-up">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRestricted = !isAdmin && ['equipment', 'resources'].includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => !isRestricted && handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isRestricted ? 'opacity-30 blur-[1px] cursor-not-allowed' : ''
                } ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
