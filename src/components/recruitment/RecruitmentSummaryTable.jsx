import React from 'react';
import { ChevronRight } from 'lucide-react';

export const RecruitmentSummaryTable = ({
  currentSeason,
  candidates = [],
  scoresSummary = [],
  fetchCandidates,
  fetchScoresSummary,
  getCandidateStageInfo,
  setProgressCandidate,
  setShowProgressModal
}) => {
  if (!currentSeason) return null;

  const scoringTypes = (() => {
    if (!currentSeason.scoring_type) return [];
    const raw = currentSeason.scoring_type;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
      return [raw];
    }
    return [];
  })();

  const hasDon = scoringTypes.includes('don') || scoresSummary.some(s => s.round_scores?.don !== undefined);
  const hasPv = scoringTypes.includes('phongvan') || scoresSummary.some(s => s.round_scores?.phongvan !== undefined);
  const hasTw = scoringTypes.includes('teamwork') || scoresSummary.some(s => s.round_scores?.teamwork !== undefined);
  const hasTtThuthach = scoringTypes.includes('thuthach_quatrinh') || scoringTypes.includes('thuthach_ketqua') || scoringTypes.includes('thuthach') || scoresSummary.some(s => s.round_scores?.thuthach_quatrinh !== undefined || s.round_scores?.thuthach_ketqua !== undefined || s.round_scores?.thuthach !== undefined);

  // Build summary list: use scoresSummary if available, else fallback to candidates list
  let summaryList = [];
  if (Array.isArray(candidates) && candidates.length > 0) {
    summaryList = candidates.map((c, idx) => {
      const matchSummary = (scoresSummary || []).find(s =>
        String(s.candidate_id).trim() === String(c.id).trim() ||
        String(s.candidate_id).trim() === String(c.interview_code || '').trim() ||
        String(s.interview_code || '').trim() === String(c.interview_code || '').trim() ||
        String(s.interview_code || '').trim() === String(c.id).trim() ||
        (s.full_name && c.full_name && String(s.full_name).trim().toLowerCase() === String(c.full_name).trim().toLowerCase())
      );
      if (matchSummary) {
        return {
          ...c,
          ...matchSummary,
          candidate_id: c.id,
          interview_code: c.interview_code || matchSummary.interview_code || c.id,
          full_name: c.full_name || matchSummary.full_name,
          class_name: c.class_name || matchSummary.class_name,
          desired_dept: c.desired_dept || matchSummary.desired_dept || currentSeason.department || 'N/A'
        };
      }
      return {
        candidate_id: c.id,
        interview_code: c.interview_code || c.id,
        full_name: c.full_name,
        class_name: c.class_name,
        desired_dept: c.desired_dept || currentSeason.department || 'N/A',
        status: c.status || 'pending',
        notes: c.notes || '',
        comments: [],
        round_scores: {},
        avg_score: 0,
        total_score: 0,
        result_status: c.status || 'pending',
        rank: idx + 1
      };
    });
    summaryList.sort((a, b) => b.total_score - a.total_score || b.avg_score - a.avg_score || (a.interview_code || '').localeCompare(b.interview_code || '', undefined, { numeric: true, sensitivity: 'base' }));
    summaryList.forEach((item, idx) => { item.rank = idx + 1; });
  } else if (Array.isArray(scoresSummary) && scoresSummary.length > 0) {
    summaryList = scoresSummary;
  }

  return (
    <div className="space-y-4">
      <div className="ds-card p-5 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0f172a] border border-slate-800 rounded-2xl">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-xl font-bold text-white">Bảng Tổng Hợp Kết Quả - {currentSeason.name}</h2>
            </div>
          </div>
          <button
            onClick={() => {
              if (currentSeason?.id) {
                if (fetchCandidates) fetchCandidates(currentSeason.id);
                if (fetchScoresSummary) fetchScoresSummary(currentSeason.id);
              }
            }}
            className="ds-btn ds-btn-secondary text-xs flex items-center gap-2"
          >
            <span>🔄 Cập Nhật Kết Quả</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
            <div className="text-slate-400 text-[11px]">👥 Tổng Ứng Viên</div>
            <div className="text-lg font-bold text-white mt-0.5">{summaryList.length}</div>
          </div>
          <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/50 text-center">
            <div className="text-emerald-400 text-[11px] font-medium">🟢 Đã Có Điểm</div>
            <div className="text-lg font-bold text-emerald-300 mt-0.5">
              {summaryList.filter(item => (item.total_score && item.total_score > 0) || (item.avg_score && item.avg_score > 0) || Object.keys(item.round_scores || {}).length > 0).length}
            </div>
          </div>
          <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/50 text-center">
            <div className="text-amber-400 text-[11px] font-medium">⚪ Chưa Có Điểm</div>
            <div className="text-lg font-bold text-amber-300 mt-0.5">
              {summaryList.length - summaryList.filter(item => (item.total_score && item.total_score > 0) || (item.avg_score && item.avg_score > 0) || Object.keys(item.round_scores || {}).length > 0).length}
            </div>
          </div>
        </div>
      </div>

      <div className="ds-card overflow-x-auto">
        <table className="ds-table w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-3">Xếp Hạng</th>
              <th className="py-3 px-3">Mã PV</th>
              <th className="py-3 px-3">Họ Tên</th>
              <th className="py-3 px-3">Lớp</th>
              <th className="py-3 px-3">Ban Mong Muốn</th>
              {hasDon && <th className="py-3 px-3 text-center">📝 TB Đơn</th>}
              {hasPv && <th className="py-3 px-3 text-center">🎙️ TB PV</th>}
              {hasTw && <th className="py-3 px-3 text-center">👥 TB TW</th>}
              {hasTtThuthach && <th className="py-3 px-3 text-center text-amber-300">⚡ TB Thử Thách</th>}
              <th className="py-3 px-3 text-center">Tổng Điểm</th>
              <th className="py-3 px-3 text-center">Kết Quả</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {summaryList.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-slate-500 italic">
                  Chưa có ứng viên nào trong mùa tuyển sinh này.
                </td>
              </tr>
            ) : (
              summaryList.map((s, idx) => {
                const code = s.interview_code || s.candidate_code || (candidates.find(c => String(c.id) === String(s.candidate_id))?.interview_code) || s.candidate_id;
                const rScores = s.round_scores || {};

                const donScore = (rScores.don !== undefined && rScores.don !== null) ? parseFloat(rScores.don) : undefined;
                const pvScore = (rScores.phongvan !== undefined && rScores.phongvan !== null) ? parseFloat(rScores.phongvan) : undefined;
                const twScore = (rScores.teamwork !== undefined && rScores.teamwork !== null) ? parseFloat(rScores.teamwork) : undefined;

                const ttProcScore = (rScores.thuthach_quatrinh !== undefined && rScores.thuthach_quatrinh !== null)
                  ? parseFloat(rScores.thuthach_quatrinh)
                  : ((rScores.thuthach !== undefined && rScores.thuthach !== null) ? parseFloat(rScores.thuthach) : undefined);
                const ttResScore = (rScores.thuthach_ketqua !== undefined && rScores.thuthach_ketqua !== null) ? parseFloat(rScores.thuthach_ketqua) : undefined;

                let ttThuthachScore = undefined;
                if (ttProcScore !== undefined && ttResScore !== undefined) {
                  ttThuthachScore = parseFloat(((2 / 3) * ttProcScore + (1 / 3) * ttResScore).toFixed(2));
                } else if (ttProcScore !== undefined) {
                  ttThuthachScore = ttProcScore;
                } else if (ttResScore !== undefined) {
                  ttThuthachScore = ttResScore;
                }

                const validScores = [donScore, pvScore, ttThuthachScore, twScore].filter(v => v !== undefined && !isNaN(v));
                const displayTotal = (s.total_score !== undefined && s.total_score > 0)
                  ? s.total_score
                  : (validScores.length > 0 ? parseFloat(validScores.reduce((a, b) => a + b, 0).toFixed(2)) : 0);

                const getRankBadge = (rank) => {
                  if (rank === 1) return <span className="ds-badge bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold px-2 py-0.5">🥇 #1</span>;
                  if (rank === 2) return <span className="ds-badge bg-slate-300/20 text-slate-200 border border-slate-400/40 font-bold px-2 py-0.5">🥈 #2</span>;
                  if (rank === 3) return <span className="ds-badge bg-amber-700/20 text-amber-500 border border-amber-700/40 font-bold px-2 py-0.5">🥉 #3</span>;
                  return <span className="font-mono text-slate-400 font-semibold px-2">#{rank}</span>;
                };

                return (
                  <React.Fragment key={s.candidate_id}>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">{getRankBadge(s.rank || idx + 1)}</td>
                      <td className="py-3 px-3">
                        <span className="ds-badge ds-badge-cyan font-mono font-bold text-xs py-1 px-2">
                          {code}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-100">{s.full_name}</td>
                      <td className="py-3 px-3 text-slate-300">{s.class_name}</td>
                      <td className="py-3 px-3 text-slate-300">{s.desired_dept}</td>
                      {hasDon && (
                        <td className="py-3 px-3 text-center font-mono text-slate-200">
                          {donScore !== undefined ? donScore : <span className="text-slate-600">-</span>}
                        </td>
                      )}
                      {hasPv && (
                        <td className="py-3 px-3 text-center font-mono text-blue-300">
                          {pvScore !== undefined ? pvScore : <span className="text-slate-600">-</span>}
                        </td>
                      )}
                      {hasTw && (
                        <td className="py-3 px-3 text-center font-mono text-emerald-300">
                          {twScore !== undefined ? twScore : <span className="text-slate-600">-</span>}
                        </td>
                      )}
                      {hasTtThuthach && (
                        <td className="py-3 px-3 text-center font-mono text-amber-300">
                          {ttThuthachScore !== undefined ? ttThuthachScore : <span className="text-slate-600">-</span>}
                        </td>
                      )}
                      <td className="py-3 px-3 text-center font-bold text-white font-mono text-sm">
                        {displayTotal}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {(() => {
                          const candObj = candidates.find(cand => String(cand.id) === String(s.candidate_id)) || s;
                          const stage = getCandidateStageInfo ? getCandidateStageInfo(candObj) : { badgeClass: 'bg-slate-800 text-slate-300', label: candObj.status };
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (setProgressCandidate) setProgressCandidate(candObj);
                                if (setShowProgressModal) setShowProgressModal(true);
                              }}
                              className={`ds-badge text-[11px] font-semibold px-2 py-0.5 border rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer hover:scale-105 mx-auto ${stage.badgeClass}`}
                              title="Nhấn vào đây để xem chi tiết tiến trình đánh giá của ứng viên"
                            >
                              <span>{stage.label}</span>
                              <ChevronRight className="w-3 h-3 opacity-70" />
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                    {s.comments && s.comments.length > 0 && (
                      <tr className="bg-slate-900/60 border-b border-slate-800/80">
                        <td colSpan={12} className="py-2.5 px-4 text-xs">
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                              💬 Nhận xét theo vòng ({s.comments.length}):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {s.comments.map((cmt, cIdx) => (
                                <div key={cIdx} className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-1">
                                  <div className="flex items-center text-[10px] text-slate-400 mb-1">
                                    <span className="ds-badge ds-badge-secondary py-0.5 px-2 text-[9.5px] uppercase font-semibold">
                                      {cmt.round_type === 'don' ? '📝 Vòng Đơn' : cmt.round_type === 'phongvan' ? '🎙️ Vòng Phỏng Vấn' : cmt.round_type === 'teamwork' ? '👥 Vòng Teamwork' : cmt.round_type === 'thuthach_quatrinh' ? '⚡ Thử Thách Quá Trình' : '🏆 Thử Thách Kết Quả'}
                                    </span>
                                  </div>
                                  <p className="text-slate-300 italic">"{cmt.comments}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
