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

  // Find summary entry for this candidate if available (matching by ID, interview_code, or full_name)
  const summary = scoresSummary.find(s => 
    String(s.candidate_id).trim() === String(candidate.id).trim() || 
    String(s.candidate_id).trim() === String(candidate.interview_code || '').trim() ||
    String(s.interview_code || '').trim() === String(candidate.interview_code || '').trim() ||
    String(s.interview_code || '').trim() === String(candidate.id).trim() ||
    (s.full_name && candidate.full_name && String(s.full_name).trim().toLowerCase() === String(candidate.full_name).trim().toLowerCase())
  ) || {};

  const rScores = summary.round_scores || candidate.round_scores || {};

  const comments = summary.comments || candidate.comments || [];
  const submittedScorersMap = summary.submitted_scorers || candidate.submitted_scorers || {};
  const activeRound = currentSeason?.active_round || 'don';
  const isRound1Closed = activeRound !== 'don' || currentSeason?.status === 'closed' || currentSeason?.status === 'completed';

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

  const interviewers = getMemberNames(candidate.interviewer_ids || summary.interviewer_ids);
  const teamworkScorers = getMemberNames(candidate.teamwork_scorer_ids || summary.teamwork_scorer_ids);
  const challengeProcessScorers = getMemberNames(candidate.challenge_process_scorer_ids || summary.challenge_process_scorer_ids);
  const challengeResultScorers = getMemberNames(candidate.challenge_result_scorer_ids || summary.challenge_result_scorer_ids);

  // Helper function to check if round is fully graded by ALL assigned scorers
  const checkRoundCompletion = (rawAssignedIds, roundKey, minRoundStage) => {
    let assigned = [];
    if (Array.isArray(rawAssignedIds)) assigned = rawAssignedIds;
    else {
      try { assigned = JSON.parse(rawAssignedIds); } catch (e) { assigned = []; }
    }
    const submitted = (submittedScorersMap[roundKey] || []).map(String);

    if (assigned.length > 0) {
      const allDone = assigned.every(id => submitted.includes(String(id)));
      if (allDone) {
        return { isDone: true, statusText: 'Đã chấm', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      } else if (submitted.length > 0) {
        return { isDone: false, statusText: `Đang chấm (${submitted.length}/${assigned.length})`, badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' };
      } else {
        const roundOrder = { don: 1, phongvan: 2, thuthach: 3, thuthach_quatrinh: 3, thuthach_ketqua: 3, teamwork: 4, all: 5 };
        const currentOrder = roundOrder[activeRound] || 1;
        const minOrder = roundOrder[minRoundStage] || 1;
        if (currentOrder >= minOrder) {
          return { isDone: false, statusText: 'Đang chấm', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
        }
        return { isDone: false, statusText: 'Chưa mở', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' };
      }
    }

    // Fallback if no specific assigned list
    const hasScore = rScores[roundKey] !== undefined || submitted.length > 0;
    if (hasScore) {
      return { isDone: true, statusText: 'Đã chấm', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }

    // If active round has reached or passed this round stage
    const roundOrder = { don: 1, phongvan: 2, thuthach: 3, thuthach_quatrinh: 3, thuthach_ketqua: 3, teamwork: 4, all: 5 };
    const currentOrder = roundOrder[activeRound] || 1;
    const minOrder = roundOrder[minRoundStage] || 1;

    if (currentOrder >= minOrder) {
      return { isDone: false, statusText: 'Đang chấm', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }

    return { isDone: false, statusText: 'Chưa mở', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' };
  };

  // Vòng 1 (Bài Đơn): Đã chấm if score exists or round 1 closed
  const v1Status = (() => {
    const hasScore = rScores.don !== undefined || summary.total_score > 0 || summary.avg_score > 0;
    if (isRound1Closed || hasScore) {
      return { isDone: true, statusText: 'Đã chấm', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
    return { isDone: false, statusText: 'Đang chấm', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30 animate-pulse' };
  })();

  // Vòng 2 (Phỏng Vấn)
  const v2Assigned = candidate.interviewer_ids || summary.interviewer_ids || [];
  const v2Status = checkRoundCompletion(v2Assigned, 'phongvan', 'phongvan');

  // Vòng 3 (Thử Thách)
  const v3ProcessAssigned = candidate.challenge_process_scorer_ids || summary.challenge_process_scorer_ids || [];
  const v3ResultAssigned = candidate.challenge_result_scorer_ids || summary.challenge_result_scorer_ids || [];
  const v3ProcessStatus = checkRoundCompletion(v3ProcessAssigned, 'thuthach_quatrinh', 'thuthach');
  const v3ResultStatus = checkRoundCompletion(v3ResultAssigned, 'thuthach_ketqua', 'thuthach');
  const isV3Done = v3ProcessStatus.isDone && v3ResultStatus.isDone;
  const isV3InProgress = !isV3Done && (v3ProcessStatus.statusText.includes('Đang chấm') || v3ResultStatus.statusText.includes('Đang chấm') || activeRound.includes('thuthach'));
  const v3Status = {
    isDone: isV3Done,
    statusText: isV3Done ? 'Đã chấm' : (isV3InProgress ? 'Đang chấm' : 'Chưa mở'),
    badgeClass: isV3Done ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : (isV3InProgress ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400')
  };

  // Vòng 4 (Teamwork)
  const v4Assigned = candidate.teamwork_scorer_ids || summary.teamwork_scorer_ids || [];
  const v4Status = checkRoundCompletion(v4Assigned, 'teamwork', 'teamwork');



  // Determine overall status
  const currentStatus = candidate.status || summary.result_status || 'pending';
  
  const getStatusBadge = () => {
    if (currentStatus === 'passed') return { text: '🎉 Đã Trúng Tuyển', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (currentStatus === 'failed') return { text: '❌ Không Trúng Tuyển', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    if (currentStatus === 'reserve') return { text: '⏳ Dự Bị Tuyển Sinh', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    const allRoundsDone = v1Status.isDone && v2Status.isDone && v3Status.isDone && v4Status.isDone;
    if (currentStatus === 'scored' || allRoundsDone) return { text: '📝 Đã Chấm Điểm', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
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
              <span className={`ds-badge text-xs font-mono font-bold ${v1Status.badgeClass}`}>
                {rScores.don !== undefined ? `${rScores.don} điểm` : v1Status.statusText}
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
              <span className={`ds-badge text-xs font-mono font-bold ${v2Status.badgeClass}`}>
                {rScores.phongvan !== undefined ? `${rScores.phongvan} điểm` : v2Status.statusText}
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
                {rScores.thuthach !== undefined && (
                  <span className="ds-badge text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                    Tổng V3: {rScores.thuthach}đ
                  </span>
                )}
                <span className={`ds-badge text-xs font-mono font-bold ${v3Status.badgeClass}`}>
                  {v3Status.statusText}
                </span>
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
              <span className={`ds-badge text-xs font-mono font-bold ${v4Status.badgeClass}`}>
                {rScores.teamwork !== undefined ? `${rScores.teamwork} điểm` : v4Status.statusText}
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
              <span className="text-2xl font-black font-mono text-cyan-300">
                {(() => {
                  const don = rScores.don !== undefined ? parseFloat(rScores.don) : undefined;
                  const pv = rScores.phongvan !== undefined ? parseFloat(rScores.phongvan) : undefined;
                  const tw = rScores.teamwork !== undefined ? parseFloat(rScores.teamwork) : undefined;

                  const proc = rScores.thuthach_quatrinh !== undefined ? parseFloat(rScores.thuthach_quatrinh) : undefined;
                  const res = rScores.thuthach_ketqua !== undefined ? parseFloat(rScores.thuthach_ketqua) : undefined;

                  let tt = rScores.thuthach !== undefined ? parseFloat(rScores.thuthach) : undefined;
                  if (proc !== undefined && res !== undefined) {
                    tt = parseFloat(((2/3) * proc + (1/3) * res).toFixed(2));
                  } else if (proc !== undefined) tt = proc;
                  else if (res !== undefined) tt = res;

                  const roundHeads = [don, pv, tt, tw].filter(v => v !== undefined && !isNaN(v));
                  if (roundHeads.length > 0) {
                    return parseFloat(roundHeads.reduce((a, b) => a + b, 0).toFixed(2));
                  }
                  if (summary.total_score !== undefined && summary.total_score > 0) return summary.total_score;
                  if (candidate.total_score) return candidate.total_score;
                  return 0;
                })()} PTS
              </span>
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
