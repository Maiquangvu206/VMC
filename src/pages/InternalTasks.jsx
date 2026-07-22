import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  Filter,
  X
} from 'lucide-react';

export const InternalTasks = () => {
  const { 
    tasks, 
    members,
    addTask, 
    updateTaskStatus, 
    deleteTask,
    isNewTaskModalOpen, 
    setIsNewTaskModalOpen,
    currentUser,
    showToast
  } = useClub();

  const [deptFilter, setDeptFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    department: 'production',
    assignee: '',
    deadline: '',
    priority: 'Medium',
    points: 10
  });

  const filteredTasks = tasks.filter(t => deptFilter === 'all' || t.department === deptFilter);

  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const doingTasks = filteredTasks.filter(t => t.status === 'doing');
  const doneTasks = filteredTasks.filter(t => t.status === 'done');

  const handleSubmitNewTask = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.assignee || !formData.deadline) {
      showToast('Vui lòng điền đầy đủ thông tin nhiệm vụ!', 'warning');
      return;
    }
    addTask(formData);
    setIsNewTaskModalOpen(false);
    setFormData({
      title: '',
      department: 'production',
      assignee: '',
      deadline: '',
      priority: 'Medium',
      desc: ''
    });
  };

  const getDeptBadge = (deptId) => {
    switch(deptId) {
      case 'bcn': return { label: 'BAN CHỦ NHIỆM', class: 'badge-pink' };
      case 'content_radio': return { label: 'NỘI DUNG - PHÁT THANH', class: 'badge-cyan' };
      case 'production': return { label: 'SẢN XUẤT', class: 'badge-purple' };
      case 'hr_external': return { label: 'ĐỐI NGOẠI - NHÂN SỰ', class: 'badge-amber' };
      default: return { label: deptId.toUpperCase(), class: 'badge-purple' };
    }
  };

  return (
    <div className="container py-8 space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-purple">VMC Operations</span>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
            Phân Công & <span className="gradient-text">Nhiệm Vụ 4 Ban</span>
          </h1>
          <p className="text-xs text-slate-400">
            Quản lý công việc Ban Chủ Nhiệm, Ban Nội Dung - Phát Thanh, Ban Sản Xuất và Ban Đối Ngoại - Nhân Sự.
          </p>
        </div>

        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="btn-primary text-xs px-5 py-2.5 shadow-blue-600/40"
        >
          <Plus className="w-4 h-4" />
          <span>Giao Công Việc Mới</span>
        </button>
      </div>

      {/* Filter Tabs matching 4 exact departments */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Lọc theo Ban:
        </span>
        {[
          { id: 'all', label: 'Tất cả 4 Ban' },
          { id: 'bcn', label: '👑 Ban Chủ Nhiệm' },
          { id: 'content_radio', label: '🎙️ Ban Nội Dung - Phát Thanh' },
          { id: 'production', label: '🎬 Ban Sản Xuất' },
          { id: 'hr_external', label: '🤝 Ban Đối Ngoại - Nhân Sự' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setDeptFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              deptFilter === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 border border-white/5 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Cần Thực Hiện (To Do) */}
        <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="font-heading font-bold text-sm text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>CẦN LÀM ({todoTasks.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {todoTasks.map(task => {
              const deptInfo = getDeptBadge(task.department);
              return (
                <div key={task.id} className="glass-card p-4 rounded-xl border border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className={`badge ${deptInfo.class}`}>{deptInfo.label}</span>
                    <span className="text-slate-400 font-mono">Hạn: {task.deadline}</span>
                  </div>

                  <h4 className="font-heading font-bold text-sm text-white">{task.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{task.desc}</p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{task.assignee}</span>
                    <button
                      onClick={() => updateTaskStatus(task.id, 'doing')}
                      className="px-3 py-1 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-[11px] font-semibold transition-all"
                    >
                      Bắt đầu làm →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Đang Thực Hiện (Doing) */}
        <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="font-heading font-bold text-sm text-blue-400 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              <span>ĐANG LÀM ({doingTasks.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {doingTasks.map(task => {
              const deptInfo = getDeptBadge(task.department);
              return (
                <div key={task.id} className="glass-card p-4 rounded-xl border border-blue-500/30 space-y-3">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className={`badge ${deptInfo.class}`}>{deptInfo.label}</span>
                    <span className="text-blue-400 font-mono">Hạn: {task.deadline}</span>
                  </div>

                  <h4 className="font-heading font-bold text-sm text-white">{task.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{task.desc}</p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{task.assignee}</span>
                    <button
                      onClick={() => updateTaskStatus(task.id, 'done')}
                      className="px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[11px] font-semibold transition-all"
                    >
                      Xong ✓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Hoàn Thành (Done) */}
        <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="font-heading font-bold text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>HOÀN THÀNH ({doneTasks.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {doneTasks.map(task => {
              const deptInfo = getDeptBadge(task.department);
              return (
                <div key={task.id} className="glass-card p-4 rounded-xl border border-emerald-500/20 opacity-85 space-y-3">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className={`badge ${deptInfo.class}`}>{deptInfo.label}</span>
                    <span className="text-emerald-400 font-mono">Xong</span>
                  </div>

                  <h4 className="font-heading font-bold text-sm text-white line-through opacity-80">{task.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{task.desc}</p>

                  <div className="pt-2 border-t border-white/10 text-xs text-slate-400">
                    Phụ trách: {task.assignee}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up">
          <div className="relative w-full max-w-lg bg-slate-900 border border-blue-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-heading font-bold text-lg text-white">Giao Nhiệm Vụ Mới</h3>
              <button onClick={() => setIsNewTaskModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên công việc / Sự kiện *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Kịch bản radio số 09 / Dựng clip RECAP Khai giảng..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Giao cho Ban nào *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="bcn">👑 Ban Chủ Nhiệm</option>
                    <option value="content_radio">🎙️ Ban Nội Dung - Phát Thanh</option>
                    <option value="production">🎬 Ban Sản Xuất</option>
                    <option value="hr_external">🤝 Ban Đối Ngoại - Nhân Sự</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hạn hoàn thành *</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Người phụ trách chính *</label>
                <select
                  required
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="" disabled hidden>-- Chọn người phụ trách --</option>
                  {members.filter(m => {
                    const isSystemAdmin = m.roleTitle?.includes('Super Admin') || m.role === 'admin' || m.memberCode === 'ADMIN' || m.name?.includes('Quản Trị Viên') || m.name?.includes('Super Admin');
                    if (isSystemAdmin) return false;

                    const deptMapping = {
                      'bcn': 'Ban Chủ Nhiệm',
                      'content_radio': 'Ban Nội Dung - Phát Thanh',
                      'production': 'Ban Sản Xuất',
                      'hr_external': 'Ban Đối Ngoại - Nhân Sự'
                    };
                    const selectedDeptName = deptMapping[formData.department];
                    
                    const isSelectedDept = m.department === formData.department || m.deptName === selectedDeptName;
                    const isBCN = m.department === 'bcn' || m.deptName === 'Ban Chủ Nhiệm';
                    
                    return isSelectedDept || isBCN;
                  }).map(m => (
                    <option key={m.id} value={m.name}>{m.name} - {m.roleTitle} ({m.deptName || m.department})</option>
                  ))}
                  <option value="Cả Ban">Cả Ban (Tất cả thành viên)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mô tả & Yêu cầu sản phẩm</label>
                <textarea
                  rows={3}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Yêu cầu nộp kịch bản radio trước 17:00 Thứ 2..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-6 py-2"
                >
                  Xác Nhận Giao Việc
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
