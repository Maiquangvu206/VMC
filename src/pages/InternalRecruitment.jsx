import React, { useState, useEffect } from 'react';
import { useClub } from '../context/ClubContext';
import {
  UserPlus, ToggleLeft, ToggleRight, Plus, Edit, Trash2, Users, 
  CheckCircle, XCircle, Clock, Award, Search, Filter, Save, ChevronDown,
  Star, FileText, Calendar, GraduationCap, Briefcase, AlertCircle, X
} from 'lucide-react';
import { SeasonModal } from '../components/recruitment/SeasonModal';
import { CriteriaModal } from '../components/recruitment/CriteriaModal';
import { CandidateModal } from '../components/recruitment/CandidateModal';
import { InterviewerModal } from '../components/recruitment/InterviewerModal';
import { ScoringModal } from '../components/recruitment/ScoringModal';
import { CandidateInterviewerModal } from '../components/recruitment/CandidateInterviewerModal';
import { CandidateTeamworkModal } from '../components/recruitment/CandidateTeamworkModal';

export const InternalRecruitment = () => {
  const { 
    currentUser, isAdmin, isHRHead, isSuperAdmin, isRecruitmentSeasonActive, toggleRecruitmentSeason, 
    members, showToast 
  } = useClub();

  // Prevent rendering if user data is not loaded
  if (!currentUser) {
    return (
      <div className="page-wrap flex items-center justify-center">
        <div className="text-slate-400">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const currentUserRoleTitle = String(currentUser?.roleTitle || '').toLowerCase();
  const currentUserDeptName = String(currentUser?.deptName || currentUser?.department || '').toLowerCase();

  const isDeptHead = Boolean(
    currentUserRoleTitle.includes('trưởng ban')
  );

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
  const [showInterviewerModal, setShowInterviewerModal] = useState(false);
  const [selectedSeasonForInterviewers, setSelectedSeasonForInterviewers] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [submittedCandidates, setSubmittedCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInterviewers, setSelectedInterviewers] = useState([]);
  const [selectedCandidateInterviewers, setSelectedCandidateInterviewers] = useState([]);
  const [selectedCandidateTeamworkScorers, setSelectedCandidateTeamworkScorers] = useState([]);
  const [showCandidateInterviewerModal, setShowCandidateInterviewerModal] = useState(false);
  const [showCandidateTeamworkModal, setShowCandidateTeamworkModal] = useState(false);
  const [scoringTypeFilter, setScoringTypeFilter] = useState(null);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [currentScoringCandidateIndex, setCurrentScoringCandidateIndex] = useState(0);
  const [scoringComments, setScoringComments] = useState('');

  // Check if current user can score based on scoring type
  const canScore = React.useMemo(() => {
    if (!currentSeason || !currentUser) return false;
    
    const scoringTypes = Array.isArray(currentSeason.scoring_type) ? currentSeason.scoring_type : [currentSeason.scoring_type || 'teamwork'];
    const seasonDept = currentSeason.department?.toLowerCase() || '';
    const userDept = (currentUser?.deptName || currentUser?.department || '').toLowerCase();
    const userRoleTitle = (currentUser?.roleTitle || '').toLowerCase();
    
    // BCN (Chủ Nhiệm, Phó Chủ Nhiệm) - always can score
    const isBCN = userRoleTitle.includes('chủ nhiệm') || userRoleTitle.includes('phó chủ nhiệm');
    
    // Cố vấn (Advisor)
    const isAdvisor = userRoleTitle.includes('cố vấn') || userRoleTitle.includes('advisor');
    
    // Department member
    const isDeptMember = seasonDept && userDept.includes(seasonDept);
    
    // Check if user can score based on any enabled scoring type
    const canScoreDon = scoringTypes.includes('don') && (isBCN || isAdvisor || isDeptMember);
    // For teamwork, check if user is assigned as scorer for any candidate OR in season's interviewer_ids
    const canScoreTeamwork = scoringTypes.includes('teamwork') && (
      (currentSeason?.interviewer_ids || []).includes(currentUser?.id) ||
      (Array.isArray(candidates) && candidates.some(c => 
        (c.teamwork_scorer_ids || []).includes(currentUser?.id) ||
        (c.interviewer_ids || []).includes(currentUser?.id)
      ))
    );
    
    return canScoreDon || canScoreTeamwork;
  }, [currentSeason, currentUser, candidates]);

  // Form states
  const [seasonForm, setSeasonForm] = useState({ name: '', quota: 0, department: '', scoring_type: [] });
  const [criteriaForm, setCriteriaForm] = useState({ criteria_name: '', max_score: 10, sort_order: 0 });
  const [candidateForm, setCandidateForm] = useState({
    full_name: '', class_name: '', phone: '', email: '', desired_dept: '', notes: ''
  });

  // Auto-fill candidate desired_dept when season changes
  useEffect(() => {
    if (currentSeason && currentSeason.department) {
      setCandidateForm(prev => ({ ...prev, desired_dept: prev.desired_dept || currentSeason.department }));
    }
  }, [currentSeason?.department]);
  const [scoringData, setScoringData] = useState({});

  // Fetch data
  useEffect(() => {
    if (isSuperAdmin || isAdmin || isHRHead || isRecruitmentSeasonActive) {
      fetchSeasons();
    }
  }, [isSuperAdmin, isAdmin, isHRHead, isRecruitmentSeasonActive]);

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
      if (data.success && Array.isArray(data.data)) {
        // Filter seasons by user's department (Super Admin sees all)
        const userDept = (currentUser?.deptName || currentUser?.department || '').toLowerCase().trim();
        const filteredSeasons = isSuperAdmin 
          ? data.data 
          : data.data.filter(s => {
              const seasonDept = (s.department || '').toLowerCase().trim();
              return !seasonDept || seasonDept === userDept;
            });
        
        setSeasons(filteredSeasons);
        const active = filteredSeasons.find(s => s.is_active === 1);
        if (active) setCurrentSeason(active);
      } else {
        console.error('Invalid seasons data:', data);
      }
    } catch (e) {
      console.error('Error fetching seasons:', e);
    }
  };

  const fetchCriteria = async (seasonId) => {
    try {
      const res = await fetch(`/api/recruitment/criteria/${seasonId}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCriteria(data.data);
      } else {
        setCriteria([]);
      }
    } catch (e) {
      console.error('Error fetching criteria:', e);
      setCriteria([]);
    }
  };

  const fetchCandidates = async (seasonId) => {
    try {
      const interviewerParam = !isAdmin && !isHRHead ? `?interviewer_id=${currentUser.id}` : '';
      const res = await fetch(`/api/recruitment/candidates/${seasonId}${interviewerParam}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCandidates(data.data);
      } else {
        setCandidates([]);
      }
    } catch (e) {
      console.error('Error fetching candidates:', e);
      setCandidates([]);
    }
  };

  const fetchScoresSummary = async (seasonId) => {
    try {
      const res = await fetch(`/api/recruitment/scores/summary/${seasonId}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setScoresSummary(data.data);
      } else {
        setScoresSummary([]);
      }
    } catch (e) {
      console.error('Error fetching scores summary:', e);
      setScoresSummary([]);
    }
  };

  const fetchSubmittedCandidates = async (seasonId) => {
    try {
      const res = await fetch(`/api/recruitment/scores/submitted?season_id=${seasonId}&interviewer_id=${currentUser.id}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSubmittedCandidates(data.data);
      } else {
        setSubmittedCandidates([]);
      }
    } catch (e) {
      console.error('Error fetching submitted candidates:', e);
      setSubmittedCandidates([]);
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
        setSeasonForm({ name: '', quota: 0, department: '', scoring_type: [] });
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

  const deactivateSeason = async (seasonId) => {
    try {
      const res = await fetch(`/api/recruitment/seasons/${seasonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ is_active: false })
      });
      if (res.ok) {
        showToast('✅ Đã tắt mùa tuyển!', 'success');
        fetchSeasons();
      }
    } catch (e) {
      showToast('❌ Lỗi tắt mùa tuyển!', 'error');
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
        showToast('✅ Đã phân công Phỏng vấn!', 'success');
        fetchSeasons();
        setShowInterviewerModal(false);
        setSelectedInterviewers([]);
      }
    } catch (e) {
      showToast('❌ Lỗi phân công Phỏng vấn!', 'error');
    }
  };

  const openInterviewerModal = (season) => {
    setSelectedSeasonForInterviewers(season);
    setSelectedInterviewers(season.interviewer_ids || []);
    setShowInterviewerModal(true);
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
      // Auto-set desired_dept based on season's department if not specified
      const candidateData = {
        ...candidateForm,
        season_id: currentSeason.id,
        desired_dept: candidateForm.desired_dept || currentSeason.department || ''
      };
      const res = await fetch('/api/recruitment/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(candidateData)
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

  const assignCandidateToInterviewer = async (candidateId, interviewerIds) => {
    try {
      const res = await fetch(`/api/recruitment/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ interviewer_ids: interviewerIds })
      });
      if (res.ok) {
        showToast('✅ Đã phân công Phỏng vấn!', 'success');
        fetchCandidates(currentSeason.id);
        setSelectedCandidateInterviewers([]);
      }
    } catch (e) {
      showToast('❌ Lỗi phân công!', 'error');
    }
  };

  const assignCandidateTeamworkScorers = async (candidateId, scorerIds) => {
    try {
      const res = await fetch(`/api/recruitment/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ teamwork_scorer_ids: scorerIds })
      });
      if (res.ok) {
        showToast('✅ Đã phân công chấm Teamwork!', 'success');
        fetchCandidates(currentSeason.id);
        setSelectedCandidateTeamworkScorers([]);
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
          comments: scoringComments || ''
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Đã gửi điểm thành công!', 'success');
        setShowScoringModal(false);
        setScoringData({});
        setScoringComments('');
        setSubmittedCandidates([...submittedCandidates, selectedCandidate.id]);
        fetchSubmittedCandidates(currentSeason.id);
        fetchCandidates(currentSeason.id);
        
        // Navigate to next candidate in filtered list
        if (filteredCandidates.length > 0 && currentScoringCandidateIndex < filteredCandidates.length - 1) {
          const newIndex = currentScoringCandidateIndex + 1;
          setCurrentScoringCandidateIndex(newIndex);
          setSelectedCandidate(filteredCandidates[newIndex]);
        } else {
          // No more candidates, clear selection
          setSelectedCandidate(null);
          setFilteredCandidates([]);
          setCandidateSearchQuery('');
        }
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

  // Get available interviewers based on season's department + BCN + advisors
  const availableInterviewers = React.useMemo(() => {
    const targetSeason = selectedSeasonForInterviewers || currentSeason;
    if (!targetSeason || !Array.isArray(members)) return [];
    
    const seasonDept = (targetSeason.department || '').toLowerCase().trim();
    
    return members.filter(m => {
      const roleTitle = (m.roleTitle || '').toLowerCase();
      const memberDept = (m.deptName || m.department || '').toLowerCase().trim();
      
      // BCN (Chủ Nhiệm, Phó Chủ Nhiệm) - always included
      const isBCN = roleTitle.includes('chủ nhiệm') || roleTitle.includes('phó chủ nhiệm');
      
      // Cố vấn (Advisor)
      const isAdvisor = roleTitle.includes('cố vấn') || roleTitle.includes('advisor');
      
      // Department members - exact match only for reliability
      const isDeptMember = seasonDept && memberDept === seasonDept;
      
      return isBCN || isAdvisor || isDeptMember;
    });
  }, [selectedSeasonForInterviewers, currentSeason, members]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <UserPlus className="text-violet-400 w-8 h-8 shrink-0" />
          <div>
          <h1 className="font-heading text-3xl font-extrabold text-slate-100 mt-1">
            Quản Lý Tuyển Gen Nội Bộ
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Hệ thống chấm điểm mù, phân công phỏng vấn và tổng hợp kết quả tuyển gen.
          </p>
          </div>
        </div>

        {isSuperAdmin && (
          <button
            onClick={toggleRecruitmentSeason}
            className={`ds-btn ${isRecruitmentSeasonActive ? 'ds-btn-success' : 'ds-btn-secondary'}`}
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
      <div className="flex flex-wrap gap-3 border-b border-[var(--border-default)] pb-4">
        <button
          onClick={() => setActiveTab('seasons')}
          className={`ds-btn ${activeTab === 'seasons' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
        >
          Mùa Tuyển
        </button>
        
        {/* Other tabs only show when season is selected and user belongs to season's department */}
        {currentSeason && (() => {
          const seasonDept = (currentSeason.department || '').toLowerCase().trim();
          const userDept = (currentUser?.deptName || currentUser?.department || '').toLowerCase().trim();
          const belongsToSeason = isSuperAdmin || !seasonDept || seasonDept === userDept;
          return belongsToSeason;
        })() && (
          <>
            {/* Criteria tab - only for Trưởng Ban */}
            {(isSuperAdmin || isAdmin || isHRHead || isDeptHead) && (
              <button
                onClick={() => setActiveTab('criteria')}
                className={`ds-btn ${activeTab === 'criteria' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
              >
                Tiêu Chí
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('candidates')}
              className={`ds-btn ${activeTab === 'candidates' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
            >
              Ứng Viên
            </button>
            
            {/* Scoring tab - based on scoring type, Super Admin can see all */}
            {(canScore || isSuperAdmin) && (
              <button
                onClick={() => setActiveTab('scoring')}
                className={`ds-btn ${activeTab === 'scoring' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
              >
                Chấm Điểm
              </button>
            )}
            
            {/* Results tab - for all department members */}
            <button
              onClick={() => setActiveTab('results')}
              className={`ds-btn ${activeTab === 'results' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
            >
              Kết Quả
            </button>
          </>
        )}
      </div>

       {/* Seasons Tab */}
       {activeTab === 'seasons' && (
         <div className="space-y-6">
           {isSuperAdmin || isAdmin || isHRHead ? (
             <>
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-slate-100">Danh Sách Mùa Tuyển</h2>
                 <button
                   onClick={() => setShowSeasonModal(true)}
                   className="ds-btn ds-btn-primary"
                 >
                   <Plus className="w-5 h-5" /> Tạo Mùa Tuyển Mới
                 </button>
               </div>
               <div className="grid gap-5">
                 {seasons.map(season => (
                   <div key={season.id} className="ds-card p-6">
                     <div className="flex justify-between items-start">
                       <div>
                         <h3 className="font-bold text-slate-100 text-xl">{season.name}</h3>
                         <p className="text-slate-400 text-base mt-2">Ban: {season.department || 'Tất cả'} | Chỉ tiêu: {season.quota} thành viên</p>
                         <div className="flex items-center gap-3 mt-3">
                           {season.is_active === 1 ? (
                             <span className="flex items-center gap-2 text-emerald-400 text-sm">
                               <CheckCircle className="w-4 h-4" /> Đang hoạt động
                             </span>
                           ) : (
                             <span className="flex items-center gap-2 text-slate-400 text-sm">
                               <Clock className="w-4 h-4" /> Đã kết thúc
                             </span>
                           )}
                         </div>
                       </div>
                       <div className="flex gap-3">
                         {season.is_active === 1 ? (
                           <button
                             onClick={() => deactivateSeason(season.id)}
                             className="ds-btn ds-btn-danger ds-btn-xs"
                             title="Tắt mùa tuyển"
                           >
                             <X className="w-5 h-5" />
                           </button>
                         ) : (
                           <button
                             onClick={() => activateSeason(season.id)}
                             className="ds-btn ds-btn-success ds-btn-xs"
                             title="Kích hoạt"
                           >
                             <CheckCircle className="w-5 h-5" />
                           </button>
                         )}
                         <button
                           onClick={() => openInterviewerModal(season)}
                           className="ds-btn ds-btn-primary ds-btn-xs"
                           title="Phân công Phỏng vấn"
                         >
                           <Users className="w-5 h-5" />
                         </button>
                         <button
                           onClick={() => setCurrentSeason(season)}
                           className={`ds-btn ds-btn-xs ${currentSeason?.id === season.id ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
                           title="Chọn"
                         >
                           <Edit className="w-5 h-5" />
                         </button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </>
           ) : (
             // Regular members - show only active season info
             <>
               <h2 className="text-2xl font-bold text-slate-100">Mùa Tuyển Hiện Tại</h2>
               {currentSeason ? (
                 <div className="ds-card p-8">
                   <div className="flex items-start gap-5">
                     <div className="p-4 bg-emerald-500/20 rounded-2xl">
                       <CheckCircle className="w-10 h-10 text-emerald-400" />
                     </div>
                     <div className="flex-1">
                       <h3 className="font-bold text-slate-100 text-2xl">{currentSeason.name}</h3>
                       <p className="text-slate-400 text-base mt-2">Ban: {currentSeason.department || 'Tất cả'} | Chỉ tiêu: {currentSeason.quota} thành viên</p>
                       <div className="flex items-center gap-3 mt-3">
                         <span className="flex items-center gap-2 text-emerald-400 text-base">
                           <CheckCircle className="w-5 h-5" /> Đang hoạt động
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="ds-card p-8 text-center">
                   <Clock className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                   <p className="text-slate-400 text-base">Hiện tại không có mùa tuyển nào đang hoạt động</p>
                 </div>
               )}
             </>
           )}
         </div>
       )}

       {/* Criteria Tab - only for Trưởng Ban */}
       {activeTab === 'criteria' && currentSeason && (isSuperAdmin || isAdmin || isHRHead || isDeptHead) && (
         <div className="space-y-4">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold text-white">Tiêu Chí Chấm Điểm - {currentSeason.name}</h2>
             <button
               onClick={() => setShowCriteriaModal(true)}
               className="ds-btn ds-btn-primary"
             >
               <Plus className="w-4 h-4" /> Thêm Tiêu Chí
             </button>
           </div>
           <div className="grid gap-3">
             {criteria.map(c => (
               <div key={c.id} className="ds-card p-4 flex justify-between items-center">
                 <div>
                   <h3 className="font-bold text-white">{c.criteria_name}</h3>
                   <p className="text-slate-400 text-sm">Điểm tối đa: {c.max_score}</p>
                 </div>
                 <button
                   onClick={() => deleteCriteria(c.id)}
                   className="ds-btn ds-btn-danger ds-btn-xs"
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
                 className="ds-btn ds-btn-primary"
               >
                 <Plus className="w-4 h-4" /> Thêm Ứng Viên
               </button>
             )}
           </div>
           <div className="grid gap-3">
             {candidates.map(c => (
               <div key={c.id} className="ds-card p-4">
                 <div className="flex justify-between items-start">
                   <div>
                     <h3 className="font-bold text-white text-lg">{c.full_name}</h3>
                     <p className="text-slate-400 text-sm">Lớp: {c.class_name} | ĐT: {c.phone}</p>
                     <p className="text-slate-400 text-sm">Ban mong muốn: {c.desired_dept}</p>
                     <div className="flex items-center gap-2 mt-2">
                       {c.status === 'passed' && <span className="ds-badge ds-badge-emerald">✅ Đậu</span>}
                       {c.status === 'failed' && <span className="ds-badge ds-badge-rose">❌ Rớt</span>}
                       {c.status === 'reserve' && <span className="ds-badge ds-badge-amber">⏳ Dự bị</span>}
                       {c.status === 'scored' && <span className="ds-badge ds-badge-blue">📝 Đã chấm</span>}
                       {c.status === 'pending' && <span className="ds-badge ds-badge-secondary">⏳ Chờ chấm</span>}
                     </div>
                   </div>
                   <div className="flex gap-2 flex-wrap">
                     {!isAdmin && !isHRHead && !submittedCandidates.includes(c.id) && (() => {
                       // Check if user is assigned to score this candidate
                       const scoringTypes = Array.isArray(currentSeason.scoring_type) ? currentSeason.scoring_type : [currentSeason.scoring_type || 'teamwork'];
                       const canScoreThisCandidate = scoringTypes.some(type => {
                         if (type === 'don') {
                           const seasonDept = currentSeason.department?.toLowerCase() || '';
                           const userDept = (currentUser?.deptName || currentUser?.department || '').toLowerCase();
                           const userRoleTitle = (currentUser?.roleTitle || '').toLowerCase();
                           const isBCN = userRoleTitle.includes('chủ nhiệm') || userRoleTitle.includes('phó chủ nhiệm');
                           const isAdvisor = userRoleTitle.includes('cố vấn') || userRoleTitle.includes('advisor');
                           const isDeptMember = seasonDept && userDept.includes(seasonDept);
                           return isBCN || isAdvisor || isDeptMember;
                         } else if (type === 'teamwork') {
                           return (c.teamwork_scorer_ids || []).includes(currentUser?.id) || 
                                  (c.interviewer_ids || []).includes(currentUser?.id) ||
                                  (currentSeason?.interviewer_ids || []).includes(currentUser?.id);
                         }
                         return false;
                       });
                       return canScoreThisCandidate;
                     })() && (
                       <button
                         onClick={() => {
                           setSelectedCandidate(c);
                           setShowScoringModal(true);
                         }}
                         className="ds-btn ds-btn-primary ds-btn-xs"
                         title="Chấm điểm"
                       >
                         <Star className="w-4 h-4" />
                       </button>
                     )}
                     {(isAdmin || isHRHead) && (
                       <div className="flex gap-1 flex-wrap">
                         <button
                           onClick={() => {
                             setSelectedCandidate(c);
                             setSelectedCandidateInterviewers(c.interviewer_ids || []);
                             setShowCandidateInterviewerModal(true);
                             setShowCandidateTeamworkModal(false);
                           }}
                           className="ds-btn ds-btn-primary ds-btn-xs"
                         >
                           Phỏng vấn ({(c.interviewer_ids || []).length})
                         </button>
                         <button
                           onClick={() => {
                             setSelectedCandidate(c);
                             setSelectedCandidateTeamworkScorers(c.teamwork_scorer_ids || []);
                             setShowCandidateTeamworkModal(true);
                             setShowCandidateInterviewerModal(false);
                           }}
                           className="ds-btn ds-btn-secondary ds-btn-xs"
                         >
                           Teamwork ({(c.teamwork_scorer_ids || []).length})
                         </button>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}

       {/* Scoring Tab - redesigned with candidate search and single candidate form */}
       {activeTab === 'scoring' && (canScore || isSuperAdmin) && currentSeason && (
         <div className="space-y-4">
           <h2 className="text-xl font-bold text-white">
             Chấm Điểm Ứng Viên - {currentSeason.name}
             <span className="text-sm font-normal text-slate-400 ml-2">
               ({Array.isArray(currentSeason.scoring_type) ? currentSeason.scoring_type.join(', ') : currentSeason.scoring_type})
             </span>
           </h2>
           
           {/* Filter by scoring type if both are enabled */}
           {Array.isArray(currentSeason.scoring_type) && currentSeason.scoring_type.length > 1 && (
             <div className="flex gap-2">
               {currentSeason.scoring_type.map(type => (
                 <button
                   key={type}
                   onClick={() => setScoringTypeFilter(type)}
                   className={`ds-btn ds-btn-xs ${scoringTypeFilter === type ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
                 >
                   {type === 'don' ? 'Đơn' : 'Teamwork'}
                 </button>
               ))}
             </div>
           )}

{/* Candidate search/filter */}
            <div className="flex gap-3">
              <div className="relative flex items-center w-full">
                <Search className="absolute left-4 w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã ứng viên, tên, hoặc lớp..."
                  value={candidateSearchQuery}
                  onChange={(e) => {
                    setCandidateSearchQuery(e.target.value);
                    const query = e.target.value.toLowerCase();
                    const filtered = candidates.filter(c => 
                      (c.id || '').toLowerCase().includes(query) ||
                      (c.full_name || '').toLowerCase().includes(query) ||
                      (c.class_name || '').toLowerCase().includes(query)
                    );
                    setFilteredCandidates(filtered);
                    setCurrentScoringCandidateIndex(0);
                    if (filtered.length > 0) {
                      setSelectedCandidate(filtered[0]);
                      setScoringComments('');
                      setScoringData({});
                    }
                  }}
                  className="ds-input pl-12"
                />
              </div>
             {filteredCandidates.length > 0 && (
               <div className="text-slate-400 text-sm flex items-center">
                 {currentScoringCandidateIndex + 1} / {filteredCandidates.length}
               </div>
             )}
           </div>

           {/* Single candidate scoring form */}
           {selectedCandidate && filteredCandidates.length > 0 && (() => {
             const c = selectedCandidate;
             const isAssignedToScore = (() => {
               const scoringTypes = Array.isArray(currentSeason.scoring_type) ? currentSeason.scoring_type : [currentSeason.scoring_type || 'teamwork'];
               const filterType = scoringTypeFilter || scoringTypes[0];
               if (filterType === 'don') {
                 const seasonDept = currentSeason.department?.toLowerCase() || '';
                 const userDept = (currentUser?.deptName || currentUser?.department || '').toLowerCase();
                 const userRoleTitle = (currentUser?.roleTitle || '').toLowerCase();
                 const isBCN = userRoleTitle.includes('chủ nhiệm') || userRoleTitle.includes('phó chủ nhiệm');
                 const isAdvisor = userRoleTitle.includes('cố vấn') || userRoleTitle.includes('advisor');
                 const isDeptMember = seasonDept && userDept.includes(seasonDept);
                 return isBCN || isAdvisor || isDeptMember;
               } else {
                 return (c.teamwork_scorer_ids || []).includes(currentUser?.id) || 
                        (c.interviewer_ids || []).includes(currentUser?.id) ||
                        (currentSeason?.interviewer_ids || []).includes(currentUser?.id);
               }
             })();
             
             const isSubmitted = submittedCandidates.includes(c.id);
             
             return (
               <div className="ds-card p-6">
                 {/* Candidate info */}
                 <div className="flex justify-between items-start mb-6 pb-4 border-b border-[var(--border-default)]">
                   <div>
                     <h3 className="text-2xl font-bold text-white">{c.full_name}</h3>
                     <p className="text-slate-400">Mã: {c.id} | Lớp: {c.class_name}</p>
                     <p className="text-slate-400">Ban mong muốn: {c.desired_dept}</p>
                   </div>
                   <div className="flex gap-2">
                     <button
                       onClick={() => {
                         if (currentScoringCandidateIndex > 0) {
                           const newIndex = currentScoringCandidateIndex - 1;
                           setCurrentScoringCandidateIndex(newIndex);
                           setSelectedCandidate(filteredCandidates[newIndex]);
                           setScoringComments('');
                           setScoringData({});
                         }
                       }}
                       disabled={currentScoringCandidateIndex === 0}
                       className="ds-btn ds-btn-secondary ds-btn-xs"
                     >
                       ← Trước
                     </button>
                     <button
                       onClick={() => {
                         if (currentScoringCandidateIndex < filteredCandidates.length - 1) {
                           const newIndex = currentScoringCandidateIndex + 1;
                           setCurrentScoringCandidateIndex(newIndex);
                           setSelectedCandidate(filteredCandidates[newIndex]);
                           setScoringComments('');
                           setScoringData({});
                         }
                       }}
                       disabled={currentScoringCandidateIndex === filteredCandidates.length - 1}
                       className="ds-btn ds-btn-secondary ds-btn-xs"
                     >
                       Sau →
                     </button>
                   </div>
                 </div>

                 {/* Scoring form */}
                 {isAssignedToScore && !isSubmitted ? (
                   <div className="space-y-4">
                     {criteria.map(crit => (
                       <div key={crit.id} className="flex items-center gap-4">
                         <div className="flex-1">
                           <label className="text-white font-medium block mb-1">{crit.criteria_name}</label>
                           <p className="text-slate-400 text-xs">Thang điểm: 0 - {crit.max_score}</p>
                         </div>
                         <input
                           type="number"
                           min="0"
                           max={crit.max_score}
                           value={scoringData[crit.id] || ''}
                           onChange={(e) => setScoringData(prev => ({
                             ...prev,
                             [crit.id]: parseFloat(e.target.value) || 0
                           }))}
                           className="ds-input w-24 text-center"
                         />
                       </div>
                     ))}
                     
                     {/* Comments field */}
                     <div>
                       <label className="ds-field-label">Nhận xét</label>
                       <textarea
                         value={scoringComments}
                         onChange={(e) => setScoringComments(e.target.value)}
                         placeholder="Nhập nhận xét về ứng viên..."
                         rows={3}
                         className="ds-textarea"
                       />
                     </div>

                     {/* Total score */}
                     <div className="flex justify-between items-center pt-4 border-t border-[var(--border-default)]">
                       <div className="text-white font-bold text-lg">
                         Tổng điểm: {criteria.reduce((sum, crit) => sum + (scoringData[crit.id] || 0), 0)}
                       </div>
                       <button
                         onClick={() => {
                           setSelectedCandidate(c);
                           setShowScoringModal(true);
                         }}
                         className="ds-btn ds-btn-primary"
                       >
                         Lưu Điểm
                       </button>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     {isSubmitted ? (
                       <p className="text-emerald-400 text-lg font-bold">✅ Đã chấm điểm ứng viên này</p>
                     ) : (
                       <p className="text-slate-400 text-lg">❌ Bạn không được phân công chấm ứng viên này</p>
                     )}
                   </div>
                 )}
               </div>
             );
           })()}
         </div>
       )}

       {/* Results Tab - for all department members */}
       {activeTab === 'results' && currentSeason && (
         <div className="space-y-4">
           <h2 className="text-xl font-bold text-white">Bảng Tổng Hợp Kết Quả - {currentSeason.name}</h2>
           <div className="ds-card overflow-hidden">
             <table className="ds-table">
               <thead>
                 <tr>
                   <th>#</th>
                   <th>Họ Tên</th>
                   <th>Lớp</th>
                   <th>Ban Mong Muốn</th>
                   <th>Số Phỏng vấn</th>
                   <th>Điểm TB</th>
                   <th>Tổng Điểm</th>
                   <th>Kết Quả</th>
                 </tr>
               </thead>
               <tbody>
                 {scoresSummary.map((s, idx) => (
                   <tr key={s.candidate_id}>
                     <td>{s.rank}</td>
                     <td className="font-medium text-white">{s.full_name}</td>
                     <td className="text-slate-400">{s.class_name}</td>
                     <td className="text-slate-400">{s.desired_dept}</td>
                     <td className="text-slate-400">{s.interviewer_count}</td>
                     <td className="text-white font-bold">{s.avg_score}</td>
                     <td className="text-white">{s.total_score}</td>
                     <td>
                       {s.result_status === 'passed' && <span className="text-emerald-400 font-bold">Đậu</span>}
                       {s.result_status === 'failed' && <span className="text-red-400 font-bold">Rớt</span>}
                       {s.result_status === 'reserve' && <span className="text-amber-400 font-bold">Dự bị</span>}
                       {s.result_status === 'pending' && <span className="text-slate-400">Chờ</span>}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       )}

      <SeasonModal
        show={showSeasonModal}
        onClose={() => setShowSeasonModal(false)}
        seasonForm={seasonForm}
        setSeasonForm={setSeasonForm}
        onSubmit={createSeason}
        loading={loading}
      />

      <CriteriaModal
        show={showCriteriaModal}
        onClose={() => setShowCriteriaModal(false)}
        criteriaForm={criteriaForm}
        setCriteriaForm={setCriteriaForm}
        onSubmit={createCriteria}
        loading={loading}
      />

      <CandidateModal
        show={showCandidateModal}
        onClose={() => setShowCandidateModal(false)}
        candidateForm={candidateForm}
        setCandidateForm={setCandidateForm}
        onSubmit={createCandidate}
        loading={loading}
        currentSeason={currentSeason}
      />

      <ScoringModal
        show={showScoringModal}
        onClose={() => {
          setShowScoringModal(false);
          setSelectedCandidate(null);
          setScoringData({});
        }}
        candidate={selectedCandidate}
        criteria={criteria}
        onSubmit={(candidateId, scores, comments) => submitScores()}
        loading={loading}
        currentUser={currentUser}
        currentSeason={currentSeason}
        submittedCandidates={submittedCandidates}
        candidates={candidates}
      />

      <InterviewerModal
        show={showInterviewerModal}
        onClose={() => {
          setShowInterviewerModal(false);
          setSelectedInterviewers([]);
          setSelectedSeasonForInterviewers(null);
        }}
        selectedSeason={selectedSeasonForInterviewers}
        availableInterviewers={availableInterviewers}
        selectedInterviewers={selectedInterviewers}
        setSelectedInterviewers={setSelectedInterviewers}
        onSubmit={() => assignInterviewers(selectedSeasonForInterviewers.id, selectedInterviewers)}
        loading={loading}
      />

      <CandidateInterviewerModal
        show={showCandidateInterviewerModal}
        onClose={() => {
          setShowCandidateInterviewerModal(false);
          setSelectedCandidate(null);
          setSelectedCandidateInterviewers([]);
        }}
        candidate={selectedCandidate}
        availableInterviewers={availableInterviewers}
        selectedInterviewers={selectedCandidateInterviewers}
        setSelectedInterviewers={setSelectedCandidateInterviewers}
        onSubmit={() => {
          assignCandidateToInterviewer(selectedCandidate.id, selectedCandidateInterviewers);
          setShowCandidateInterviewerModal(false);
        }}
        loading={loading}
      />

      <CandidateTeamworkModal
        show={showCandidateTeamworkModal}
        onClose={() => {
          setShowCandidateTeamworkModal(false);
          setSelectedCandidate(null);
          setSelectedCandidateTeamworkScorers([]);
        }}
        candidate={selectedCandidate}
        availableInterviewers={availableInterviewers}
        selectedScorers={selectedCandidateTeamworkScorers}
        setSelectedScorers={setSelectedCandidateTeamworkScorers}
        onSubmit={() => {
          assignCandidateTeamworkScorers(selectedCandidate.id, selectedCandidateTeamworkScorers);
          setShowCandidateTeamworkModal(false);
        }}
        loading={loading}
      />

    </div>
  );
};
