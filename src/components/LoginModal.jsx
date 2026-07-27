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
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)] backdrop-blur-2xl border-b border-[var(--border-subtle)] supports-[backdrop-filter]:bg-[var(--bg-primary)]">
      {/* Tăng padding px-6 sm:px-10 lg:px-12 để đẩy Logo & User vào trong, không dính sát góc */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="relative flex items-center justify-between h-16 w-full">

          {/* CỘT TRÁI: Brand Logo */}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0 z-10"
          >
            <div className="relative w-9 h-9 rounded-xl bg-blue-600 border border-blue-500/30 shadow-lg shadow-blue-500/20 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-300 overflow-hidden p-0.5 shrink-0">
              <img src="/vmc-logo.jpg" alt="VMC Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-black text-sm tracking-tight text-slate-100 block leading-none">
                VMC PORTAL
              </span>
              <span className="text-[8.5px] block text-slate-400 font-medium mt-1 tracking-widest uppercase">
                THPT Vĩnh Bảo
              </span>
            </div>
          </div>

          {/* CỘT GIỮA: Absolute Centered Navigation (Căn chuẩn giữa 100%, chữ thu nhỏ thoáng mắt) */}
          <div className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
            <nav className="flex items-center gap-0.5 bg-[var(--bg-secondary)] backdrop-blur-sm px-2 py-1 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isRestricted = !isAdmin && ['equipment', 'resources'].includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => !isRestricted && handleNavClick(item.id)}
                    className={`relative flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-xl font-medium text-[11.5px] tracking-normal whitespace-nowrap transition-all duration-200 ${isRestricted ? 'opacity-30 blur-[1px] cursor-not-allowed' : ''
                      } ${isActive
                        ? 'bg-blue-600/20 text-blue-300 font-semibold shadow-sm border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[var(--bg-hover)] border border-transparent'
                      }`}
                    title={isRestricted ? 'Chức năng chỉ dành cho Admin' : ''}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full leading-none ${isActive ? 'bg-blue-500 text-white' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* CỘT PHẢI: Actions & User Info */}
          <div className="flex items-center justify-end gap-2 shrink-0 z-10">
            {/* Search Button (Mobile/Tablet) */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[var(--bg-hover)] transition-all"
              title="Tìm kiếm"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[var(--bg-hover)] transition-all relative"
              title="Thông báo"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>

            {/* User Profile */}
            <div
              className="relative"
              onMouseLeave={() => setIsUserDropdownOpen(false)}
            >
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-blue-500/30 hover:bg-[var(--bg-hover)] transition-all group"
              >
                <div className="relative">
                  <img
                    src={safeUser.avatar}
                    alt={safeUser.name}
                    className="w-6 h-6 rounded-md object-cover border border-blue-500/20 group-hover:border-blue-500/50 transition-colors"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[var(--bg-primary)]" />
                </div>
                <div className="text-left max-w-[100px] truncate hidden md:block">
                  <div className="font-semibold text-slate-200 text-[11px] truncate leading-tight">{safeUser.name}</div>
                  <div className="text-[9.5px] text-blue-400 font-medium truncate">{safeUser.roleTitle}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-500 shrink-0 transition-transform group-hover:rotate-180" />
              </button>

              {/* Profile Dropdown Content */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[var(--bg-secondary)] backdrop-blur-2xl border border-[var(--border-subtle)] rounded-2xl p-3 shadow-2xl z-50 animate-slide-up space-y-1.5">
                  <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5">
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
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500 hover:text-[var(--bg-primary)] font-semibold text-xs transition-all"
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
                    className="w-full flex items-center gap-2.5 p-3 rounded-xl hover:bg-[var(--bg-hover)] text-slate-300 hover:text-slate-100 transition-all text-xs font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span>Xem Hồ Sơ Thành Viên</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('settings'); setIsUserDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 p-3 rounded-xl hover:bg-[var(--bg-hover)] text-slate-300 hover:text-slate-100 transition-all text-xs font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Cài Đặt</span>
                  </button>

                  <div className="border-t border-[var(--border-subtle)] my-1" />

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
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border-subtle)] transition-all shrink-0"
              title="Chuyển chế độ giao diện"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[var(--bg-hover)] transition-all shrink-0"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {isSearchOpen && (
        <div className="xl:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] backdrop-blur-2xl px-4 py-3 animate-slide-up">
          <div className="relative flex items-center w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm thành viên, công việc..."
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none !pl-10 !pr-10 py-2"
              autoFocus
            />
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-3 text-slate-500 hover:text-slate-300"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[var(--bg-secondary)] backdrop-blur-2xl border-t border-[var(--border-subtle)] p-4 space-y-1.5 animate-slide-up">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRestricted = !isAdmin && ['equipment', 'resources'].includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => !isRestricted && handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all ${isRestricted ? 'opacity-30 blur-[1px] cursor-not-allowed' : ''
                  } ${isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-[var(--bg-hover)] border border-transparent'
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