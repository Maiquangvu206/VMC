import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import { Users, Calendar, Award, Clock, Search, CheckCircle2, Wallet, Plus, ArrowDownRight, ArrowUpRight, Gift, X } from 'lucide-react';
import { MeetingManagement } from '../components/hr/MeetingManagement';
import { BirthdayManagement } from '../components/hr/BirthdayManagement';
import { PointManagement } from '../components/hr/PointManagement';

const Loading = () => (
  <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-center min-h-[60vh]">
    <div className="text-slate-400 text-sm font-mono animate-pulse">Đang tải dữ liệu Nhân sự...</div>
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
  const [activeTab, setActiveTab] = useState('points'); // 'points', 'birthdays', 'deadlines', 'finance', 'meetings'

  const [financeForm, setFinanceForm] = useState({ type: 'income', amount: '', description: '', date: '' });
  
  // Meeting Form State
  const [meetingForm, setMeetingForm] = useState({ title: '', date: '', time: '' });
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);

  // Birthday Assignment State
  const [birthdayForm, setBirthdayForm] = useState({ month: new Date().getMonth() + 2, memberId: '' });

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

  const handleAddFinance = (e) => {
    e.preventDefault();
    if (!financeForm.amount || !financeForm.description) return;
    
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Users className="text-blue-500 w-8 h-8 shrink-0" />
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
              Thi Đua & Sinh Nhật
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Theo dõi điểm số, sinh nhật, deadline và thu chi quỹ CLB.
            </p>
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
             <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-3">
               <Clock className="text-blue-400" /> Theo Dõi Tiến Độ & Deadline Thành Viên
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {allHumanMembers.map(m => {
                 const mTasks = getMemberTasks(m);
                 const pendingTasks = mTasks.filter(t => t.status !== 'completed' && t.status !== 'done');
                 const completedTasks = mTasks.filter(t => t.status === 'completed' || t.status === 'done');
                 return (
                   <div key={m.id} className="ds-card p-5 space-y-4">
                     <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                           {m.name?.substring(0, 1) || 'V'}
                         </div>
                         <div>
                           <div className="font-bold text-slate-100">{m.name}</div>
                           <div className="text-xs text-slate-400">{m.deptName || m.department} • {m.memberCode}</div>
                         </div>
                       </div>
                       <div className="text-right">
                         <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                           {completedTasks.length}/{mTasks.length} Hoàn thành
                         </span>
                       </div>
                     </div>
                     <div className="space-y-2">
                       {mTasks.length === 0 ? (
                         <div className="text-xs text-slate-500 italic py-2">Chưa được phân công nhiệm vụ nào.</div>
                       ) : (
                         mTasks.map(t => (
                           <div key={t.id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-900/50 border border-slate-800">
                             <span className="text-slate-300 truncate max-w-[200px]">{t.title}</span>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                               t.status === 'completed' || t.status === 'done'
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
               })}
             </div>
           </div>
         )}

         {/* MEETINGS TAB */}
         {activeTab === 'meetings' && (
           <MeetingManagement 
             meetings={meetings}
             members={allHumanMembers}
             createMeeting={createMeeting}
             submitMeetingAttendance={submitMeetingAttendance}
             submitMeetingMinutes={submitMeetingMinutes}
             penalizeMember={penalizeMember}
             currentUser={currentUser}
             isHRMember={isHRMember}
             isHRHead={isHRHead}
             isAdmin={isAdmin}
           />
         )}

         {/* FINANCE TAB */}
         {activeTab === 'finance' && (
           <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-default)] pb-4">
               <div>
                 <h3 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                   <Wallet className="text-emerald-400" /> Quản Lý Quỹ & Thu Chi CLB
                 </h3>
                 <p className="text-sm text-slate-400 mt-1">Số dư quỹ hiện tại đã duyệt: <span className="font-bold text-emerald-400">{totalBalance.toLocaleString('vi-VN')} VNĐ</span></p>
               </div>
             </div>

             <form onSubmit={handleAddFinance} className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
               <div>
                 <label className="text-xs text-slate-400 mb-1 block">Loại khoản</label>
                 <select 
                   value={financeForm.type}
                   onChange={e => setFinanceForm({ ...financeForm, type: e.target.value })}
                   className="ds-input text-xs"
                 >
                   <option value="income">➕ Thu Quỹ / Tài Trợ</option>
                   <option value="expense">➖ Chi Phí Hoạt Động</option>
                 </select>
               </div>
               <div>
                 <label className="text-xs text-slate-400 mb-1 block">Số tiền (VNĐ)</label>
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
                 <label className="text-xs text-slate-400 mb-1 block">Nội dung chi tiết</label>
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
               <h4 className="font-bold text-slate-200 text-sm">Lịch Sử Thu Chi & Dự Trù</h4>
               <div className="divide-y divide-slate-800 bg-slate-950/40 rounded-xl border border-slate-800 overflow-hidden">
                 {(finances || []).length === 0 ? (
                   <div className="p-6 text-center text-slate-500 text-sm">Chưa có bản ghi thu chi nào.</div>
                 ) : (
                   finances.map(item => (
                     <div key={item.id} className="p-4 flex items-center justify-between text-sm hover:bg-slate-900/50 transition-colors">
                       <div className="flex items-center gap-3">
                         {item.type === 'income' ? (
                           <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><ArrowDownRight className="w-4 h-4" /></div>
                         ) : (
                           <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400"><ArrowUpRight className="w-4 h-4" /></div>
                         )}
                         <div>
                           <div className="font-bold text-slate-200">{item.description}</div>
                           <div className="text-xs text-slate-400">{item.date} • Ghi bởi {item.loggedBy || 'VMC'}</div>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className={`font-mono font-bold ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {item.type === 'income' ? '+' : '-'}{item.amount?.toLocaleString('vi-VN')} VNĐ
                         </div>
                         <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                           item.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                         }`}>
                           {item.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                         </span>
                       </div>
                     </div>
                   ))
                 )}
               </div>
             </div>
           </div>
         )}
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="ds-card max-w-lg w-full p-6 space-y-6 relative border-amber-500/30">
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl border border-amber-500/40">
                {selectedMember.name?.substring(0, 1)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">{selectedMember.name}</h3>
                <p className="text-sm text-slate-400">{selectedMember.deptName || selectedMember.department} • Mã TV: {selectedMember.memberCode}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    Xếp hạng #{selectedMember.displayRank}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {selectedMember.points || 0} điểm thi đua
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
