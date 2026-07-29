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

  // Helper to check if a user is permitted to access a given season
  const canAccessSeason = (season) => {
    if (!season) return false;
    if (isSuperAdmin || isAdmin || isHRHead) return true;

    const userDept = (currentUser?.deptName || currentUser?.department || '').toLowerCase().trim();
    const seasonDept = (season.department || '').toLowerCase().trim();
    const userRoleTitle = (currentUser?.roleTitle || '').toLowerCase();
    
    // 1. Check if member of the department in charge
    const isDeptMember = seasonDept && userDept.includes(seasonDept);
    
    // 2. Check if Advisor or anyone explicitly assigned in season.interviewer_ids
    const getInterviewerIds = (interviewerIdsVal) => {
      if (!interviewerIdsVal) return [];
      if (Array.isArray(interviewerIdsVal)) return interviewerIdsVal;
      try {
        return JSON.parse(interviewerIdsVal);
      } catch (e) {
        return [];
      }
    };
    const isAssignedScorer = getInterviewerIds(season.interviewer_ids).includes(currentUser?.id);

    // 3. BCN / Advisor who is assigned can access
    const isBCN = userRoleTitle.includes('chủ nhiệm') || userRoleTitle.includes('phó chủ nhiệm');
    const isAdvisor = userRoleTitle.includes('cố vấn') || userRoleTitle.includes('advisor');

    return isDeptMember || isAssignedScorer || ((isBCN || isAdvisor) && isAssignedScorer);
  };

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
    // For phỏng vấn, check if user is BCN, advisor, dept member, or assigned interviewer
    const canScorePhongvan = scoringTypes.includes('phongvan') && (
      isBCN || isAdvisor || isDeptMember ||
      (currentSeason?.interviewer_ids || []).includes(currentUser?.id) ||
      (Array.isArray(candidates) && candidates.some(c => 
        (c.interviewer_ids || []).includes(currentUser?.id)
      ))
    );
    
    return canScoreDon || canScoreTeamwork || canScorePhongvan;
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

  // Set default scoring type filter based on active round or first available type
  useEffect(() => {
    if (activeTab === 'scoring' && currentSeason) {
      setScoringTypeFilter(currentSeason.active_round || 'don');
    }
  }, [activeTab, currentSeason]);
  const [scoringData, setScoringData] = useState({});

  // Client-side candidate filtering based on role, round, and search query
  useEffect(() => {
    if (!currentSeason || !Array.isArray(candidates)) {
      setFilteredCandidates([]);
      return;
    }

    const query = (candidateSearchQuery || '').toLowerCase().trim();
    const filterType = scoringTypeFilter || 'don';

    // Filter by query first
    let list = candidates.filter(c => 
      (c.id || '').toLowerCase().includes(query) ||
      (c.full_name || '').toLowerCase().includes(query) ||
      (c.class_name || '').toLowerCase().includes(query)
    );

    // Enforce permission assignment check for teamwork and phongvan for normal members
    const userRoleTitle = (currentUser?.roleTitle || '').toLowerCase();
    const isBCN = userRoleTitle.includes('chủ nhiệm') || userRoleTitle.includes('phó chủ nhiệm');
    const isAdvisor = userRoleTitle.includes('cố vấn') || userRoleTitle.includes('advisor');
    const isPowerUser = isSuperAdmin || isAdmin || isHRHead || isBCN || isAdvisor;

    if (!isPowerUser) {
      if (filterType === 'teamwork') {
        list = list.filter(c => (c.teamwork_scorer_ids || []).includes(currentUser?.id));
      } else if (filterType === 'phongvan') {
        list = list.filter(c => (c.interviewer_ids || []).includes(currentUser?.id));
      }
      // For 'don', any member of the department can score, so no candidate-level filtering is applied.
    }

    setFilteredCandidates(list);
    setCurrentScoringCandidateIndex(0);
    if (list.length > 0) {
      setSelectedCandidate(list[0]);
    } else {
      setSelectedCandidate(null);
    }
  }, [candidates, scoringTypeFilter, candidateSearchQuery, currentSeason, currentUser]);

  // Fetch data
  useEffect(() => {
    fetchSeasons();
  }, []);

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
        if (active && (isSuperAdmin || isAdmin || isHRHead)) {
          setCurrentSeason(active);
        }
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
      const res = await fetch(`/api/recruitment/candidates/${seasonId}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
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

  const updateActiveRound = async (seasonId, round) => {
    try {
      const res = await fetch(`/api/recruitment/seasons/${seasonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ active_round: round })
      });
      if (res.ok) {
        showToast('✅ Đã chuyển vòng chấm điểm!', 'success');
        fetchSeasons();
        if (currentSeason?.id === seasonId) {
          setCurrentSeason(prev => ({ ...prev, active_round: round }));
        }
      }
    } catch (e) {
      showToast('❌ Lỗi chuyển vòng!', 'error');
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

  // Get available interviewers: Ban Cố Vấn, Ban Chủ Nhiệm, Ban Phụ Trách (Ban Phụ Trách sorted FIRST at top)
  const availableInterviewers = React.useMemo(() => {
    if (!Array.isArray(members)) return [];
    const targetSeason = selectedSeasonForInterviewers || currentSeason;
    const targetDept = (targetSeason?.department || '').toLowerCase().trim();

    const filtered = members.filter(m => {
      if (m.status === 'Suspended') return false;
      const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase().trim();
      const deptName = (m.deptName || m.department || '').toLowerCase().trim();
      const code = (m.memberCode || m.member_code || '').toUpperCase();

      // 1. Ban Cố Vấn
      const isAdvisor = roleTitle.includes('cố vấn') || deptName.includes('cố vấn') || roleTitle.includes('advisor');

      // 2. Ban Chủ Nhiệm / Admin / Super Admin
      const isBCN = roleTitle.includes('chủ nhiệm') || deptName.includes('chủ nhiệm') || roleTitle.includes('super admin') || code === 'ADMIN';

      // 3. Ban Phụ Trách (Department in charge of the recruitment season)
      const isDeptInCharge = targetDept && (deptName.includes(targetDept) || targetDept.includes(deptName));

      return isAdvisor || isBCN || isDeptInCharge;
    });

    // Sort: Members of Ban Phụ Trách appear FIRST at the top of the list!
    return filtered.sort((a, b) => {
      const deptA = (a.deptName || a.department || '').toLowerCase().trim();
      const deptB = (b.deptName || b.department || '').toLowerCase().trim();

      const aIsInCharge = targetDept && (deptA.includes(targetDept) || targetDept.includes(deptA));
      const bIsInCharge = targetDept && (deptB.includes(targetDept) || targetDept.includes(deptB));

      if (aIsInCharge && !bIsInCharge) return -1;
      if (!aIsInCharge && bIsInCharge) return 1;
      return 0;
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
        
        {/* Other tabs only show when season is selected and user is authorized */}
        {currentSeason && canAccessSeason(currentSeason) && (
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
           <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-slate-100">
               {isSuperAdmin || isAdmin || isHRHead ? 'Danh Sách Mùa Tuyển' : 'Chọn Mùa Tuyển Sinh'}
             </h2>
             {(isSuperAdmin || isAdmin || isHRHead) && (
               <button
                 onClick={() => setShowSeasonModal(true)}
                 className="ds-btn ds-btn-primary"
               >
                 <Plus className="w-5 h-5" /> Tạo Mùa Tuyển Mới
               </button>
             )}
           </div>

           <div className="grid gap-5">
             {seasons.map(season => {
               const seasonDept = (season.department || '').toLowerCase().trim();
               const userDept = (currentUser?.deptName || currentUser?.department || '').toLowerCase().trim();
               const isSeasonDeptHead = isDeptHead && userDept.includes(seasonDept);
               const canManageSeason = isSuperAdmin || isAdmin || isHRHead || isSeasonDeptHead;

               const getScoringTypes = (scoringType) => {
                 if (!scoringType) return ['teamwork'];
                 if (Array.isArray(scoringType)) return scoringType;
                 try {
                   return JSON.parse(scoringType);
                 } catch (e) {
                   return [scoringType];
                 }
               };
               const scoringTypes = getScoringTypes(season.scoring_type);

               return (
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
                         <span className="text-slate-600">|</span>
                         <span className="text-blue-400 font-bold text-xs">
                           Vòng đang mở: {season.active_round === 'don' ? '📝 Chấm Đơn' : season.active_round === 'teamwork' ? '👥 Chấm Teamwork' : '🎙️ Chấm Phỏng Vấn'}
                         </span>
                       </div>
                     </div>
                     <div className="flex gap-3">
                       {season.is_active === 1 && (isSuperAdmin || isAdmin || isHRHead) && (
                         <button
                           onClick={() => deactivateSeason(season.id)}
                           className="ds-btn ds-btn-danger ds-btn-xs"
                           title="Tắt mùa tuyển"
                         >
                           <X className="w-5 h-5" />
                         </button>
                       )}
                       {season.is_active !== 1 && (isSuperAdmin || isAdmin || isHRHead) && (
                         <button
                           onClick={() => activateSeason(season.id)}
                           className="ds-btn ds-btn-success ds-btn-xs"
                           title="Kích hoạt"
                         >
                           <CheckCircle className="w-5 h-5" />
                         </button>
                       )}
                       {(isSuperAdmin || isAdmin || isHRHead) && (
                         <button
                           onClick={() => openInterviewerModal(season)}
                           className="ds-btn ds-btn-primary ds-btn-xs"
                           title="Phân công Phỏng vấn"
                         >
                           <Users className="w-5 h-5" />
                         </button>
                       )}
                       {(() => {
                         const hasAccess = canAccessSeason(season);
                         if (!hasAccess) {
                           return (
                             <button
                               disabled
                               className="ds-btn ds-btn-xs bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                               title="Bạn không thuộc ban phụ trách và không được phân công chấm điểm cho mùa tuyển này"
                             >
                               🔒 Khóa
                             </button>
                           );
                         }
                         return (
                           <button
                             onClick={() => setCurrentSeason(season)}
                             className={`ds-btn ds-btn-xs ${currentSeason?.id === season.id ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
                           >
                             {currentSeason?.id === season.id ? '✓ Đang Chọn' : 'Chọn Mùa Tuyển'}
                           </button>
                         );
                       })()}
                     </div>
                   </div>

                   {/* Control active round for head of department / admins */}
                   {season.is_active === 1 && canManageSeason && (
                     <div className="mt-4 pt-4 border-t border-[#1f2937] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f172a] p-3 rounded-xl">
                       <span className="text-xs text-slate-300 font-medium">🛡️ Điều khiển vòng chấm điểm:</span>
                       <div className="flex gap-2">
                         {scoringTypes.includes('don') && (
                           <button
                             onClick={() => updateActiveRound(season.id, 'don')}
                             className={`ds-btn ds-btn-xs ${season.active_round === 'don' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'}`}
                           >
                             Mở Chấm Đơn
                           </button>
                         )}
                         {scoringTypes.includes('teamwork') && (
                           <button
                             onClick={() => updateActiveRound(season.id, 'teamwork')}
                             className={`ds-btn ds-btn-xs ${season.active_round === 'teamwork' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'}`}
                           >
                             Mở Chấm Teamwork
                           </button>
                         )}
                         {scoringTypes.includes('phongvan') && (
                           <button
                             onClick={() => updateActiveRound(season.id, 'phongvan')}
                             className={`ds-btn ds-btn-xs ${season.active_round === 'phongvan' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'}`}
                           >
                             Mở Phỏng Vấn
                           </button>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
               );
             })}
           </div>
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
        {activeTab === 'scoring' && (canScore || isSuperAdmin) && currentSeason && (() => {
          const userDept = (currentUser?.deptName || currentUser?.department || '').toLowerCase().trim();
          const seasonDept = (currentSeason.department || '').toLowerCase().trim();
          const isSeasonDeptHead = isDeptHead && userDept.includes(seasonDept);
          const isRoundOpen = isSuperAdmin || isAdmin || isHRHead || isSeasonDeptHead || (currentSeason.active_round === scoringTypeFilter);

          return (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                Chấm Điểm Ứng Viên - {currentSeason.name}
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
                      {type === 'don' ? 'Đơn' : type === 'phongvan' ? 'Phỏng vấn' : 'Teamwork'}
                    </button>
                  ))}
                </div>
              )}

              {!isRoundOpen ? (
                <div className="text-center py-12 ds-card bg-[#0f172a]/50 border border-slate-800 rounded-2xl">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <h4 className="font-heading font-bold text-white text-base">Vòng Chấm Điểm Này Hiện Chưa Được Mở</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Trưởng ban hoặc Admin cần kích hoạt vòng chấm điểm này ở mục Quản lý mùa tuyển trước khi Giám khảo có thể chấm điểm.
                  </p>
                </div>
              ) : (
                <>
{/* Candidate search/filter */}
            <div className="flex gap-3">
              <div className="relative flex items-center w-full">
                <Search className="absolute left-4 w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã ứng viên, tên, hoặc lớp..."
                  value={candidateSearchQuery}
                  onChange={(e) => setCandidateSearchQuery(e.target.value)}
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
                </>
              )}
            </div>
          );
        })()}

       {/* Results Tab - for all department members */}
       {activeTab === 'results' && currentSeason && (
         <div className="space-y-4">
           <h2 className="text-xl font-bold text-white">Bảng Tổng Hợp Kết Quả - {currentSeason.name}</h2>
           <div className="ds-card overflow-hidden">
             <table className="ds-table">
               <thead>
                 <tr>
                   <th>Mã Phỏng Vấn</th>
                   <th>Họ Tên</th>
                   <th>Lớp</th>
                   <th>Ban Mong Muốn</th>
                   <th>Số Giám Khảo</th>
                   <th>Điểm TB</th>
                   <th>Tổng Điểm</th>
                   <th>Kết Quả</th>
                 </tr>
               </thead>
                <tbody>
                  {scoresSummary.map((s, idx) => {
                    const code = s.interview_code || s.candidate_code || (candidates.find(c => c.id === s.candidate_id)?.interview_code) || `PV-${String(idx + 1).padStart(2, '0')}`;
                    return (
                      <tr key={s.candidate_id}>
                        <td>
                          <span className="ds-badge ds-badge-cyan font-mono font-bold text-xs py-1 px-2.5">
                            {code}
                          </span>
                        </td>
                        <td className="font-bold text-slate-100">{s.full_name}</td>
                        <td className="text-slate-300">{s.class_name}</td>
                        <td className="text-slate-300">{s.desired_dept}</td>
                        <td className="text-slate-400 font-mono">{s.interviewer_count} GK</td>
                        <td className="text-emerald-400 font-bold font-mono">{s.avg_score}</td>
                        <td className="text-white font-mono">{s.total_score}</td>
                        <td>
                          {s.result_status === 'passed' && <span className="ds-badge ds-badge-emerald">✅ Đậu</span>}
                          {s.result_status === 'failed' && <span className="ds-badge ds-badge-rose">❌ Rớt</span>}
                          {s.result_status === 'reserve' && <span className="ds-badge ds-badge-amber">⏳ Dự bị</span>}
                          {s.result_status === 'pending' && <span className="ds-badge ds-badge-secondary">⏳ Chờ</span>}
                        </td>
                      </tr>
                    );
                  })}
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
