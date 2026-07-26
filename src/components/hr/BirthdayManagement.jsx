import React, { useState, useEffect, useCallback } from 'react';
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
  Mail,
  Save,
  Upload
} from 'lucide-react';

export const BirthdayManagement = () => {
  const { 
    birthdayAssignments, 
    assignBirthdayDuty, 
    submitMemberBirthdayData,
    submitBirthdayExcuse,
    reviewBirthdayExcuse,
    getPhotoAndDataDeadline,
    getMonitoringDeadline,
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

  // --- Monthly Email Config State ---
  // emailConfigs: { 'month-year': { wishTemplate, cardUrl, isSaving, cardUploading } }
  const [emailConfigs, setEmailConfigs] = useState({});

  const getConfigKey = (month, year) => `${month}-${year}`;

  const fetchEmailConfig = useCallback(async (month, year) => {
    const key = getConfigKey(month, year);
    try {
      const res = await fetch(`/api/birthday-config?month=${month}&year=${year}`);
      const result = await res.json();
      if (result.success) {
        setEmailConfigs(prev => ({
          ...prev,
          [key]: { wishTemplate: result.data.wishTemplate, cardUrl: result.data.cardUrl, isSaving: false, cardUploading: false }
        }));
      }
    } catch (_e) { /* ignore */ }
  }, []);

  useEffect(() => {
    birthdayAssignments.forEach(a => fetchEmailConfig(a.month, a.year));
  }, [birthdayAssignments, fetchEmailConfig]);

  const updateConfig = (month, year, patch) => {
    const key = getConfigKey(month, year);
    setEmailConfigs(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const handleSaveEmailConfig = async (month, year) => {
    const key = getConfigKey(month, year);
    const cfg = emailConfigs[key] || {};
    updateConfig(month, year, { isSaving: true });
    try {
      const res = await fetch('/api/birthday-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year, wishTemplate: cfg.wishTemplate || '', cardUrl: cfg.cardUrl || '' })
      });
      const result = await res.json();
      if (result.success) {
        if (showToast) showToast('✅ Đã lưu cấu hình email tháng ' + month + '/' + year, 'success');
      } else {
        if (showToast) showToast('Lỗi lưu cấu hình!', 'error');
      }
    } catch (_e) {
      if (showToast) showToast('Lỗi kết nối server!', 'error');
    } finally {
      updateConfig(month, year, { isSaving: false });
    }
  };

  const handleUploadCard = async (month, year, file) => {
    if (!file) return;
    updateConfig(month, year, { cardUploading: true });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/birthday-config/upload-card', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success && result.url) {
        updateConfig(month, year, { cardUrl: result.url });
        if (showToast) showToast('🎉 Đã tải thiệp lên thành công!', 'success');
      } else {
        if (showToast) showToast(result.message || 'Lỗi tải thiệp lên!', 'error');
      }
    } catch (_e) {
      if (showToast) showToast('Lỗi kết nối server!', 'error');
    } finally {
      updateConfig(month, year, { cardUploading: false });
    }
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!assignForm.memberId) {
      if (showToast) showToast('Vui lòng chọn người phụ trách', 'error');
      return;
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-indexed

    const selectedYear = parseInt(assignForm.year, 10);
    const selectedMonth = parseInt(assignForm.month, 10);

    if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
      if (showToast) showToast(`⚠️ Không thể phân công trực sinh nhật cho tháng đã qua (Tháng ${selectedMonth}/${selectedYear})!`, 'error');
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
      } catch (_err) {
        if (showToast) showToast('Lỗi khi kết nối đến máy chủ!', 'error');
      } finally {
        setIsUploading(false);
      }
    } else if (submissionMethod === 'no_photo') {
      const assignment = (birthdayAssignments || []).find(a => String(a.id) === String(activeAssignmentId));
      if (assignment) {
        const deadlineDate = getPhotoAndDataDeadline(assignment.year, assignment.month);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadlineDate && today < deadlineDate) {
          const deadlineString = `${String(deadlineDate.getDate()).padStart(2, '0')}/${String(deadlineDate.getMonth() + 1).padStart(2, '0')}/${deadlineDate.getFullYear()}`;
          if (showToast) showToast(`⚠️ Lý do không có ảnh chỉ được phép dùng kể từ ngày hạn chót (${deadlineString})!`, 'error');
          return;
        }
      }
      if (!memberLinkInput.trim()) {
        if (showToast) showToast('Vui lòng nhập lý do không có ảnh!', 'warning');
        return;
      }
      submitMemberBirthdayData(activeAssignmentId, submittingMemberId, `Lý do: ${memberLinkInput.trim()}`);
      setSubmittingMemberId(null);
      setMemberLinkInput('');
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
       <div className="ds-card p-5 border border-pink-500/30">
         <div>
              <h3 className="font-heading text-lg font-bold text-white flex flex-col items-center justify-center text-center gap-2">
                <Gift className="text-pink-400" />
                <span>Phân Công & Quản Lý Dữ Liệu Sinh Nhật</span>
              </h3>
           <p className="text-xs text-slate-400 mt-1">
             Nộp ảnh/bài đăng cho từng cá nhân sinh nhật trong tháng. Hạn chót nộp tư liệu đến ngày 28 của tháng trước, hạn trực kết thúc cuối tháng.
           </p>
         </div>

         <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
           <span className="ds-badge ds-badge-rose">
             <Calendar className="w-3.5 h-3.5 text-pink-400" /> Ngày 15: Gửi DS tháng sau
           </span>
           <span className="ds-badge ds-badge-amber">
             <Clock className="w-3.5 h-3.5 text-amber-400" /> Hạn chót nộp tư liệu: Ngày 28 tháng trước (-10 PTS)
           </span>
         </div>
       </div>

       {/* Form Phân Công (HR Head / Leader) */}
       {isHRHead && (
         <form onSubmit={handleAssign} className="ds-card p-5 border border-pink-500/30 space-y-4">
           <h4 className="font-heading text-sm font-bold text-white mb-2 flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-pink-400" />
             Phân công người phụ trách mừng sinh nhật tháng tới
           </h4>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
             <div>
               <label className="ds-field-label">Tháng *</label>
               <input required type="number" min="1" max="12" className="ds-input" value={assignForm.month} onChange={e => setAssignForm({...assignForm, month: parseInt(e.target.value)})} />
             </div>
             <div>
               <label className="ds-field-label">Năm *</label>
               <input required type="number" min="2024" max="2100" className="ds-input" value={assignForm.year} onChange={e => setAssignForm({...assignForm, year: parseInt(e.target.value)})} />
             </div>
             <div>
               <label className="ds-field-label">Người phụ trách *</label>
               <select required className="ds-input" value={assignForm.memberId} onChange={e => setAssignForm({...assignForm, memberId: e.target.value})}>
                 <option value="">-- Chọn thành viên Ban Đối Ngoại - Nhân Sự --</option>
                 {members
                   .filter(m => {
                     const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase();
                     const code = (m.memberCode || m.member_code || '').toUpperCase();
                     const dept = (m.deptName || m.department || '').toLowerCase();
                     const isHRExternal = dept.includes('đối ngoại') || dept.includes('nhân sự') || dept.includes('đn-ns') || dept.includes('dn-ns') || dept.includes('hr_external');
                     return !roleTitle.includes('super admin') 
                       && code !== 'ADMIN'
                       && isHRExternal
                       && m.status !== 'Suspended';
                   })
                   .map(m => (
                     <option key={m.id} value={m.id}>
                       {m.name} ({m.roleTitle || 'Thành Viên'})
                     </option>
                   ))}
               </select>
             </div>
           </div>
           <button type="submit" className="ds-btn ds-btn-primary w-full">
             <Send className="w-4 h-4" /> Giao nhiệm vụ sinh nhật
           </button>
         </form>
       )}

         {birthdayAssignments.length === 0 && (
           <p className="text-sm text-slate-500 italic ds-card p-6 text-center">
             Chưa có phân công nhiệm vụ sinh nhật nào.
           </p>
         )}
         
         {birthdayAssignments.map(a => {
           const assignee = members.find(mem => String(mem.id) === String(a.memberId) || String(mem.memberCode) === String(a.memberId));
           const isAssignee = String(currentUser?.id) === String(a.memberId) || String(currentUser?.memberCode) === String(a.memberId);

           const monitoringDeadlineDate = getMonitoringDeadline(a.year, a.month) || new Date(parseInt(a.year, 10), parseInt(a.month, 10), 0);
           const formattedDeadline = `${String(monitoringDeadlineDate.getDate()).padStart(2, '0')}/${String(monitoringDeadlineDate.getMonth() + 1).padStart(2, '0')}/${monitoringDeadlineDate.getFullYear()}`;

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
             <div key={a.id} className="ds-card p-5 space-y-4">
               
               {/* Card Title & Main Status */}
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[var(--border-default)]">
                 <div>
                   <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white flex flex-col items-center justify-center text-center gap-2">
                        <Gift className="w-4 h-4 text-pink-400" />
                        <span>Sinh nhật tháng {a.month}/{a.year}</span>
                      </h4>
                     {isCompleted ? (
                       <span className="ds-badge ds-badge-emerald">
                         <CheckCircle2 className="w-3 h-3" /> Hoàn Thành Nộp ({submittedCount}/{totalCount})
                       </span>
                     ) : (
                       <span className="ds-badge ds-badge-amber">
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
                       className="ds-btn ds-btn-ghost ds-btn-xs text-amber-400"
                     >
                       <FileText className="w-3.5 h-3.5" />
                       <span>Gửi Giải Trình Nộp Chậm</span>
                     </button>
                   )}

                   {/* HR Leader Exemption Review Controls */}
                   {(isHRHead || isAdmin) && a.excuseStatus === 'pending' && (
                     <div className="flex items-center gap-1.5 ds-card p-1 border border-amber-500/40">
                       <span className="text-[10px] text-amber-400 font-bold px-2">Đơn giải trình:</span>
                       <button
                         onClick={() => reviewBirthdayExcuse(a.id, 'approved')}
                         className="ds-btn ds-btn-success ds-btn-xs"
                       >
                         <Check className="w-3 h-3" /> Duyệt Miễn Phạt
                       </button>
                       <button
                         onClick={() => reviewBirthdayExcuse(a.id, 'rejected')}
                         className="ds-btn ds-btn-danger ds-btn-xs"
                       >
                         Từ Chối
                       </button>
                     </div>
                   )}
                 </div>
               </div>

               {/* Status Banner for Excuses */}
               {a.excuseStatus === 'pending' && (
                 <div className="ds-card p-3 border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2">
                   <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                   <div>
                     <strong>Đơn giải trình đang chờ duyệt:</strong> "{a.excuseReason}"
                   </div>
                 </div>
               )}

               {a.excuseStatus === 'approved' && (
                 <div className="ds-card p-2.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                   <span>Trưởng ban đã **Duyệt miễn phạt** nộp chậm cho đợt sinh nhật này.</span>
                 </div>
               )}

               {/* Birthday Members List for this month */}
               <div>
                 <h5 className="text-xs font-bold text-slate-300 mb-3.5 flex items-center justify-between">
                   <span>Danh Sách Thành Viên Sinh Nhật Tháng {a.month} ({birthdayMembersInMonth.length} người)</span>
                   <span className="text-[10px] text-pink-400 font-mono font-normal">Hạn chót: {formattedDeadline}</span>
                 </h5>

                 {birthdayMembersInMonth.length === 0 ? (
                   <p className="text-xs text-slate-500 italic py-2">Tháng này không có thành viên nào sinh nhật.</p>
                 ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                     {birthdayMembersInMonth.map((m) => {
                       const submittedLink = submissions[m.id];
                       return (
                         <div key={m.id} className="ds-card p-3 flex items-center justify-between gap-3">
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
                               submittedLink.startsWith('http') ? (
                                 <a
                                   href={submittedLink}
                                   target="_blank"
                                   rel="noreferrer"
                                   className="ds-badge ds-badge-emerald"
                                 >
                                   <ImageIcon className="w-3 h-3" /> Xem Bài
                                 </a>
                               ) : (
                                 <span className="ds-badge ds-badge-amber">
                                   📝 Không đăng page
                                 </span>
                               )
                             ) : (
                               (isAssignee || isHRHead || isAdmin) && (
                                 <button
                                   onClick={() => {
                                     setActiveAssignmentId(a.id);
                                     setSubmittingMemberId(m.id);
                                     setMemberLinkInput('');
                                   }}
                                   className="ds-btn ds-btn-primary ds-btn-xs"
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

               {/* Email Config Section - HR Head / Admin only */}
               {(isHRHead || isAdmin) && (() => {
                 const key = getConfigKey(a.month, a.year);
                 const cfg = emailConfigs[key] || {};
                 return (
                   <div className="mt-2 pt-4 border-t border-pink-500/20">
                     <h5 className="text-xs font-bold text-pink-300 mb-3 flex items-center gap-2">
                       <Mail className="w-3.5 h-3.5" /> Cấu hình gửi email chúc mừng tháng {a.month}
                     </h5>
                     <div className="space-y-3">
                       <div>
                         <label className="text-[11px] text-slate-400 mb-1 block">Lời chúc của tháng (template email tự động)</label>
                         <textarea
                           rows={3}
                           placeholder="Nhập nội dung lời chúc sẽ gửi kèm email sinh nhật... (có thể dùng {name}, {month})..."
                           value={cfg.wishTemplate || ''}
                           onChange={e => updateConfig(a.month, a.year, { wishTemplate: e.target.value })}
                           className="ds-textarea"
                         />
                       </div>
                       <div>
                         <label className="text-[11px] text-slate-400 mb-1 block">Thiệp chúc mừng của tháng</label>
                         <div className="flex items-center gap-3">
                           {cfg.cardUrl && (
                             <a href={cfg.cardUrl} target="_blank" rel="noreferrer" className="shrink-0">
                               <img src={cfg.cardUrl} alt="Thiệp" className="w-16 h-16 object-cover rounded-lg border border-pink-500/30" onError={e => e.target.style.display='none'} />
                             </a>
                           )}
                           <div className="flex-1 space-y-1.5">
                             <label className={`ds-btn ds-btn-ghost w-full text-center ${
                               cfg.cardUploading ? 'opacity-50 cursor-not-allowed' : ''
                             }`}>
                               <Upload className="w-3.5 h-3.5" />
                               {cfg.cardUploading ? 'Đang tải lên...' : (cfg.cardUrl ? 'Thay thiệp khác' : 'Tải thiệp lên')}
                               <input
                                 type="file"
                                 accept="image/*"
                                 className="hidden"
                                 disabled={cfg.cardUploading}
                                 onChange={e => handleUploadCard(a.month, a.year, e.target.files[0])}
                               />
                             </label>
                             {cfg.cardUrl && (
                               <input
                                 type="url"
                                 value={cfg.cardUrl}
                                 onChange={e => updateConfig(a.month, a.year, { cardUrl: e.target.value })}
                                 placeholder="Hoặc dán URL thiệp..."
                                 className="ds-input"
                               />
                             )}
                           </div>
                         </div>
                         {!cfg.cardUrl && (
                           <input
                             type="url"
                             value={cfg.cardUrl || ''}
                             onChange={e => updateConfig(a.month, a.year, { cardUrl: e.target.value })}
                             placeholder="Hoặc dán URL thiệp trực tiếp..."
                             className="ds-input"
                           />
                         )}
                       </div>
                       <button
                         onClick={() => handleSaveEmailConfig(a.month, a.year)}
                         disabled={cfg.isSaving}
                         className="ds-btn ds-btn-primary w-full"
                       >
                         <Save className="w-3.5 h-3.5" />
                         {cfg.isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình Email'}
                       </button>
                     </div>
                   </div>
                 );
               })()}

             </div>
           );
          })}

        {/* Modal Nộp Link/Ảnh Sinh Nhật cho 1 Thành Viên Cụ Thể */}
       {submittingMemberId && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-slide-up">
           <div className="ds-card p-6 w-full max-w-md shadow-2xl text-white space-y-4">
             <div className="flex justify-between items-center pb-3 border-b border-[var(--border-default)]">
                  <h3 className="font-heading font-bold text-base text-white flex flex-col items-center justify-center text-center gap-2">
                    <ImageIcon className="text-pink-400 w-5 h-5" />
                    <span>Nộp Ảnh / Link Mừng Sinh Nhật</span>
                  </h3>
               <button onClick={() => { setSubmittingMemberId(null); setSelectedFile(null); }} className="ds-btn ds-btn-ghost p-1">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <form onSubmit={handleConfirmMemberSubmit} className="space-y-4 text-xs">
               {/* Method Tabs */}
               <div className="flex gap-2 p-1 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-default)]">
                 <button
                   type="button"
                   onClick={() => setSubmissionMethod('upload')}
                   className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-all ${
                     submissionMethod === 'upload' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
                   }`}
                 >
                   Tải Ảnh Lên
                 </button>
                 <button
                   type="button"
                   onClick={() => setSubmissionMethod('link')}
                   className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-all ${
                     submissionMethod === 'link' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
                   }`}
                 >
                   Dán Link
                 </button>
                 <button
                   type="button"
                   onClick={() => {
                     const assignment = (birthdayAssignments || []).find(a => String(a.id) === String(activeAssignmentId));
                     if (assignment) {
                       const deadlineDate = getPhotoAndDataDeadline(assignment.year, assignment.month);
                       const today = new Date();
                       today.setHours(0, 0, 0, 0);
                       if (deadlineDate && today < deadlineDate) {
                         const deadlineString = `${String(deadlineDate.getDate()).padStart(2, '0')}/${String(deadlineDate.getMonth() + 1).padStart(2, '0')}/${deadlineDate.getFullYear()}`;
                         if (showToast) showToast(`⚠️ Lý do không có ảnh chỉ được phép dùng kể từ ngày hạn chót (${deadlineString})!`, 'warning');
                         return;
                       }
                     }
                     setSubmissionMethod('no_photo');
                   }}
                   className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-all ${
                     submissionMethod === 'no_photo' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
                   }`}
                 >
                   Không Có Ảnh
                 </button>
               </div>

               {submissionMethod === 'upload' ? (
                 <div>
                   <label className="ds-field-label">Chọn file ảnh / video mừng sinh nhật</label>
                   <input
                     type="file"
                     required
                     accept="image/*,video/*"
                     onChange={(e) => setSelectedFile(e.target.files[0])}
                     className="ds-input"
                   />
                   <p className="text-[10px] text-slate-500 mt-1">Hệ thống sẽ tự động tải lên Google Drive của Ban Đối Ngoại - Nhân Sự.</p>
                 </div>
               ) : submissionMethod === 'no_photo' ? (
                 <div>
                   <label className="ds-field-label">Lý do không nộp ảnh (ví dụ: Thành viên không cung cấp ảnh...)</label>
                   <textarea
                     required
                     placeholder="Nhập lý do chi tiết tại đây..."
                     value={memberLinkInput}
                     onChange={(e) => setMemberLinkInput(e.target.value)}
                     rows={3}
                     className="ds-textarea"
                   />
                 </div>
               ) : (
                 <div>
                   <label className="ds-field-label">Link Ảnh / Bài Đăng chúc mừng cá nhân (Drive, Facebook...)</label>
                   <input
                     type="url"
                     required
                     placeholder="https://drive.google.com/... hoặc https://facebook.com/..."
                     value={memberLinkInput}
                     onChange={(e) => setMemberLinkInput(e.target.value)}
                     className="ds-input"
                   />
                 </div>
               )}

               <div className="pt-2 flex justify-end gap-2">
                 <button
                   type="button"
                   disabled={isUploading}
                   onClick={() => { setSubmittingMemberId(null); setSelectedFile(null); }}
                   className="ds-btn ds-btn-secondary ds-btn-xs"
                 >
                   Hủy
                 </button>
                 <button
                   type="submit"
                   disabled={isUploading}
                   className="ds-btn ds-btn-primary ds-btn-xs"
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
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-slide-up">
           <div className="ds-card p-6 w-full max-w-md shadow-2xl text-white space-y-4">
             <div className="flex justify-between items-center pb-3 border-b border-[var(--border-default)]">
                  <h3 className="font-heading font-bold text-base text-white flex flex-col items-center justify-center text-center gap-2">
                    <FileText className="text-amber-400 w-5 h-5" />
                    <span>Nộp Đơn Giải Trình Nộp Chậm</span>
                  </h3>
               <button onClick={() => setExcuseModalAssignmentId(null)} className="ds-btn ds-btn-ghost p-1">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <form onSubmit={handleConfirmExcuseSubmit} className="space-y-4 text-xs">
               <div>
                 <label className="ds-field-label">Lý do giải trình (Để Trưởng Ban / HR duyệt miễn trừ phạt điểm)</label>
                 <textarea
                   required
                   rows={4}
                   placeholder="Nhập lý do chi tiết (ví dụ: Bận kỳ thi học kỳ, lý do sức khỏe...)"
                   value={excuseReasonInput}
                   onChange={(e) => setExcuseReasonInput(e.target.value)}
                   className="ds-textarea"
                 />
               </div>

               <div className="pt-2 flex justify-end gap-2">
                 <button
                   type="button"
                   onClick={() => setExcuseModalAssignmentId(null)}
                   className="ds-btn ds-btn-secondary ds-btn-xs"
                 >
                   Hủy
                 </button>
                 <button
                   type="submit"
                   className="ds-btn ds-btn-primary ds-btn-xs"
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
