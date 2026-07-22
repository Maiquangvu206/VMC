import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Gift, Image as ImageIcon, Send, CheckCircle2 } from 'lucide-react';

export const BirthdayManagement = () => {
  const { birthdayAssignments, assignBirthdayDuty, submitBirthdayImage, members, currentUser, isHRHead } = useClub();
  
  const [assignForm, setAssignForm] = useState({ month: new Date().getMonth() + 2 > 12 ? 1 : new Date().getMonth() + 2, year: new Date().getFullYear(), memberId: '' });

  const handleAssign = (e) => {
    e.preventDefault();
    assignBirthdayDuty(assignForm.month, assignForm.year, assignForm.memberId);
    setAssignForm({ ...assignForm, memberId: '' });
  };

  const handleImageSubmit = (id) => {
    const link = prompt('Dán link ảnh/bài đăng sinh nhật (Google Drive, Facebook...):');
    if (link) {
      submitBirthdayImage(id, link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Gift className="text-pink-400" /> Phân Công Nhiệm Vụ Sinh Nhật
        </h3>
      </div>

      {isHRHead && (
        <form onSubmit={handleAssign} className="bg-slate-900 p-5 rounded-2xl border border-pink-500/30 space-y-4">
          <h4 className="text-sm font-bold text-white mb-2">Phân công người phụ trách tháng tới</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Tháng</label>
              <input required type="number" min="1" max="12" className="input-field" value={assignForm.month} onChange={e => setAssignForm({...assignForm, month: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Năm</label>
              <input required type="number" min="2024" max="2100" className="input-field" value={assignForm.year} onChange={e => setAssignForm({...assignForm, year: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Người phụ trách</label>
              <select required className="input-field" value={assignForm.memberId} onChange={e => setAssignForm({...assignForm, memberId: e.target.value})}>
                <option value="">-- Chọn --</option>
                {members
                  .filter(m => m.deptName?.toLowerCase().includes('đối ngoại') || m.deptName?.toLowerCase().includes('nhân sự'))
                  .map(m => <option key={m.id} value={m.id}>{m.name} ({m.deptName})</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-2 bg-pink-600 hover:bg-pink-700 border border-pink-500/50">
            Giao nhiệm vụ
          </button>
        </form>
      )}

      <div className="space-y-4">
        {birthdayAssignments.length === 0 && <p className="text-sm text-slate-500 italic">Chưa có phân công nào.</p>}
        
        {birthdayAssignments.map(a => {
          const assignee = members.find(mem => mem.id === a.memberId);
          const isAssignee = currentUser?.id === a.memberId;

          return (
            <div key={a.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white">Sinh nhật tháng {a.month}/{a.year}</h4>
                <div className="text-sm text-slate-400 mt-1">
                  Người phụ trách: <strong className="text-pink-300">{assignee?.name || 'Không xác định'}</strong>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {a.status === 'pending' ? (
                  <>
                    <span className="badge badge-amber bg-amber-500/10 text-amber-400 border border-amber-500/20">Chưa nộp ảnh</span>
                    {(isAssignee || isHRHead) && (
                      <button onClick={() => handleImageSubmit(a.id)} className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Nộp ảnh / Bài đăng
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <span className="badge badge-emerald bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
                    </span>
                    <a href={a.link} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2">
                      Xem bài đăng
                    </a>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
