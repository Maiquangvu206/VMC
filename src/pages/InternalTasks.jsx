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
  X,
  Printer
} from 'lucide-react';
import { RoleTitleDisplay } from '../utils/roleHelper';
import { WATERMARK_CSS, WATERMARK_HTML } from '../utils/watermark';
import { getAvailableSigners, findSigner, renderSignerFooterHtml } from '../utils/reportSigner';
import { SignerSelect } from '../components/hr/SignerSelect';

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
    isAdvisor: isAdvisorFromContext,
    isHRMember,
    isHRHead,
    isAdmin,
    showToast
  } = useClub();

  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedMemberDeadline, setSelectedMemberDeadline] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department: 'production',
    assignee: '',
    deadline: '',
    priority: 'Medium'
  });

  const isAdvisor = isAdvisorFromContext || Boolean(
    currentUser?.deptName?.toLowerCase().includes('cố vấn') ||
    currentUser?.department?.toLowerCase().includes('cố vấn') ||
    currentUser?.roleTitle?.toLowerCase().includes('cố vấn') ||
    currentUser?.roleTitle?.toLowerCase().includes('cựu')
  );
  const currentUserDeptName = String(currentUser?.deptName || currentUser?.department || '').toLowerCase();
  const canExportHR = !isAdvisor && Boolean(
    isHRMember ||
    isHRHead ||
    isAdmin ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUser?.role === 'admin' ||
    currentUserDeptName.includes('đối ngoại') ||
    currentUserDeptName.includes('nhân sự') ||
    currentUserDeptName.includes('đn-ns') ||
    currentUserDeptName.includes('dn-ns')
  );

  // Danh sách người ký duyệt khả dụng (Trưởng ban, Phó ban, Chủ nhiệm, Phó chủ nhiệm)
  const signerOptions = useMemo(() => getAvailableSigners(members), [members]);
  const [selectedSignerId, setSelectedSignerId] = useState('');
  const chosenSigner = useMemo(() => findSigner(signerOptions, selectedSignerId), [signerOptions, selectedSignerId]);

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dl = new Date(deadline);
    dl.setHours(0, 0, 0, 0);
    return dl < now;
  };

  const handlePrintMemberDeadline = (mem, memberTasks) => {
    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (!printWindow) {
      alert('Vui lòng cho phép mở popup trình duyệt để xem và in báo cáo!');
      return;
    }

    const todayStr = new Date().toLocaleDateString('vi-VN');
    const tasksList = memberTasks || [];

    const tableRows = tasksList.length === 0 ? `
      <tr>
        <td colspan="6" style="text-align: center; padding: 18px; color: #64748b; font-style: italic;">
          Thành viên chưa có deadline / nhiệm vụ nào được giao.
        </td>
      </tr>
    ` : tasksList.map((t, index) => {
      const overdue = isOverdue(t.deadline, t.status);
      const statusText = t.status === 'done'
        ? '<span style="color: #166534; font-weight: bold;">✓ Đã hoàn thành</span>'
        : overdue
          ? '<span style="color: #991b1b; font-weight: bold;">⚠️ Quá hạn</span>'
          : t.status === 'doing'
            ? '<span style="color: #1e40af; font-weight: bold;">⏳ Đang thực hiện</span>'
            : '<span style="color: #854d0e; font-weight: bold;">📋 Chờ thực hiện</span>';

      return `
        <tr>
          <td style="text-align: center; padding: 7px 10px;">${index + 1}</td>
          <td style="padding: 7px 10px; font-weight: 600;">${t.title || 'Nhiệm vụ'}</td>
          <td style="text-align: center; padding: 7px 10px; font-family: monospace;">${t.deadline || '-'}</td>
          <td style="text-align: center; padding: 7px 10px;">${statusText}</td>
          <td style="text-align: center; padding: 7px 10px;">${getPriorityInfo(t.priority).label}</td>
          <td style="padding: 7px 10px; font-size: 10pt; color: #475569;">${t.desc || '-'}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Báo Cáo Deadline - ${mem.name} - VMC</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 landscape;
              margin: 15mm 20mm;
            }
            body { 
              font-family: "Times New Roman", Times, serif; 
              padding: 20px; 
              color: #000000; 
              line-height: 1.4;
            }
            .letterhead {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 25px;
            }
            .letterhead-left {
              text-align: center;
            }
            .letterhead-right {
              text-align: center;
            }
            .title-bold {
              margin: 0;
              font-size: 13.5pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .letterhead-left p + p {
              margin-top: 5px;
            }
            .doc-title {
              text-align: center;
              margin: 25px 0 20px 0;
            }
            .doc-title h2 {
              margin: 0;
              font-size: 16pt;
              font-weight: bold;
              text-transform: uppercase;
              color: #000000;
              letter-spacing: 0.5px;
            }
            .doc-title p {
              margin: 6px 0 0 0;
              font-size: 11pt;
              color: #374151;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px; 
              font-size: 10.5pt; 
            }
            th, td {
              border: 1px solid #64748b;
              padding: 7px 10px;
            }
            th { 
              background-color: #f1f5f9; 
              font-weight: bold; 
              text-align: left; 
            }
            tbody tr:nth-child(even) { 
              background-color: #f8fafc; 
            }
            .footer { 
              margin-top: 40px; 
              display: flex; 
              justify-content: space-between; 
              font-size: 11.5pt; 
              text-align: center; 
              page-break-inside: avoid; 
            }
            .sign-box { 
              width: 280px; 
            }
            @media print {
              body { padding: 0; }
            }
            ${WATERMARK_CSS}
          </style>
        </head>
        <body>
          ${WATERMARK_HTML}
          <div class="letterhead">
            <div class="letterhead-left">
              <p class="title-bold">ĐOÀN TNCS HỒ CHÍ MINH THPT VĨNH BẢO</p>
              <p class="title-bold">CLB TRUYỀN THÔNG THPT VĨNH BẢO</p>
            </div>
            <div class="letterhead-right">
              <p class="title-bold"><u>ĐOÀN TNCS HỒ CHÍ MINH</u></p>
            </div>
          </div>

          <div class="doc-title">
            <h2>BÁO CÁO THEO DÕI DEADLINE VÀ NHIỆM VỤ THÀNH VIÊN</h2>
            <p><strong>Họ và tên:</strong> ${mem.name} &nbsp;•&nbsp; <strong>Mã TV:</strong> ${mem.memberCode || mem.member_code || '-'} &nbsp;•&nbsp; <strong>Ban:</strong> ${mem.deptName || mem.department || '-'}</p>
            <p style="font-style: italic; font-size: 10.5pt; color: #4b5563;">Ngày xuất báo cáo: ${todayStr} • Tổng số nhiệm vụ được giao: ${tasksList.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 45px; text-align: center;">STT</th>
                <th>Tên Nhiệm Vụ</th>
                <th style="width: 110px; text-align: center;">Hạn Chót</th>
                <th style="width: 120px; text-align: center;">Trạng Thái</th>
                <th style="width: 80px; text-align: center;">Ưu Tiên</th>
                <th style="width: 280px;">Ghi Chú</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          ${renderSignerFooterHtml(chosenSigner, todayStr, currentUser?.name, 'NGƯỜI LẬP BÁO CÁO')}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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

  const filteredTasks = useMemo(() => tasks.filter(t => deptFilter === 'all' || t.department === deptFilter), [tasks, deptFilter]);

  const todoTasks = useMemo(() => filteredTasks.filter(t => t.status === 'todo'), [filteredTasks]);
  const doingTasks = useMemo(() => filteredTasks.filter(t => t.status === 'doing'), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter(t => t.status === 'done'), [filteredTasks]);

  const membersWithDeadlines = useMemo(() => {
    const map = new Map();
    tasks.forEach(task => {
      const assigneeName = getTaskAssignee(task);
      if (!assigneeName || assigneeName === 'Chưa phân công' || assigneeName === 'Thành viên còn thiếu') return;

      const memberObj = members.find(m =>
        m.name === assigneeName ||
        String(m.id) === String(task.assigneeId || task.assignee_id) ||
        String(m.memberCode) === String(task.assigneeId || task.assignee_id)
      ) || {
        id: assigneeName,
        name: assigneeName,
        roleTitle: 'Thành Viên VMC',
        deptName: task.department || 'Ban Chuyên Môn',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
      };

      if (!map.has(memberObj.name)) {
        map.set(memberObj.name, {
          member: memberObj,
          tasks: []
        });
      }
      map.get(memberObj.name).tasks.push(task);
    });
    return Array.from(map.values());
  }, [tasks, members]);

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
    switch (deptId) {
      case 'bcn': return { label: 'BAN CHỦ NHIỆM', class: 'ds-badge ds-badge-pink' };
      case 'content_radio': return { label: 'NỘI DUNG - PHÁT THANH', class: 'ds-badge ds-badge-cyan' };
      case 'production': return { label: 'SẢN XUẤT', class: 'ds-badge ds-badge-purple' };
      case 'hr_external': return { label: 'ĐỐI NGOẠI - NHÂN SỰ', class: 'ds-badge ds-badge-amber' };
      default: return { label: deptId.toUpperCase(), class: 'ds-badge ds-badge-purple' };
    }
  };

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'High':
      case 'Cao':
        return { label: 'Cao', class: 'text-rose-400' };
      case 'Low':
      case 'Thấp':
        return { label: 'Thấp', class: 'text-slate-400' };
      case 'Medium':
      case 'Trung bình':
      default:
        return { label: 'Trung bình', class: 'text-amber-400' };
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-slate-100 mt-2">
            Công Việc Được Giao
          </h1>
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
              const prio = getPriorityInfo(task.priority);
              return (
                <div key={task.id} className={`ds-card p-5 space-y-4 transition-all ${overdue ? 'border-red-500/50 bg-red-950/20' : ''}`}>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${deptInfo.class}`}>{deptInfo.label}</span>
                    <span className={`font-mono flex items-center gap-1.5 text-xs ${overdue ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                      {overdue && <AlertTriangle className="w-4 h-4" />}
                      Hạn: {task.deadline}
                    </span>
                  </div>

                  {overdue && (
                    <span className="ds-badge ds-badge-rose animate-pulse">
                      <AlertTriangle className="w-4 h-4" /> QUÁ HẠN
                    </span>
                  )}

                  <div>
                    <h4 className="font-heading font-bold text-base text-slate-100">{task.title}</h4>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <span>Độ ưu tiên:</span>
                      <span className={`font-bold ${prio.class}`}>{prio.label}</span>
                    </div>
                  </div>
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
              const prio = getPriorityInfo(task.priority);
              return (
                <div key={task.id} className={`ds-card p-5 space-y-4 transition-all ${overdue ? 'border-red-500/50 bg-red-950/20' : ''}`}>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${deptInfo.class}`}>{deptInfo.label}</span>
                    <span className={`font-mono flex items-center gap-1.5 text-xs ${overdue ? 'text-rose-400 font-bold' : 'text-blue-400'}`}>
                      {overdue && <AlertTriangle className="w-4 h-4" />}
                      Hạn: {task.deadline}
                    </span>
                  </div>

                  {overdue && (
                    <span className="ds-badge ds-badge-rose animate-pulse">
                      <AlertTriangle className="w-4 h-4" /> QUÁ HẠN
                    </span>
                  )}

                  <div>
                    <h4 className="font-heading font-bold text-base text-slate-100">{task.title}</h4>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <span>Độ ưu tiên:</span>
                      <span className={`font-bold ${prio.class}`}>{prio.label}</span>
                    </div>
                  </div>
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
              const prio = getPriorityInfo(task.priority);
              return (
                <div key={task.id} className="ds-card p-5 space-y-4 opacity-75">
                  <div className="flex justify-between items-center text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${deptInfo.class}`}>{deptInfo.label}</span>
                    <span className="text-emerald-400 font-mono text-xs">Xong</span>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-base text-slate-100 line-through opacity-70">{task.title}</h4>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <span>Độ ưu tiên:</span>
                      <span className={`font-bold ${prio.class}`}>{prio.label}</span>
                    </div>
                  </div>
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
      {
        isNewTaskModalOpen && (
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="ds-field-label">Ban phụ trách *</label>
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
                    <label className="ds-field-label">Độ ưu tiên *</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="ds-input ds-select"
                    >
                      <option value="High">🔴 Cao (High)</option>
                      <option value="Medium">🟡 Trung bình (Medium)</option>
                      <option value="Low">🔵 Thấp (Low)</option>
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
                    className="w-full bg-[#0f172a] border border-[#1f2937] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 leading-relaxed resize-y mt-1 transition-all block"
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
        )
      }

      {/* Member Deadline Detail Modal */}
      {
        selectedMemberDeadline && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="ds-card w-full max-w-2xl bg-[#111827] border border-[#1f2937] p-6 rounded-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#1f2937] pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedMemberDeadline.member.avatar || selectedMemberDeadline.member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt={selectedMemberDeadline.member.name}
                    onError={(e) => { e.currentTarget.src = '/vmc-logo.jpg'; }}
                    className="w-12 h-12 rounded-xl object-cover border border-blue-500/30 shrink-0"
                  />
                  <div>
                    <h3 className="font-heading font-bold text-lg text-slate-100">{selectedMemberDeadline.member.name}</h3>
                    <div className="text-xs text-slate-400 font-medium">
                      {selectedMemberDeadline.member.deptName || selectedMemberDeadline.member.department}
                    </div>
                    <RoleTitleDisplay roleTitle={selectedMemberDeadline.member.roleTitle} className="text-xs text-blue-400 font-medium mt-0.5" />
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMemberDeadline(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2937] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Deadlines List */}
              <div className="space-y-3">
                <h4 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Danh Sách Tất Cả Deadline Đã Giao ({selectedMemberDeadline.tasks.length})
                </h4>

                {selectedMemberDeadline.tasks.map(task => {
                  const overdue = task.status !== 'done' && isOverdue(task.deadline);
                  const deptInfo = getDeptBadge(task.department);

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border space-y-3 transition-all ${task.status === 'done'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : overdue
                          ? 'bg-rose-500/10 border-rose-500/30'
                          : 'bg-[#0f172a] border-[#1f2937]'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={deptInfo.class}>{deptInfo.label}</span>
                            {overdue && (
                              <span className="ds-badge ds-badge-rose text-[10px]">
                                ⚠️ QUÁ HẠN
                              </span>
                            )}
                            <span className={`ds-badge ${task.status === 'done'
                              ? 'ds-badge-emerald'
                              : task.status === 'doing'
                                ? 'ds-badge-blue'
                                : 'ds-badge-amber'
                              }`}>
                              {task.status === 'done' ? '✓ HOÀN THÀNH' : task.status === 'doing' ? '⏳ ĐANG LÀM' : '📋 CẦN LÀM'}
                            </span>
                          </div>
                          <h5 className="font-bold text-sm text-slate-100">{task.title}</h5>
                        </div>

                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          className="bg-[#1e293b] text-slate-100 border border-slate-700 text-xs py-1.5 px-3 rounded-lg focus:outline-none focus:border-blue-500 shrink-0 cursor-pointer self-start sm:self-auto"
                        >
                          <option value="todo">📋 Cần Làm</option>
                          <option value="doing">⏳ Đang Làm</option>
                          <option value="done">✓ Hoàn Thành</option>
                        </select>
                      </div>

                      {task.desc && (
                        <p className="text-xs text-slate-300 bg-[#111827] p-2.5 rounded-lg border border-[#1f2937]">
                          {task.desc}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                        <span>Hạn: <strong className={overdue ? 'text-rose-400' : 'text-slate-200'}>{task.deadline}</strong></span>
                        <span>Ưu tiên: <strong className={getPriorityInfo(task.priority).class}>{getPriorityInfo(task.priority).label}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#1f2937] flex items-center justify-between gap-3">
                {canExportHR ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <SignerSelect
                      signers={signerOptions}
                      selectedSignerId={chosenSigner?.id}
                      onChange={setSelectedSignerId}
                      compact
                    />
                    <button
                      type="button"
                      onClick={() => handlePrintMemberDeadline(selectedMemberDeadline.member, selectedMemberDeadline.tasks)}
                      className="ds-btn ds-btn-secondary text-xs flex items-center gap-1.5 hover:border-blue-500/50"
                      title="In danh sách deadline của thành viên này"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-400" />
                      <span>In Báo Cáo Deadline</span>
                    </button>
                  </div>
                ) : <div />}
                <button
                  onClick={() => setSelectedMemberDeadline(null)}
                  className="ds-btn ds-btn-primary text-xs"
                >
                  Đóng
                </button>
              </div>

            </div>
          </div>
        )
      }

    </div >
  );
};
