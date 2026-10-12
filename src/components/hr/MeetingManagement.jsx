import React, { useState, useMemo } from 'react';
import { useClub } from '../../context/ClubContext';
import { Plus, Users, Clock, CheckCircle2, FileText, AlertCircle, Printer, Calendar } from 'lucide-react';
import { WATERMARK_CSS, WATERMARK_HTML } from '../../utils/watermark';
import { getAvailableSigners, findSigner, renderSignerFooterHtml } from '../../utils/reportSigner';
import { SignerSelect } from './SignerSelect';

export const MeetingManagement = ({
  members: propMembers,
  canExport = false,
  hrHeadName = 'Đặng Nguyệt Minh'
}) => {
  const {
    meetings,
    createMeeting,
    cancelMeeting,
    updateMeeting,
    members: clubMembers,
    submitMeetingAttendance,
    submitMeetingMinutes,
    currentUser,
    isHRHead,
    isHRMember,
    isAdvisor: isAdvisorFromContext
  } = useClub();

  const members = useMemo(() => {
    return (propMembers && propMembers.length > 0) ? propMembers : (clubMembers || []);
  }, [propMembers, clubMembers]);

  const signerOptions = useMemo(() => getAvailableSigners(members), [members]);
  const [selectedSignerId, setSelectedSignerId] = useState('');
  const chosenSigner = useMemo(() => findSigner(signerOptions, selectedSignerId), [signerOptions, selectedSignerId]);

  // Danh sách thành viên chính thức hợp lệ (loại trừ ADMIN, Ban Cố Vấn, Cựu, Đình chỉ)
  const activeClubMembers = useMemo(() => {
    const seen = new Set();
    return (members || []).filter(m => {
      const role = (m.roleTitle || m.role_title || '').toLowerCase();
      const dept = (m.deptName || m.department || '').toLowerCase();
      const code = (m.memberCode || m.member_code || '').toUpperCase();
      if (
        code === 'ADMIN' ||
        role.includes('super admin') ||
        role.includes('cố vấn') ||
        dept.includes('cố vấn') ||
        role.includes('cựu') ||
        m.status === 'Suspended'
      ) {
        return false;
      }
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [members]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '', attendanceTakerId: '', minuteTakerId: '' });
  const [editMeetingId, setEditMeetingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const todayDate = new Date().toISOString().split('T')[0];

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState(`${currentMonth}-${currentYear}`);

  const isAdvisor = isAdvisorFromContext || Boolean(
    currentUser?.deptName?.toLowerCase().includes('cố vấn') ||
    currentUser?.department?.toLowerCase().includes('cố vấn') ||
    currentUser?.roleTitle?.toLowerCase().includes('cố vấn') ||
    currentUser?.roleTitle?.toLowerCase().includes('cựu')
  );

  const canExportHR = !isAdvisor && (canExport || Boolean(
    isHRHead ||
    isHRMember ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUser?.deptName?.toLowerCase().includes('đối ngoại') ||
    currentUser?.deptName?.toLowerCase().includes('nhân sự') ||
    currentUser?.deptName?.toLowerCase().includes('đn-ns') ||
    currentUser?.deptName?.toLowerCase().includes('dn-ns')
  ));

  const monthOptions = useMemo(() => {
    const opts = [];
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

  const handlePrintMonthlyAttendance = () => {
    const [selM, selY] = selectedAttendanceMonth.split('-').map(Number);
    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (!printWindow) {
      alert('Vui lòng cho phép mở popup để xem bản in!');
      return;
    }

    const todayStr = new Date().toLocaleDateString('vi-VN');

    // Lọc các cuộc họp trong tháng và sắp xếp theo ngày tăng dần
    const meetingsInMonth = (meetings || [])
      .filter(m => {
        if (!m.date) return false;
        const { month, year } = parseMonthYear(m.date);
        return month === selM && year === selY;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date + (a.time ? 'T' + a.time : '')).getTime() || 0;
        const timeB = new Date(b.date + (b.time ? 'T' + b.time : '')).getTime() || 0;
        return timeA - timeB;
      });

    // Thành viên hợp lệ thực tế của CLB (10 thành viên)
    const eligibleMembers = (activeClubMembers && activeClubMembers.length > 0)
      ? activeClubMembers
      : (members || []).filter(m => {
          const role = (m.roleTitle || m.role_title || '').toLowerCase();
          const dept = (m.deptName || m.department || '').toLowerCase();
          const code = (m.memberCode || m.member_code || '').toUpperCase();
          return code !== 'ADMIN' && !role.includes('super admin') && !role.includes('cố vấn') && !dept.includes('cố vấn') && !role.includes('cựu') && m.status !== 'Suspended';
        });
    const eligibleMemberIds = new Set(eligibleMembers.map(m => String(m.id)));

    const memberStats = eligibleMembers.map(m => {
      let present = 0;
      let late = 0;
      let absent = 0;

      meetingsInMonth.forEach(mtg => {
        const attList = mtg.attendanceData || mtg.attendees || [];
        const rec = attList.find(a => String(a.memberId || a.id) === String(m.id));
        if (rec) {
          if (rec.status === 'present') present++;
          else if (rec.status === 'late') late++;
          else if (rec.status === 'absent' || rec.status === 'absent_excused') absent++;
        } else if (mtg.status === 'completed') {
          absent++;
        }
      });

      const totalSessions = meetingsInMonth.length;
      const rate = totalSessions > 0 ? Math.round(((present + late * 0.5) / totalSessions) * 100) : 0;
      return { ...m, present, late, absent, rate, totalSessions };
    });

    // Tạo HTML bảng điểm danh
    const summaryRows = memberStats.map((m, idx) => `
      <tr>
        <td style="text-align: center; padding: 6px 8px;">${idx + 1}</td>
        <td style="text-align: center; font-family: monospace; padding: 6px 8px;">${m.memberCode || m.member_code || '-'}</td>
        <td style="padding: 6px 8px; font-weight: 600;">${m.name}</td>
        <td style="text-align: center; padding: 6px 8px;">${m.class || m.class_name || '-'}</td>
        <td style="padding: 6px 8px;">${m.deptName || m.department || '-'}</td>
        <td style="text-align: center; font-weight: bold; color: #15803d; padding: 6px 8px;">${m.present}</td>
        <td style="text-align: center; font-weight: bold; color: #b45309; padding: 6px 8px;">${m.late}</td>
        <td style="text-align: center; font-weight: bold; color: #b91c1c; padding: 6px 8px;">${m.absent}</td>
      </tr>
    `).join('');

    const meetingListRows = meetingsInMonth.length === 0 ? `
      <tr>
        <td colspan="7" style="text-align: center; padding: 12px; color: #64748b; font-style: italic;">
          Không có cuộc họp / buổi sinh hoạt nào được ghi nhận trong tháng ${selM}/${selY}.
        </td>
      </tr>
    ` : meetingsInMonth.map((mtg, idx) => {
      // Chỉ tính số lượng có mặt từ các thành viên chính thức hợp lệ (tránh tính nhầm các tài khoản cố vấn/cựu)
      const attList = (mtg.attendanceData || []).filter(a => eligibleMemberIds.has(String(a.memberId || a.id)));
      const presentCount = attList.filter(a => a.status === 'present').length;
      const taker = (clubMembers || members || []).find(mem => String(mem.id) === String(mtg.attendanceTakerId));
      const minute = (clubMembers || members || []).find(mem => String(mem.id) === String(mtg.minuteTakerId));

      return `
        <tr>
          <td style="text-align: center; padding: 6px 8px;">${idx + 1}</td>
          <td style="padding: 6px 8px; font-weight: 600;">${mtg.title}</td>
          <td style="text-align: center; padding: 6px 8px;">${mtg.date}</td>
          <td style="text-align: center; padding: 6px 8px;">${mtg.time}</td>
          <td style="padding: 6px 8px;">${taker?.name || 'Chưa phân công'}</td>
          <td style="padding: 6px 8px;">${minute?.name || 'Chưa phân công'}</td>
          <td style="text-align: center; padding: 6px 8px; font-weight: bold;">${presentCount}/${eligibleMembers.length} TV</td>
        </tr>
      `;
    }).join('');

    // 3. Ma trận chi tiết điểm danh từng buổi theo ngày thực tế của các cuộc họp
    const formatShortDate = (dateStr) => {
      if (!dateStr) return '';
      const str = dateStr.toString().trim();
      if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length >= 3) {
          if (parts[0].length === 4) {
            return `${parts[2].slice(0, 2)}/${parts[1]}`;
          } else {
            return `${parts[0]}/${parts[1]}`;
          }
        }
      } else if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length >= 2) {
          return `${parts[0]}/${parts[1]}`;
        }
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
      return '';
    };

    const hasMeetings = meetingsInMonth.length > 0;

    const matrixColHeaders = hasMeetings ? meetingsInMonth.map((mtg, i) => {
      const shortD = formatShortDate(mtg.date);
      return `
        <th style="width: 28px; min-width: 26px; text-align: center; vertical-align: bottom; padding: 6px 1px; height: 52px;">
          <span style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; font-size: 9pt; font-weight: bold; letter-spacing: 0.5px; display: inline-block;">
            ${shortD || `B.${i + 1}`}
          </span>
        </th>
      `;
    }).join('') : '';

    const matrixRows = memberStats.length === 0 ? `
      <tr>
        <td colspan="${hasMeetings ? meetingsInMonth.length + 5 : 5}" style="text-align: center; padding: 12px; color: #64748b; font-style: italic;">
          Chưa có dữ liệu thành viên
        </td>
      </tr>
    ` : !hasMeetings ? `
      <tr>
        <td colspan="5" style="text-align: center; padding: 18px; color: #64748b; font-style: italic;">
          Không có cuộc họp / buổi sinh hoạt nào được ghi nhận trong tháng ${selM}/${selY} để lập bảng chi tiết điểm danh.
        </td>
      </tr>
    ` : memberStats.map((m, idx) => {
      const sessionCells = meetingsInMonth.map((mtg) => {
        const attList = mtg.attendanceData || mtg.attendees || [];
        const rec = attList.find(a => String(a.memberId || a.id) === String(m.id));
        let cellContent = '&nbsp;';
        if (rec) {
          if (rec.status === 'present') {
            cellContent = '<span style="color: #15803d; font-weight: bold; font-size: 11pt;">✓</span>';
          } else if (rec.status === 'late') {
            cellContent = '<span style="color: #b45309; font-weight: bold; font-size: 9.5pt;">M</span>';
          } else if (rec.status === 'absent') {
            cellContent = '<span style="color: #b91c1c; font-weight: bold; font-size: 9.5pt;">V</span>';
          }
        } else if (mtg.status === 'completed') {
          cellContent = '<span style="color: #b91c1c; font-weight: bold; font-size: 9.5pt;">V</span>';
        }
        return `<td style="text-align: center; padding: 4px 1px; height: 26px; width: 28px;">${cellContent}</td>`;
      }).join('');

      return `
        <tr>
          <td style="text-align: center; padding: 4px 6px;">${idx + 1}</td>
          <td style="text-align: center; font-family: monospace; font-size: 9pt; padding: 4px 6px;">${m.memberCode || m.member_code || '-'}</td>
          <td style="padding: 4px 6px; font-weight: 600; white-space: nowrap;">${m.name}</td>
          <td style="text-align: center; font-size: 9pt; padding: 4px 6px;">${m.class || m.class_name || '-'}</td>
          ${sessionCells}
          <td style="padding: 4px 6px; font-size: 8.5pt; text-align: center; color: #64748b;">&nbsp;</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Báo Cáo Điểm Danh Tháng ${selM}/${selY} - VMC</title>
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
              margin-top: 10px; 
              font-size: 10pt; 
            }
            th, td {
              border: 1px solid #64748b;
              padding: 5px 6px;
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
              margin-top: 30px; 
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
            <h2>BÁO CÁO ĐIỂM DANH SINH HOẠT CLB - THÁNG ${selM}/${selY}</h2>
            <p><strong>Tháng theo dõi:</strong> Tháng ${selM < 10 ? '0' + selM : selM}/${selY} &nbsp;•&nbsp; <strong>Số buổi họp/sinh hoạt:</strong> ${meetingsInMonth.length} &nbsp;•&nbsp; <strong>Tổng số thành viên:</strong> ${eligibleMembers.length}</p>
            <p style="font-style: italic; font-size: 10.5pt; color: #4b5563;">Ngày xuất báo cáo: ${todayStr} • Người lập: ${currentUser?.name || 'Ban Đối Ngoại - Nhân Sự'}</p>
          </div>

          <h3 style="font-size: 12pt; text-transform: uppercase; margin: 15px 0 5px 0;">1. Bảng Tổng Hợp Chuyên Cần Thành Viên</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">STT</th>
                <th style="width: 85px; text-align: center;">Mã TV</th>
                <th>Họ và Tên</th>
                <th style="width: 70px; text-align: center;">Lớp</th>
                <th>Ban Chuyên Môn</th>
                <th style="width: 75px; text-align: center;">Có Mặt</th>
                <th style="width: 75px; text-align: center;">Đi Muộn</th>
                <th style="width: 75px; text-align: center;">Vắng</th>
              </tr>
            </thead>
            <tbody>
              ${summaryRows}
            </tbody>
          </table>

          <h3 style="font-size: 12pt; text-transform: uppercase; margin: 25px 0 5px 0;">2. Danh Sách Các Buổi Họp / Sinh Hoạt Trong Tháng</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">STT</th>
                <th>Tên Buổi Sinh Hoạt / Họp</th>
                <th style="width: 100px; text-align: center;">Ngày</th>
                <th style="width: 70px; text-align: center;">Giờ</th>
                <th style="width: 160px;">Phụ Trách Điểm Danh</th>
                <th style="width: 160px;">Ghi Biên Bản</th>
                <th style="width: 110px; text-align: center;">Có Mặt</th>
              </tr>
            </thead>
            <tbody>
              ${meetingListRows}
            </tbody>
          </table>

          <div style="page-break-before: always; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
              <div>
                <h3 style="font-size: 12pt; text-transform: uppercase; margin: 0;">3. Bảng Chi Tiết Điểm Danh Từng Buổi Sinh Hoạt</h3>
                ${hasMeetings ? `
                  <p style="margin: 4px 0 0 0; font-size: 9.5pt; font-style: italic; color: #475569;">
                    (Ký hiệu: <strong style="color: #15803d;">✓</strong> : Có mặt &nbsp;|&nbsp; <strong style="color: #b45309;">M</strong> : Đi muộn &nbsp;|&nbsp; <strong style="color: #b91c1c;">V</strong> : Vắng mặt)
                  </p>
                ` : ''}
              </div>
              <div style="font-size: 9.5pt; color: #475569; font-style: italic;">
                Tháng ${selM < 10 ? '0' + selM : selM}/${selY}
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 35px; text-align: center;">STT</th>
                  <th style="width: 80px; text-align: center;">Mã TV</th>
                  <th style="min-width: 130px; text-align: left;">Họ và Tên</th>
                  <th style="width: 55px; text-align: center;">Lớp</th>
                  ${matrixColHeaders}
                  <th style="width: 75px; text-align: center;">Ghi Chú</th>
                </tr>
              </thead>
              <tbody>
                ${matrixRows}
              </tbody>
            </table>
          </div>

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

  const [activeAttendanceMeeting, setActiveAttendanceMeeting] = useState(null);
  const [attendanceState, setAttendanceState] = useState({});

  const handleCreate = (e) => {
    e.preventDefault();
    createMeeting(formData);
    setFormData({ title: '', date: '', time: '', attendanceTakerId: '', minuteTakerId: '' });
    setShowForm(false);
  };

  const startAttendance = (mtg) => {
    setActiveAttendanceMeeting(mtg);
    const initial = {};
    activeClubMembers.forEach(m => { initial[m.id] = 'present'; });
    setAttendanceState(initial);
  };

  const handleAttendanceSubmit = () => {
    const data = Object.keys(attendanceState).map(memberId => ({
      memberId,
      status: attendanceState[memberId]
    }));
    submitMeetingAttendance(activeAttendanceMeeting.id, data);
    setActiveAttendanceMeeting(null);
  };

  const handleMinuteSubmit = (mtgId) => {
    const link = prompt('Vui lòng dán Link Google Docs/Drive biên bản cuộc họp:');
    if (link) {
      submitMeetingMinutes(mtgId, link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="text-purple-400" /> Quản Lý Điểm Danh & Họp
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          {canExportHR && (
            <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 font-medium pl-1">Tháng:</span>
              <select
                value={selectedAttendanceMonth}
                onChange={e => setSelectedAttendanceMonth(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs py-1 px-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {monthOptions.map(opt => (
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
                onClick={handlePrintMonthlyAttendance}
                className="ds-btn ds-btn-primary ds-btn-xs text-xs font-semibold flex items-center gap-1.5"
                title="In hoặc lưu báo cáo PDF điểm danh sinh hoạt của tháng này"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span>In Điểm Danh</span>
              </button>
            </div>
          )}

          {isHRHead && (
            <button onClick={() => setShowForm(!showForm)} className="ds-btn ds-btn-primary ds-btn-xs">
              <Plus className="w-4 h-4" /> Tạo Cuộc Họp
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="ds-card p-5 border border-purple-500/30 space-y-4">
          <div>
            <label className="ds-field-label">Tên cuộc họp</label>
            <input required type="text" className="ds-input" placeholder="VD: Họp giao ban đầu tháng" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="ds-field-label">Ngày họp</label>
              <input required type="date" min={todayDate} className="ds-input" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div>
              <label className="ds-field-label">Giờ họp</label>
              <input required type="time" className="ds-input" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="ds-field-label">Người điểm danh</label>
              <select className="ds-input" value={formData.attendanceTakerId} onChange={e => setFormData({ ...formData, attendanceTakerId: e.target.value })}>
                <option value="">-- Chọn thành viên --</option>
                {activeClubMembers
                  .filter(m => {
                    const dept = (m.deptName || m.department || '').toLowerCase();
                    return dept.includes('đối ngoại') || dept.includes('nhân sự') || dept.includes('chủ nhiệm');
                  })
                  .map(m => <option key={m.id} value={m.id}>{m.name} ({m.deptName || m.department})</option>)}
              </select>
            </div>
            <div>
              <label className="ds-field-label">Người ghi biên bản</label>
              <select className="ds-input" value={formData.minuteTakerId} onChange={e => setFormData({ ...formData, minuteTakerId: e.target.value })}>
                <option value="">-- Chọn thành viên --</option>
                {activeClubMembers
                  .filter(m => {
                    const dept = (m.deptName || m.department || '').toLowerCase();
                    return dept.includes('đối ngoại') || dept.includes('nhân sự') || dept.includes('chủ nhiệm');
                  })
                  .map(m => <option key={m.id} value={m.id}>{m.name} ({m.deptName || m.department})</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="ds-btn ds-btn-primary w-full">Lưu Cuộc Họp</button>
        </form>
      )}

      {/* Danh sách cuộc họp */}
      <div className="space-y-4">
        {meetings.length === 0 && <p className="text-sm text-slate-500 italic ds-card p-6 text-center">Chưa có lịch họp nào.</p>}

        {meetings.map(m => {
          const attendanceTaker = (clubMembers || members || []).find(mem => String(mem.id) === String(m.attendanceTakerId));
          const minuteTaker = (clubMembers || members || []).find(mem => String(mem.id) === String(m.minuteTakerId));
          const isAttendanceTaker = String(currentUser?.id) === String(m.attendanceTakerId);
          const isMinuteTaker = String(currentUser?.id) === String(m.minuteTakerId);

          return (
            <div key={m.id} className="ds-card p-5 space-y-4">
              <div className="absolute top-0 right-0 p-3 flex gap-2">
                {m.status === 'pending' && <span className="ds-badge ds-badge-blue">Sắp diễn ra</span>}
                {m.status === 'postponed' && <span className="ds-badge ds-badge-amber">Đã Hoãn</span>}
                {m.status === 'cancelled' && <span className="ds-badge ds-badge-rose">Đã Hủy</span>}
                {m.status === 'pending_minutes' && <span className="ds-badge ds-badge-amber">Chờ nộp biên bản</span>}
                {m.status === 'completed' && <span className="ds-badge ds-badge-emerald">Đã hoàn thành</span>}
              </div>

              <div>
                <h4 className="font-bold text-white text-base pr-24">{m.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 font-mono">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.time} | {m.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs ds-card p-3 border border-[var(--border-default)]">
                <div>
                  <span className="text-slate-500">Phụ trách điểm danh:</span><br />
                  <span className="font-semibold text-blue-300">{attendanceTaker?.name || 'Chưa phân công'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Ghi biên bản:</span><br />
                  <span className="font-semibold text-rose-300">{minuteTaker?.name || 'Chưa phân công'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {m.status === 'pending' && (isAttendanceTaker || isHRHead) && (
                  <button onClick={() => startAttendance(m)} className="ds-btn ds-btn-primary ds-btn-xs">
                    <CheckCircle2 className="w-4 h-4" /> Bắt đầu điểm danh
                  </button>
                )}

                {m.status === 'pending_minutes' && (isMinuteTaker || isHRHead) && (
                  <button onClick={() => handleMinuteSubmit(m.id)} className="ds-btn ds-btn-primary ds-btn-xs">
                    <FileText className="w-4 h-4" /> Nộp link biên bản
                  </button>
                )}
                {m.minutesLink && (
                  <a href={m.minutesLink} target="_blank" rel="noreferrer" className="ds-btn ds-btn-secondary ds-btn-xs">
                    Xem biên bản
                  </a>
                )}

                {(m.status === 'pending' || m.status === 'postponed') && isHRHead && (
                  <>
                    <button onClick={() => {
                      setEditMeetingId(m.id);
                      setEditDate(m.date);
                      setEditTime(m.time);
                    }} className="ds-btn ds-btn-secondary ds-btn-xs">
                      Đổi giờ
                    </button>
                    <button onClick={() => updateMeeting(m.id, null, null, true)} className="ds-btn ds-btn-ghost ds-btn-xs text-amber-400">
                      Hoãn
                    </button>
                    <button onClick={() => cancelMeeting(m.id)} className="ds-btn ds-btn-danger ds-btn-xs">
                      Hủy
                    </button>
                  </>
                )}
              </div>

              {editMeetingId === m.id && (
                <div className="mt-4 ds-card p-4 border border-blue-500/30 space-y-3">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="ds-field-label">Ngày mới</label>
                      <input type="date" min={todayDate} className="ds-input" value={editDate} onChange={e => setEditDate(e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <label className="ds-field-label">Giờ mới</label>
                      <input type="time" className="ds-input" value={editTime} onChange={e => setEditTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditMeetingId(null)} className="ds-btn ds-btn-ghost ds-btn-xs">Hủy</button>
                    <button onClick={() => {
                      updateMeeting(m.id, editDate, editTime, false);
                      setEditMeetingId(null);
                    }} className="ds-btn ds-btn-primary ds-btn-xs">Lưu thay đổi</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Attendance Modal */}
      {activeAttendanceMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-slide-up">
          <div className="ds-card p-6 w-full max-w-2xl shadow-2xl text-white flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[var(--border-default)] flex justify-between items-center shrink-0">
              <h3 className="font-bold text-white text-lg">
                Điểm danh: {activeAttendanceMeeting.title}
              </h3>
            </div>

            <div className="p-6 overflow-y-auto space-y-2 flex-1">
              <div className="ds-card p-4 border border-amber-500/30 bg-amber-500/10 mb-4 flex gap-3 text-sm text-amber-200/80">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
              </div>

              {activeClubMembers.map(m => (
                <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 ds-card p-3">
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white">{m.name}</div>
                    <div className="text-[10px] text-slate-500">{m.deptName || m.department} • {m.memberCode || m.member_code}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAttendanceState({ ...attendanceState, [m.id]: 'present' })}
                      className={`ds-btn ds-btn-xs ${attendanceState[m.id] === 'present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-[var(--bg-input)] text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                    >
                      Có mặt
                    </button>
                    <button
                      onClick={() => setAttendanceState({ ...attendanceState, [m.id]: 'late' })}
                      className={`ds-btn ds-btn-xs ${attendanceState[m.id] === 'late' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-[var(--bg-input)] text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                    >
                      Đi muộn
                    </button>
                    <button
                      onClick={() => setAttendanceState({ ...attendanceState, [m.id]: 'absent_excused' })}
                      className={`ds-btn ds-btn-xs ${attendanceState[m.id] === 'absent_excused' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-[var(--bg-input)] text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                    >
                      Có phép
                    </button>
                    <button
                      onClick={() => setAttendanceState({ ...attendanceState, [m.id]: 'absent' })}
                      className={`ds-btn ds-btn-xs ${attendanceState[m.id] === 'absent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-[var(--bg-input)] text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                    >
                      Vắng
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-[var(--border-default)] flex justify-end gap-3 shrink-0">
              <button onClick={() => setActiveAttendanceMeeting(null)} className="ds-btn ds-btn-secondary">
                Hủy
              </button>
              <button onClick={handleAttendanceSubmit} className="ds-btn ds-btn-primary">
                Chốt Điểm Danh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
