import React, { useState, useMemo, useEffect } from 'react';
import { useClub } from '../context/ClubContext';
import { Users, Calendar, Award, Clock, Search, CheckCircle2, Wallet, Plus, ArrowDownRight, ArrowUpRight, Gift, X, Printer, Check, Trash2 } from 'lucide-react';
import { MeetingManagement } from '../components/hr/MeetingManagement';
import { BirthdayManagement } from '../components/hr/BirthdayManagement';
import { PointManagement } from '../components/hr/PointManagement';
import { MemberDetailModal } from '../components/members/MemberDetailModal';
import { MemberRankingDetailModal } from '../components/hr/MemberRankingDetailModal';
import { RoleTitleDisplay } from '../utils/roleHelper';
import { WATERMARK_CSS, WATERMARK_HTML } from '../utils/watermark';
import { getAvailableSigners, findSigner, renderSignerFooterHtml } from '../utils/reportSigner';
import { SignerSelect } from '../components/hr/SignerSelect';

const Loading = () => (
  <div className="w-full max-w-[1720px] mx-auto px-4 flex items-center justify-center min-h-[60vh]">
    <div className="text-slate-400 text-sm font-mono animate-pulse">Đang tải dữ liệu Nhân sự...</div>
  </div>
);

export const InternalHRDashboard = () => {
  const {
    members, tasks, currentUser, isAdvisor: isAdvisorFromContext, isHRMember, isHRHead, isAdmin, finances, addFinanceRecord, updateFinanceStatus, deleteFinanceRecord,
    meetings, createMeeting, submitMeetingAttendance, submitMeetingMinutes, penalizeMember, updateMemberPoints,
    birthdayAssignments, assignBirthdayDuty, submitBirthdayImage, showToast
  } = useClub();

  if (!currentUser) {
    return <Loading />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('points'); // 'points', 'birthdays', 'deadlines', 'finance', 'meetings'

  const [financeForm, setFinanceForm] = useState({
    type: 'income',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 10)
  });

  // Meeting Form State
  const [meetingForm, setMeetingForm] = useState({ title: '', date: '', time: '' });
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);

  // Birthday Assignment State
  const [birthdayForm, setBirthdayForm] = useState({ month: new Date().getMonth() + 2, memberId: '' });

  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRankingMember, setSelectedRankingMember] = useState(null);
  const [rankingMonthFilter, setRankingMonthFilter] = useState('all');

  const isAdvisor = isAdvisorFromContext || Boolean(
    currentUser?.deptName?.toLowerCase().includes('cố vấn') ||
    currentUser?.department?.toLowerCase().includes('cố vấn') ||
    currentUser?.roleTitle?.toLowerCase().includes('cố vấn') ||
    currentUser?.roleTitle?.toLowerCase().includes('cựu')
  );

  useEffect(() => {
    if (isAdvisor && activeTab !== 'points' && activeTab !== 'birthdays') {
      setActiveTab('points');
    }
  }, [isAdvisor, activeTab]);

  const currentUserDeptName = String(currentUser?.deptName || currentUser?.department || '').toLowerCase();
  const currentUserRoleTitle = String(currentUser?.roleTitle || '').toLowerCase();

  // Quyền xuất file (In / PDF): CHỈ DÀNH RIÊNG CHO BAN ĐỐI NGOẠI - NHÂN SỰ
  const canExportHR = !isAdvisor && Boolean(
    isHRMember ||
    isHRHead ||
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
  const hrHeadName = chosenSigner?.name || 'Đặng Nguyệt Minh';

  const isAllowedBirthdayDuty = !isAdvisor && Boolean(
    isHRMember ||
    currentUserDeptName.includes('đối ngoại') ||
    currentUserDeptName.includes('nhân sự') ||
    currentUserDeptName.includes('đn-ns') ||
    currentUserDeptName.includes('dn-ns') ||
    currentUserDeptName === 'ban chủ nhiệm' ||
    currentUserDeptName === 'bcn' ||
    currentUser?.role === 'admin' ||
    currentUser?.memberCode === 'ADMIN'
  );

  const normalizeText = (text) => text ? text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

  // All members including Ban Cố Vấn (excluding only System Admin) — deduplicated by id
  const allHumanMembers = useMemo(() => {
    const seen = new Set();
    return members.filter(m => {
      const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase();
      const code = (m.memberCode || m.member_code || '').toUpperCase();
      if (roleTitle.includes('super admin') || code === 'ADMIN') return false;
      if (seen.has(m.id)) return false;
      seen.add(m.id);

      const q = normalizeText(searchQuery);
      return !q || normalizeText(m.name).includes(q) || normalizeText(m.memberCode).includes(q);
    });
  }, [members, searchQuery]);

  // Points ranking — đồng hạng nếu bằng điểm, không tính tài khoản hệ thống & Ban Cố Vấn / Cựu thành viên
  const rankedMembers = useMemo(() => {
    const seenRanked = new Set();
    const list = members.filter(m => {
      const rawRole = (m.roleTitle || m.role_title || '').toLowerCase();
      const rawDept = (m.deptName || m.department || '').toLowerCase();
      const normRole = normalizeText(rawRole);
      const normDept = normalizeText(rawDept);
      const code = (m.memberCode || m.member_code || '').toUpperCase();

      // Nguyên tắc: Không xuất hiện tài khoản Admin, Ban Cố Vấn, Cố vấn hoặc Cựu thành viên trên bảng thi đua
      if (
        code === 'ADMIN' ||
        normRole.includes('super admin') ||
        normRole.includes('co van') ||
        normRole.includes('cuu') ||
        normDept.includes('co van') ||
        rawDept.includes('cố vấn') ||
        rawDept.includes('c? v?n') ||
        rawRole.includes('cố vấn') ||
        rawRole.includes('cựu') ||
        m.status === 'Suspended'
      ) {
        return false;
      }

      if (seenRanked.has(m.id)) return false;
      seenRanked.add(m.id);

      const q = normalizeText(searchQuery);
      return !q || normalizeText(m.name).includes(q) || normalizeText(m.memberCode).includes(q);
    }).map(m => {
      // Tính điểm tổng thực tế từ các nhiệm vụ/biên bản/điểm danh đã hoàn thành
      const mTasks = (tasks || []).filter(t => {
        const assId = t.assigneeId || t.assignee_id;
        const assName = (t.assignee || '').trim().toLowerCase();
        const mName = (m.name || m.full_name || '').trim().toLowerCase();
        if (assId && (String(assId) === String(m.id) || (m.memberCode && String(assId) === String(m.memberCode)))) return true;
        if (assName && mName && (assName === mName || mName.includes(assName) || assName.includes(mName))) return true;
        return false;
      });
      const taskPoints = mTasks
        .filter(t => t.status === 'done' || t.status === 'completed')
        .reduce((sum, t) => sum + (Number(t.pointsReward) || 10), 0);

      const effectivePoints = Math.max(Number(m.points) || 0, taskPoints);
      return { ...m, points: effectivePoints };
    }).sort((a, b) => (b.points || 0) - (a.points || 0));

    let currentRank = 1;
    return list.map((m, idx) => {
      if (idx > 0) {
        const prevPoints = list[idx - 1].points || 0;
        const currPoints = m.points || 0;
        if (currPoints < prevPoints) {
          currentRank = currentRank + 1;
        }
      }
      return { ...m, displayRank: currentRank };
    });
  }, [members, tasks, searchQuery]);

  // Mở cửa sổ in / xuất PDF bảng xếp hạng thi đua chuẩn format CLB VMC
  const handlePrintRanking = () => {
    if (!rankedMembers || rankedMembers.length === 0) {
      if (typeof showToast === 'function') {
        showToast('Không có dữ liệu để in!', 'warning');
      }
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cho phép mở popup để xem bảng in báo cáo!');
      return;
    }

    const now = new Date();
    const todayStr = now.toLocaleDateString('vi-VN');
    const isAll = rankingMonthFilter === 'all';
    let month = now.getMonth() + 1;
    let year = now.getFullYear();
    if (!isAll && rankingMonthFilter) {
      [month, year] = rankingMonthFilter.split('-').map(Number);
    }

    const docTitle = isAll
      ? 'BẢNG XẾP HẠNG ĐIỂM THI ĐUA THÀNH VIÊN'
      : `BẢNG XẾP HẠNG ĐIỂM THI ĐUA - THÁNG ${month < 10 ? '0' + month : month}/${year}`;

    const tableRows = rankedMembers.map((m) => `
      <tr style="border-bottom: 1px solid #e2e8f0; text-align: left;">
        <td style="padding: 10px 12px; font-weight: bold; text-align: center;">${m.displayRank}</td>
        <td style="padding: 10px 12px; font-family: monospace; text-align: center;">${m.memberCode || m.member_code || ''}</td>
        <td style="padding: 10px 12px; font-weight: 600;">${m.name || ''}</td>
        <td style="padding: 10px 12px;">${m.class || m.class_name || '-'}</td>
        <td style="padding: 10px 12px;">${m.deptName || m.department || ''}</td>
        <td style="padding: 10px 12px;">${m.roleTitle || m.role_title || 'Thành Viên'}</td>
        <td style="padding: 10px 12px; font-weight: bold; text-align: right; color: #d97706; font-family: monospace; text-align: center;">${m.points || 0}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bảng Xếp Hạng Thi Đua - VMC</title>
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
              font-style: italic;
              color: #4b5563;
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
            <h2>${docTitle}</h2>
            <p>Ngày xuất dữ liệu: ${todayStr} • Tổng số thành viên xếp hạng: ${rankedMembers.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 55px; text-align: center;">Hạng</th>
                <th style="width: 95px; text-align: center;">Mã TV</th>
                <th style="text-align: center;">Họ và Tên</th>
                <th style="width: 75px; text-align: center;">Lớp</th>
                <th style="text-align: center;" >Ban Chuyên Môn</th>
                <th style="text-align: center;">Chức Vụ</th>
                <th style="width: 85px; text-align: center;">Điểm</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          ${renderSignerFooterHtml(chosenSigner, todayStr, currentUser?.name, 'NGƯỜI LẬP BẢNG')}
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

  // Danh sách thành viên nhận phân công & theo dõi deadline (Không bao gồm Ban Cố Vấn, Cố vấn, Cựu thành viên)
  const deadlineMembers = useMemo(() => {
    return allHumanMembers.filter(m => {
      const rawRole = (m.roleTitle || m.role_title || '').toLowerCase();
      const rawDept = (m.deptName || m.department || '').toLowerCase();
      const normRole = normalizeText(rawRole);
      const normDept = normalizeText(rawDept);
      const code = (m.memberCode || m.member_code || '').toUpperCase();

      if (
        code === 'ADMIN' ||
        normRole.includes('super admin') ||
        normRole.includes('co van') ||
        normRole.includes('cuu') ||
        normDept.includes('co van') ||
        rawDept.includes('cố vấn') ||
        rawRole.includes('cố vấn') ||
        rawRole.includes('cựu') ||
        m.status === 'Suspended'
      ) {
        return false;
      }
      return true;
    });
  }, [allHumanMembers]);

  // Helper to parse DOB in any format (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
  const parseDob = (dobStr) => {
    if (!dobStr) return { day: 0, month: 0 };
    const str = dobStr.toString().trim();
    let day = 0, month = 0;

    if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        } else {
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
        }
      }
    } else if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        } else {
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
        }
      }
    }

    return { day: isNaN(day) ? 0 : day, month: isNaN(month) ? 0 : month };
  };

  // Birthdays parsing supporting MySQL YYYY-MM-DD date format
  const getUpcomingBirthdays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mapped = [...allHumanMembers].map(m => {
      const { day, month } = parseDob(m.dob);
      if (!day || !month) return null;

      const currentYear = today.getFullYear();
      let nextBirthday = new Date(currentYear, month - 1, day);
      if (nextBirthday < today) {
        nextBirthday = new Date(currentYear + 1, month - 1, day);
      }

      const diffTime = nextBirthday.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...m,
        bDay: day,
        bMonth: month,
        daysUntil,
        formattedDob: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
      };
    }).filter(Boolean);

    return mapped.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  // Deadlines (Tasks mapped to members)
  const getMemberTasks = (m) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    const id = m?.id;
    const memberCode = m?.memberCode || m?.member_code;
    return tasks.filter(t => {
      const assId = t.assigneeId || t.assignee_id;
      if (!assId) return t.assignee === 'Cả Ban';
      return String(assId) === String(id) || (memberCode && String(assId) === String(memberCode));
    });
  };

  const isOverdue = (deadlineStr, status) => {
    if (!deadlineStr || status === 'done' || status === 'completed') return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const d = new Date(deadlineStr);
    d.setHours(0, 0, 0, 0);
    return d < now;
  };

  // In báo cáo deadline cá nhân của 1 thành viên
  const handlePrintMemberDeadlines = (m, mTasks) => {
    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (!printWindow) {
      alert('Vui lòng cho phép mở popup trình duyệt để xem và in báo cáo!');
      return;
    }

    const todayStr = new Date().toLocaleDateString('vi-VN');
    const tasksList = mTasks || getMemberTasks(m);

    const tableRows = tasksList.length === 0 ? `
      <tr>
        <td colspan="6" style="text-align: center; padding: 18px; color: #64748b; font-style: italic;">
          Thành viên chưa có deadline / nhiệm vụ nào được giao.
        </td>
      </tr>
    ` : tasksList.map((t, index) => {
      const overdue = isOverdue(t.deadline || t.dueDate, t.status);
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
          <td style="text-align: center; padding: 7px 10px; font-family: monospace;">${t.deadline || t.dueDate || '-'}</td>
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
          <title>Báo Cáo Deadline - ${m.name} - VMC</title>
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
            <p><strong>Họ và tên:</strong> ${m.name} &nbsp;•&nbsp; <strong>Mã TV:</strong> ${m.memberCode || m.member_code || '-'} &nbsp;•&nbsp; <strong>Ban:</strong> ${m.deptName || m.department || '-'}</p>
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

  // In báo cáo tổng hợp toàn bộ deadline trong CLB
  const handlePrintAllDeadlines = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (!printWindow) {
      alert('Vui lòng cho phép mở popup trình duyệt để xem và in báo cáo!');
      return;
    }

    const todayStr = new Date().toLocaleDateString('vi-VN');

    const allTaskRows = [];
    let count = 1;
    (deadlineMembers || []).forEach(m => {
      const mTasks = getMemberTasks(m);
      if (mTasks.length === 0) return;
      mTasks.forEach(t => {
        const overdue = isOverdue(t.deadline || t.dueDate, t.status);
        const statusText = t.status === 'done' || t.status === 'completed'
          ? '<span style="color: #166534; font-weight: bold;">✓ Hoàn thành</span>'
          : overdue
            ? '<span style="color: #991b1b; font-weight: bold;">⚠️ Quá hạn</span>'
            : t.status === 'doing' || t.status === 'in_progress'
              ? '<span style="color: #1e40af; font-weight: bold;">⏳ Đang làm</span>'
              : '<span style="color: #854d0e; font-weight: bold;">📋 Cần làm</span>';

        allTaskRows.push(`
          <tr>
            <td style="text-align: center; padding: 6px 8px;">${count++}</td>
            <td style="text-align: center; font-family: monospace; padding: 6px 8px;">${m.memberCode || m.member_code || '-'}</td>
            <td style="padding: 6px 8px; font-weight: 600;">${m.name}</td>
            <td style="padding: 6px 8px;">${m.deptName || m.department || '-'}</td>
            <td style="padding: 6px 8px; font-weight: 500;">${t.title || 'Nhiệm vụ'}</td>
            <td style="text-align: center; font-family: monospace; padding: 6px 8px;">${t.deadline || t.dueDate || '-'}</td>
            <td style="text-align: center; padding: 6px 8px;">${statusText}</td>
            <td style="text-align: center; padding: 6px 8px;">${t.priority === 'high' ? 'Cao' : t.priority === 'low' ? 'Thấp' : 'Trung bình'}</td>
          </tr>
        `);
      });
    });

    const rowsHtml = allTaskRows.length === 0 ? `
      <tr>
        <td colspan="8" style="text-align: center; padding: 18px; color: #64748b; font-style: italic;">
          Hiện tại chưa có nhiệm vụ nào được phân công trong câu lạc bộ.
        </td>
      </tr>
    ` : allTaskRows.join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Báo Cáo Tổng Hợp Deadline Toàn CLB - VMC</title>
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
              padding: 6px 8px;
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
            <h2>BÁO CÁO TỔNG HỢP TIẾN ĐỘ VÀ DEADLINE CÂU LẠC BỘ</h2>
            <p><strong>Đơn vị theo dõi:</strong> Ban Đối Ngoại - Nhân Sự &nbsp;•&nbsp; <strong>Tổng số nhiệm vụ đang theo dõi:</strong> ${allTaskRows.length}</p>
            <p style="font-style: italic; font-size: 10.5pt; color: #4b5563;">Ngày xuất báo cáo: ${todayStr} • Người lập: ${currentUser?.name || 'Ban Đối Ngoại - Nhân Sự'}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">STT</th>
                <th style="width: 80px; text-align: center;">Mã TV</th>
                <th style="min-width: 140px;">Họ và Tên</th>
                <th style="width: 130px;">Ban Chuyên Môn</th>
                <th>Tên Nhiệm Vụ</th>
                <th style="width: 100px; text-align: center;">Hạn Chót</th>
                <th style="width: 110px; text-align: center;">Trạng Thái</th>
                <th style="width: 75px; text-align: center;">Ưu Tiên</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
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

  const handleAddFinance = async (e) => {
    e.preventDefault();
    if (!financeForm.amount || !financeForm.description) return;

    const finalDate = financeForm.date || new Date().toISOString().slice(0, 10);
    const isAutoApproved = Boolean(
      isAdmin ||
      isHRHead ||
      currentUser?.role === 'admin' ||
      currentUser?.memberCode === 'ADMIN' ||
      String(currentUser?.roleTitle || '').toLowerCase().includes('trưởng') ||
      String(currentUser?.roleTitle || '').toLowerCase().includes('chủ nhiệm')
    );

    await addFinanceRecord({
      type: financeForm.type,
      amount: parseInt(financeForm.amount, 10),
      description: financeForm.description,
      date: finalDate,
      record_date: finalDate,
      loggedBy: currentUser?.name || 'Ban Đối Ngoại - Nhân Sự',
      status: isAutoApproved ? 'approved' : 'pending'
    });

    setFinanceForm({
      type: 'income',
      amount: '',
      description: '',
      date: new Date().toISOString().slice(0, 10)
    });

    if (!isAutoApproved) {
      alert('Đã gửi yêu cầu dự trù kinh phí tới Ban Quản Trị / Trưởng ban để duyệt!');
    }
  };

  const parseMonthYear = (dateStr) => {
    if (!dateStr) return { month: 0, year: 0 };
    const str = dateStr.toString().trim();
    if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length >= 2) {
        if (parts[0].length === 4) {
          return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) };
        } else if (parts[2]) {
          return { year: parseInt(parts[2].slice(0, 4), 10), month: parseInt(parts[1], 10) };
        } else {
          return { year: parseInt(parts[1], 10), month: parseInt(parts[0], 10) };
        }
      }
    } else if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length >= 2) {
        if (parts[2]) {
          return { year: parseInt(parts[2].slice(0, 4), 10), month: parseInt(parts[1], 10) };
        } else {
          return { year: parseInt(parts[1], 10), month: parseInt(parts[0], 10) };
        }
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    }
    return { month: 0, year: 0 };
  };

  const financeMonthOptions = useMemo(() => {
    const opts = [{ value: 'all', label: 'Tất cả các tháng' }];
    const thisYear = new Date().getFullYear();
    for (let y = thisYear; y >= thisYear - 1; y--) {
      for (let m = 12; m >= 1; m--) {
        opts.push({
          value: `${m}-${y}`,
          label: `Tháng ${m < 10 ? '0' + m : m}/${y}`,
          month: m,
          year: y
        });
      }
    }
    return opts;
  }, []);

  const [financeMonthFilter, setFinanceMonthFilter] = useState(`${new Date().getMonth() + 1}-${new Date().getFullYear()}`);

  const filteredFinances = useMemo(() => {
    if (financeMonthFilter === 'all') return finances || [];
    const [selM, selY] = financeMonthFilter.split('-').map(Number);
    return (finances || []).filter(item => {
      const { month, year } = parseMonthYear(item.date || item.record_date || item.created_at);
      return month === selM && year === selY;
    });
  }, [finances, financeMonthFilter]);

  const totalBalance = (finances || []).filter(f => f.status === 'approved').reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);

  const filteredIncome = useMemo(() => {
    return filteredFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + (f.amount || 0), 0);
  }, [filteredFinances]);

  const filteredExpense = useMemo(() => {
    return filteredFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + (f.amount || 0), 0);
  }, [filteredFinances]);

  const filteredBalance = filteredIncome - filteredExpense;

  const handlePrintFinance = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (!printWindow) {
      alert('Vui lòng cho phép mở popup để xem bản in!');
      return;
    }

    const todayStr = new Date().toLocaleDateString('vi-VN');
    const isAll = financeMonthFilter === 'all';
    let selM = 0, selY = 0;
    if (!isAll) {
      [selM, selY] = financeMonthFilter.split('-').map(Number);
    }

    const docTitleText = isAll
      ? 'BÁO CÁO TỔNG HỢP THU CHI QUỸ CÂU LẠC BỘ'
      : `BÁO CÁO THU CHI QUỸ CÂU LẠC BỘ - THÁNG ${selM < 10 ? '0' + selM : selM}/${selY}`;

    const tableRows = filteredFinances.length === 0 ? `
      <tr>
        <td colspan="7" style="text-align: center; padding: 18px; color: #64748b; font-style: italic;">
          Không có bản ghi thu chi nào trong khoảng thời gian đã chọn.
        </td>
      </tr>
    ` : filteredFinances.map((item, idx) => `
      <tr>
        <td style="text-align: center; padding: 7px 10px;">${idx + 1}</td>
        <td style="text-align: center; font-family: monospace; padding: 7px 10px;">${item.date || item.record_date || '-'}</td>
        <td style="padding: 7px 10px; font-weight: 600;">${item.description}</td>
        <td style="text-align: center; padding: 7px 10px;">
          ${item.type === 'income' ? '<span style="color: #15803d; font-weight: bold;">Thu Quỹ</span>' : '<span style="color: #b91c1c; font-weight: bold;">Chi Tiêu</span>'}
        </td>
        <td style="text-align: right; font-family: monospace; font-weight: bold; padding: 7px 10px; color: ${item.type === 'income' ? '#15803d' : '#b91c1c'};">
          ${item.type === 'income' ? '+' : '-'}${item.amount?.toLocaleString('vi-VN')} VNĐ
        </td>
        <td style="padding: 7px 10px;">${item.loggedBy || item.recorded_by || 'VMC'}</td>
        <td style="text-align: center; padding: 7px 10px;">${item.status === 'approved' ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitleText} - VMC</title>
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
            .total-row {
              background-color: #f1f5f9;
              font-weight: bold;
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
            <h2>${docTitleText}</h2>
            <p style="font-style: italic; font-size: 10.5pt; color: #4b5563;">Ngày xuất báo cáo: ${todayStr} • Người lập: ${currentUser?.name || 'Ban Đối Ngoại - Nhân Sự'}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 45px; text-align: center;">STT</th>
                <th style="width: 100px; text-align: center;">Ngày</th>
                <th>Nội Dung Thu / Chi</th>
                <th style="width: 120px; text-align: center;">Phân Loại</th>
                <th style="width: 130px; text-align: right;">Số Tiền</th>
                <th style="width: 150px;">Người Ghi Nhận</th>
                <th style="width: 100px; text-align: center;">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="4" style="text-align: right; padding: 8px 10px;">TỔNG THU:</td>
                <td style="text-align: right; font-family: monospace; color: #15803d; padding: 8px 10px;">+${filteredIncome.toLocaleString('vi-VN')} VNĐ</td>
                <td colspan="2"></td>
              </tr>
              <tr class="total-row">
                <td colspan="4" style="text-align: right; padding: 8px 10px;">TỔNG CHI:</td>
                <td style="text-align: right; font-family: monospace; color: #b91c1c; padding: 8px 10px;">-${filteredExpense.toLocaleString('vi-VN')} VNĐ</td>
                <td colspan="2"></td>
              </tr>
              <tr class="total-row" style="background-color: #e2e8f0; font-size: 11.5pt;">
                <td colspan="4" style="text-align: right; padding: 9px 10px; font-weight: bold;">TỒN QUỸ / CHÊNH LỆCH:</td>
                <td style="text-align: right; font-family: monospace; font-weight: bold; color: ${filteredBalance >= 0 ? '#15803d' : '#b91c1c'}; padding: 9px 10px;">
                  ${filteredBalance >= 0 ? '+' : ''}${filteredBalance.toLocaleString('vi-VN')} VNĐ
                </td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>

          ${renderSignerFooterHtml(chosenSigner, todayStr, currentUser?.name, 'NGƯỜI LẬP BẢNG')}
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

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Users className="text-blue-500 w-8 h-8 shrink-0" />
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
              Thi Đua & Sinh Nhật
            </h1>
          </div>
        </div>

        <div className="relative flex items-center w-full md:w-72">
          <Search className="absolute left-4 w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm mã hoặc tên TV..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ds-input pl-12"
          />
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        <button
          onClick={() => setActiveTab('points')}
          className={`ds-btn ${activeTab === 'points' ? 'ds-btn-primary' : 'ds-btn-secondary'} shrink-0`}
        >
          <Award className="w-5 h-5" /> Bảng Xếp Hạng Điểm Thi Đua
        </button>
        <button
          onClick={() => setActiveTab('birthdays')}
          className={`ds-btn ${activeTab === 'birthdays' ? 'ds-btn-primary' : 'ds-btn-secondary'} shrink-0`}
        >
          <Gift className="w-5 h-5" /> Sinh Nhật
        </button>
        {!isAdvisor && (
          <>
            <button
              onClick={() => setActiveTab('deadlines')}
              className={`ds-btn ${activeTab === 'deadlines' ? 'ds-btn-primary' : 'ds-btn-secondary'} shrink-0`}
            >
              <Clock className="w-5 h-5" /> Theo Dõi Deadline
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`ds-btn ${activeTab === 'meetings' ? 'ds-btn-primary' : 'ds-btn-secondary'} shrink-0`}
            >
              <Calendar className="w-5 h-5" /> Quản Lý Cuộc Họp
            </button>
            {(isHRMember || currentUser?.deptName === 'Ban Chủ Nhiệm' || currentUser?.department === 'bcn') && (
              <button
                onClick={() => setActiveTab('finance')}
                className={`ds-btn ${activeTab === 'finance' ? 'ds-btn-primary' : 'ds-btn-secondary'} shrink-0`}
              >
                <Wallet className="w-5 h-5" /> Quản Lý Thu Chi
              </button>
            )}
          </>
        )}
      </div>

      {/* Content Area */}
      <div className="ds-card p-6">
        {/* POINTS TAB */}
        {activeTab === 'points' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                  <Award className="text-amber-400 w-6 h-6 shrink-0" />
                  <span>Bảng Điểm Thi Đua</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Đang hiển thị: <strong className="text-amber-300 font-mono">{rankedMembers.length}</strong> thành viên xếp hạng
                </p>
              </div>

              {canExportHR && (
                <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium pl-1">Tháng:</span>
                  <select
                    value={rankingMonthFilter}
                    onChange={e => setRankingMonthFilter(e.target.value)}
                    className="bg-slate-800 text-slate-200 text-xs py-1 px-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="all">Tất cả</option>
                    {financeMonthOptions.filter(o => o.value !== 'all').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  <SignerSelect
                    signers={signerOptions}
                    selectedSignerId={chosenSigner?.id}
                    onChange={setSelectedSignerId}
                  />

                  <button
                    type="button"
                    onClick={handlePrintRanking}
                    className="ds-btn ds-btn-primary ds-btn-xs text-xs font-semibold flex items-center gap-1.5"
                    title="In hoặc lưu báo cáo PDF bảng xếp hạng thi đua"
                  >
                    <Printer className="w-3.5 h-3.5 shrink-0" />
                    <span>In / PDF</span>
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rankedMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    const fullMember = (members || []).find(mem => String(mem.id) === String(m.id) || (m.memberCode && String(mem.memberCode) === String(m.memberCode))) || m;
                    setSelectedRankingMember({ ...fullMember, displayRank: m.displayRank, points: m.points });
                  }}
                  className="ds-card p-5 flex items-center gap-4 cursor-pointer hover:border-amber-500/50 hover:scale-[1.01] transition-all group"
                  title="Bấm để xem chi tiết deadline và lịch sử điểm của thành viên"
                >
                  <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-lg ${m.displayRank === 1
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                    : m.displayRank === 2
                      ? 'bg-slate-300/20 text-slate-300 border border-slate-400/50'
                      : m.displayRank === 3
                        ? 'bg-orange-600/20 text-orange-400 border border-orange-600/50'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                    {m.displayRank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors">{m.name}</div>
                    <div className="text-xs text-slate-400 truncate font-medium">{m.deptName || m.department || 'Ban Chuyên Môn'}</div>
                    <RoleTitleDisplay roleTitle={m.roleTitle || m.role_title} className="text-xs text-blue-400 font-semibold mt-0.5" />
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-black text-blue-400 font-mono">{m.points || 0}</div>
                  </div>
                </div>
              ))}
            </div>

            {!isAdvisor && isHRMember && (
              <div className="mt-8 pt-8 border-t border-[var(--border-default)]">
                <PointManagement />
              </div>
            )}
          </div>
        )}

        {/* BIRTHDAYS TAB */}
        {activeTab === 'birthdays' && (
          <BirthdayManagement
            upcomingBirthdays={upcomingBirthdays}
            allHumanMembers={allHumanMembers}
            birthdayAssignments={birthdayAssignments}
            assignBirthdayDuty={assignBirthdayDuty}
            submitBirthdayImage={submitBirthdayImage}
            isAllowedBirthdayDuty={isAllowedBirthdayDuty}
            currentUser={currentUser}
          />
        )}

        {/* DEADLINES TAB */}
        {activeTab === 'deadlines' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                <Clock className="text-blue-400" /> Theo Dõi Tiến Độ & Deadline
              </h3>
              {canExportHR && (
                <div className="flex items-center gap-2 flex-wrap">
                  <SignerSelect
                    signers={signerOptions}
                    selectedSignerId={chosenSigner?.id}
                    onChange={setSelectedSignerId}
                  />
                  <button
                    type="button"
                    onClick={handlePrintAllDeadlines}
                    className="ds-btn ds-btn-primary ds-btn-xs text-xs font-semibold flex items-center gap-1.5"
                    title="In báo cáo tổng hợp tiến độ và deadline toàn CLB"
                  >
                    <Printer className="w-3.5 h-3.5 shrink-0" />
                    <span>In Báo Cáo Deadline Toàn CLB</span>
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deadlineMembers.length === 0 ? (
                <div className="col-span-1 md:col-span-2 text-center text-slate-500 italic py-8">
                  Không có thành viên nào.
                </div>
              ) : (
                deadlineMembers.map(m => {
                  const mTasks = getMemberTasks(m);
                  const pendingTasks = mTasks.filter(t => t.status !== 'completed' && t.status !== 'done');
                  const completedTasks = mTasks.filter(t => t.status === 'completed' || t.status === 'done');
                  return (
                    <div key={m.id} className="ds-card p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                        <div
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity min-w-0 flex-1 mr-2"
                          onClick={() => {
                            const fullMember = (members || []).find(mem => String(mem.id) === String(m.id) || (m.memberCode && String(mem.memberCode) === String(m.memberCode))) || m;
                            setSelectedMember(fullMember);
                          }}
                          title="Bấm để xem chi tiết thông tin thành viên"
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-500/30 flex items-center justify-center font-bold text-white text-base shadow-sm">
                            {(m.avatar || m.avatar_url) ? (
                              <img
                                src={m.avatar || m.avatar_url}
                                alt={m.name}
                                onError={(e) => { e.currentTarget.src = '/vmc-logo.jpg'; }}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{m.name?.substring(0, 1) || 'V'}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="font-bold text-slate-100 hover:text-blue-400 transition-colors truncate">{m.name}</div>
                            <div className="text-xs text-slate-400 truncate">{m.deptName || m.department} • {m.memberCode}</div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2 shrink-0">
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                            {completedTasks.length}/{mTasks.length} Hoàn thành
                          </span>
                          {canExportHR && (
                            <button
                              type="button"
                              onClick={() => handlePrintMemberDeadlines(m, mTasks)}
                              className="ds-btn ds-btn-secondary ds-btn-xs text-xs font-semibold flex items-center gap-1 hover:border-blue-500/50"
                              title="In danh sách deadline của thành viên này"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>In Deadline</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {mTasks.length === 0 ? (
                          <div className="text-xs text-slate-500 italic py-2">Chưa được phân công nhiệm vụ nào.</div>
                        ) : (
                          mTasks.map(t => (
                            <div key={t.id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-900/50 border border-slate-800">
                              <span className="text-slate-300 truncate max-w-[200px]">{t.title}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'completed' || t.status === 'done'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                {t.status === 'completed' || t.status === 'done' ? 'Xong' : t.dueDate || 'Đang làm'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* MEETINGS TAB */}
        {activeTab === 'meetings' && (
          <MeetingManagement
            meetings={meetings}
            members={deadlineMembers}
            createMeeting={createMeeting}
            submitMeetingAttendance={submitMeetingAttendance}
            submitMeetingMinutes={submitMeetingMinutes}
            penalizeMember={penalizeMember}
            currentUser={currentUser}
            isHRMember={isHRMember}
            isHRHead={isHRHead}
            isAdmin={isAdmin}
            canExport={canExportHR}
            hrHeadName={hrHeadName}
          />
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-default)] pb-4">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                  <Wallet className="text-emerald-400" /> Quản Lý Quỹ & Thu Chi
                </h3>
              </div>

              {canExportHR && (
                <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] p-1.5 rounded-lg border border-[var(--border-default)]">
                  <span className="text-xs text-[var(--text-secondary)] font-medium pl-1">Tháng:</span>
                  <select
                    value={financeMonthFilter}
                    onChange={e => setFinanceMonthFilter(e.target.value)}
                    className="bg-[var(--bg-card)] text-[var(--text-primary)] text-xs py-1 px-2 rounded border border-[var(--border-default)] focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {financeMonthOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  <SignerSelect
                    signers={signerOptions}
                    selectedSignerId={chosenSigner?.id}
                    onChange={setSelectedSignerId}
                  />

                  <button
                    type="button"
                    onClick={handlePrintFinance}
                    className="ds-btn ds-btn-primary ds-btn-xs text-xs font-semibold flex items-center gap-1.5"
                    title="In hoặc lưu file PDF báo cáo thu chi quỹ của tháng đã chọn"
                  >
                    <Printer className="w-3.5 h-3.5 shrink-0" />
                    <span>In Thu Chi</span>
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleAddFinance} className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-default)]">
              <div>
                <label className="text-xs text-[var(--text-secondary)] font-medium mb-1 block">Loại khoản</label>
                <select
                  value={financeForm.type}
                  onChange={e => setFinanceForm({ ...financeForm, type: e.target.value })}
                  className="ds-input text-xs"
                >
                  <option value="income">➕ Thu Quỹ</option>
                  <option value="expense">➖ Chi Phí Hoạt Động</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] font-medium mb-1 block">Số tiền (VNĐ)</label>
                <input
                  type="number"
                  placeholder="100000"
                  value={financeForm.amount}
                  onChange={e => setFinanceForm({ ...financeForm, amount: e.target.value })}
                  className="ds-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] font-medium mb-1 block">Ngày ghi nhận</label>
                <input
                  type="date"
                  value={financeForm.date}
                  onChange={e => setFinanceForm({ ...financeForm, date: e.target.value })}
                  className="ds-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] font-medium mb-1 block">Nội dung chi tiết</label>
                <input
                  type="text"
                  placeholder="Nội dung thu/chi..."
                  value={financeForm.description}
                  onChange={e => setFinanceForm({ ...financeForm, description: e.target.value })}
                  className="ds-input text-xs"
                  required
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="ds-btn ds-btn-primary text-xs w-full justify-center">
                  <Plus className="w-4 h-4" /> Thêm Thu Chi
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[var(--text-primary)] text-sm">
                  Lịch Sử Thu Chi & Dự Trù {financeMonthFilter !== 'all' ? `(${filteredFinances.length} bản ghi)` : ''}
                </h4>
              </div>
              <div className="divide-y divide-[var(--border-default)] bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
                {filteredFinances.length === 0 ? (
                  <div className="p-6 text-center text-[var(--text-secondary)] text-sm">Không có bản ghi thu chi nào trong thời gian đã chọn.</div>
                ) : (
                  filteredFinances.map(item => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm hover:bg-[var(--bg-tertiary)] transition-colors">
                      <div className="flex items-center gap-3">
                        {item.type === 'income' ? (
                          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0"><ArrowDownRight className="w-4 h-4" /></div>
                        ) : (
                          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0"><ArrowUpRight className="w-4 h-4" /></div>
                        )}
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{item.description}</div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {item.date || item.record_date} • Ghi bởi {item.loggedBy || item.logged_by || item.recorded_by || 'VMC'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="text-right">
                          <div className={`font-mono font-bold ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.type === 'income' ? '+' : '-'}{Number(item.amount || 0).toLocaleString('vi-VN')} VNĐ
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${item.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {item.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        </div>

                        {(isAdmin || isHRHead || currentUser?.role === 'admin' || currentUser?.memberCode === 'ADMIN') && (
                          <div className="flex items-center gap-1.5 pl-2 border-l border-[var(--border-default)]">
                            {item.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => updateFinanceStatus(item.id, 'approved')}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                title="Duyệt khoản này"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi thu chi này khỏi CSDL?')) {
                                  deleteFinanceRecord(item.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                              title="Xóa khoản thu chi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Member Ranking Detail Modal (Deadlines & Points History for Leaderboard) */}
      <MemberRankingDetailModal
        show={Boolean(selectedRankingMember)}
        member={selectedRankingMember}
        members={members}
        onClose={() => setSelectedRankingMember(null)}
        tasks={tasks}
        meetings={meetings}
        birthdayAssignments={birthdayAssignments}
        canExport={canExportHR}
        currentUser={currentUser}
        hrHeadName={hrHeadName}
      />

      {/* Member Details Modal */}
      <MemberDetailModal
        show={Boolean(selectedMember)}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};
