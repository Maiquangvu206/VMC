import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { FileText, CheckCircle, Plus, Clock, User, X, Share2, Sparkles } from 'lucide-react';

export const InternalDrafts = () => {
  const { 
    drafts, 
    members,
    approveDraft,
    completeGrading,
    addDraft, 
    isNewDraftModalOpen, 
    setIsNewDraftModalOpen,
    currentUser 
  } = useClub();

  const canApproveDraft = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.role === 'lead' ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUser?.roleTitle?.includes('Super Admin') ||
    currentUser?.roleTitle?.includes('Chủ Nhiệm') ||
    currentUser?.roleTitle?.includes('Trưởng Ban') ||
    currentUser?.roleTitle?.includes('Phó Ban') ||
    currentUser?.deptName?.includes('Nội Dung') ||
    currentUser?.deptName?.includes('Chủ Nhiệm') ||
    currentUser?.deptName?.includes('Đối Ngoại') ||
    currentUser?.deptName?.includes('Nhân Sự')
  );

  const [draftToSchedule, setDraftToSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    publishDate: '',
    graderId: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const handleSubmitNewDraft = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết!');
      return;
    }
    addDraft(formData);
    setIsNewDraftModalOpen(false);
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="container py-8 space-y-8 pb-20">
      
      {/* Locked Notice Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-200 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 text-lg font-bold">
            🔒
          </div>
          <div>
            <strong className="block text-amber-300 font-bold text-sm">Chức năng đang trong quá trình phát triển!</strong>
            <span className="text-amber-200/80">Tính năng Soạn Kịch Bản, Phê Duyệt & Lên Lịch Đăng Bài hiện đang tạm khóa để nâng cấp trải nghiệm hệ thống.</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-amber">Content Studio VMC (Đang Phát Triển)</span>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
            Kho Kịch Bản & <span className="gradient-text">Duyệt Bài Fanpage</span>
          </h1>
          <p className="text-xs text-slate-400">
            Khu vực biên tập kịch bản video, bài viết truyền thông THPT Vĩnh Bảo trước khi duyệt đăng chính thức.
          </p>
        </div>

        <button
          onClick={() => alert('🔒 Chức năng Soạn Kịch Bản & Duyệt Bài đang trong quá trình phát triển!')}
          className="btn-primary text-xs px-5 py-2.5 shadow-amber-600/30 opacity-80 hover:opacity-100 bg-amber-600 border-amber-500"
        >
          <Plus className="w-4 h-4" />
          <span>Soạn Bài Viết Mới (Đang Khóa)</span>
        </button>
      </div>

      {/* Drafts List */}
      <div className="space-y-4">
        {drafts.map(draft => (
          <div
            key={draft.id}
            className="glass-card p-6 rounded-2xl border border-white/10 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-400 font-semibold">{draft.author}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-mono">{draft.createdAt}</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-white">{draft.title}</h3>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`badge ${draft.status === 'approved' ? 'badge-emerald' : 'badge-amber'}`}>
                  {draft.status === 'approved' ? 'Đã Lên Lịch Đăng' : 'Chờ Phê Duyệt & Lên Lịch'}
                </span>

                {draft.status === 'pending' && (
                  <button
                    onClick={() => alert('🔒 Chức năng Lên Lịch & Giao Chấm Bài đang trong quá trình phát triển!')}
                    className="btn-primary text-xs px-4 py-1.5 shadow-amber-600/30 bg-amber-600 border-amber-500 opacity-80 hover:opacity-100"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Lên Lịch (Đang Khóa)</span>
                  </button>
                )}
                
                {draft.status === 'approved' && draft.gradingStatus === 'pending' && (
                  <button
                    onClick={() => alert('🔒 Chức năng Chấm Điểm Bài Đăng đang trong quá trình phát triển!')}
                    className="btn-primary text-xs px-4 py-1.5 shadow-amber-600/30 bg-amber-600 border-amber-500 opacity-80 hover:opacity-100"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Hoàn Thành Chấm Điểm (Đang Khóa)</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 whitespace-pre-line text-xs text-slate-300 font-sans leading-relaxed">
              {draft.content}
            </div>
          </div>
        ))}
      </div>

      {/* New Draft Modal */}
      {isNewDraftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up">
          <div className="relative w-full max-w-xl bg-slate-900 border border-blue-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-heading font-bold text-lg text-white">Soạn Bài Viết Nháp Mới</h3>
              <button onClick={() => setIsNewDraftModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewDraft} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tiêu đề bài viết / Phim ngắn *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="[RECAP] LỄ KHAI GIẢNG NĂM HỌC MỚI..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nội dung bài đăng Fanpage *</label>
                <textarea
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Soạn thảo nội dung bài đăng Fanpage tại đây..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewDraftModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-6 py-2"
                >
                  Gửi Bài Chờ BCN Duyệt
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Schedule Draft Modal */}
      {draftToSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up">
          <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-heading font-bold text-lg text-emerald-400">Lên Lịch Đăng Bài</h3>
              <button onClick={() => setDraftToSchedule(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!scheduleForm.publishDate || !scheduleForm.graderId) {
                alert('Vui lòng nhập ngày giờ đăng và chọn người chấm bài!');
                return;
              }
              approveDraft(draftToSchedule, scheduleForm.publishDate, scheduleForm.graderId);
              setDraftToSchedule(null);
              setScheduleForm({ publishDate: '', graderId: '' });
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ngày Giờ Đăng Thực Tế</label>
                <input 
                  type="datetime-local" 
                  required
                  value={scheduleForm.publishDate}
                  onChange={e => setScheduleForm({...scheduleForm, publishDate: e.target.value})}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Giao nhiệm vụ chấm tương tác</label>
                <select 
                  required
                  value={scheduleForm.graderId}
                  onChange={e => setScheduleForm({...scheduleForm, graderId: e.target.value})}
                  className="input-field w-full"
                >
                  <option value="">-- Chọn thành viên phụ trách --</option>
                  {members.filter(m => {
                    const isSystemAdmin = m.roleTitle?.includes('Super Admin') || m.role === 'admin' || m.memberCode === 'ADMIN' || m.name?.includes('Quản Trị Viên') || m.name?.includes('Super Admin');
                    return !isSystemAdmin && m.status !== 'Suspended';
                  }).map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.deptName})</option>
                  ))}
                </select>
                <p className="text-[10px] text-amber-400 mt-2">
                  * Hệ thống sẽ tự động đếm ngược 24 tiếng sau khi bài đăng lên. Nếu người phụ trách không hoàn thành chấm điểm sẽ bị tự động phạt -5 điểm.
                </p>
              </div>
              
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setDraftToSchedule(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                  Hủy
                </button>
                <button type="submit" className="btn-primary text-xs px-6 py-2">
                  Xác Nhận Đăng & Giao Việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
