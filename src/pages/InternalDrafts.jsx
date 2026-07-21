import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { FileText, CheckCircle, Plus, Clock, User, X, Share2, Sparkles } from 'lucide-react';

export const InternalDrafts = () => {
  const { 
    drafts, 
    approveDraft, 
    addDraft, 
    isNewDraftModalOpen, 
    setIsNewDraftModalOpen,
    currentUser 
  } = useClub();

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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-amber">Content Studio VMC</span>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
            Kho Kịch Bản & <span className="gradient-text">Duyệt Bài Fanpage</span>
          </h1>
          <p className="text-xs text-slate-400">
            Khu vực biên tập kịch bản video, bài viết truyền thông THPT Vĩnh Bảo trước khi duyệt đăng chính thức.
          </p>
        </div>

        <button
          onClick={() => setIsNewDraftModalOpen(true)}
          className="btn-primary text-xs px-5 py-2.5 shadow-blue-600/40"
        >
          <Plus className="w-4 h-4" />
          <span>Soạn Bài Viết Mới</span>
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
                  {draft.status === 'approved' ? 'Đã Duyệt Đăng Fanpage' : 'Chờ Ban Chủ Nhiệm Duyệt'}
                </span>

                {draft.status === 'pending' && (currentUser.role === 'admin' || currentUser.role === 'lead') && (
                  <button
                    onClick={() => approveDraft(draft.id)}
                    className="btn-primary text-xs px-4 py-1.5 shadow-emerald-600/30"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Duyệt Bài</span>
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

    </div>
  );
};
