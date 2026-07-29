import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  User, 
  AlertCircle, 
  AlertTriangle,
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
    priority: 'Medium'
  });

  const filteredTasks = useMemo(() => tasks.filter(t => deptFilter === 'all' || t.department === deptFilter), [tasks, deptFilter]);

  const todoTasks = useMemo(() => filteredTasks.filter(t => t.status === 'todo'), [filteredTasks]);
  const doingTasks = useMemo(() => filteredTasks.filter(t => t.status === 'doing'), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter(t => t.status === 'done'), [filteredTasks]);

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

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dl = new Date(deadline);
    dl.setHours(0, 0, 0, 0);
    return dl < now;
  };

  const getTaskAssignee = (task) => {
    if (task.assignee && task.assignee !== 'Chưa phân công' && task.assignee !== 'Thành viên còn thiếu') {
      return task.assignee;
    }
    const assId = task.assigneeId || task.assignee_id;
    if (assId) {
      const match = members.find(m => String(m.id) === String(assId) || String(m.memberCode) === String(assId));
      if (match) return match.name || match.full_name;
    }
    return task.assignee || 'Chưa phân công';
  };

  const getDeptBadge = (deptId) => {
    switch(deptId) {
      case 'bcn': return { label: 'BAN CHỦ NHIỆM', class: 'ds-badge ds-badge-pink' };
      case 'content_radio': return { label: 'NỘI DUNG - PHÁT THANH', class: 'ds-badge ds-badge-cyan' };
      case 'production': return { label: 'SẢN XUẤT', class: 'ds-badge ds-badge-purple' };
      case 'hr_external': return { label: 'ĐỐI NGOẠI - NHÂN SỰ', class: 'ds-badge ds-badge-amber' };
      default: return { label: deptId.toUpperCase(), class: 'ds-badge ds-badge-purple' };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="ds-badge ds-badge-purple">VMC Operations</span>
          <h1 className="font-heading text-3xl font-extrabold text-slate-100 mt-2">
            Phân Công & <span className="text-blue-400">Nhiệm Vụ 4 Ban</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý công việc Ban Chủ Nhiệm, Ban Nội Dung - Phát Thanh, Ban Sản Xuất và Ban Đối Ngoại - Nhân Sự.
          </p>
        </div>

        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="ds-btn ds-btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Giao Công Việc Mới</span>
        </button>
      </div>

      {/* Filter Tabs matching 4 exact departments */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <span className="text-sm text-slate-400 font-semibold flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4" /> Lọc theo Ban:
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
            className={`ds-btn ${deptFilter === tab.id ? 'ds-btn-primary' : 'ds-btn-secondary'} shrink-0`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Cần Thực Hiện (To Do) */}
        <div className="ds-card p-5 space-y-4">
          <div className="ds-section-header pb-4 border-b border-[var(--border-default)] mb-0">
            <h3 className="font-heading font-bold text-base text-amber-400 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>CẦN LÀM ({todoTasks.length})</span>
            </h3>
          </div>

          <div className="space-y-4">
            {todoTasks.map(task => {
              const deptInfo = getDeptBadge(task.department);
              const overdue = isOverdue(task.deadline);
              return (
                <div key={task.id} className={`ds-card p-5 space-y-4 transition-all ${overdue ? 'border-red-500/50 bg-red-950/20' : ''}`}>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${deptInfo.class}`}>{deptInfo.label}</span>
                    <span className={`font-mono flex items-center gap-1.5 ${overdue ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                      {overdue && <AlertTriangle className="w-4 h-4" />}
                      Hạn: {task.deadline}
                    </span>
                  </div>

                  {overdue && (
                    <span className="ds-badge ds-badge-rose animate-pulse">
                      <AlertTriangle className="w-4 h-4" /> QUÁ HẠN
                    </span>
                  )}

                  <h4 className="font-heading font-bold text-base text-slate-100">{task.title}</h4>
                  <p className="text-sm text-slate-400 line-clamp-2">{task.desc}</p>

                  <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between text-sm">
                    <span className="text-slate-300 font-semibold">{getTaskAssignee(task)}</span>
                    <button
                      onClick={() => updateTaskStatus(task.id, 'doing')}
                      className="ds-btn ds-btn-primary ds-btn-xs"
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
        <div className="ds-card p-5 space-y-4">
          <div className="ds-section-header pb-4 border-b border-[var(--border-default)] mb-0">
            <h3 className="font-heading font-bold text-base text-blue-400 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              <span>ĐANG LÀM ({doingTasks.length})</span>
            </h3>
          </div>

          <div className="space-y-4">
            {doingTasks.map(task => {
              const deptInfo = getDeptBadge(task.department);
              const overdue = isOverdue(task.deadline);
              return (
                <div key={task.id} className={`ds-card p-5 space-y-4 transition-all ${overdue ? 'border-red-500/50 bg-red-950/20' : ''}`}>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${deptInfo.class}`}>{deptInfo.label}</span>
                    <span className={`font-mono flex items-center gap-1.5 ${overdue ? 'text-red-400 font-bold' : 'text-blue-400'}`}>
                      {overdue && <AlertTriangle className="w-4 h-4" />}
                      Hạn: {task.deadline}
                    </span>
                  </div>

                  {overdue && (
                    <span className="ds-badge ds-badge-rose animate-pulse">
                      <AlertTriangle className="w-4 h-4" /> QUÁ HẠN
                    </span>
                  )}

                  <h4 className="font-heading font-bold text-base text-slate-100">{task.title}</h4>
                  <p className="text-sm text-slate-400 line-clamp-2">{task.desc}</p>

                  <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between text-sm">
                    <span className="text-slate-300 font-semibold">{getTaskAssignee(task)}</span>
                    <button
                      onClick={() => updateTaskStatus(task.id, 'done')}
                      className="ds-btn ds-btn-success ds-btn-xs"
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
        <div className="ds-card p-5 space-y-4">
          <div className="ds-section-header pb-4 border-b border-[var(--border-default)] mb-0">
            <h3 className="font-heading font-bold text-base text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>HOÀN THÀNH ({doneTasks.length})</span>
            </h3>
          </div>

          <div className="space-y-4">
            {doneTasks.map(task => {
              const deptInfo = getDeptBadge(task.department);
              return (
                <div key={task.id} className="ds-card p-5 space-y-4 opacity-75">
                  <div className="flex justify-between items-center text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${deptInfo.class}`}>{deptInfo.label}</span>
                    <span className="text-emerald-400 font-mono">Xong</span>
                  </div>

                  <h4 className="font-heading font-bold text-base text-slate-100 line-through opacity-70">{task.title}</h4>
                  <p className="text-sm text-slate-400 line-clamp-1">{task.desc}</p>

                  <div className="pt-4 border-t border-[var(--border-default)] text-sm text-slate-400">
                    Phụ trách: {getTaskAssignee(task)}
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
          <div className="relative w-full max-w-lg ds-card ds-card-elevated border border-blue-500/30 p-6 shadow-2xl text-white space-y-6">
            
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border-default)]">
              <h3 className="font-heading font-bold text-lg text-slate-100">Giao Nhiệm Vụ Mới</h3>
              <button onClick={() => setIsNewTaskModalOpen(false)} className="text-slate-400 hover:text-white p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewTask} className="space-y-5">
              <div>
                <label className="ds-field-label">Tên công việc / Sự kiện *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Kịch bản radio số 09 / Dựng clip RECAP Khai giảng..."
                  className="ds-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="ds-field-label">Giao cho Ban nào *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="ds-input ds-select"
                  >
                    <option value="bcn">👑 Ban Chủ Nhiệm</option>
                    <option value="content_radio">🎙️ Ban Nội Dung - Phát Thanh</option>
                    <option value="production">🎬 Ban Sản Xuất</option>
                    <option value="hr_external">🤝 Ban Đối Ngoại - Nhân Sự</option>
                  </select>
                </div>

                <div>
                  <label className="ds-field-label">Hạn hoàn thành *</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="ds-input"
                  />
                </div>
              </div>

              <div>
                <label className="ds-field-label">Người phụ trách chính *</label>
                <select
                  required
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="ds-input ds-select"
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
                <label className="ds-field-label">Mô tả & Yêu cầu sản phẩm</label>
                <textarea
                  rows={3}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Yêu cầu nộp kịch bản radio trước 17:00 Thứ 2..."
                  className="ds-textarea"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="ds-btn ds-btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="ds-btn ds-btn-primary"
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
