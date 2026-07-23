import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import { FileText, CheckCircle, Plus, Clock, User, X, Share2, Sparkles, ThumbsUp, MessageSquare, Users } from 'lucide-react';

export const InternalDrafts = () => {
  const {
    drafts,
    members,
    approveDraft,
    completeGrading,
    addDraft,
    isNewDraftModalOpen,
    setIsNewDraftModalOpen,
    currentUser,
    showToast
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

  const [gradingDraftId, setGradingDraftId] = useState(null);
  // Per-member grading: { [memberId]: { shared: bool, reacted: bool, commented: bool } }
  const [memberGrades, setMemberGrades] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  // Get active members for grading (exclude system admin)
  const activeMembers = useMemo(() => {
    return members.filter(m => {
      const isSystemAdmin = m.roleTitle?.includes('Super Admin') || m.role === 'admin' || m.memberCode === 'ADMIN' || m.name?.includes('Quản Trị Viên') || m.name?.includes('Super Admin');
      return !isSystemAdmin && m.status !== 'Suspended';
    });
  }, [members]);

  const initMemberGrades = () => {
    const grades = {};
    activeMembers.forEach(m => {
      grades[m.id] = { shared: false, reacted: false, commented: false };
    });
    return grades;
  };

  const openGradingModal = (draftId) => {
    // Check if draft already has member_grades saved, restore them
    const draft = drafts.find(d => d.id === draftId);
    if (draft?.memberGrades && typeof draft.memberGrades === 'object' && Object.keys(draft.memberGrades).length > 0) {
      setMemberGrades(draft.memberGrades);
    } else {
      setMemberGrades(initMemberGrades());
    }
    setGradingDraftId(draftId);
  };

  const toggleMemberCriteria = (memberId, criteria) => {
    setMemberGrades(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [criteria]: !prev[memberId]?.[criteria]
      }
    }));
  };

  const toggleAllForCriteria = (criteria) => {
    const allChecked = activeMembers.every(m => memberGrades[m.id]?.[criteria]);
    setMemberGrades(prev => {
      const next = { ...prev };
      activeMembers.forEach(m => {
        next[m.id] = { ...next[m.id], [criteria]: !allChecked };
      });
      return next;
    });
  };

  const getMemberScore = (memberId) => {
    const g = memberGrades[memberId];
    if (!g) return 0;
    let score = 0;
    score += g.shared ? 1 : -1;
    score += g.reacted ? 1 : -1;
    score += g.commented ? 1 : -1;
    return score;
  };

  const handleSubmitNewDraft = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết!', 'warning');
      return;
    }
    addDraft(formData);
    setIsNewDraftModalOpen(false);
    setFormData({ title: '', content: '' });
  };

  const handleSaveGrading = (e) => {
    e.preventDefault();

    // Calculate per-member scores and build summary
    const memberScores = {};
    let totalPositive = 0;
    let totalNegative = 0;
    activeMembers.forEach(m => {
      const score = getMemberScore(m.id);
      memberScores[m.id] = {
        name: m.name,
        ...memberGrades[m.id],
        score
      };
      if (score > 0) totalPositive += score;
      if (score < 0) totalNegative += Math.abs(score);
    });

    completeGrading(gradingDraftId, {
      memberGrades: memberGrades,
      memberScores: memberScores,
      totalPositive,
      totalNegative,
      finalScore: totalPositive - totalNegative
    });

    setGradingDraftId(null);
    setMemberGrades({});
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
                  {draft.status === 'approved' ? 'Đã Lên Lịch Đăng' : 'Chờ Phê Duyệt & Lên Lịch'}
                </span>

                {draft.status === 'pending' && canApproveDraft && (
                  <button
                    onClick={() => setDraftToSchedule(draft.id)}
                    className="btn-primary text-xs px-4 py-1.5 shadow-emerald-600/30"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Lên Lịch & Giao Chấm Bài</span>
                  </button>
                )}

                {draft.status === 'approved' && draft.gradingStatus === 'pending' && (draft.graderId === currentUser.id || canApproveDraft) && (
                  <button
                    onClick={() => setGradingDraftId(draft.id)}
                    className="btn-primary text-xs px-4 py-1.5 shadow-blue-600/30 flex items-center gap-1.5 animate-pulse"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Tiến Hành Chấm Điểm</span>
                  </button>
                )}

                {draft.status === 'approved' && draft.gradingStatus === 'completed' && (
                  <div className="text-right text-xs bg-slate-950/40 p-2.5 rounded-xl border border-white/5 space-y-1">
                    <div className="font-semibold text-emerald-400">📊 Đã Chấm Điểm: {draft.finalScore || 0}/100</div>
                    <div className="text-[10px] text-slate-400 grid grid-cols-2 gap-x-2 gap-y-0.5">
                      <span>• Thích: {draft.likesCount || 0}</span>
                      <span>• Chia sẻ: {draft.sharesCount || 0}</span>
                      <span>• Bình luận: {draft.commentsCount || 0}</span>
                      <span>• Nội dung: {draft.contentScore || 0}/20</span>
                    </div>
                  </div>
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
                  Gửi Bài Chờ Duyệt
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
                showToast('Vui lòng nhập ngày giờ đăng và chọn người chấm bài!', 'warning');
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
                  onChange={e => setScheduleForm({ ...scheduleForm, publishDate: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Giao nhiệm vụ chấm tương tác</label>
                <select
                  required
                  value={scheduleForm.graderId}
                  onChange={e => setScheduleForm({ ...scheduleForm, graderId: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">-- Chọn thành viên Ban Đối Ngoại - Nhân Sự --</option>
                  {members.filter(m => {
                    const isSystemAdmin = m.roleTitle?.includes('Super Admin') || m.role === 'admin' || m.memberCode === 'ADMIN';
                    const dept = (m.deptName || m.department || '').toLowerCase();
                    const isHRExternal = dept.includes('đối ngoại') || dept.includes('nhân sự') || dept.includes('đn-ns') || dept.includes('dn-ns') || dept.includes('hr_external');
                    return !isSystemAdmin && isHRExternal && m.status !== 'Suspended';
                  }).map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.roleTitle || 'Thành Viên'})</option>
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

      {/* Grading Modal - Per Member Checklist (+1/-1) */}
      {gradingDraftId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-blue-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-white/10 pb-3 shrink-0">
              <div>
                <h3 className="font-heading font-bold text-lg text-blue-400 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-400" /> Chấm Điểm Tương Tác Từng Thành Viên
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Tích chọn các tiêu chí tương tác bài viết cho mỗi thành viên trong CLB.</p>
              </div>
              <button onClick={() => setGradingDraftId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Criteria Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-white/5 text-[11px] text-slate-300 shrink-0">
              <div className="space-y-1">
                <div className="font-bold text-emerald-400">➕ Điểm Cộng (+1đ mỗi mục):</div>
                <div>• +1đ: Share bài viết mới trên page</div>
                <div>• +1đ: Thả cảm xúc bài viết mới trên page</div>
                <div>• +1đ: Tối thiểu 3 comment bài viết mới trên page</div>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-rose-400">➖ Điểm Trừ (-1đ nếu không đạt):</div>
                <div>• -1đ: Không share bài viết / share kín</div>
                <div>• -1đ: Không reaction bài viết mới</div>
                <div>• -1đ: Không comment đủ số lượng (dưới 3)</div>
              </div>
            </div>

            {/* Batch Controls */}
            <div className="flex items-center justify-between gap-2 py-1 border-b border-white/10 text-xs shrink-0">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" /> Danh Sách Thành Viên ({activeMembers.length})
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleAllForCriteria('shared')}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[10px] font-bold border border-blue-500/30"
                >
                  <Share2 className="w-3 h-3 inline mr-1" /> Chọn tất cả Share
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllForCriteria('reacted')}
                  className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 text-[10px] font-bold border border-pink-500/30"
                >
                  <ThumbsUp className="w-3 h-3 inline mr-1" /> Chọn tất cả Thích
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllForCriteria('commented')}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-[10px] font-bold border border-purple-500/30"
                >
                  <MessageSquare className="w-3 h-3 inline mr-1" /> Chọn tất cả 3 Cmt
                </button>
              </div>
            </div>

            {/* Member List */}
            <form onSubmit={handleSaveGrading} className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {activeMembers.map(m => {
                const g = memberGrades[m.id] || { shared: false, reacted: false, commented: false };
                const score = getMemberScore(m.id);
                return (
                  <div key={m.id} className="p-3 bg-slate-950 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/30">
                        {m.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.deptName || m.department || 'Ban Chuyên Môn'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={Boolean(g.shared)}
                          onChange={() => toggleMemberCriteria(m.id, 'shared')}
                          className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-0"
                        />
                        <span>Share (+1/ -1)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={Boolean(g.reacted)}
                          onChange={() => toggleMemberCriteria(m.id, 'reacted')}
                          className="rounded border-slate-700 bg-slate-900 text-pink-500 focus:ring-0"
                        />
                        <span>Thả tim (+1/ -1)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={Boolean(g.commented)}
                          onChange={() => toggleMemberCriteria(m.id, 'commented')}
                          className="rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-0"
                        />
                        <span>≥ 3 Cmt (+1/ -1)</span>
                      </label>

                      <div className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md min-w-[50px] text-center ${
                        score > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                        score < 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {score > 0 ? `+${score}đ` : `${score}đ`}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2 shrink-0">
                <button type="button" onClick={() => setGradingDraftId(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                  Hủy
                </button>
                <button type="submit" className="btn-primary text-xs px-6 py-2 shadow-emerald-600/30">
                  Hoàn Thành Chấm Điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
