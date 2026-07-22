import React from 'react';
import { useClub } from '../context/ClubContext';
import { CLUB_INFO } from '../data/mockData';
import { 
  CheckSquare, 
  Camera, 
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
  Award
} from 'lucide-react';

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
    setActiveTab, 
    setIsNewTaskModalOpen,
    setIsNewDraftModalOpen
  } = useClub();

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

  const safeUser = currentUser || {
    name: 'Thành Viên VMC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    roleTitle: 'Thành Viên VMC',
    memberCode: 'VMC-MEMBER',
    class: '12A1',
    deptName: 'Ban Chủ Nhiệm',
    points: 100
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

  return (
    <div className="container py-8 space-y-8 pb-20">
      
      {/* Welcome Banner Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/30 relative overflow-hidden bg-gradient-to-r from-[#131d33] via-[#162447] to-[#0b1120] shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 shrink-0 shadow-md">
              <img src={safeUser.avatar} alt={safeUser.name} className="w-full h-full object-cover rounded-[14px]" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-white">
                  Xin chào, {safeUser.name}!
                </h1>
                <span className="badge badge-purple flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> {safeUser.roleTitle}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Thuộc: <strong className="text-blue-400">{safeUser.deptName}</strong> • Lớp <strong className="text-white">{safeUser.class}</strong> • Điểm thi đua: <strong className="text-amber-400 font-mono">{safeUser.points} PTS</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => {
                setActiveTab('tasks');
                setIsNewTaskModalOpen(true);
              }}
              className="btn-primary text-xs px-4 py-2.5 shadow-md shadow-blue-600/30 font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Việc Mới</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('drafts');
                setIsNewDraftModalOpen(true);
              }}
              className="btn-secondary text-xs px-4 py-2.5 font-semibold"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Soạn Kịch Bản / Bài Đăng</span>
            </button>
          </div>

        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-center">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-medium">Nhiệm Vụ Đang Làm</div>
            <div className="font-heading font-extrabold text-2xl text-blue-400 font-mono mt-1">
              {doingTasks.length}
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-medium">Kịch Bản Chờ Duyệt</div>
            <div className="font-heading font-extrabold text-2xl text-amber-400 font-mono mt-1">
              {pendingDrafts.length}
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-medium">Thiết Bị Đang Mượn</div>
            <div className="font-heading font-extrabold text-2xl text-cyan-400 font-mono mt-1">
              {borrowedEquipment.length}
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 shadow-inner">
            <div className="text-xs text-slate-400 font-medium">Công Việc Đã Xong</div>
            <div className="font-heading font-extrabold text-2xl text-emerald-400 font-mono mt-1">
              {doneTasks.length}
            </div>
          </div>
        </div>

      </div>

      {/* 4 Ban Chuyên Môn trong CLB */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <span>5 Ban Chuyên Môn Trong CLB VMC</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CLUB_INFO.departments.map(dept => {
            const Icon = deptIcons[dept.id] || Users;
            return (
              <div
                key={dept.id}
                onClick={() => setActiveTab('tasks')}
                className="glass-card p-5 rounded-2xl border border-white/10 space-y-3 hover:border-blue-500/40 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/5">
                      {getDepartmentMemberCount(dept.id)} Thành viên
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-base text-white group-hover:text-blue-300 transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-purple-400 font-semibold mt-0.5">
                      Trưởng Ban: {dept.lead}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {dept.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tasks & Drafts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Tasks */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-400" />
                <span>Nhiệm Vụ Đang Phân Công</span>
              </h2>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>Vào Bảng Nhiệm Vụ ({tasks.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 hover:border-blue-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="badge badge-purple">{task.department.toUpperCase()}</span>
                    <span className="text-slate-400 font-mono">Hạn: {task.deadline}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-white">{task.title}</h3>
                  <p className="text-xs text-slate-400">Phụ trách: <span className="text-slate-200 font-medium">{task.assignee}</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Drafts */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Kịch Bản Radio & Bài Đăng Chờ Duyệt</span>
              </h2>
              <button
                onClick={() => setActiveTab('drafts')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Quản Lý Kịch Bản</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {drafts.map(draft => (
                <div
                  key={draft.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-mono">Tác giả: {draft.author}</span>
                    <span className={`badge ${draft.status === 'approved' ? 'badge-emerald' : 'badge-amber'}`}>
                      {draft.status === 'approved' ? 'Đã Duyệt' : 'Chờ Duyệt'}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-white">{draft.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 italic bg-slate-950/60 p-3 rounded-xl border border-white/5">
                    "{draft.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Notices & Equipment */}
        <div className="space-y-6">
          
          {/* Announcements */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <span>Thông Báo Ban Chủ Nhiệm</span>
              </h2>

              {canManageAnnouncements && (
                <button
                  onClick={() => setIsAnnModalOpen(true)}
                  className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Đăng Thông Báo</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(!announcements || announcements.length === 0) ? (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  Chưa có thông báo nào từ Ban Chủ Nhiệm.
                </div>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1.5 text-xs relative group">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 font-mono text-[10px]">{ann.date || 'Hôm nay'}</span>
                      <div className="flex items-center gap-2">
                        <span className={`badge text-[9px] px-2 py-0.2 ${ann.isPinned ? 'badge-pink' : 'badge-purple'}`}>
                          {ann.priority || (ann.isPinned ? 'Ghim đầu' : 'Thông báo')}
                        </span>
                        {canManageAnnouncements && (
                          <button
                            onClick={() => deleteAnnouncement(ann.id)}
                            className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] underline"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="font-bold text-white leading-snug">{ann.title}</h4>
                    <p className="text-slate-400 leading-relaxed text-[11px] whitespace-pre-line">{ann.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Modal Đăng Thông Báo Mới của Ban Chủ Nhiệm */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-slide-up text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <span>ĐĂNG THÔNG BÁO BAN CHỦ NHIỆM</span>
              </h3>
              <button onClick={() => setIsAnnModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!annTitle || !annContent) return;
              await addAnnouncement({ title: annTitle, content: annContent, isPinned: annPinned });
              setAnnTitle('');
              setAnnContent('');
              setAnnPinned(false);
              setIsAnnModalOpen(false);
            }} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Tiêu Đề Thông Báo *</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Nhập tiêu đề thông báo..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Nội Dung Thông Báo *</label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Nhập nội dung thông báo gửi tới toàn thể thành viên CLB..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinAcc"
                  checked={annPinned}
                  onChange={(e) => setAnnPinned(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600"
                />
                <label htmlFor="pinAcc" className="text-xs text-slate-300 font-medium cursor-pointer">
                  📌 Ghim thông báo này lên đầu trang
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30"
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
