import React, { useState, useMemo, useEffect } from 'react';
import { X, Clock, Award, Printer, CheckCircle2, AlertTriangle, Calendar, Briefcase, Hash, GraduationCap } from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { RoleTitleDisplay } from '../../utils/roleHelper';
import { updateMemberAPI } from '../../services/api';
import { WATERMARK_CSS, WATERMARK_HTML } from '../../utils/watermark';
import { getAvailableSigners, findSigner, renderSignerFooterHtml } from '../../utils/reportSigner';
import { SignerSelect } from './SignerSelect';

export const MemberRankingDetailModal = ({
  show,
  onClose,
  member,
  members: propMembers,
  tasks = [],
  meetings = [],
  birthdayAssignments = [],
  canExport = false,
  currentUser = null,
  hrHeadName = 'Đặng Nguyệt Minh'
}) => {
  const { members: clubMembers } = useClub();
  const allMembers = useMemo(() => {
    return (propMembers && propMembers.length > 0) ? propMembers : (clubMembers || []);
  }, [propMembers, clubMembers]);

  const signerOptions = useMemo(() => getAvailableSigners(allMembers), [allMembers]);
  const [selectedSignerId, setSelectedSignerId] = useState('');
  const chosenSigner = useMemo(() => findSigner(signerOptions, selectedSignerId), [signerOptions, selectedSignerId]);

  const [activeTab, setActiveTab] = useState('points'); // 'points' | 'deadlines'

  // Danh sách nhiệm vụ / deadline được giao cho thành viên
  const memberTasks = useMemo(() => {
    if (!member || !Array.isArray(tasks)) return [];
    const id = member.id;
    const memberCode = member.memberCode || member.member_code;
    const memberName = (member.name || member.full_name || '').trim().toLowerCase();

    return tasks.filter(t => {
      const assId = t.assigneeId || t.assignee_id;
      const assName = (t.assignee || '').trim().toLowerCase();

      if (assId && (String(assId) === String(id) || (memberCode && String(assId) === String(memberCode)))) {
        return true;
      }
      if (assName && memberName && (assName === memberName || memberName.includes(assName) || assName.includes(memberName))) {
        return true;
      }
      return false;
    });
  }, [member, tasks]);

  // Kiểm tra deadline quá hạn
  const isOverdue = (deadlineStr, status) => {
    if (!deadlineStr || status === 'done' || status === 'completed') return false;
    try {
      const d = new Date(deadlineStr);
      return !isNaN(d.getTime()) && d.getTime() < Date.now();
    } catch {
      return false;
    }
  };

  // Lịch sử điểm thi đua (kết hợp từ localStorage và các hoạt động của thành viên)
  const pointHistory = useMemo(() => {
    if (!member) return [];
    const logs = [];

    // 1. Logs đã lưu từ hệ thống quản lý điểm
    try {
      const stored = JSON.parse(localStorage.getItem('vmc_point_logs') || '[]');
      const memberLogs = stored.filter(l =>
        String(l.memberId) === String(member.id) ||
        (member.memberCode && String(l.memberCode) === String(member.memberCode))
      );
      memberLogs.forEach(l => {
        logs.push({
          id: l.id,
          date: l.date || new Date(l.timestamp || Date.now()).toLocaleDateString('vi-VN'),
          time: l.time || '12:00',
          title: l.reason || 'Cập nhật điểm thi đua',
          pointsDelta: l.pointsDelta || 0,
          category: l.pointsDelta > 0 ? 'Cộng điểm' : 'Trừ điểm',
          timestamp: l.timestamp || 0
        });
      });
    } catch (e) {
      console.warn('Failed to parse point logs:', e);
    }

    // 2. Nhiệm vụ trễ hạn (Mặc định trừ 5 điểm nếu chưa có log ghi nhận)
    const todayIsoStr = new Date().toISOString().split('T')[0];
    memberTasks.forEach(t => {
      const deadline = t.deadline || t.dueDate;
      const deadlineDate = deadline ? String(deadline).slice(0, 10) : '';
      const isPastDue = deadlineDate && deadlineDate < todayIsoStr;
      const isOverdueTask = isPastDue && (t.status !== 'done' && t.status !== 'completed');

      if (isOverdueTask) {
        const alreadyInLogs = logs.some(l => l.taskId === t.id || l.title?.includes(t.title) || l.reason?.includes(t.title));
        if (!alreadyInLogs) {
          logs.push({
            id: `task-overdue-point-${t.id}`,
            date: deadlineDate ? new Date(deadlineDate).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
            time: '23:59',
            title: `Trễ hạn nhiệm vụ: ${t.title}`,
            pointsDelta: -5,
            category: 'Trừ điểm vi phạm',
            timestamp: new Date(deadline || Date.now()).getTime()
          });
        }
      }
    });

    // 3. Điểm danh các cuộc họp
    (meetings || []).forEach(m => {
      if (m.status === 'completed' && Array.isArray(m.attendees)) {
        const attended = m.attendees.some(att =>
          String(att.memberId || att.id) === String(member.id) && att.status === 'present'
        );
        if (attended) {
          logs.push({
            id: `meet-point-${m.id}`,
            date: m.date || new Date().toLocaleDateString('vi-VN'),
            time: m.time || '19:30',
            title: `Tham gia sinh hoạt / cuộc họp: ${m.title}`,
            pointsDelta: 5,
            category: 'Sinh hoạt CLB',
            timestamp: new Date(m.date || 0).getTime() || Date.now() - 172800000
          });
        }
      }
    });

    // 4. Nhiệm vụ chúc mừng sinh nhật
    (birthdayAssignments || []).forEach(b => {
      if (String(b.memberId) === String(member.id) && b.status === 'completed') {
        logs.push({
          id: `bday-point-${b.id}`,
          date: `15/${b.assign_month || b.month}/2026`,
          time: '08:00',
          title: `Hoàn thành thiết kế & phụ trách sinh nhật tháng ${b.assign_month || b.month}`,
          pointsDelta: 15,
          category: 'Nhiệm vụ đặc biệt',
          timestamp: Date.now() - 259200000
        });
      }
    });

    // 5. Nếu chưa có log hoặc tổng điểm chưa khớp, thêm mục điểm ban đầu
    if (logs.length === 0 && (member.points || 0) > 0) {
      logs.push({
        id: 'initial-points',
        date: '01/09/2026',
        time: '08:00',
        title: 'Điểm khởi tạo thi đua định kỳ đầu kỳ hoạt động',
        pointsDelta: member.points || 0,
        category: 'Khởi tạo',
        timestamp: 1
      });
    }

    return logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [member, memberTasks, meetings, birthdayAssignments]);

  // Tổng điểm thi đua thực tế của thành viên (không cộng điểm hoàn thành nhiệm vụ đúng hạn)
  const totalEarnedPoints = useMemo(() => {
    return Number(member?.points) || 0;
  }, [member]);

  if (!show || !member) return null;

  const todayStr = new Date().toLocaleDateString('vi-VN');

  // Thao tác 1: Xuất báo cáo Deadline (In / PDF)
  const handlePrintDeadlines = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (!printWindow) {
      alert('Vui lòng cho phép mở popup trình duyệt để xem và in báo cáo!');
      return;
    }

    const tableRows = memberTasks.length === 0 ? `
      <tr>
        <td colspan="7" style="text-align: center; padding: 18px; color: #64748b; font-style: italic;">
          Thành viên chưa có deadline / nhiệm vụ nào được giao.
        </td>
      </tr>
    ` : memberTasks.map((t, index) => {
      const overdue = isOverdue(t.deadline, t.status);
      const statusText = t.status === 'done' || t.status === 'completed'
        ? '<span style="color: #166534; font-weight: bold;">✓ Đã hoàn thành</span>'
        : overdue
          ? '<span style="color: #991b1b; font-weight: bold;">⚠️ Quá hạn</span>'
          : t.status === 'doing' || t.status === 'in_progress'
            ? '<span style="color: #1e40af; font-weight: bold;">⏳ Đang thực hiện</span>'
            : '<span style="color: #854d0e; font-weight: bold;">📋 Chờ thực hiện</span>';

      return `
        <tr>
          <td style="text-align: center; padding: 7px 10px;">${index + 1}</td>
          <td style="padding: 7px 10px; font-weight: 600;">${t.title || 'Nhiệm vụ'}</td>
          <td style="text-align: center; padding: 7px 10px; font-family: monospace;">${t.deadline || '-'}</td>
          <td style="text-align: center; padding: 7px 10px;">${statusText}</td>
          <td style="text-align: center; padding: 7px 10px;">${t.priority === 'high' ? 'Cao' : t.priority === 'low' ? 'Thấp' : 'Trung bình'}</td>
          <td style="padding: 7px 10px; font-size: 10pt; color: #475569;">${t.description || t.desc || '-'}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Báo Cáo Deadline - ${member.name} - VMC</title>
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
              font-size: 11pt; 
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
            <p><strong>Họ và tên:</strong> ${member.name} &nbsp;•&nbsp; <strong>Ban:</strong> ${member.deptName || member.department || '-'}</p>
            <p style="font-style: italic; font-size: 10.5pt; color: #4b5563;">Ngày xuất báo cáo: ${todayStr} • Tổng số nhiệm vụ được giao: ${memberTasks.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 45px; text-align: center;">STT</th>
                <th>Tên Nhiệm Vụ</th>
                <th style="width: 110px; text-align: center;">Hạn Chót</th>
                <th style="width: 120px; text-align: center;">Trạng Thái</th>
                <th style="width: 80px; text-align: center;">Ưu Tiên</th>
                <th style="width: 300px;">Ghi Chú</th>
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

  // Thao tác 2: Xuất báo cáo Lịch Sử Điểm (In / PDF)
  const handlePrintPoints = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (!printWindow) {
      alert('Vui lòng cho phép mở popup trình duyệt để xem và in báo cáo!');
      return;
    }

    const tableRows = pointHistory.length === 0 ? `
      <tr>
        <td colspan="6" style="text-align: center; padding: 18px; color: #64748b; font-style: italic;">
          Chưa có biến động điểm thi đua nào được ghi nhận.
        </td>
      </tr>
    ` : pointHistory.map((item, index) => {
      const deltaText = item.pointsDelta > 0
        ? `<span style="color: #166534; font-weight: bold;">+${item.pointsDelta} </span>`
        : `<span style="color: #991b1b; font-weight: bold;">${item.pointsDelta} </span>`;

      return `
        <tr>
          <td style="text-align: center; padding: 7px 10px;">${index + 1}</td>
          <td style="text-align: center; padding: 7px 10px; font-family: monospace;">${item.date}</td>
          <td style="padding: 7px 10px; font-weight: 500;">${item.title}</td>
          <td style="text-align: center; padding: 7px 10px; font-family: monospace;">${deltaText}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Báo Cáo Lịch Sử Điểm - ${member.name} - VMC</title>
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
              font-size: 11pt; 
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
            <h2>BÁO CÁO CHI TIẾT LỊCH SỬ ĐIỂM THI ĐUA THÀNH VIÊN</h2>
            <p><strong>Họ và tên:</strong> ${member.name} &nbsp;•&nbsp; <strong>Ban:</strong> ${member.deptName || member.department || '-'} &nbsp;•&nbsp; <strong>Tổng điểm hiện tại:</strong> <span style="font-weight: bold; color: #b45309;">${totalEarnedPoints} </span></p>
            <p style="font-style: italic; font-size: 10.5pt; color: #4b5563;">Ngày xuất báo cáo: ${todayStr} • Tổng số bản ghi biến động: ${pointHistory.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 45px; text-align: center;">STT</th>
                <th style="width: 140px; text-align: center;">Thời Gian</th>
                <th>Nội Dung / Lý Do Biến Động Điểm</th>
                <th style="width: 110px; text-align: center;">Biến Động</th>
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

  const completedCount = memberTasks.filter(t => t.status === 'done' || t.status === 'completed').length;
  const inProgressCount = memberTasks.filter(t => t.status === 'doing' || t.status === 'in_progress').length;
  const overdueCount = memberTasks.filter(t => isOverdue(t.deadline, t.status)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
      <div className="ds-card p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-[var(--border-default)]">

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-default)] gap-3 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${member.displayRank === 1
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
              : member.displayRank === 2
                ? 'bg-slate-300/20 text-slate-300 border border-slate-400/50'
                : member.displayRank === 3
                  ? 'bg-orange-600/20 text-orange-400 border border-orange-600/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
              {member.displayRank || '#'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">
                  {member.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {totalEarnedPoints}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
                <span>{member.deptName || member.department || 'Ban Chuyên Môn'}</span>
                <span>•</span>
                <span>Mã: {member.memberCode || member.member_code || '-'}</span>
                {member.class && (
                  <>
                    <span>•</span>
                    <span>Lớp: {member.class || member.class_name}</span>
                  </>
                )}
              </div>
              <RoleTitleDisplay roleTitle={member.roleTitle || member.role_title} className="text-xs text-blue-400 font-semibold mt-0.5" />
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Tabs & Export Buttons (Aligned into 1 single row) */}
        <div className="flex items-center justify-between gap-3 py-3 border-b border-[var(--border-default)] shrink-0 overflow-x-auto no-scrollbar">
          {/* Tab buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('deadlines')}
              className={`ds-btn ds-btn-sm text-xs font-semibold flex items-center gap-1.5 shrink-0 ${activeTab === 'deadlines' ? 'ds-btn-primary' : 'ds-btn-secondary'
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Deadline Đã Giao ({memberTasks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`ds-btn ds-btn-sm text-xs font-semibold flex items-center gap-1.5 shrink-0 ${activeTab === 'points' ? 'ds-btn-primary' : 'ds-btn-secondary'
                }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Lịch Sử Điểm ({pointHistory.length})</span>
            </button>
          </div>

          {/* Export Buttons: CHỈ HIỆN VỚI BAN ĐỐI NGOẠI - NHÂN SỰ */}
          {canExport && (
            <div className="flex items-center gap-2 shrink-0">
              <SignerSelect
                signers={signerOptions}
                selectedSignerId={chosenSigner?.id}
                onChange={setSelectedSignerId}
                compact
                className="shrink-0"
              />
              {activeTab === 'deadlines' ? (
                <button
                  type="button"
                  onClick={handlePrintDeadlines}
                  className="ds-btn ds-btn-primary ds-btn-sm text-xs font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                  title="In hoặc xuất file PDF báo cáo deadline của thành viên này"
                >
                  <Printer className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>In Báo Cáo Deadline</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePrintPoints}
                  className="ds-btn ds-btn-primary ds-btn-sm text-xs font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                  title="In hoặc xuất file PDF lịch sử điểm của thành viên này"
                >
                  <Printer className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Xuất Lịch Sử Điểm</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {activeTab === 'deadlines' ? (
            <div className="space-y-3">
              {/* Stat summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-slate-400 font-medium">Tổng nhiệm vụ</div>
                  <div className="text-base font-bold text-slate-100 font-mono mt-0.5">{memberTasks.length}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-emerald-400 font-medium">Hoàn thành</div>
                  <div className="text-base font-bold text-emerald-300 font-mono mt-0.5">{completedCount}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-blue-400 font-medium">Đang làm</div>
                  <div className="text-base font-bold text-blue-300 font-mono mt-0.5">{inProgressCount}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <div className="text-rose-400 font-medium">Quá hạn</div>
                  <div className="text-base font-bold text-rose-300 font-mono mt-0.5">{overdueCount}</div>
                </div>
              </div>

              {/* Task list */}
              {memberTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm italic">
                  Chưa có deadline / nhiệm vụ nào được giao cho thành viên này.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {memberTasks.map((t, idx) => {
                    const overdue = isOverdue(t.deadline, t.status);
                    const isDone = t.status === 'done' || t.status === 'completed';

                    return (
                      <div
                        key={t.id || idx}
                        className={`p-3.5 rounded-xl border transition-all ${isDone
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : overdue
                            ? 'bg-rose-500/10 border-rose-500/30'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${isDone
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : overdue
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : t.status === 'doing' || t.status === 'in_progress'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}>
                                {isDone ? '✓ Hoàn thành' : overdue ? '⚠️ Quá hạn' : t.status === 'doing' || t.status === 'in_progress' ? '⏳ Đang làm' : '📋 Cần làm'}
                              </span>

                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {t.department || member.deptName || 'Chung'}
                              </span>

                              {t.priority && (
                                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${t.priority === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'
                                  }`}>
                                  Ưu tiên: {t.priority === 'high' ? 'Cao' : 'Thường'}
                                </span>
                              )}
                            </div>

                            <h5 className="font-bold text-sm text-slate-100">{t.title}</h5>

                            {(t.description || t.desc) && (
                              <p className="text-xs text-slate-300 line-clamp-2">
                                {t.description || t.desc}
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-[11px] text-slate-400">Hạn chót:</div>
                            <div className={`text-xs font-mono font-bold ${overdue ? 'text-rose-400' : 'text-slate-200'}`}>
                              {t.deadline || 'Không giới hạn'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Stat summary */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Tổng điểm tích lũy hiện tại</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{totalEarnedPoints} </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Số lượt ghi nhận</div>
                  <div className="text-base font-bold font-mono text-slate-200 mt-0.5">{pointHistory.length}</div>
                </div>
              </div>

              {/* Point History List */}
              {pointHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm italic">
                  Chưa có lịch sử biến động điểm nào được ghi nhận.
                </div>
              ) : (
                <div className="space-y-2">
                  {pointHistory.map((item, idx) => {
                    const isPositive = (item.pointsDelta || 0) > 0;
                    return (
                      <div
                        key={item.id || idx}
                        className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">{item.date} {item.time || ''}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {item.category || 'Thi đua'}
                            </span>
                          </div>
                          <div className="text-slate-200 font-medium text-xs truncate">{item.title}</div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${isPositive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}>
                            {isPositive ? `+${item.pointsDelta}` : item.pointsDelta}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>
          </div>
          <button
            onClick={onClose}
            className="ds-btn ds-btn-secondary ds-btn-sm text-xs font-semibold px-4"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
