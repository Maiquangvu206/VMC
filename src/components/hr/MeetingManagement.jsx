import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Plus, Users, Clock, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

export const MeetingManagement = () => {
  const { meetings, createMeeting, cancelMeeting, updateMeeting, members, submitMeetingAttendance, submitMeetingMinutes, currentUser, isHRHead } = useClub();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '', attendanceTakerId: '', minuteTakerId: '' });
  const [editMeetingId, setEditMeetingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const todayDate = new Date().toISOString().split('T')[0];
  
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
    members.forEach(m => { initial[m.id] = 'present'; });
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
        {isHRHead && (
          <button onClick={() => setShowForm(!showForm)} className="ds-btn ds-btn-primary ds-btn-xs">
            <Plus className="w-4 h-4" /> Tạo Cuộc Họp
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="ds-card p-5 border border-purple-500/30 space-y-4">
          <div>
            <label className="ds-field-label">Tên cuộc họp</label>
            <input required type="text" className="ds-input" placeholder="VD: Họp giao ban đầu tháng" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="ds-field-label">Ngày họp</label>
              <input required type="date" min={todayDate} className="ds-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="ds-field-label">Giờ họp</label>
              <input required type="time" className="ds-input" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="ds-field-label">Người điểm danh</label>
              <select className="ds-input" value={formData.attendanceTakerId} onChange={e => setFormData({...formData, attendanceTakerId: e.target.value})}>
                <option value="">-- Chọn thành viên --</option>
                {members
                  .filter(m => m.deptName?.toLowerCase().includes('đối ngoại') || m.deptName?.toLowerCase().includes('nhân sự'))
                  .map(m => <option key={m.id} value={m.id}>{m.name} ({m.deptName})</option>)}
              </select>
            </div>
            <div>
              <label className="ds-field-label">Người ghi biên bản</label>
              <select className="ds-input" value={formData.minuteTakerId} onChange={e => setFormData({...formData, minuteTakerId: e.target.value})}>
                <option value="">-- Chọn thành viên --</option>
                {members
                  .filter(m => m.deptName?.toLowerCase().includes('đối ngoại') || m.deptName?.toLowerCase().includes('nhân sự'))
                  .map(m => <option key={m.id} value={m.id}>{m.name} ({m.deptName})</option>)}
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
          const attendanceTaker = members.find(mem => String(mem.id) === String(m.attendanceTakerId));
          const minuteTaker = members.find(mem => String(mem.id) === String(m.minuteTakerId));
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
                  <span className="text-slate-500">Phụ trách điểm danh:</span><br/>
                  <span className="font-semibold text-blue-300">{attendanceTaker?.name || 'Chưa phân công'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Ghi biên bản:</span><br/>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up">
          <div className="ds-card p-6 w-full max-w-2xl shadow-2xl text-white flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[var(--border-default)] flex justify-between items-center shrink-0">
              <h3 className="font-bold text-white text-lg">
                Điểm danh: {activeAttendanceMeeting.title}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-2 flex-1">
              <div className="ds-card p-4 border border-amber-500/30 bg-amber-500/10 mb-4 flex gap-3 text-sm text-amber-200/80">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
                <p>Thành viên bị đánh dấu "Đi muộn" hoặc "Vắng không phép" sẽ bị trừ điểm tự động ngay khi bạn chốt điểm danh.</p>
              </div>

              {members.filter(m => {
                const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase();
                const deptName = (m.deptName || m.department || '').toLowerCase();
                const code = (m.memberCode || m.member_code || '').toUpperCase();
                return !roleTitle.includes('super admin') && !roleTitle.includes('cố vấn') && !deptName.includes('cố vấn') && code !== 'ADMIN';
              }).map(m => (
                <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 ds-card p-3">
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white">{m.name}</div>
                    <div className="text-[10px] text-slate-500">{m.deptName}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAttendanceState({...attendanceState, [m.id]: 'present'})}
                      className={`ds-btn ds-btn-xs ${attendanceState[m.id] === 'present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                    >
                      Có mặt
                    </button>
                    <button 
                      onClick={() => setAttendanceState({...attendanceState, [m.id]: 'late'})}
                      className={`ds-btn ds-btn-xs ${attendanceState[m.id] === 'late' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                    >
                      Đi muộn (-5đ)
                    </button>
                    <button 
                      onClick={() => setAttendanceState({...attendanceState, [m.id]: 'absent_excused'})}
                      className={`ds-btn ds-btn-xs ${attendanceState[m.id] === 'absent_excused' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                    >
                      Vắng (Có phép)
                    </button>
                    <button 
                      onClick={() => setAttendanceState({...attendanceState, [m.id]: 'absent'})}
                      className={`ds-btn ds-btn-xs ${attendanceState[m.id] === 'absent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                    >
                      Vắng (-10đ)
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
