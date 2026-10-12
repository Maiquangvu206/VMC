import React from 'react';
import { useClub } from '../context/ClubContext';
import { splitRoleTitles } from '../utils/roleHelper';
import {
  CheckSquare,
  FileText,
  Bell,
  Plus,
  ArrowRight,
  ShieldCheck,
  Crown,
  Mic,
  Film,
  Handshake,
  Users,
  Award,
  TrendingUp,
  Activity,
  Clock,
  Target,
  Zap,
  X
} from 'lucide-react';

const Loading = () => (
  <div className="page-wrap flex items-center justify-center min-h-screen">
    <div className="text-slate-400 text-sm font-mono animate-pulse">Đang tải...</div>
  </div>
);

export const InternalDashboard = () => {
  const {
    currentUser,
    members,
    tasks,
    equipment,
    drafts,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    isAdmin,
    isAdvisor: isAdvisorFromContext,
    setActiveTab,
    setMembersFilterDept,
    setIsNewTaskModalOpen,
    setIsNewDraftModalOpen,
    setIsBorrowModalOpen,
    setIsNewAccountModalOpen,
    clubInfo
  } = useClub();

  if (!currentUser) {
    return <Loading />;
  }

  const isAdvisor = isAdvisorFromContext || Boolean(
    currentUser?.deptName?.toLowerCase().includes('cố vấn') ||
    currentUser?.department?.toLowerCase().includes('cố vấn') ||
    currentUser?.roleTitle?.toLowerCase().includes('cố vấn') ||
    currentUser?.roleTitle?.toLowerCase().includes('cựu')
  );

  const [isAnnModalOpen, setIsAnnModalOpen] = React.useState(false);
  const [annTitle, setAnnTitle] = React.useState('');
  const [annContent, setAnnContent] = React.useState('');
  const [annPinned, setAnnPinned] = React.useState(false);

  const canManageAnnouncements = Boolean(
    isAdmin ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUser?.roleTitle?.includes('Chủ Nhiệm') ||
    currentUser?.roleTitle?.includes('Super Admin') ||
    currentUser?.roleTitle?.includes('Trưởng Ban') ||
    currentUser?.roleTitle?.includes('Phó Ban')
  );

  const getDepartmentMemberCount = (deptId) => {
    if (!members || !Array.isArray(members)) return 0;
    return members.filter(m => {
      const deptName = (m.deptName || m.department || '').toLowerCase();
      const roleTitle = (m.roleTitle || m.role_title || m.role || '').toLowerCase();

      if (deptId === 'bcn') {
        return deptName.includes('chủ nhiệm') || deptName.includes('bcn') || roleTitle.includes('chủ nhiệm') || roleTitle.includes('phó chủ nhiệm');
      }
      if (deptId === 'content_radio') {
        return deptName.includes('nội dung') || deptName.includes('phát thanh');
      }
      if (deptId === 'production') {
        return deptName.includes('sản xuất') || deptName.includes('media') || deptName.includes('kỹ thuật');
      }
      if (deptId === 'hr_external') {
        return deptName.includes('đối ngoại') || deptName.includes('nhân sự') || deptName.includes('đn-ns');
      }
      if (deptId === 'advisory') {
        return deptName.includes('cố vấn') || roleTitle.includes('cố vấn');
      }
      return false;
    }).length;
  };

  const renderDepartmentLeadership = (dept) => {
    const deptId = (dept.id || '').toLowerCase();
    const deptName = (dept.name || '').toLowerCase();

    if (deptId.includes('advisory') || deptId.includes('cv') || deptName.includes('cố vấn')) {
      return null;
    }

    const deptMembers = (members || []).filter(m => {
      const mDept = (m.deptName || m.department || '').toLowerCase();
      if (deptId === 'bcn' || deptName.includes('chủ nhiệm')) {
        return mDept.includes('chủ nhiệm') || mDept.includes('bcn');
      }
      if (deptId === 'content_radio' || deptName.includes('nội dung')) {
        return mDept.includes('nội dung') || mDept.includes('phát thanh');
      }
      if (deptId === 'production' || deptName.includes('sản xuất')) {
        return mDept.includes('sản xuất') || mDept.includes('media');
      }
      if (deptId === 'hr_external' || deptName.includes('đối ngoại') || deptName.includes('nhân sự')) {
        return mDept.includes('đối ngoại') || mDept.includes('nhân sự') || mDept.includes('đn-ns');
      }
      return false;
    });

    if (deptId === 'bcn' || deptName.includes('chủ nhiệm')) {
      const leader = deptMembers.find(m => {
        const title = (m.roleTitle || m.role_title || '').toLowerCase();
        return title.includes('chủ nhiệm') && !title.includes('phó');
      });
      const viceLeaders = deptMembers.filter(m => {
        const title = (m.roleTitle || m.role_title || '').toLowerCase();
        return title.includes('phó chủ nhiệm');
      });

      const leaderName = leader ? (leader.name || leader.full_name) : 'Vũ Mai Quang';
      const viceNames = viceLeaders.length > 0 ? viceLeaders.map(m => m.name || m.full_name).join(', ') : 'Chưa cập nhật';

      return (
        <div className="text-xs space-y-0.5 mt-1">
          <div className="text-purple-300 font-semibold">
            <span className="text-purple-400 font-bold">Chủ Nhiệm:</span> {leaderName}
          </div>
          <div className="text-slate-300">
            <span className="text-slate-400 font-semibold">Phó Chủ Nhiệm:</span> {viceNames}
          </div>
        </div>
      );
    }

    const leader = deptMembers.find(m => {
      const title = (m.roleTitle || m.role_title || '').toLowerCase();
      return title.includes('trưởng ban');
    });
    const viceLeaders = deptMembers.filter(m => {
      const title = (m.roleTitle || m.role_title || '').toLowerCase();
      return title.includes('phó ban');
    });

    const leaderName = leader ? (leader.name || leader.full_name) : (dept.lead || 'Chưa cập nhật');
    const viceNames = viceLeaders.length > 0 ? viceLeaders.map(m => m.name || m.full_name).join(', ') : 'Chưa cập nhật';

    return (
      <div className="text-xs space-y-0.5 mt-1">
        <div className="text-purple-300 font-semibold">
          <span className="text-purple-400 font-bold">Trưởng Ban:</span> {leaderName}
        </div>
        <div className="text-slate-300">
          <span className="text-slate-400 font-semibold">Phó Ban:</span> {viceNames}
        </div>
      </div>
    );
  };

  const safeUser = {
    name: currentUser?.name || 'Thành Viên VMC',
    avatar: currentUser?.avatar || currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    roleTitle: currentUser?.roleTitle || 'Thành Viên VMC',
    memberCode: currentUser?.memberCode || 'VMC-MEMBER',
    class: isAdvisor ? '' : (currentUser?.class || ''),
    deptName: currentUser?.deptName || (isAdvisor ? 'Ban Cố Vấn' : 'Ban Chuyên Môn'),
    points: currentUser?.points ?? 0,
    role: currentUser?.role || 'member'
  };

  const doingTasks = (tasks || []).filter(t => t?.status === 'doing');
  const doneTasks = (tasks || []).filter(t => t?.status === 'done');
  const pendingDrafts = (drafts || []).filter(d => d?.status === 'pending');
  const borrowedEquipment = (equipment || []).filter(e => e?.status === 'borrowed');

  const deptIcons = {
    bcn: Crown,
    content_radio: Mic,
    production: Film,
    hr_external: Handshake,
    advisory: Award
  };

  const statCards = [
    { label: 'Nhiệm Vụ Đang Làm', value: doingTasks.length, icon: Target, color: 'blue', trend: '' },
    { label: 'Kịch Bản Chờ Duyệt', value: pendingDrafts.length, icon: FileText, color: 'amber', trend: '' },
    { label: 'Thiết Bị Đang Mượn', value: borrowedEquipment.length, icon: Activity, color: 'cyan', trend: '' },
    { label: 'Công Việc Đã Xong', value: doneTasks.length, icon: CheckSquare, color: 'emerald', trend: '' },
  ];

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20">

      {/* Welcome Banner */}
      <div className="ds-card p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 lg:gap-8 relative z-10">

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden p-0.5 bg-blue-500 shrink-0 shadow-lg shadow-blue-500/20">
              <img
                src={safeUser.avatar}
                alt={safeUser.name}
                onError={(e) => { e.currentTarget.src = '/vmc-logo.jpg'; }}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100">
                  Xin chào, {safeUser.name}!
                </h1>
                <div className="flex flex-col gap-1 items-start">
                  {splitRoleTitles(safeUser.roleTitle).map((role, idx) => (
                    <span key={idx} className="ds-badge ds-badge-blue font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> {role}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Thuộc: <strong className="text-blue-400">{safeUser.deptName}</strong>
                {!isAdvisor && (
                  <>
                    {safeUser.class && safeUser.class !== 'N/A' && (
                      <> • Lớp <strong className="text-slate-100">{safeUser.class}</strong></>
                    )}
                    {' • Điểm thi đua: '}
                    <strong className="text-amber-400 font-mono">{safeUser.points ?? 0} PTS</strong>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          {!isAdvisor && (
            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('tasks');
                  setIsNewTaskModalOpen(true);
                }}
                className="ds-btn ds-btn-primary"
              >
                <Plus className="w-4 h-4" />
                <span>Giao Việc Mới</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('drafts');
                  setIsNewDraftModalOpen(true);
                }}
                className="ds-btn ds-btn-secondary"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Soạn Kịch Bản</span>
              </button>
            </div>
          )}

        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-8 pt-6 border-t border-[var(--border-default)]">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="ds-card p-3 sm:p-4 lg:p-6 text-center hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400 font-medium">{stat.label}</span>
                  <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                </div>
                <div className="font-heading font-extrabold text-3xl text-white font-mono mt-1">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Department Overview */}
      <div className="space-y-6">
        <h2 className="font-heading font-bold text-2xl text-slate-100 flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-400" />
          <span>5 Ban Chuyên Môn Trong CLB VMC</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {(clubInfo?.departments || []).map(dept => {
            const Icon = deptIcons[dept.id] || Users;
            return (
              <div
                key={dept.id}
                onClick={() => {
                  setMembersFilterDept(dept.name);
                  setActiveTab('members');
                }}
                className="ds-card p-3 sm:p-4 lg:p-6 cursor-pointer group flex flex-col justify-between hover:border-blue-500/50 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 border border-blue-500/20">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="ds-badge ds-badge-blue">
                      {getDepartmentMemberCount(dept.id)} TV
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-lg text-slate-100 group-hover:text-blue-300 transition-colors">
                      {dept.name}
                    </h3>
                    {renderDepartmentLeadership(dept)}
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                    {dept.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Announcements Section */}
      <div className="ds-card p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-slate-100">Bảng Tin & Thông Báo CLB</h3>
              <p className="text-xs text-slate-400 mt-0.5">Thông báo chính thức từ Ban Chủ Nhiệm và các Ban Chuyên Môn</p>
            </div>
          </div>
          {canManageAnnouncements && (
            <button
              onClick={() => setIsAnnModalOpen(true)}
              className="ds-btn ds-btn-primary ds-btn-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng Thông Báo Mới</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          {(!announcements || announcements.length === 0) ? (
            <div className="text-center py-12 text-slate-400 text-sm italic">
              Chưa có thông báo nào từ Ban Chủ Nhiệm.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map(ann => (
                <div key={ann.id} className={`ds-card p-5 space-y-3 relative group hover:border-slate-500 transition-all ${ann.isPinned ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-400 font-mono text-xs font-semibold">{ann.date || 'Hôm nay'}</span>
                    <div className="flex items-center gap-2">
                      <span className={`ds-badge ${ann.isPinned ? 'ds-badge-rose' : 'ds-badge-purple'}`}>
                        {ann.priority || (ann.isPinned ? '📌 Ghim đầu' : 'Thông báo')}
                      </span>
                      {canManageAnnouncements && (
                        <button
                          onClick={() => deleteAnnouncement(ann.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Xóa thông báo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-base text-slate-100 leading-snug">{ann.title}</h4>
                  <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{ann.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcement Modal */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="ds-card p-3 sm:p-4 lg:p-6 w-full max-w-lg shadow-2xl text-white space-y-6 border border-blue-500/30">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-100">ĐĂNG THÔNG BÁO BAN CHỦ NHIỆM</h3>
              </div>
              <button onClick={() => setIsAnnModalOpen(false)} className="ds-btn ds-btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!annTitle || !annContent) return;
              await addAnnouncement({ title: annTitle, content: annContent, isPinned: annPinned });
              setAnnTitle('');
              setAnnContent('');
              setAnnPinned(false);
              setIsAnnModalOpen(false);
            }} className="space-y-5">
              <div>
                <label className="ds-field-label">Tiêu Đề Thông Báo *</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Nhập tiêu đề thông báo..."
                  className="ds-input"
                />
              </div>

              <div>
                <label className="ds-field-label">Nội Dung Thông Báo *</label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Nhập nội dung thông báo gửi tới toàn thể thành viên CLB..."
                  className="ds-textarea"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="pinAcc"
                  checked={annPinned}
                  onChange={(e) => setAnnPinned(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="pinAcc" className="text-sm text-slate-300 font-medium cursor-pointer">
                  📌 Ghim thông báo này lên đầu trang
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="ds-btn ds-btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="ds-btn ds-btn-primary"
                >
                  ĐĂNG THÔNG BÁO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
