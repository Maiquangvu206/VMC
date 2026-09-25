import React from 'react';
import { 
  X, CheckCircle2, Clock, AlertCircle, Award, Star, FileText, 
  Users, Zap, Sparkles
} from 'lucide-react';

export const CandidateProgressModal = ({ 
  show, 
  onClose, 
  candidate, 
  currentSeason, 
  scoresSummary = [], 
  members = [] 
}) => {
  if (!show || !candidate) return null;

  // Find summary entry for this candidate if available
  const summary = scoresSummary.find(s => String(s.candidate_id) === String(candidate.id) || String(s.interview_code) === String(candidate.interview_code)) || {};
  const rScores = summary.round_scores || candidate.round_scores || {};
  const comments = summary.comments || candidate.comments || [];

  // Helper to resolve member names by ID
  const getMemberNames = (idsVal) => {
    if (!idsVal) return [];
    let ids = [];
    if (Array.isArray(idsVal)) ids = idsVal;
    else {
      try { ids = JSON.parse(idsVal); } catch (e) { ids = []; }
    }
    return ids.map(id => {
      const m = members.find(mem => String(mem.id) === String(id) || String(mem.memberCode) === String(id));
      return m ? `${m.name} (${m.roleTitle || 'Thành viên'})` : id;
    });
  };

  const interviewers = getMemberNames(candidate.interviewer_ids);
  const teamworkScorers = getMemberNames(candidate.teamwork_scorer_ids);
  const challengeProcessScorers = getMemberNames(candidate.challenge_process_scorer_ids);
  const challengeResultScorers = getMemberNames(candidate.challenge_result_scorer_ids);

  // Define recruitment steps
  const steps = [
    {
      key: 'don',
      stepNum: 1,
      title: 'Vòng 1: Đơn Đăng Ký',
      icon: FileText,
      score: rScores.don,
      isCompleted: rScores.don !== undefined,
      comments: comments.filter(c => c.round_type === 'don'),
      scorers: []
    },
    {
      key: 'phongvan',
      stepNum: 2,
      title: 'Vòng 2: Phỏng Vấn',
      icon: Users,
      score: rScores.phongvan,
      isCompleted: rScores.phongvan !== undefined,
      comments: comments.filter(c => c.round_type === 'phongvan'),
      scorers: interviewers
    },
    {
      key: 'thuthach',
      stepNum: 3,
      title: 'Vòng 3: Thử Thách',
      icon: Zap,
      score: rScores.thuthach,
      scoreProcess: rScores.thuthach_quatrinh ?? rScores.thuthach,
      scoreResult: rScores.thuthach_ketqua ?? rScores.thuthach,
      isCompleted: rScores.thuthach_quatrinh !== undefined || rScores.thuthach_ketqua !== undefined || rScores.thuthach !== undefined,
      comments: comments.filter(c => c.round_type === 'thuthach_quatrinh' || c.round_type === 'thuthach_ketqua' || c.round_type === 'thuthach'),
      scorersProcess: challengeProcessScorers,
      scorersResult: challengeResultScorers
    },
    {
      key: 'teamwork',
      stepNum: 4,
      title: 'Vòng 4: Teamwork',
      icon: Sparkles,
      score: rScores.teamwork,
      isCompleted: rScores.teamwork !== undefined,
      comments: comments.filter(c => c.round_type === 'teamwork'),
      scorers: teamworkScorers
    }
  ];

  // Determine overall status
  const currentStatus = candidate.status || summary.result_status || 'pending';
  
  const getStatusBadge = () => {
    if (currentStatus === 'passed') return { text: '🎉 Đã Trúng Tuyển', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (currentStatus === 'failed') return { text: '❌ Không Trúng Tuyển', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    if (currentStatus === 'reserve') return { text: '⏳ Dự Bị Tuyển Sinh', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    if (currentStatus === 'scored') return { text: '📝 Đã Chấm Điểm', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    return { text: '⏳ Đang Đánh Giá', bg: 'bg-slate-700/60 text-slate-300 border-slate-600' };
  };

  const statusBadgeInfo = getStatusBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
      <div className="ds-card p-5 sm:p-7 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#0f172a] border border-[#1f2937] rounded-2xl shadow-2xl space-y-6" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#1f2937] gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`ds-badge px-2.5 py-1 text-xs font-bold border ${statusBadgeInfo.bg}`}>
                {statusBadgeInfo.text}
              </span>
              <span className="ds-badge bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-xs">
                Mã PV: {candidate.interview_code || candidate.id}
              </span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-black text-white mt-2 leading-tight truncate">
              {candidate.full_name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Lớp <span className="text-slate-200 font-medium">{candidate.class_name || 'N/A'}</span> • Ban mong muốn: <span className="text-blue-400 font-semibold">{candidate.desired_dept || 'Tất cả'}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-[#1f2937] transition-colors shrink-0"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontal Timeline Progress Bar */}
        <div className="bg-[#111827] p-4 sm:p-5 rounded-xl border border-slate-800/80 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Tiến Trình Đánh Giá Mùa Tuyển</span>
          </h4>

          <div className="grid grid-cols-4 gap-2 pt-2 relative">
            {steps.map((st, idx) => {
              const isCompleted = st.isCompleted;
              const isCurrent = !isCompleted && (idx === 0 || steps[idx - 1].isCompleted);
              const StepIcon = st.icon;

              return (
                <div key={st.key} className="flex flex-col items-center text-center">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/60 shadow-lg shadow-emerald-950' 
                      : isCurrent 
                      ? 'bg-blue-600/30 text-blue-400 border-2 border-blue-500 animate-pulse shadow-lg shadow-blue-950' 
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] font-semibold mt-2 leading-tight ${
                    isCompleted ? 'text-emerald-300' : isCurrent ? 'text-blue-300 font-bold' : 'text-slate-500'
                  }`}>
                    {st.title.replace('Vòng ', 'V').split(':')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[75px]">
                    {st.score !== undefined ? `${st.score}đ` : (isCompleted ? 'Hoàn thành' : (isCurrent ? 'Đang xét' : 'Chưa mở'))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Rounds Timeline Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Chi Tiết Kết Quả Qua Các Vòng
          </h4>

          {/* Vòng 1: Đơn */}
          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-slate-200 text-sm">Vòng 1: Bài Đơn Đăng Ký</span>
              </div>
              <span className={`ds-badge text-xs font-mono font-bold ${
                rScores.don !== undefined ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {rScores.don !== undefined ? `${rScores.don} điểm` : 'Chưa chấm'}
              </span>
            </div>
            {candidate.desired_dept && (
              <p className="text-xs text-slate-400">Ban đăng ký: <span className="text-slate-200 font-medium">{candidate.desired_dept}</span></p>
            )}
            {comments.filter(c => c.round_type === 'don').map((cmt, i) => (
              <div key={i} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 italic">
                "{cmt.comments}"
              </div>
            ))}
          </div>

          {/* Vòng 2: Phỏng Vấn */}
          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-slate-200 text-sm">Vòng 2: Phỏng Vấn</span>
              </div>
              <span className={`ds-badge text-xs font-mono font-bold ${
                rScores.phongvan !== undefined ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {rScores.phongvan !== undefined ? `${rScores.phongvan} điểm` : 'Chưa chấm'}
              </span>
            </div>
            {interviewers.length > 0 && (
              <div className="text-xs text-slate-400">
                <span className="text-slate-500">Giám khảo PV:</span> {interviewers.join(', ')}
              </div>
            )}
            {comments.filter(c => c.round_type === 'phongvan').map((cmt, i) => (
              <div key={i} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 italic">
                "{cmt.comments}"
              </div>
            ))}
          </div>

          {/* Vòng 3: Thử Thách */}
          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-slate-200 text-sm">Vòng 3: Thử Thách Chuyên Môn</span>
              </div>
              <div className="flex items-center gap-2">
                {rScores.thuthach !== undefined && rScores.thuthach_quatrinh === undefined && (
                  <span className="ds-badge text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Điểm: {rScores.thuthach}đ
                  </span>
                )}
                {rScores.thuthach_quatrinh !== undefined && (
                  <span className="ds-badge text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Quá trình: {rScores.thuthach_quatrinh}đ
                  </span>
                )}
                {rScores.thuthach_ketqua !== undefined && (
                  <span className="ds-badge text-[11px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Kết quả: {rScores.thuthach_ketqua}đ
                  </span>
                )}
                {rScores.thuthach_quatrinh === undefined && rScores.thuthach_ketqua === undefined && rScores.thuthach === undefined && (
                  <span className="ds-badge text-xs font-mono text-slate-400 bg-slate-800">Chưa chấm</span>
                )}
              </div>
            </div>
            {candidate.challenge_topic && (
              <p className="text-xs text-amber-300 font-medium">🎯 Đề bài: {candidate.challenge_topic}</p>
            )}
            {comments.filter(c => c.round_type === 'thuthach_quatrinh' || c.round_type === 'thuthach_ketqua' || c.round_type === 'thuthach').map((cmt, i) => (
              <div key={i} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 italic">
                "{cmt.comments}"
              </div>
            ))}
          </div>

          {/* Vòng 4: Teamwork */}
          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200 text-sm">Vòng 4: Teamwork</span>
              </div>
              <span className={`ds-badge text-xs font-mono font-bold ${
                rScores.teamwork !== undefined ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {rScores.teamwork !== undefined ? `${rScores.teamwork} điểm` : 'Chưa chấm'}
              </span>
            </div>
            {teamworkScorers.length > 0 && (
              <div className="text-xs text-slate-400">
                <span className="text-slate-500">Giám khảo TW:</span> {teamworkScorers.join(', ')}
              </div>
            )}
            {comments.filter(c => c.round_type === 'teamwork').map((cmt, i) => (
              <div key={i} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 italic">
                "{cmt.comments}"
              </div>
            ))}
          </div>

          {/* Tổng Kết */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Tổng điểm tích lũy</span>
              <span className="text-2xl font-black font-mono text-cyan-300">{summary.total_score || candidate.total_score || 0} PTS</span>
            </div>
            {summary.rank && (
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium block">Xếp hạng mùa tuyển</span>
                <span className="text-lg font-bold text-amber-300 font-mono">#{summary.rank}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
