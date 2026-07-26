import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  UserCheck, 
  X, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Send, 
  Users, 
  Calendar,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';

export const AttendanceModal = () => {
  const { 
    members, 
    currentUser, 
    attendanceRecords, 
    isHRMember, 
    isHRHead, 
    submitAttendanceCheckin, 
    approveAttendanceCheckin,
    isAttendanceModalOpen,
    setIsAttendanceModalOpen
  } = useClub();

  const [sessionName, setSessionName] = useState(`Buổi Sinh Hoạt Định Kỳ Tuần ${Math.ceil(new Date().getDate() / 7)} Tháng ${new Date().getMonth() + 1}`);
  const [selectedPresentIds, setSelectedPresentIds] = useState([currentUser?.id || 'admin']);
  const [attendanceFilter, setAttendanceFilter] = useState('all');

  if (!isAttendanceModalOpen) return null;

  const handleToggleMember = (id) => {
    setSelectedPresentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPresentIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 thành viên có mặt!');
      return;
    }
    submitAttendanceCheckin(sessionName, selectedPresentIds);
    setIsAttendanceModalOpen(false);
  };

  const pendingRecords = attendanceRecords.filter(r => r.status === 'pending_approval');
  const approvedRecords = attendanceRecords.filter(r => r.status === 'approved');

  const eligibleMembers = members.filter(m => {
    const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase();
    const deptName = (m.deptName || m.department || '').toLowerCase();
    const code = (m.memberCode || m.member_code || '').toUpperCase();
    return !roleTitle.includes('super admin') && !roleTitle.includes('cố vấn') && !deptName.includes('cố vấn') && code !== 'ADMIN';
  });

  const filteredMembers = attendanceFilter === 'all' 
    ? eligibleMembers 
    : eligibleMembers.filter(m => {
        const dept = (m.deptName || m.department || '').toLowerCase();
        if (attendanceFilter === 'hr') return dept.includes('đối ngoại') || dept.includes('nhân sự');
        if (attendanceFilter === 'production') return dept.includes('sản xuất');
        if (attendanceFilter === 'content') return dept.includes('nội dung') || dept.includes('phát thanh');
        return true;
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
       <div className="ds-card-glass p-6 shadow-2xl text-white space-y-6 my-8 w-full max-w-2xl">
         
         {/* Header */}
         <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
               <UserCheck className="w-5 h-5" />
             </div>
             <div>
               <h3 className="font-heading font-extrabold text-lg text-white">Điểm Danh Sinh Hoạt CLB VMC</h3>
               <p className="text-xs text-slate-400">
                 Thành viên Ban Đối Ngoại - Nhân Sự lập danh sách • Trưởng Ban duyệt (+50 PTS)
               </p>
             </div>
           </div>
           <button onClick={() => setIsAttendanceModalOpen(false)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.04] transition-all">
             <X className="w-5 h-5" />
           </button>
         </div>

         {/* Section A: Pending Approvals for Head of HR */}
         {isHRHead && pendingRecords.length > 0 && (
           <div className="ds-card p-4 border border-amber-500/30 bg-amber-500/10 space-y-3">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                 <Clock className="w-4 h-4" />
                 <span>CHỜ DUYỆT ({pendingRecords.length})</span>
               </div>
               <span className="ds-badge ds-badge-amber text-[10px]">Quyền Duyệt</span>
             </div>

             {pendingRecords.map(rec => (
               <div key={rec.id} className="ds-card p-3.5 space-y-2 text-xs">
                 <div className="flex justify-between font-bold text-white">
                   <span>{rec.sessionName}</span>
                   <span className="text-amber-300 font-mono">{rec.date}</span>
                 </div>
                 <div className="text-slate-400">Lập bởi: <span className="text-blue-300 font-semibold">{rec.takenBy}</span></div>
                 <div className="text-slate-300">
                   Có mặt ({rec.presentMemberIds?.length}): {' '}
                   <span className="text-emerald-400 font-bold">
                     {members.filter(m => rec.presentMemberIds?.includes(m.id)).map(m => m.name).join(', ')}
                   </span>
                 </div>

                 <div className="pt-2 flex justify-end">
                   <button
                     onClick={() => approveAttendanceCheckin(rec.id)}
                     className="ds-btn ds-btn-success"
                   >
                     <ShieldCheck className="w-4 h-4" />
                     <span>Đồng Ý Duyệt (+50 PTS)</span>
                   </button>
                 </div>
               </div>
             ))}
           </div>
         )}

         {/* Section B: Attendance Take Form */}
         {isHRMember ? (
           <form onSubmit={handleSubmit} className="space-y-4 text-xs">
             <div className="ds-card p-3 border border-blue-500/20 bg-blue-500/10 text-blue-300 flex items-center gap-2">
               <AlertCircle className="w-4 h-4 shrink-0" />
               <span>Bạn có quyền lập danh sách điểm danh với vai trò Thành Viên Ban Đối Ngoại - Nhân Sự.</span>
             </div>

             <div>
               <label className="ds-field-label font-bold">Tiêu Đề Buổi Sinh Hoạt *</label>
               <input
                 type="text"
                 required
                 value={sessionName}
                 onChange={(e) => setSessionName(e.target.value)}
                 className="ds-input"
               />
             </div>

             {/* Filter Bar */}
             <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 flex-1">
                 <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                 <input
                   type="text"
                   placeholder="Tìm kiếm thành viên..."
                   className="ds-input text-xs py-2"
                   onChange={(e) => {
                     const q = e.target.value.toLowerCase();
                     // Filter is handled by attendanceFilter for now
                   }}
                 />
               </div>
               <select
                 value={attendanceFilter}
                 onChange={(e) => setAttendanceFilter(e.target.value)}
                 className="ds-input ds-select text-xs py-2"
               >
                 <option value="all">Tất Cả</option>
                 <option value="hr">Đối Ngoại - Nhân Sự</option>
                 <option value="production">Sản Xuất</option>
                 <option value="content">Nội Dung - Phát Thanh</option>
               </select>
             </div>

             <div>
               <label className="ds-field-label font-bold flex items-center justify-between">
                 <span>Danh Sách Thành Viên Có Mặt (Tích chọn) *</span>
                 <span className="text-blue-400 font-mono">Đã chọn: {selectedPresentIds.length}/{eligibleMembers.length}</span>
               </label>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                 {filteredMembers.map(m => {
                   const isChecked = selectedPresentIds.includes(m.id);
                   return (
                     <div
                       key={m.id}
                       onClick={() => handleToggleMember(m.id)}
                       className={`ds-card p-2.5 flex items-center gap-3 cursor-pointer transition-all ${
                         isChecked 
                           ? 'border-blue-500 text-white' 
                           : 'border-white/[0.06] text-slate-400 hover:text-white'
                       }`}
                     >
                       <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                       <div className="truncate flex-1">
                         <div className="truncate text-xs">{m.name}</div>
                         <div className="text-[10px] text-slate-400 truncate">{m.deptName}</div>
                       </div>
                       <input 
                         type="checkbox" 
                         checked={isChecked} 
                         onChange={() => {}}
                         className="rounded border-slate-700 text-blue-600 focus:ring-0"
                       />
                     </div>
                   );
                 })}
               </div>
             </div>

             <div className="pt-3 flex justify-end gap-2 border-t border-white/[0.06]">
               <button
                 type="button"
                 onClick={() => setIsAttendanceModalOpen(false)}
                 className="ds-btn ds-btn-secondary ds-btn-xs"
               >
                 Hủy
               </button>
               <button
                 type="submit"
                 className="ds-btn ds-btn-primary ds-btn-xs"
               >
                 <Send className="w-4 h-4" />
                 <span>Gửi Điểm Danh Sang Trưởng Ban Duyệt</span>
               </button>
             </div>
           </form>
         ) : (
           /* Non-HR Department Member View */
           <div className="ds-card p-4 border border-white/10 text-center space-y-3">
             <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <h4 className="font-bold text-white text-sm">Quy Trình Điểm Danh Sinh Hoạt CLB</h4>
             <p className="text-xs text-slate-300 max-w-md mx-auto">
               Việc điểm danh sinh hoạt do <strong className="text-blue-400">Thành viên Ban Đối Ngoại - Nhân Sự</strong> thực hiện và phải được <strong className="text-amber-400">Trưởng Ban Đối Ngoại - Nhân Sự</strong> kiểm tra & duyệt để cộng 50 điểm thi đua PTS.
             </p>
           </div>
         )}

         {/* Section C: History Approved Attendance */}
         {approvedRecords.length > 0 && (
           <div className="border-t border-white/[0.06] pt-4 space-y-3">
             <h4 className="font-bold text-white text-xs flex items-center gap-2">
               <CheckCircle className="w-4 h-4 text-emerald-400" />
               <span>Lịch Sử Buổi Điểm Danh Đã Được Duyệt</span>
             </h4>
             <div className="space-y-2 max-h-40 overflow-y-auto">
               {approvedRecords.map(rec => (
                 <div key={rec.id} className="ds-card p-3 text-xs flex items-center justify-between">
                   <div>
                     <div className="font-bold text-white">{rec.sessionName}</div>
                     <div className="text-[10px] text-slate-400">Duyệt bởi: {rec.approvedBy} • Ngày {rec.date}</div>
                   </div>
                   <span className="ds-badge ds-badge-emerald text-[10px]">+50 PTS</span>
                 </div>
               ))}
             </div>
           </div>
         )}

       </div>
     </div>
  );
};
