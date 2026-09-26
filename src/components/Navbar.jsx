import React, { useState, useRef, useEffect } from 'react';
import { useClub } from '../context/ClubContext';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
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
    setIsAttendanceModalOpen,
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
  const dropdownRef = useRef(null);

  // Xử lý click outside chuẩn xác bằng mousedown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeUser = currentUser || {
    name: 'Thành Viên VMC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    roleTitle: 'Thành Viên VMC',
    memberCode: 'VMC-MEMBER',
    class: '',
  };

  const pendingTasksCount = tasks?.filter(t => t.status !== 'done')?.length || 0;
  const pendingDraftsCount = drafts?.filter(d => d.status === 'pending')?.length || 0;

  const navItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard, badge: 0 },
    { id: 'tasks', label: 'Phân Công', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'drafts', label: 'Duyệt Bài', icon: FileText, badge: pendingDraftsCount },
    { id: 'hr_dashboard', label: 'QLNS', icon: Sparkles, badge: 0 },
    ...(isSuperAdmin || isRecruitmentSeasonActive ? [{ id: 'recruitment', label: 'Tuyển Gen', icon: UserPlus, badge: 0 }] : []),
    ...(isSuperAdmin ? [{ id: 'admin_sessions', label: 'Hoạt Động', icon: ShieldCheck, badge: 0 }] : []),
    { id: 'members', label: 'Thành Viên', icon: Users, badge: 0 },
    { id: 'profile', label: 'Hồ Sơ', icon: User, badge: 0 },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAttendanceClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsUserDropdownOpen(false);
    handleNavClick('hr_dashboard');
    if (typeof checkinAttendance === 'function') {
      checkinAttendance();
    } else if (typeof setIsAttendanceModalOpen === 'function') {
      setIsAttendanceModalOpen(true);
    }
  };

  const handleProfileClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsUserDropdownOpen(false);
    handleNavClick('profile');
  };

  const handleLogoutClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsUserDropdownOpen(false);
    if (typeof logout === 'function') {
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/95 backdrop-blur-md border-b border-[#1f2937] w-full">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full gap-3 sm:gap-6">

          {/* BRAND LOGO & TITLE */}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 border border-blue-500/30 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              <img src="/vmc-logo.jpg" alt="VMC Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-xs sm:text-sm tracking-tight text-slate-100 block leading-none">
                VMC PORTAL
              </span>
            </div>
          </div>

          {/* DESKTOP NAVIGATION BAR */}
          <nav className="hidden xl:flex items-center gap-1.5 bg-[#111827] px-2.5 py-1.5 rounded-xl border border-[#1f2937] shrink min-w-0 max-w-full overflow-x-auto scrollbar-none">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-[12.5px] font-semibold tracking-wide transition-all whitespace-nowrap ${isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2937] border border-transparent'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-90" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full leading-none ${isActive ? 'bg-blue-500 text-white' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT UTILITIES & USER PROFILE */}
          <div className="flex items-center gap-2.5 shrink-0 ml-auto xl:ml-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1f2937] border border-[#1f2937] transition-all shrink-0"
              title="Chuyển chế độ giao diện"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>

            {/* User Dropdown Button */}
            <div ref={dropdownRef} className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserDropdownOpen(prev => !prev);
                  setIsMobileMenuOpen(false);
                }}
                className="user-dropdown-toggle flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#111827] border border-[#1f2937] hover:border-slate-700 hover:bg-[#1f2937] transition-all cursor-pointer"
              >
                <img
                  src={safeUser.avatar}
                  alt={safeUser.name}
                  className="w-6.5 h-6.5 rounded-lg object-cover border border-slate-700 shrink-0 pointer-events-none"
                />
                <div className="text-left max-w-[100px] sm:max-w-[130px] xl:max-w-[160px] truncate hidden md:block pointer-events-none">
                  <div className="font-semibold text-slate-200 text-xs truncate leading-tight">{safeUser.name}</div>
                  <div className="text-[9.5px] text-blue-400 font-medium truncate leading-tight">{safeUser.roleTitle}</div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform pointer-events-none ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div
                  className="user-dropdown-menu absolute right-0 top-full mt-2 w-64 bg-[#111827] border border-[#1f2937] rounded-xl p-2.5 shadow-xl z-50 space-y-1 animate-slide-up pointer-events-auto"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="p-2.5 rounded-lg bg-[#0f172a] border border-[#1f2937] space-y-1">
                    <div className="font-bold text-slate-100 text-xs truncate">{safeUser.name}</div>
                    <div className="text-[11px] text-blue-400 font-medium truncate">{safeUser.roleTitle}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Mã TV: {safeUser.memberCode}</div>
                  </div>

                  {(isHRMember || isAdmin || isSuperAdmin) && (
                    <button
                      type="button"
                      onClick={handleAttendanceClick}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white font-semibold text-xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 shrink-0" />
                        <span>Điểm Danh Sinh Hoạt</span>
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-[#1f2937] text-slate-300 hover:text-slate-100 transition-all text-xs font-medium cursor-pointer"
                  >
                    <User className="w-4 h-4 shrink-0" />
                    <span>Xem Hồ Sơ Cá Nhân</span>
                  </button>

                  <div className="border-t border-[#1f2937] my-1" />

                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile / Tablet Drawer Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(prev => !prev);
                setIsUserDropdownOpen(false);
              }}
              className="xl:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1f2937] border border-[#1f2937] transition-all shrink-0"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE / TABLET DRAWER */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#111827] border-t border-[#1f2937] px-4 py-3 space-y-1 shadow-2xl">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-semibold text-xs transition-all ${isActive
                  ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-[#1f2937] border border-transparent'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
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