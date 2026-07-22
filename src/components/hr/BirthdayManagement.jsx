import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Gift, Image as ImageIcon, Send, CheckCircle2, X } from 'lucide-react';

export const BirthdayManagement = () => {
  const { birthdayAssignments, assignBirthdayDuty, submitBirthdayImage, members, currentUser, isHRHead, showToast } = useClub();
  
  const [assignForm, setAssignForm] = useState({ 
    month: new Date().getMonth() + 2 > 12 ? 1 : new Date().getMonth() + 2, 
    year: new Date().getFullYear(), 
    memberId: '' 
  });

  const [submittingAssignmentId, setSubmittingAssignmentId] = useState(null);
  const [imageLinkInput, setImageLinkInput] = useState('');

  const handleAssign = (e) => {
    e.preventDefault();
    if (!assignForm.memberId) {
      if (showToast) showToast('Vui lòng chọn người phụ trách', 'error');
      return;
    }
    assignBirthdayDuty(assignForm.month, assignForm.year, assignForm.memberId);
    if (showToast) showToast(`Đã giao nhiệm vụ sinh nhật tháng ${assignForm.month}/${assignForm.year} thành công!`, 'success');
    setAssignForm({ ...assignForm, memberId: '' });
  };

  const handleConfirmImageSubmit = (e) => {
    e.preventDefault();
    if (!imageLinkInput.trim()) return;
    submitBirthdayImage(submittingAssignmentId, imageLinkInput.trim());
    if (showToast) showToast('Đã cập nhật bài đăng / ảnh sinh nhật thành công!', 'success');
    setSubmittingAssignmentId(null);
    setImageLinkInput('');
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
          <h4 className="text-sm font-bold text-white mb-2">Phân công người phụ trách mừng sinh nhật tháng tới</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Tháng *</label>
              <input required type="number" min="1" max="12" className="input-field" value={assignForm.month} onChange={e => setAssignForm({...assignForm, month: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Năm *</label>
              <input required type="number" min="2024" max="2100" className="input-field" value={assignForm.year} onChange={e => setAssignForm({...assignForm, year: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Người phụ trách *</label>
              <select required className="input-field" value={assignForm.memberId} onChange={e => setAssignForm({...assignForm, memberId: e.target.value})}>
                <option value="">-- Chọn thành viên phụ trách --</option>
                {members
                  .filter(m => {
                    const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase();
                    const code = (m.memberCode || m.member_code || '').toUpperCase();
                    return !roleTitle.includes('super admin') && code !== 'ADMIN';
                  })
                  .map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.deptName || m.department || 'Thành Viên'})
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-2.5 bg-pink-600 hover:bg-pink-700 border border-pink-500/50 text-xs font-bold flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Giao nhiệm vụ sinh nhật
          </button>
        </form>
      )}

      <div className="space-y-4">
        {birthdayAssignments.length === 0 && (
          <p className="text-sm text-slate-500 italic bg-slate-950 p-4 rounded-xl border border-white/5 text-center">Chưa có phân công nhiệm vụ sinh nhật nào.</p>
        )}
        
        {birthdayAssignments.map(a => {
          const assignee = members.find(mem => String(mem.id) === String(a.memberId) || String(mem.memberCode) === String(a.memberId));
          const isAssignee = String(currentUser?.id) === String(a.memberId) || String(currentUser?.memberCode) === String(a.memberId);

          return (
            <div key={a.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-pink-400" /> Sinh nhật tháng {a.month}/{a.year}
                </h4>
                <div className="text-sm text-slate-400 mt-1">
                  Người phụ trách: <strong className="text-pink-300 font-semibold">{assignee?.name || 'Thành viên VMC'}</strong>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {a.status === 'pending' ? (
                  <>
                    <span className="badge badge-amber bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">Chưa nộp bài đăng</span>
                    {(isAssignee || isHRHead) && (
                      <button 
                        onClick={() => {
                          setSubmittingAssignmentId(a.id);
                          setImageLinkInput(a.link || '');
                        }} 
                        className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-pink-600/20 transition-all"
                      >
                        <ImageIcon className="w-4 h-4" /> Nộp ảnh / Bài đăng
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <span className="badge badge-emerald bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn thành
                    </span>
                    {a.link && (
                      <a href={a.link} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all">
                        Xem bài đăng
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nộp Ảnh / Link Bài Đăng Sinh Nhật */}
      {submittingAssignmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up">
          <div className="relative w-full max-w-md bg-slate-900 border border-pink-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <ImageIcon className="text-pink-400 w-5 h-5" /> Nộp Link Bài Đăng Sinh Nhật
              </h3>
              <button onClick={() => setSubmittingAssignmentId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmImageSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Link Ảnh / Bài Đăng (Google Drive, Facebook...)</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... hoặc https://facebook.com/..."
                  value={imageLinkInput}
                  onChange={(e) => setImageLinkInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignmentId(null)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-6 py-2 bg-pink-600 hover:bg-pink-500 border border-pink-500/50 shadow-pink-600/30 flex items-center gap-2 font-bold"
                >
                  <Send className="w-4 h-4" /> Xác Nhận Nộp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
