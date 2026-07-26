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
  UserPlus
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
    isRecruitmentSeasonActive
  } = useClub();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const safeUser = currentUser || {
    name: 'Thành Viên VMC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    roleTitle: 'Thành Viên VMC',
    memberCode: 'VMC-MEMBER',
    class: '10A1'
  };

  const pendingTasksCount = tasks.filter(t => t.status !== 'done').length;
  const pendingDraftsCount = drafts.filter(d => d.status === 'pending').length;

  const currentUserRoleTitle = String(currentUser?.roleTitle || '').toLowerCase();
  const currentUserDeptName = String(currentUser?.deptName || currentUser?.department || '').toLowerCase();

  const isHRHead = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUserRoleTitle.includes('super admin') ||
    (currentUserRoleTitle.includes('tr\u01b0\u1edfng ban') && (
      currentUserDeptName.includes('\u0111\u1ed1i ngo\u1ea1i') ||
      currentUserDeptName.includes('nh\u00e2n s\u1ef1') ||
      currentUserDeptName.includes('\u0111n-ns') ||
      currentUserDeptName.includes('dn-ns')
    ))
  );

  const navItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'tasks', label: 'Phân Công', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'drafts', label: 'Duyệt Bài', icon: FileText, badge: pendingDraftsCount },
    { id: 'resources', label: 'Tài Nguyên', icon: FolderGit2 },
    { id: 'members', label: 'Thành Viên', icon: Users },
    { id: 'profile', label: 'Hồ Sơ', icon: User, badge: 0 },
    { id: 'hr_dashboard', label: 'Thi Đua & Sinh Nhật', icon: Users, badge: 0 },
    ...(isSuperAdmin || isRecruitmentSeasonActive ? [{ id: 'recruitment', label: 'Tuyển Gen', icon: UserPlus, badge: 0 }] : []),
    ...(isSuperAdmin ? [{ id: 'admin_sessions', label: 'Quản Lý Phiên', icon: ShieldCheck, badge: 0 }] : [])
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f17]/95 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-500/30 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all overflow-hidden p-0.5 shrink-0">
            <img src="/vmc-logo.jpg" alt="VMC Logo" className="w-full h-full object-cover rounded-lg" />
          </div>

          <div className="hidden sm:block">
            <span className="font-heading font-black text-lg tracking-tight text-slate-100 block leading-none">
              VMC PORTAL
            </span>
            <span className="text-xs block text-slate-400 font-medium mt-0.5">
              THPT Vĩnh Bảo
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 px-3 py-2 rounded-2xl border border-slate-700/50 shrink-0">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRestricted = !isAdmin && ['equipment', 'resources'].includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => !isRestricted && handleNavClick(item.id)}
                className={`flex flex-row items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                  isRestricted ? 'opacity-30 blur-[1px] cursor-not-allowed' : ''
                } ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
                title={isRestricted ? 'Chức năng chỉ dành cho Admin' : ''}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full leading-none ${
                    isActive ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* User Profile Card */}
          <div 
            className="relative"
            onMouseLeave={() => setIsUserDropdownOpen(false)}
          >
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              onMouseEnter={() => setIsUserDropdownOpen(true)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/50 hover:border-blue-500/50 transition-all text-sm"
            >
              <img
                src={safeUser.avatar}
                alt={safeUser.name}
                className="w-9 h-9 rounded-lg object-cover border-2 border-blue-500/30 shrink-0"
              />
              <div className="text-left max-w-[140px] truncate hidden md:block">
                <div className="font-bold text-slate-100 text-sm truncate leading-tight">{safeUser.name}</div>
                <div className="text-xs text-blue-400 font-medium truncate">{safeUser.roleTitle}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {/* Profile Dropdown */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-3 shadow-2xl z-50 animate-slide-up space-y-2">
                {/* Account Info */}
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1 text-sm">
                  <div className="font-bold text-slate-100 truncate">{safeUser.name}</div>
                  <div className="text-xs text-blue-400 font-medium truncate">{safeUser.roleTitle}</div>
                  <div className="text-xs text-slate-400 font-mono">Mã TV: {safeUser.memberCode} • Lớp {safeUser.class}</div>
                </div>

                {/* Attendance */}
                {isHRMember && (
                  <button
                    onClick={checkinAttendance}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 font-semibold text-sm transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      <span>Điểm Danh Sinh Hoạt</span>
                    </div>
                    <span className="text-xs font-mono font-bold">+50 PTS</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setIsUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 text-blue-300 hover:bg-blue-500 hover:text-white transition-all text-sm font-semibold text-left"
                >
                  <User className="w-5 h-5" />
                  <span>Xem Hồ Sơ Thành Viên</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white font-semibold text-sm transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng Xuất Tài Khoản</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700/50 hover:border-blue-500/50 transition-all shrink-0"
            title="Chuyển chế độ Giao diện"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700/50 shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 p-4 space-y-2 animate-slide-up">
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
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title={isRestricted ? 'Chức năng chỉ dành cho Admin' : ''}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-blue-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
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
