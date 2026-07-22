import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Camera, 
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
  UserCheck
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
    isAdmin
  } = useClub();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const pendingTasksCount = tasks.filter(t => t.status !== 'done').length;
  const pendingDraftsCount = drafts.filter(d => d.status === 'pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'tasks', label: 'Phân Công', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'equipment', label: 'Thiết Bị', icon: Camera },
    { id: 'drafts', label: 'Duyệt Bài', icon: FileText, badge: pendingDraftsCount },
    { id: 'resources', label: 'Tài Nguyên', icon: FolderGit2 },
    { id: 'members', label: 'Thành Viên', icon: Users },
    { id: 'profile', label: 'Hồ Sơ', icon: User, badge: 0 },
    { id: 'hr_dashboard', label: 'Thi Đua & Sinh Nhật', icon: Users, badge: 0 }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="container flex items-center justify-between h-16 px-4 sm:px-6">
        
        {/* Brand Logo - Compact & Spacious */}
        <div 
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-[#0a1128] border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-all overflow-hidden p-0.5 shrink-0">
            <img src="/vmc-logo.jpg" alt="VMC Logo" className="w-full h-full object-cover rounded-full" />
          </div>

          <div className="hidden sm:block">
            <span className="font-heading font-black text-base tracking-tight text-white block leading-none">
              VMC PORTAL
            </span>
            <span className="text-[10px] block text-slate-400 font-medium mt-0.5">
              THPT Vĩnh Bảo
            </span>
          </div>
        </div>

        {/* Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-full border border-white/10 shrink-0">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRestricted = !isAdmin && ['equipment', 'drafts', 'resources'].includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => !isRestricted && handleNavClick(item.id)}
                className={`flex flex-row items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all duration-200 ${
                  isRestricted ? 'opacity-30 blur-[1px] cursor-not-allowed' : ''
                } ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title={isRestricted ? 'Chức năng chỉ dành cho Admin' : ''}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full leading-none ${
                    isActive ? 'bg-white text-blue-700' : 'bg-blue-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* User Profile Card */}
          <div 
            className="relative"
            onMouseLeave={() => setIsUserDropdownOpen(false)}
          >
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              onMouseEnter={() => setIsUserDropdownOpen(true)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-900 border border-white/10 hover:border-blue-500/50 transition-all text-xs"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-blue-400 shrink-0"
              />
              <div className="text-left max-w-[120px] truncate hidden md:block">
                <div className="font-bold text-white text-xs truncate leading-tight">{currentUser.name}</div>
                <div className="text-[9px] text-blue-400 font-medium truncate">{currentUser.roleTitle}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Profile Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 glass-panel border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-slide-up space-y-1.5">
                {/* Account Info */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-0.5 text-xs">
                  <div className="font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-blue-400 font-medium truncate">{currentUser.roleTitle}</div>
                  <div className="text-[9px] text-slate-400 font-mono">Mã TV: {currentUser.memberCode} • Lớp {currentUser.class}</div>
                </div>

                {/* Attendance */}
                {isHRMember && (
                  <button
                    onClick={checkinAttendance}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Điểm Danh Sinh Hoạt</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold">+50 PTS</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setIsUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold text-left"
                >
                  <User className="w-4 h-4" />
                  <span>Xem Hồ Sơ Thành Viên</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white font-bold text-xs transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng Xuất Tài Khoản</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-800 text-slate-200 border border-white/10 hover:scale-105 transition-all shrink-0"
            title="Chuyển chế độ Giao diện"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-slate-800 text-slate-200 border border-white/10 shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-white/10 p-3 space-y-1.5 animate-slide-up">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRestricted = !isAdmin && ['equipment', 'drafts', 'resources'].includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => !isRestricted && handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isRestricted ? 'opacity-30 blur-[1px] cursor-not-allowed' : ''
                } ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
                title={isRestricted ? 'Chức năng chỉ dành cho Admin' : ''}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-blue-500 text-white px-2 py-0.2 rounded-full text-[10px] font-bold">
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
