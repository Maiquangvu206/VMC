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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="text-purple-400" /> Quản Lý Điểm Danh & Họp
        </h3>
        {isHRHead && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs px-4 py-2 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tạo Cuộc Họp
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-900 p-5 rounded-2xl border border-purple-500/30 space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tên cuộc họp</label>
            <input required type="text" className="input-field" placeholder="VD: Họp giao ban đầu tháng" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Ngày họp</label>
              <input required type="date" min={todayDate} className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Giờ họp</label>
              <input required type="time" className="input-field" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Người điểm danh</label>
              <select className="input-field" value={formData.attendanceTakerId} onChange={e => setFormData({...formData, attendanceTakerId: e.target.value})}>
                <option value="">-- Chọn thành viên --</option>
                {members
                  .filter(m => m.deptName?.toLowerCase().includes('đối ngoại') || m.deptName?.toLowerCase().includes('nhân sự'))
                  .map(m => <option key={m.id} value={m.id}>{m.name} ({m.deptName})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Người ghi biên bản</label>
              <select className="input-field" value={formData.minuteTakerId} onChange={e => setFormData({...formData, minuteTakerId: e.target.value})}>
                <option value="">-- Chọn thành viên --</option>
                {members
                  .filter(m => m.deptName?.toLowerCase().includes('đối ngoại') || m.deptName?.toLowerCase().includes('nhân sự'))
                  .map(m => <option key={m.id} value={m.id}>{m.name} ({m.deptName})</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-2">Lưu Cuộc Họp</button>
        </form>
      )}

      {/* Danh sách cuộc họp */}
      <div className="space-y-4">
        {meetings.length === 0 && <p className="text-sm text-slate-500 italic">Chưa có lịch họp nào.</p>}
        
        {meetings.map(m => {
          const attendanceTaker = members.find(mem => mem.id === m.attendanceTakerId);
          const minuteTaker = members.find(mem => mem.id === m.minuteTakerId);
          const isAttendanceTaker = currentUser?.id === m.attendanceTakerId;
          const isMinuteTaker = currentUser?.id === m.minuteTakerId;

          return (
            <div key={m.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 flex gap-2">
                {m.status === 'pending' && <span className="badge badge-purple bg-purple-500/10 text-purple-400 border border-purple-500/20">Sắp diễn ra</span>}
                {m.status === 'postponed' && <span className="badge badge-amber bg-amber-500/10 text-amber-400 border border-amber-500/20">Đã Hoãn</span>}
                {m.status === 'cancelled' && <span className="badge badge-rose bg-rose-500/10 text-rose-400 border border-rose-500/20">Đã Hủy</span>}
                {m.status === 'pending_minutes' && <span className="badge badge-amber bg-amber-500/10 text-amber-400 border border-amber-500/20">Chờ nộp biên bản</span>}
                {m.status === 'completed' && <span className="badge badge-emerald bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Đã hoàn thành</span>}
              </div>

              <div>
                <h4 className="font-bold text-white text-base pr-24">{m.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 font-mono">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.time} | {m.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/50 p-3 rounded-xl border border-white/5">
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
                  <button onClick={() => startAttendance(m)} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors">
                    <CheckCircle2 className="w-4 h-4" /> Bắt đầu điểm danh
                  </button>
                )}
                
                {m.status === 'pending_minutes' && (isMinuteTaker || isHRHead) && (
                  <button onClick={() => handleMinuteSubmit(m.id)} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors">
                    <FileText className="w-4 h-4" /> Nộp link biên bản
                  </button>
                )}
                {m.minutesLink && (
                  <a href={m.minutesLink} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700">
                    Xem biên bản
                  </a>
                )}
                
                {(m.status === 'pending' || m.status === 'postponed') && isHRHead && (
                  <>
                    <button onClick={() => {
                      setEditMeetingId(m.id);
                      setEditDate(m.date);
                      setEditTime(m.time);
                    }} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold transition-colors">
                      Đổi giờ
                    </button>
                    <button onClick={() => updateMeeting(m.id, null, null, true)} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold transition-colors">
                      Hoãn
                    </button>
                    <button onClick={() => cancelMeeting(m.id)} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold transition-colors">
                      Hủy
                    </button>
                  </>
                )}
              </div>

              {editMeetingId === m.id && (
                <div className="mt-4 p-4 bg-slate-900 border border-blue-500/30 rounded-xl space-y-3">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 block mb-1">Ngày mới</label>
                      <input type="date" min={todayDate} className="input-field" value={editDate} onChange={e => setEditDate(e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 block mb-1">Giờ mới</label>
                      <input type="time" className="input-field" value={editTime} onChange={e => setEditTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditMeetingId(null)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Hủy</button>
                    <button onClick={() => {
                      updateMeeting(m.id, editDate, editTime, false);
                      setEditMeetingId(null);
                    }} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">Lưu thay đổi</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Attendance Modal */}
      {activeAttendanceMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-white text-lg">
                Điểm danh: {activeAttendanceMeeting.title}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-2 flex-1">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 flex gap-3 text-sm text-amber-200/80">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
                <p>Thành viên bị đánh dấu "Đi muộn" hoặc "Vắng không phép" sẽ bị trừ điểm tự động ngay khi bạn chốt điểm danh.</p>
              </div>

              {members.map(m => (
                <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-white/5">
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white">{m.name}</div>
                    <div className="text-[10px] text-slate-500">{m.deptName}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAttendanceState({...attendanceState, [m.id]: 'present'})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${attendanceState[m.id] === 'present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                    >
                      Có mặt
                    </button>
                    <button 
                      onClick={() => setAttendanceState({...attendanceState, [m.id]: 'late'})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${attendanceState[m.id] === 'late' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                    >
                      Đi muộn (-5đ)
                    </button>
                    <button 
                      onClick={() => setAttendanceState({...attendanceState, [m.id]: 'absent_excused'})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${attendanceState[m.id] === 'absent_excused' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                    >
                      Vắng (Có phép)
                    </button>
                    <button 
                      onClick={() => setAttendanceState({...attendanceState, [m.id]: 'absent'})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${attendanceState[m.id] === 'absent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                    >
                      Vắng (-10đ)
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 shrink-0">
              <button onClick={() => setActiveAttendanceMeeting(null)} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800">
                Hủy
              </button>
              <button onClick={handleAttendanceSubmit} className="btn-primary px-6 py-2.5">
                Chốt Điểm Danh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
