import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { 
  Gift, 
  Image as ImageIcon, 
  Send, 
  CheckCircle2, 
  X, 
  Calendar, 
  Clock, 
  AlertCircle, 
  FileText, 
  Check, 
  AlertTriangle,
  User,
  Sparkles
} from 'lucide-react';

export const BirthdayManagement = () => {
  const { 
    birthdayAssignments, 
    assignBirthdayDuty, 
    submitMemberBirthdayData,
    submitBirthdayExcuse,
    reviewBirthdayExcuse,
    members, 
    currentUser, 
    isHRHead,
    isAdmin,
    showToast 
  } = useClub();
  
  const [assignForm, setAssignForm] = useState({ 
    month: new Date().getMonth() + 2 > 12 ? 1 : new Date().getMonth() + 2, 
    year: new Date().getFullYear(), 
    memberId: '' 
  });

  const [activeAssignmentId, setActiveAssignmentId] = useState(null);
  const [submittingMemberId, setSubmittingMemberId] = useState(null);
  const [memberLinkInput, setMemberLinkInput] = useState('');

  const [excuseModalAssignmentId, setExcuseModalAssignmentId] = useState(null);
  const [excuseReasonInput, setExcuseReasonInput] = useState('');

  const [submissionMethod, setSubmissionMethod] = useState('upload'); // 'upload' or 'link'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAssign = (e) => {
    e.preventDefault();
    if (!assignForm.memberId) {
      if (showToast) showToast('Vui lòng chọn người phụ trách', 'error');
      return;
    }
    assignBirthdayDuty(assignForm.month, assignForm.year, assignForm.memberId);
    setAssignForm({ ...assignForm, memberId: '' });
  };

  const handleConfirmMemberSubmit = async (e) => {
    e.preventDefault();
    if (!activeAssignmentId || !submittingMemberId) return;

    if (submissionMethod === 'upload') {
      if (!selectedFile) {
        if (showToast) showToast('Vui lòng chọn file ảnh để tải lên!', 'warning');
        return;
      }
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/birthday/upload', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        if (result.success && result.webViewLink) {
          submitMemberBirthdayData(activeAssignmentId, submittingMemberId, result.webViewLink);
          if (showToast) showToast('🎉 Đã tải ảnh lên Google Drive Ban thành công!', 'success');
          setSubmittingMemberId(null);
          setSelectedFile(null);
        } else {
          if (showToast) showToast(result.message || 'Không thể tải ảnh lên Google Drive!', 'error');
        }
      } catch (err) {
        if (showToast) showToast('Lỗi khi kết nối đến máy chủ!', 'error');
      } finally {
        setIsUploading(false);
      }
    } else {
      if (!memberLinkInput.trim()) return;
      submitMemberBirthdayData(activeAssignmentId, submittingMemberId, memberLinkInput.trim());
      setSubmittingMemberId(null);
      setMemberLinkInput('');
    }
  };

  const handleConfirmExcuseSubmit = (e) => {
    e.preventDefault();
    if (!excuseReasonInput.trim() || !excuseModalAssignmentId) return;
    submitBirthdayExcuse(excuseModalAssignmentId, excuseReasonInput.trim());
    setExcuseModalAssignmentId(null);
    setExcuseReasonInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-pink-500/30">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Gift className="text-pink-400" /> Phân Công & Quản Lý Dữ Liệu Sinh Nhật
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Nộp ảnh/bài đăng cho từng cá nhân sinh nhật trong tháng. Hạn chót đến 28 hàng tháng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="bg-pink-500/10 text-pink-300 border border-pink-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-pink-400" /> Ngày 15: Gửi DS tháng sau
          </span>
          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Hạn chót: Ngày 28 (-10 PTS)
          </span>
        </div>
      </div>

      {/* Form Phân Công (HR Head / Leader) */}
      {isHRHead && (
        <form onSubmit={handleAssign} className="bg-slate-900 p-5 rounded-2xl border border-pink-500/30 space-y-4">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            Phân công người phụ trách mừng sinh nhật tháng tới
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block">Tháng *</label>
              <input required type="number" min="1" max="12" className="input-field" value={assignForm.month} onChange={e => setAssignForm({...assignForm, month: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Năm *</label>
              <input required type="number" min="2024" max="2100" className="input-field" value={assignForm.year} onChange={e => setAssignForm({...assignForm, year: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Người phụ trách *</label>
              <select required className="input-field" value={assignForm.memberId} onChange={e => setAssignForm({...assignForm, memberId: e.target.value})}>
                <option value="">-- Chọn thành viên phụ trách --</option>
                {members
                  .filter(m => {
                    const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase();
                    const code = (m.memberCode || m.member_code || '').toUpperCase();
                    const dept = (m.deptName || m.department || '').toLowerCase();
                    return !roleTitle.includes('super admin') 
                      && code !== 'ADMIN'
                      && !dept.includes('cố vấn');
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

      {/* Danh sách Phân Công Sinh Nhật */}
      <div className="space-y-4">
        {birthdayAssignments.length === 0 && (
          <p className="text-sm text-slate-500 italic bg-slate-950 p-6 rounded-2xl border border-white/5 text-center">
            Chưa có phân công nhiệm vụ sinh nhật nào.
          </p>
        )}
        
        {birthdayAssignments.map(a => {
          const assignee = members.find(mem => String(mem.id) === String(a.memberId) || String(mem.memberCode) === String(a.memberId));
          const isAssignee = String(currentUser?.id) === String(a.memberId) || String(currentUser?.memberCode) === String(a.memberId);

          // Get members having birthday in this month
          const birthdayMembersInMonth = members.filter(m => {
            if (!m.dob) return false;
            const parts = m.dob.split('/');
            return parts.length >= 2 && parseInt(parts[1], 10) === parseInt(a.month, 10);
          });

          const submissions = a.submissions || {};
          const submittedCount = birthdayMembersInMonth.filter(m => Boolean(submissions[m.id])).length;
          const totalCount = birthdayMembersInMonth.length;
          const isCompleted = a.status === 'completed' || (totalCount > 0 && submittedCount >= totalCount);

          return (
            <div key={a.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              
              {/* Card Title & Main Status */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Gift className="w-4 h-4 text-pink-400" /> Sinh nhật tháng {a.month}/{a.year}
                    </h4>
                    {isCompleted ? (
                      <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Hoàn Thành Nộp ({submittedCount}/{totalCount})
                      </span>
                    ) : (
                      <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                        Đang Nộp ({submittedCount}/{totalCount})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Người phụ trách: <strong className="text-pink-300 font-semibold">{assignee?.name || 'Thành viên VMC'}</strong>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isAssignee && !isCompleted && (
                    <button
                      onClick={() => {
                        setExcuseModalAssignmentId(a.id);
                        setExcuseReasonInput(a.excuseReason || '');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-amber-500/30 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Gửi Giải Trình Nộp Chậm</span>
                    </button>
                  )}

                  {/* HR Leader Exemption Review Controls */}
                  {(isHRHead || isAdmin) && a.excuseStatus === 'pending' && (
                    <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-amber-500/40">
                      <span className="text-[10px] text-amber-400 font-bold px-2">Đơn giải trình:</span>
                      <button
                        onClick={() => reviewBirthdayExcuse(a.id, 'approved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1"
                        title="Duyệt miễn phạt chậm deadline"
                      >
                        <Check className="w-3 h-3" /> Duyệt Miễn Phạt
                      </button>
                      <button
                        onClick={() => reviewBirthdayExcuse(a.id, 'rejected')}
                        className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                        title="Từ chối giải trình"
                      >
                        Từ Chối
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Banner for Excuses */}
              {a.excuseStatus === 'pending' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <div>
                    <strong>Đơn giải trình đang chờ duyệt:</strong> "{a.excuseReason}"
                  </div>
                </div>
              )}

              {a.excuseStatus === 'approved' && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Trưởng ban đã **Duyệt miễn phạt** nộp chậm cho đợt sinh nhật này.</span>
                </div>
              )}

              {/* Birthday Members List for this month */}
              <div>
                <h5 className="text-xs font-bold text-slate-300 mb-3.5 flex items-center justify-between">
                  <span>Danh Sách Thành Viên Sinh Nhật Tháng {a.month} ({birthdayMembersInMonth.length} người)</span>
                  <span className="text-[10px] text-pink-400 font-mono font-normal">Hạn chót: 28/{a.month}/{a.year}</span>
                </h5>

                {birthdayMembersInMonth.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">Tháng này không có thành viên nào sinh nhật.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {birthdayMembersInMonth.map((m) => {
                      const submittedLink = submissions[m.id];
                      return (
                        <div key={m.id} className="p-3 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold shrink-0 border border-pink-500/30">
                              {(m.name || 'V').charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">{m.name}</div>
                              <div className="text-[10px] text-pink-400 font-mono">
                                🎂 {m.dob} • {m.deptName || m.department || 'Ban Chuyên Môn'}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {submittedLink ? (
                              <a
                                href={submittedLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                              >
                                <ImageIcon className="w-3 h-3" /> Xem Bài
                              </a>
                            ) : (
                              (isAssignee || isHRHead || isAdmin) && (
                                <button
                                  onClick={() => {
                                    setActiveAssignmentId(a.id);
                                    setSubmittingMemberId(m.id);
                                    setMemberLinkInput('');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-md shadow-pink-600/20"
                                >
                                  <ImageIcon className="w-3 h-3" /> Nộp Bài
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Nộp Link Sinh Nhật cho 1 Thành Viên Cụ Thể */}
      {/* Modal Nộp Link/Ảnh Sinh Nhật cho 1 Thành Viên Cụ Thể */}
      {submittingMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up">
          <div className="relative w-full max-w-md bg-slate-900 border border-pink-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <ImageIcon className="text-pink-400 w-5 h-5" /> Nộp Ảnh / Link Mừng Sinh Nhật
              </h3>
              <button onClick={() => { setSubmittingMemberId(null); setSelectedFile(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmMemberSubmit} className="space-y-4 text-xs">
              {/* Method Tabs */}
              <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setSubmissionMethod('upload')}
                  className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-all ${
                    submissionMethod === 'upload' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tải Ảnh Lên Drive Ban
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionMethod('link')}
                  className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-all ${
                    submissionMethod === 'link' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dán Link Ảnh / Bài Đăng
                </button>
              </div>

              {submissionMethod === 'upload' ? (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Chọn file ảnh / video mừng sinh nhật</label>
                  <input
                    type="file"
                    required
                    accept="image/*,video/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-600/20 file:text-pink-400 hover:file:bg-pink-600/30"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Hệ thống sẽ tự động tải lên Google Drive của Ban Đối Ngoại - Nhân Sự.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Link Ảnh / Bài Đăng chúc mừng cá nhân (Drive, Facebook...)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... hoặc https://facebook.com/..."
                    value={memberLinkInput}
                    onChange={(e) => setMemberLinkInput(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => { setSubmittingMemberId(null); setSelectedFile(null); }}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn-primary text-xs px-6 py-2 bg-pink-600 hover:bg-pink-500 border border-pink-500/50 shadow-pink-600/30 flex items-center gap-2 font-bold disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> 
                  <span>{isUploading ? 'Đang Tải Lên...' : 'Xác Nhận Nộp'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nộp Đơn Giải Trình Lý Do */}
      {excuseModalAssignmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <FileText className="text-amber-400 w-5 h-5" /> Nộp Đơn Giải Trình Nộp Chậm
              </h3>
              <button onClick={() => setExcuseModalAssignmentId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmExcuseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Lý do giải trình (Để Trưởng Ban / HR duyệt miễn trừ phạt điểm)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Nhập lý do chi tiết (ví dụ: Bận kỳ thi học kỳ, lý do sức khỏe...)"
                  value={excuseReasonInput}
                  onChange={(e) => setExcuseReasonInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExcuseModalAssignmentId(null)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-6 py-2 bg-amber-600 hover:bg-amber-500 border border-amber-500/50 shadow-amber-600/30 flex items-center gap-2 font-bold"
                >
                  <Send className="w-4 h-4" /> Gửi Đơn Giải Trình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
