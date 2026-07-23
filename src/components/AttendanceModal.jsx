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
  AlertCircle
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-6 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">Điểm Danh Sinh Hoạt CLB VMC</h3>
              <p className="text-xs text-slate-400">
                Thành viên Ban Đối Ngoại - Nhân Sự lập danh sách • Trưởng Ban Đối Ngoại - Nhân Sự duyệt (+50 PTS)
              </p>
            </div>
          </div>
          <button onClick={() => setIsAttendanceModalOpen(false)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section A: Pending Approvals for Head of HR */}
        {isHRHead && pendingRecords.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>CHỜ TRƯỞNG BAN ĐỐI NGOẠI - NHÂN SỰ DUYỆT ({pendingRecords.length})</span>
              </div>
              <span className="badge badge-amber text-[10px]">Quyền Duyệt</span>
            </div>

            {pendingRecords.map(rec => (
              <div key={rec.id} className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/20 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-white">
                  <span>{rec.sessionName}</span>
                  <span className="text-amber-300 font-mono">{rec.date}</span>
                </div>
                <div className="text-slate-400">Lập bởi: <span className="text-blue-300 font-semibold">{rec.takenBy}</span></div>
                <div className="text-slate-300">
                  Thành viên có mặt ({rec.presentMemberIds?.length}): {' '}
                  <span className="text-emerald-400 font-bold">
                    {members.filter(m => rec.presentMemberIds?.includes(m.id)).map(m => m.name).join(', ')}
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => approveAttendanceCheckin(rec.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 shadow-md text-xs transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Đồng Ý Duyệt Điểm Danh (+50 PTS)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section B: Attendance Take Form (For Members of External Relations & HR Department) */}
        {isHRMember ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Bạn có quyền lập danh sách điểm danh với vai trò Thành Viên Ban Đối Ngoại - Nhân Sự.</span>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Tiêu Đề Buổi Sinh Hoạt *</label>
              <input
                type="text"
                required
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              {(() => {
                const eligibleMembers = members.filter(m => {
                  const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase();
                  const deptName = (m.deptName || m.department || '').toLowerCase();
                  const code = (m.memberCode || m.member_code || '').toUpperCase();
                  return !roleTitle.includes('super admin') && !roleTitle.includes('cố vấn') && !deptName.includes('cố vấn') && code !== 'ADMIN';
                });
                return (
                  <>
                    <label className="block font-bold text-slate-300 mb-2 flex items-center justify-between">
                      <span>Danh Sách Thành Viên Có Mặt (Tích chọn) *</span>
                      <span className="text-blue-400 font-mono">Đã chọn: {selectedPresentIds.length}/{eligibleMembers.length}</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                      {eligibleMembers.map(m => {
                        const isChecked = selectedPresentIds.includes(m.id);
                        return (
                          <div
                            key={m.id}
                            onClick={() => handleToggleMember(m.id)}
                            className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                              isChecked 
                                ? 'bg-blue-600/20 border-blue-500 text-white font-bold' 
                                : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
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
                  </>
                );
              })()}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2.5"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-primary text-xs px-6 py-2.5 shadow-emerald-600/30 flex items-center gap-2 font-bold"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Điểm Danh Sang Trưởng Ban Đối Ngoại - Nhân Sự Duyệt</span>
              </button>
            </div>
          </form>
        ) : (
          /* Non-HR Department Member View */
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-center space-y-3">
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
          <div className="border-t border-white/10 pt-4 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Lịch Sử Buổi Điểm Danh Đã Được Duyệt</span>
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {approvedRecords.map(rec => (
                <div key={rec.id} className="p-3 rounded-xl bg-slate-950/50 border border-emerald-500/20 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{rec.sessionName}</div>
                    <div className="text-[10px] text-slate-400">Duyệt bởi: {rec.approvedBy} • Ngày {rec.date}</div>
                  </div>
                  <span className="badge badge-emerald text-[10px]">+50 PTS</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
