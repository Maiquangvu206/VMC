import React, { useState, useEffect } from 'react';
import { useClub } from '../context/ClubContext';
import {
  UserPlus, ToggleLeft, ToggleRight, Plus, Edit, Trash2, Users, 
  CheckCircle, XCircle, Clock, Award, Search, Filter, Save, ChevronDown,
  Star, FileText, Calendar, GraduationCap, Briefcase, AlertCircle
} from 'lucide-react';

export const InternalRecruitment = () => {
  const { 
    currentUser, isAdmin, isHRHead, isSuperAdmin, isRecruitmentSeasonActive, toggleRecruitmentSeason, 
    members, showToast 
  } = useClub();

  const [activeTab, setActiveTab] = useState('seasons');
  const [seasons, setSeasons] = useState([]);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [scoresSummary, setScoresSummary] = useState([]);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [submittedCandidates, setSubmittedCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [seasonForm, setSeasonForm] = useState({ name: '', quota: 0 });
  const [criteriaForm, setCriteriaForm] = useState({ criteria_name: '', max_score: 10, sort_order: 0 });
  const [candidateForm, setCandidateForm] = useState({
    full_name: '', class_name: '', phone: '', email: '', desired_dept: '', notes: ''
  });
  const [scoringData, setScoringData] = useState({});

  // Fetch data
  useEffect(() => {
    if (isAdmin || isHRHead) {
      fetchSeasons();
    }
  }, [isAdmin, isHRHead]);

  useEffect(() => {
    if (currentSeason) {
      fetchCriteria(currentSeason.id);
      fetchCandidates(currentSeason.id);
      if (isAdmin || isHRHead) {
        fetchScoresSummary(currentSeason.id);
      }
      if (!isAdmin && !isHRHead) {
        fetchSubmittedCandidates(currentSeason.id);
      }
    }
  }, [currentSeason, isAdmin, isHRHead]);

  const fetchSeasons = async () => {
    try {
      const res = await fetch('/api/recruitment/seasons', { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const data = await res.json();
      if (data.success) {
        setSeasons(data.data);
        const active = data.data.find(s => s.is_active === 1);
        if (active) setCurrentSeason(active);
      }
    } catch (e) {
      console.error('Error fetching seasons:', e);
    }
  };

  const fetchCriteria = async (seasonId) => {
    try {
      const res = await fetch(`/api/recruitment/criteria/${seasonId}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const data = await res.json();
      if (data.success) setCriteria(data.data);
    } catch (e) {
      console.error('Error fetching criteria:', e);
    }
  };

  const fetchCandidates = async (seasonId) => {
    try {
      const interviewerParam = !isAdmin && !isHRHead ? `?interviewer_id=${currentUser.id}` : '';
      const res = await fetch(`/api/recruitment/candidates/${seasonId}${interviewerParam}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const data = await res.json();
      if (data.success) setCandidates(data.data);
    } catch (e) {
      console.error('Error fetching candidates:', e);
    }
  };

  const fetchScoresSummary = async (seasonId) => {
    try {
      const res = await fetch(`/api/recruitment/scores/summary/${seasonId}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const data = await res.json();
      if (data.success) setScoresSummary(data.data);
    } catch (e) {
      console.error('Error fetching scores summary:', e);
    }
  };

  const fetchSubmittedCandidates = async (seasonId) => {
    try {
      const res = await fetch(`/api/recruitment/scores/submitted?season_id=${seasonId}&interviewer_id=${currentUser.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const data = await res.json();
      if (data.success) setSubmittedCandidates(data.data);
    } catch (e) {
      console.error('Error fetching submitted candidates:', e);
    }
  };

  // Season operations
  const createSeason = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recruitment/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ ...seasonForm, created_by: currentUser.id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Đã tạo mùa tuyển mới!', 'success');
        setShowSeasonModal(false);
        setSeasonForm({ name: '', quota: 0 });
        fetchSeasons();
      } else {
        showToast('❌ Lỗi tạo mùa tuyển!', 'error');
      }
    } catch (e) {
      showToast('❌ Lỗi kết nối server!', 'error');
    }
    setLoading(false);
  };

  const activateSeason = async (seasonId) => {
    try {
      const res = await fetch(`/api/recruitment/seasons/${seasonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ is_active: true })
      });
      if (res.ok) {
        showToast('✅ Đã kích hoạt mùa tuyển!', 'success');
        fetchSeasons();
      }
    } catch (e) {
      showToast('❌ Lỗi kích hoạt mùa tuyển!', 'error');
    }
  };

  const assignInterviewers = async (seasonId, interviewerIds) => {
    try {
      const res = await fetch(`/api/recruitment/seasons/${seasonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ interviewer_ids: interviewerIds })
      });
      if (res.ok) {
        showToast('✅ Đã phân công Interviewer!', 'success');
        fetchSeasons();
      }
    } catch (e) {
      showToast('❌ Lỗi phân công Interviewer!', 'error');
    }
  };

  // Criteria operations
  const createCriteria = async () => {
    if (!currentSeason) return;
    setLoading(true);
    try {
      const res = await fetch('/api/recruitment/criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ ...criteriaForm, season_id: currentSeason.id, sort_order: criteria.length })
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Đã thêm tiêu chí chấm điểm!', 'success');
        setShowCriteriaModal(false);
        setCriteriaForm({ criteria_name: '', max_score: 10, sort_order: 0 });
        fetchCriteria(currentSeason.id);
      } else {
        showToast('❌ Lỗi thêm tiêu chí!', 'error');
      }
    } catch (e) {
      showToast('❌ Lỗi kết nối server!', 'error');
    }
    setLoading(false);
  };

  const deleteCriteria = async (criteriaId) => {
    try {
      const res = await fetch(`/api/recruitment/criteria/${criteriaId}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        showToast('✅ Đã xóa tiêu chí!', 'success');
        fetchCriteria(currentSeason.id);
      }
    } catch (e) {
      showToast('❌ Lỗi xóa tiêu chí!', 'error');
    }
  };

  // Candidate operations
  const createCandidate = async () => {
    if (!currentSeason) return;
    setLoading(true);
    try {
      const res = await fetch('/api/recruitment/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ ...candidateForm, season_id: currentSeason.id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Đã thêm ứng viên mới!', 'success');
        setShowCandidateModal(false);
        setCandidateForm({ full_name: '', class_name: '', phone: '', email: '', desired_dept: '', notes: '' });
        fetchCandidates(currentSeason.id);
      } else {
        showToast('❌ Lỗi thêm ứng viên!', 'error');
      }
    } catch (e) {
      showToast('❌ Lỗi kết nối server!', 'error');
    }
    setLoading(false);
  };

  const assignCandidateToInterviewer = async (candidateId, interviewerId) => {
    try {
      const res = await fetch(`/api/recruitment/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ interviewer_id: interviewerId })
      });
      if (res.ok) {
        showToast('✅ Đã phân công Interviewer!', 'success');
        fetchCandidates(currentSeason.id);
      }
    } catch (e) {
      showToast('❌ Lỗi phân công!', 'error');
    }
  };

  // Scoring operations
  const submitScores = async () => {
    if (!selectedCandidate || !currentSeason) return;
    setLoading(true);
    try {
      const scoresArray = criteria.map(c => ({
        criteria_id: c.id,
        score: scoringData[c.id] || 0
      }));
      const res = await fetch('/api/recruitment/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          season_id: currentSeason.id,
          candidate_id: selectedCandidate.id,
          interviewer_id: currentUser.id,
          scores: scoresArray,
          comments: scoringData.comments || ''
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Đã gửi điểm thành công!', 'success');
        setShowScoringModal(false);
        setScoringData({});
        setSelectedCandidate(null);
        fetchSubmittedCandidates(currentSeason.id);
        fetchCandidates(currentSeason.id);
      } else {
        showToast('❌ Lỗi gửi điểm!', 'error');
      }
    } catch (e) {
      showToast('❌ Lỗi kết nối server!', 'error');
    }
    setLoading(false);
  };

  const updateCandidateResult = async (candidateId, status, notes) => {
    try {
      const res = await fetch(`/api/recruitment/candidates/${candidateId}/result`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        showToast('✅ Đã cập nhật kết quả!', 'success');
        fetchScoresSummary(currentSeason.id);
      }
    } catch (e) {
      showToast('❌ Lỗi cập nhật kết quả!', 'error');
    }
  };

  // Get available interviewers (members with appropriate roles)
  const availableInterviewers = members.filter(m => {
    const roleTitle = (m.roleTitle || '').toLowerCase();
    return roleTitle.includes('trưởng ban') || roleTitle.includes('chủ nhiệm') || roleTitle.includes('kỹ thuật');
  });

  return (
    <div className="container py-8 space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1 flex items-center gap-3">
            <UserPlus className="text-violet-400 w-8 h-8" /> Quản Lý Tuyển Gen Nội Bộ
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hệ thống chấm điểm mù, phân công phỏng vấn và tổng hợp kết quả tuyển gen.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={toggleRecruitmentSeason}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              isRecruitmentSeasonActive
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isRecruitmentSeasonActive
              ? <ToggleRight className="w-5 h-5 text-emerald-400" />
              : <ToggleLeft className="w-5 h-5 text-slate-500" />
            }
            {isRecruitmentSeasonActive ? 'Mùa Tuyển: ĐANG BẬT' : 'Mùa Tuyển: ĐÃ TẮT'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {['seasons', 'criteria', 'candidates', 'scoring', 'results'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeTab === tab
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {tab === 'seasons' && 'Mùa Tuyển'}
            {tab === 'criteria' && 'Tiêu Chí'}
            {tab === 'candidates' && 'Ứng Viên'}
            {tab === 'scoring' && 'Chấm Điểm'}
            {tab === 'results' && 'Kết Quả'}
          </button>
        ))}
      </div>

      {/* Seasons Tab */}
      {activeTab === 'seasons' && (isAdmin || isHRHead) && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Danh Sách Mùa Tuyển</h2>
            <button
              onClick={() => setShowSeasonModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 border border-violet-500/30"
            >
              <Plus className="w-4 h-4" /> Tạo Mùa Tuyển Mới
            </button>
          </div>
          <div className="grid gap-4">
            {seasons.map(season => (
              <div key={season.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-lg">{season.name}</h3>
                    <p className="text-slate-400 text-sm">Hạn ngạch: {season.quota} thành viên</p>
                    <div className="flex items-center gap-2 mt-2">
                      {season.is_active === 1 ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs">
                          <CheckCircle className="w-3 h-3" /> Đang hoạt động
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          <Clock className="w-3 h-3" /> Đã kết thúc
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {season.is_active !== 1 && (
                      <button
                        onClick={() => activateSeason(season.id)}
                        className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30"
                        title="Kích hoạt"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setCurrentSeason(season)}
                      className={`p-2 rounded-lg ${currentSeason?.id === season.id ? 'bg-violet-500/30 text-violet-300' : 'bg-slate-800 text-slate-400'}`}
                      title="Chọn"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Criteria Tab */}
      {activeTab === 'criteria' && currentSeason && (isAdmin || isHRHead) && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Tiêu Chí Chấm Điểm - {currentSeason.name}</h2>
            <button
              onClick={() => setShowCriteriaModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 border border-violet-500/30"
            >
              <Plus className="w-4 h-4" /> Thêm Tiêu Chí
            </button>
          </div>
          <div className="grid gap-3">
            {criteria.map(c => (
              <div key={c.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white">{c.criteria_name}</h3>
                  <p className="text-slate-400 text-sm">Điểm tối đa: {c.max_score}</p>
                </div>
                <button
                  onClick={() => deleteCriteria(c.id)}
                  className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidates Tab */}
      {activeTab === 'candidates' && currentSeason && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Danh Sách Ứng Viên - {currentSeason.name}</h2>
            {(isAdmin || isHRHead) && (
              <button
                onClick={() => setShowCandidateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 border border-violet-500/30"
              >
                <Plus className="w-4 h-4" /> Thêm Ứng Viên
              </button>
            )}
          </div>
          <div className="grid gap-3">
            {candidates.map(c => (
              <div key={c.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-lg">{c.full_name}</h3>
                    <p className="text-slate-400 text-sm">Lớp: {c.class_name} | ĐT: {c.phone}</p>
                    <p className="text-slate-400 text-sm">Ban mong muốn: {c.desired_dept}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {c.status === 'passed' && <span className="text-emerald-400 text-xs">✅ Đậu</span>}
                      {c.status === 'failed' && <span className="text-red-400 text-xs">❌ Rớt</span>}
                      {c.status === 'reserve' && <span className="text-amber-400 text-xs">⏳ Dự bị</span>}
                      {c.status === 'scored' && <span className="text-blue-400 text-xs">📝 Đã chấm</span>}
                      {c.status === 'pending' && <span className="text-slate-400 text-xs">⏳ Chờ chấm</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isAdmin && !isHRHead && !submittedCandidates.includes(c.id) && (
                      <button
                        onClick={() => {
                          setSelectedCandidate(c);
                          setShowScoringModal(true);
                        }}
                        className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30"
                        title="Chấm điểm"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    {(isAdmin || isHRHead) && (
                      <select
                        value={c.interviewer_id || ''}
                        onChange={(e) => assignCandidateToInterviewer(c.id, e.target.value)}
                        className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 border border-slate-700"
                      >
                        <option value="">Chọn Interviewer</option>
                        {availableInterviewers.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scoring Tab (Interviewer only) */}
      {activeTab === 'scoring' && !isAdmin && !isHRHead && currentSeason && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Chấm Điểm Ứng Viên - {currentSeason.name}</h2>
          <div className="grid gap-3">
            {candidates.filter(c => !submittedCandidates.includes(c.id)).map(c => (
              <div key={c.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white">{c.full_name}</h3>
                    <p className="text-slate-400 text-sm">Lớp: {c.class_name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCandidate(c);
                      setShowScoringModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30"
                  >
                    <Star className="w-4 h-4" /> Chấm Điểm
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Tab (Admin/HR Head only) */}
      {activeTab === 'results' && (isAdmin || isHRHead) && currentSeason && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Bảng Tổng Hợp Kết Quả - {currentSeason.name}</h2>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-300 font-bold">#</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-bold">Họ Tên</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-bold">Lớp</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-bold">Ban Mong Muốn</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-bold">Số Interviewer</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-bold">Điểm TB</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-bold">Tổng Điểm</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-bold">Kết Quả</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-bold">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {scoresSummary.map((s, idx) => (
                  <tr key={s.candidate_id} className="border-t border-slate-800">
                    <td className="px-4 py-3 text-white">{s.rank}</td>
                    <td className="px-4 py-3 text-white font-medium">{s.full_name}</td>
                    <td className="px-4 py-3 text-slate-400">{s.class_name}</td>
                    <td className="px-4 py-3 text-slate-400">{s.desired_dept}</td>
                    <td className="px-4 py-3 text-slate-400">{s.interviewer_count}</td>
                    <td className="px-4 py-3 text-white font-bold">{s.avg_score}</td>
                    <td className="px-4 py-3 text-white">{s.total_score}</td>
                    <td className="px-4 py-3">
                      {s.result_status === 'passed' && <span className="text-emerald-400 font-bold">Đậu</span>}
                      {s.result_status === 'failed' && <span className="text-red-400 font-bold">Rớt</span>}
                      {s.result_status === 'reserve' && <span className="text-amber-400 font-bold">Dự bị</span>}
                      {s.result_status === 'pending' && <span className="text-slate-400">Chờ</span>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={s.status}
                        onChange={(e) => updateCandidateResult(s.candidate_id, e.target.value, s.notes)}
                        className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 border border-slate-700"
                      >
                        <option value="pending">Chờ</option>
                        <option value="passed">Đậu</option>
                        <option value="failed">Rớt</option>
                        <option value="reserve">Dự bị</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Season Modal */}
      {showSeasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Tạo Mùa Tuyển Mới</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm block mb-1">Tên mùa tuyển</label>
                <input
                  type="text"
                  value={seasonForm.name}
                  onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
                  placeholder="VD: Tuyển Gen 6 - 2025"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm block mb-1">Hạn ngạch</label>
                <input
                  type="number"
                  value={seasonForm.quota}
                  onChange={(e) => setSeasonForm({ ...seasonForm, quota: parseInt(e.target.value) })}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
                  placeholder="Số lượng thành viên cần tuyển"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSeasonModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={createSeason}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
              >
                {loading ? 'Đang tạo...' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Criteria Modal */}
      {showCriteriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Thêm Tiêu Chí Chấm Điểm</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm block mb-1">Tên tiêu chí</label>
                <input
                  type="text"
                  value={criteriaForm.criteria_name}
                  onChange={(e) => setCriteriaForm({ ...criteriaForm, criteria_name: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
                  placeholder="VD: Thái độ, Kỹ năng, Kiến thức..."
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm block mb-1">Điểm tối đa</label>
                <input
                  type="number"
                  value={criteriaForm.max_score}
                  onChange={(e) => setCriteriaForm({ ...criteriaForm, max_score: parseInt(e.target.value) })}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCriteriaModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={createCriteria}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
              >
                {loading ? 'Đang thêm...' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Thêm Ứng Viên Mới</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm block mb-1">Họ tên</label>
                <input
                  type="text"
                  value={candidateForm.full_name}
                  onChange={(e) => setCandidateForm({ ...candidateForm, full_name: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm block mb-1">Lớp</label>
                <input
                  type="text"
                  value={candidateForm.class_name}
                  onChange={(e) => setCandidateForm({ ...candidateForm, class_name: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm block mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={candidateForm.phone}
                  onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm block mb-1">Email</label>
                <input
                  type="email"
                  value={candidateForm.email}
                  onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm block mb-1">Ban mong muốn</label>
                <input
                  type="text"
                  value={candidateForm.desired_dept}
                  onChange={(e) => setCandidateForm({ ...candidateForm, desired_dept: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm block mb-1">Ghi chú</label>
                <textarea
                  value={candidateForm.notes}
                  onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCandidateModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={createCandidate}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
              >
                {loading ? 'Đang thêm...' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Modal */}
      {showScoringModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Chấm Điểm - {selectedCandidate.full_name}</h3>
            <div className="space-y-4">
              {criteria.map(c => (
                <div key={c.id} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-slate-300 font-medium">{c.criteria_name}</label>
                    <span className="text-slate-400 text-sm">Max: {c.max_score}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={c.max_score}
                    step="0.5"
                    value={scoringData[c.id] || 0}
                    onChange={(e) => setScoringData({ ...scoringData, [c.id]: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-right text-white font-bold mt-1">{scoringData[c.id] || 0}/{c.max_score}</div>
                </div>
              ))}
              <div>
                <label className="text-slate-300 text-sm block mb-1">Nhận xét</label>
                <textarea
                  value={scoringData.comments || ''}
                  onChange={(e) => setScoringData({ ...scoringData, comments: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
                  rows={3}
                  placeholder="Nhận xét chi tiết về ứng viên..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowScoringModal(false);
                  setSelectedCandidate(null);
                  setScoringData({});
                }}
                className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={submitScores}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Đang gửi...' : 'Gửi Điểm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!currentSeason && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
          <AlertCircle className="w-16 h-16 text-amber-500/40" />
          <div className="text-slate-400 text-sm max-w-md">
            <p className="font-bold text-slate-300 text-base mb-2">Chưa chọn mùa tuyển</p>
            <p>Vui lòng tạo hoặc chọn một mùa tuyển để bắt đầu quản lý tuyển gen.</p>
          </div>
        </div>
      )}
    </div>
  );
};
