import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import { Users, Calendar, Award, Clock, Search, CheckCircle2, Wallet, Plus, ArrowDownRight, ArrowUpRight, Gift, X } from 'lucide-react';
import { MeetingManagement } from '../components/hr/MeetingManagement';
import { BirthdayManagement } from '../components/hr/BirthdayManagement';
import { PointManagement } from '../components/hr/PointManagement';

const Loading = () => (
  <div className="page-wrap flex items-center justify-center min-h-screen">
    <div className="text-slate-400 text-sm font-mono animate-pulse">Đang tải...</div>
  </div>
);

export const InternalHRDashboard = () => {
  const { 
    members, tasks, currentUser, isHRMember, isHRHead, isAdmin, finances, addFinanceRecord, updateFinanceStatus,
    meetings, createMeeting, submitMeetingAttendance, submitMeetingMinutes, penalizeMember, updateMemberPoints,
    birthdayAssignments, assignBirthdayDuty, submitBirthdayImage
  } = useClub();

  if (!currentUser) {
    return <Loading />;
  }
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('points'); // 'points', 'birthdays', 'deadlines', 'finance'

  const [financeForm, setFinanceForm] = useState({ type: 'income', amount: '', description: '', date: '' });
  
  // Meeting Form State
  const [meetingForm, setMeetingForm] = useState({ title: '', date: '', time: '' });
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);

  // Birthday Assignment State
  const [birthdayForm, setBirthdayForm] = useState({ month: new Date().getMonth() + 2, memberId: '' });

  // No access restriction: All members can view rankings, birthdays, and deadlines

  const [selectedMember, setSelectedMember] = useState(null);

  const isAdvisor = Boolean(
    currentUser?.deptName?.toLowerCase().includes('cố vấn') ||
    currentUser?.department?.toLowerCase().includes('cố vấn') ||
    currentUser?.roleTitle?.toLowerCase().includes('cố vấn')
  );

  const currentUserDeptName = String(currentUser?.deptName || currentUser?.department || '').toLowerCase();
  const currentUserRoleTitle = String(currentUser?.roleTitle || '').toLowerCase();

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

  // Points ranking — đồng hạng nếu bằng điểm, không tính tài khoản hệ thống & Ban Cố Vấn
  const rankedMembers = useMemo(() => {
    const list = members.filter(m => {
      const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase();
      const deptName = (m.deptName || m.department || '').toLowerCase();
      const code = (m.memberCode || m.member_code || '').toUpperCase();
      if (roleTitle.includes('super admin') || roleTitle.includes('cố vấn') || deptName.includes('cố vấn') || code === 'ADMIN') return false;

      const q = normalizeText(searchQuery);
      return !q || normalizeText(m.name).includes(q) || normalizeText(m.memberCode).includes(q);
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
  }, [members, searchQuery]);

  // Helper to parse DOB in any format (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
  const parseDob = (dobStr) => {
    if (!dobStr) return { day: 0, month: 0 };
    const str = dobStr.toString().trim();
    let day = 0, month = 0;

    if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        } else {
          // DD-MM-YYYY
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
        }
      }
    } else if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY/MM/DD
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        } else {
          // DD/MM/YYYY
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

  const handleAddFinance = (e) => {
    e.preventDefault();
    if (!financeForm.amount || !financeForm.description) return;
    
    // Nếu không điền ngày thì lấy ngày thao tác hiện tại
    const finalDate = financeForm.date || new Date().toLocaleDateString('en-CA');
    
    addFinanceRecord({
      type: financeForm.type,
      amount: parseInt(financeForm.amount, 10),
      description: financeForm.description,
      date: finalDate,
      loggedBy: currentUser?.name || 'Ban Đối Ngoại - Nhân Sự',
      status: isHRHead ? 'approved' : 'pending'
    });
    setFinanceForm({ type: 'income', amount: '', description: '', date: '' });
    if (!isHRHead) {
      alert('Đã gửi yêu cầu dự trù kinh phí tới Trưởng ban!');
    }
  };

  const totalBalance = (finances || []).filter(f => f.status === 'approved').reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);

  return (
    <div className="page-wrap space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col items-center justify-center text-center">
          <Users className="text-blue-500 w-8 h-8" />
          <h1 className="font-heading text-3xl font-extrabold text-slate-100 mt-1">
            Thi Đua & Sinh Nhật
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Theo dõi điểm số, sinh nhật, deadline và thu chi quỹ CLB.
          </p>
        </div>
        
        <div className="relative flex items-center w-full">
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

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        <button
          onClick={() => setActiveTab('points')}
          className={`ds-btn ${activeTab === 'points' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
        >
          <Award className="w-5 h-5" /> Bảng Xếp Hạng Điểm Thi Đua
        </button>
        <button
          onClick={() => setActiveTab('birthdays')}
          className={`ds-btn ${activeTab === 'birthdays' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
        >
          <Gift className="w-5 h-5" /> Sinh Nhật
        </button>
        <button
          onClick={() => setActiveTab('deadlines')}
          className={`ds-btn ${activeTab === 'deadlines' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
        >
          <Clock className="w-5 h-5" /> Theo Dõi Deadline
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`ds-btn ${activeTab === 'meetings' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
        >
          <Calendar className="w-5 h-5" /> Quản Lý Cuộc Họp
        </button>
        {(isHRMember || currentUser?.deptName === 'Ban Chủ Nhiệm' || currentUser?.department === 'bcn') && (
          <button
            onClick={() => setActiveTab('finance')}
            className={`ds-btn ${activeTab === 'finance' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
          >
            <Wallet className="w-5 h-5" /> Quản Lý Thu Chi (Quỹ CLB)
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="ds-card p-6">
        
         {/* POINTS TAB */}
         {activeTab === 'points' && (
           <div className="space-y-6">
             <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-3">
               <Award className="text-amber-400" /> Bảng Điểm Thi Đua (Ranking)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {rankedMembers.map((m) => (
                 <div 
                   key={m.id} 
                   onClick={() => setSelectedMember(m)}
                   className="ds-card p-5 flex items-center gap-4 cursor-pointer hover:border-amber-500/50 hover:scale-[1.01] transition-all group"
                   title="Bấm để xem chi tiết thông tin thành viên"
                 >
                   <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-lg ${
                     m.displayRank === 1 
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
                     <div className="text-sm text-slate-400 truncate">{m.deptName || m.department}</div>
                   </div>
                   <div className="text-right shrink-0">
                     <div className="text-xl font-black text-blue-400 font-mono">{m.points || 0}</div>
                     <div className="text-xs text-slate-500">PTS</div>
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="mt-8 pt-8 border-t border-[var(--border-default)]">
               <PointManagement />
             </div>
           </div>
         )}

         {/* BIRTHDAYS TAB */}
         {activeTab === 'birthdays' && (
           <div className="space-y-6">
             <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-3">
               <Calendar className="text-rose-400" /> Sinh Nhật Sắp Tới
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {upcomingBirthdays.length > 0 ? upcomingBirthdays.map((m) => (
                 <div 
                   key={m.id} 
                   onClick={() => setSelectedMember(m)}
                   className="ds-card p-5 flex items-center gap-4 relative overflow-hidden group cursor-pointer hover:border-rose-500/60 hover:scale-[1.02] transition-all"
                   title="Bấm để xem chi tiết thông tin thành viên"
                 >
                   <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-bl-full -z-0" />
                   <img src={m.avatar || '/placeholder-avatar.jpg'} alt={m.name} className="w-14 h-14 rounded-xl object-cover border border-slate-700 z-10" />
                   <div className="flex-1 min-w-0 z-10">
                     <div className="text-base font-bold text-slate-100 truncate group-hover:text-rose-300 transition-colors">{m.name}</div>
                     <div className="text-sm text-rose-300 font-mono mt-2 font-semibold flex items-center gap-3">
                       <span>🎂 {m.formattedDob || m.dob}</span>
                       <span className="ds-badge ds-badge-rose">
                         {m.daysUntil === 0 ? '🎉 Hôm nay!' : `Còn ${m.daysUntil} ngày`}
                       </span>
                     </div>
                   </div>
                 </div>
               )) : (
                 <div className="text-slate-400 text-sm col-span-full">Không tìm thấy sinh nhật nào sắp tới.</div>
               )}
             </div>

             {/* Phân Công Nhiệm Vụ Sinh Nhật (Chỉ hiển thị cho Ban ĐN-NS & BCN/Admin, ẩn hoàn toàn với Cố Vấn và các ban khác) */}
             {isAllowedBirthdayDuty && (
               <div className="mt-8 pt-8 border-t border-[var(--border-default)]">
                 <BirthdayManagement />
               </div>
             )}
           </div>
         )}

         {/* DEADLINES TAB */}
         {activeTab === 'deadlines' && (
           <div className="space-y-6">
             <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-3">
               <Clock className="text-amber-400" /> Theo Dõi Tình Trạng Deadline
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               {allHumanMembers.map((m) => {
                 const memberTasks = getMemberTasks(m);
                 if (memberTasks.length === 0) return null;
                 
                 const doingTasks = memberTasks.filter(t => t.status === 'doing' || t.status === 'todo');
                 const doneTasks = memberTasks.filter(t => t.status === 'done');
                 
                 return (
                   <div key={m.id} className="ds-card p-5 space-y-4">
                     <div className="flex justify-between items-center border-b border-[var(--border-default)] pb-3">
                       <div className="font-bold text-base text-slate-100">{m.name}</div>
                       <span className="ds-badge ds-badge-blue">{m.deptName || m.department}</span>
                     </div>
                     
                     <div className="space-y-3">
                       <div className="text-sm font-semibold text-slate-400">Đang thực hiện ({doingTasks.length})</div>
                       {doingTasks.length > 0 ? doingTasks.map(t => {
                         const isTaskOverdue = (() => {
                           if (!t.deadline) return false;
                           const n = new Date(); n.setHours(0, 0, 0, 0);
                           const d = new Date(t.deadline); d.setHours(0, 0, 0, 0);
                           return d < n;
                         })();
                         return (
                           <div key={t.id} className={`ds-card p-3 flex justify-between items-center ${isTaskOverdue ? 'border-rose-500/50' : 'border-amber-500/20'}`}>
                             <div className="text-sm text-slate-300 truncate pr-3 max-w-[65%] flex items-center gap-2">
                               {isTaskOverdue && (
                                 <span className="ds-badge ds-badge-rose animate-pulse shrink-0">
                                   ⚠ Quá hạn
                                 </span>
                               )}
                               <span className="truncate">{t.title}</span>
                             </div>
                             <div className={`text-xs font-mono whitespace-nowrap flex items-center gap-2 ${isTaskOverdue ? 'text-rose-400 font-bold' : 'text-amber-400'}`}>
                               <Clock className="w-4 h-4" /> {t.deadline}
                             </div>
                           </div>
                         );
                       }) : (
                         <div className="text-sm text-slate-500 italic">Không có công việc đang làm</div>
                       )}
                     </div>
                     
                     <div className="pt-3 border-t border-[var(--border-default)]">
                       <div className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4" /> Đã hoàn thành ({doneTasks.length})
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
         )}
        {/* MEETINGS & SEEDING TAB */}
        {activeTab === 'meetings' && (
          <MeetingManagement />
        )}

        {/* BIRTHDAY DUTY TAB */}
        {activeTab === 'birthday_duty' && (
          <BirthdayManagement />
        )}

         {/* FINANCE TAB */}
         {activeTab === 'finance' && (isHRMember || currentUser?.deptName === 'Ban Chủ Nhiệm' || currentUser?.department === 'bcn') && (
           <div className="space-y-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                 <Wallet className="text-emerald-400" /> Quản Lý Quỹ CLB
               </h3>
               <div className="ds-card p-3 text-right">
                 <div className="text-sm text-slate-400">Tổng Quỹ Hiện Tại</div>
                 <div className="text-2xl font-mono font-bold text-emerald-400">
                   {totalBalance.toLocaleString()} VNĐ
                 </div>
               </div>
             </div>

             {/* Pending Approvals Section — only visible to HR Head/Admin */}
             {(() => {
               const pendingList = (finances || []).filter(f => f.status === 'pending');
               if (pendingList.length === 0 || (!isHRHead && !isAdmin)) return null;
               return (
                 <div className="ds-card p-6 border border-amber-500/40">
                   <div className="flex items-center justify-between">
                     <h4 className="font-bold text-amber-300 text-base flex items-center gap-3">
                       <Clock className="w-5 h-5" />
                       Yêu Cầu Chờ Duyệt
                       <span className="ml-2 ds-badge ds-badge-amber">
                         {pendingList.length}
                       </span>
                     </h4>
                   </div>
                   <div className="space-y-4">
                     {pendingList.map((f) => (
                       <div key={f.id} className="ds-card p-5 border border-amber-500/30 space-y-4">
                         <div className="flex justify-between items-center">
                           <div className="flex gap-4 items-center">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${f.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                               {f.type === 'income' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                             </div>
                             <div>
                               <div className="text-base font-semibold text-slate-100 flex items-center gap-3">
                                 {f.description}
                                 <span className="ds-badge ds-badge-amber">⏳ Chờ duyệt</span>
                               </div>
                               <div className="text-sm text-slate-400 flex gap-3 mt-1">
                                 <span>📅 {f.date}</span>
                                 <span>•</span>
                                 <span>👤 Gửi bởi: {f.loggedBy}</span>
                               </div>
                             </div>
                           </div>
                           <div className={`font-mono font-bold text-xl whitespace-nowrap ${f.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                             {f.type === 'income' ? '+' : '-'}{(f.amount || 0).toLocaleString()} đ
                           </div>
                         </div>
                         <div className="flex justify-end gap-3 border-t border-amber-500/20 pt-4">
                           <button
                             onClick={() => updateFinanceStatus(f.id, 'rejected')}
                             className="ds-btn ds-btn-danger"
                           >
                             ❌ Từ Chối
                           </button>
                           <button
                             onClick={() => updateFinanceStatus(f.id, 'approved')}
                             className="ds-btn ds-btn-success"
                           >
                             ✅ Duyệt {f.type === 'income' ? 'Thu' : 'Chi'}
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               );
             })()}

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Form Add */}
               {isHRMember && (
                 <div className="ds-card p-6">
                   <h4 className="font-bold text-slate-100 text-base mb-5">{isHRHead ? 'Thêm Giao Dịch Mới' : 'Thêm Dự Trù Kinh Phí (Cần Duyệt)'}</h4>
                   <form onSubmit={handleAddFinance} className="space-y-5">
                     <div>
                       <label className="ds-field-label">Loại Giao Dịch</label>
                       <select
                         value={financeForm.type}
                         onChange={(e) => setFinanceForm({ ...financeForm, type: e.target.value })}
                         className="ds-input ds-select"
                       >
                         <option value="income">Thu Tiền (+)</option>
                         <option value="expense">Chi Tiền (-)</option>
                       </select>
                     </div>
                     <div>
                       <label className="ds-field-label">Số Tiền (VNĐ)</label>
                       <input
                         type="number"
                         required
                         value={financeForm.amount}
                         onChange={(e) => setFinanceForm({ ...financeForm, amount: e.target.value })}
                         className="ds-input font-mono"
                         placeholder="VD: 50000"
                       />
                     </div>
                     <div>
                       <label className="ds-field-label">Nội Dung</label>
                       <input
                         type="text"
                         required
                         value={financeForm.description}
                         onChange={(e) => setFinanceForm({ ...financeForm, description: e.target.value })}
                         className="ds-input"
                         placeholder="VD: Thu tiền quỹ tháng 8..."
                       />
                     </div>
                     <div>
                       <label className="ds-field-label">Ngày Thực Hiện (Để trống để lấy ngày hôm nay)</label>
                       <input
                         type="date"
                         value={financeForm.date}
                         onChange={(e) => setFinanceForm({ ...financeForm, date: e.target.value })}
                         className="ds-input"
                       />
                     </div>
                     {!isHRHead && (
                       <div className="ds-card p-4 text-xs text-amber-300 border border-amber-500/20">
                         ⚠️ Yêu cầu của bạn sẽ được gửi tới Trưởng Ban Đối Ngoại - Nhân Sự để duyệt trước khi ghi nhận.
                       </div>
                     )}
                     <button type="submit" className="ds-btn ds-btn-success w-full">
                       <Plus className="w-5 h-5" /> {isHRHead ? 'Thêm Giao Dịch' : 'Gửi Yêu Cầu Duyệt'}
                     </button>
                   </form>
                 </div>
               )}

               {/* History List */}
               <div className={`${isHRMember ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
                 <h4 className="font-bold text-slate-100 text-base mb-3 flex items-center gap-3">📋 Lịch Sử Giao Dịch Đã Duyệt</h4>
                 <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                   {(finances || []).filter(f => f.status === 'approved').map((f) => (
                     <div key={f.id} className="ds-card p-5 flex justify-between items-center hover:border-slate-600 transition-colors">
                       <div className="flex gap-4 items-center">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${f.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                           {f.type === 'income' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                         </div>
                         <div>
                           <div className="text-base font-semibold text-slate-100">{f.description}</div>
                           <div className="text-sm text-slate-400 flex gap-3">
                             <span>{f.date}</span>
                             <span>•</span>
                             <span>Bởi: {f.loggedBy}</span>
                           </div>
                         </div>
                       </div>
                       <div className={`font-mono font-bold whitespace-nowrap ${f.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {f.type === 'income' ? '+' : '-'}{(f.amount || 0).toLocaleString()} đ
                       </div>
                     </div>
                   ))}

                   {/* Rejected items */}
                   {(finances || []).filter(f => f.status === 'rejected').length > 0 && (
                     <>
                       <h5 className="text-sm font-bold text-rose-400 mt-5 pt-4 border-t border-[var(--border-default)]">🚫 Đã Từ Chối</h5>
                       {(finances || []).filter(f => f.status === 'rejected').map((f) => (
                         <div key={f.id} className="ds-card p-4 flex justify-between items-center opacity-60 border-rose-500/20">
                           <div className="flex gap-4 items-center">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${f.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                               {f.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                             </div>
                             <div>
                               <div className="text-sm font-semibold text-slate-100 line-through">{f.description}</div>
                               <div className="text-xs text-slate-400">{f.date} • {f.loggedBy}</div>
                             </div>
                           </div>
                           <div className="text-sm font-mono text-rose-400 line-through">
                             {f.type === 'income' ? '+' : '-'}{(f.amount || 0).toLocaleString()} đ
                           </div>
                         </div>
                       ))}
                     </>
                   )}

                   {(finances || []).filter(f => f.status === 'approved').length === 0 && (
                     <div className="text-center py-10 text-slate-500 text-sm">Chưa có giao dịch nào được ghi nhận.</div>
                   )}
                 </div>
               </div>
             </div>
           </div>
         )}

      </div>

       {/* Selected Member Detail Modal Popup */}
       {selectedMember && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
           <div className="relative w-full max-w-xl ds-card ds-card-elevated border border-rose-500/40 p-6 shadow-2xl text-white space-y-5 my-8">
             <div className="flex justify-between items-center border-b border-[var(--border-default)] pb-4">
               <div className="flex items-center gap-3">
                 <img src={selectedMember.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt={selectedMember.name} className="w-14 h-14 rounded-full object-cover border-2 border-rose-500/60 shadow-lg" />
                 <div>
                   <h3 className="font-heading font-extrabold text-lg text-white">{selectedMember.name}</h3>
                   <p className="text-xs text-rose-400 font-semibold">{selectedMember.roleTitle || 'Thành Viên VMC'} • {selectedMember.deptName}</p>
                   <p className="text-[10px] text-slate-400 font-mono">Mã TV: {selectedMember.memberCode} • Lớp: {selectedMember.class || 'N/A'}</p>
                 </div>
               </div>
               <button onClick={() => setSelectedMember(null)} className="ds-btn ds-btn-ghost ds-btn-xs">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
               <div className="ds-card p-3 space-y-1">
                 <span className="text-slate-400 block text-[10px] uppercase font-bold">Họ và Tên</span>
                 <span className="text-white font-semibold text-sm">{selectedMember.name}</span>
               </div>
               <div className="ds-card p-3 space-y-1">
                 <span className="text-slate-400 block text-[10px] uppercase font-bold">Ban Chuyên Môn</span>
                 <span className="text-cyan-400 font-semibold">{selectedMember.deptName}</span>
               </div>
               <div className="ds-card p-3 space-y-1">
                 <span className="text-slate-400 block text-[10px] uppercase font-bold">Chức Vụ trong CLB</span>
                 <span className="text-amber-300 font-semibold">{selectedMember.roleTitle}</span>
               </div>
               <div className="ds-card p-3 space-y-1">
                 <span className="text-slate-400 block text-[10px] uppercase font-bold">Ngày Sinh (DOB)</span>
                 <span className="text-rose-400 font-mono font-bold">🎂 {selectedMember.dob || 'Chưa cập nhật'}</span>
               </div>
               <div className="ds-card p-3 space-y-1">
                 <span className="text-slate-400 block text-[10px] uppercase font-bold">Số Điện Thoại / Zalo</span>
                 <span className="text-emerald-400 font-mono font-bold">{selectedMember.phone || 'Chưa cập nhật'}</span>
               </div>
               <div className="ds-card p-3 space-y-1">
                 <span className="text-slate-400 block text-[10px] uppercase font-bold">Thế Hệ (Gen)</span>
                 <span className="text-purple-300 font-bold">{selectedMember.term || 'Gen 6'}</span>
               </div>
               <div className="ds-card p-3 space-y-1 sm:col-span-2">
                 <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                 <span className="text-slate-200 font-mono">{selectedMember.email || 'Chưa cập nhật'}</span>
               </div>
               <div className="ds-card p-3 space-y-1 sm:col-span-2">
                 <span className="text-slate-400 block text-[10px] uppercase font-bold">Địa Chỉ</span>
                 <span className="text-slate-300">{selectedMember.address || 'Chưa cập nhật'}</span>
               </div>
             </div>

             <div className="pt-2 flex justify-end">
               <button onClick={() => setSelectedMember(null)} className="ds-btn ds-btn-primary">
                 Đóng
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};
