import React, { useState, useEffect } from 'react';
import { useClub } from '../context/ClubContext';
import {
  UserPlus, ToggleLeft, ToggleRight, Plus, Edit, Trash2, Users, 
  CheckCircle, XCircle, Clock, Award, Search, Filter, Save, ChevronDown, ChevronRight,
  Star, FileText, Calendar, GraduationCap, Briefcase, AlertCircle, X
} from 'lucide-react';
import { SeasonModal } from '../components/recruitment/SeasonModal';
import { CriteriaModal } from '../components/recruitment/CriteriaModal';
import { CandidateModal } from '../components/recruitment/CandidateModal';
import { InterviewerModal } from '../components/recruitment/InterviewerModal';
import { ScoringModal } from '../components/recruitment/ScoringModal';
import { CandidateInterviewerModal } from '../components/recruitment/CandidateInterviewerModal';
import { CandidateTeamworkModal } from '../components/recruitment/CandidateTeamworkModal';
import { CandidateChallengeModal } from '../components/recruitment/CandidateChallengeModal';
import { CandidateProgressModal } from '../components/recruitment/CandidateProgressModal';

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
    currentUserRoleTitle.includes('trưởng ban') ||
    currentUserRoleTitle.includes('chủ nhiệm') ||
    currentUserRoleTitle.includes('cố vấn') ||
    currentUserRoleTitle.includes('advisor')
  );

  // Helper to check if a user is permitted to access a given season
  const canAccessSeason = (season) => {
    if (!season) return false;
    if (isSuperAdmin || isAdmin || isHRHead) return true;

    const userDept = (currentUser?.deptName || currentUser?.department || '').toLowerCase().trim();
    const seasonDept = (season.department || '').toLowerCase().trim();
    const userRoleTitle = (currentUser?.roleTitle || '').toLowerCase();
    
    // 1. BCN / Advisor always have access
    const isBCN = userRoleTitle.includes('chủ nhiệm') || userRoleTitle.includes('phó chủ nhiệm');
    const isAdvisor = userRoleTitle.includes('cố vấn') || userRoleTitle.includes('advisor');
    if (isBCN || isAdvisor) return true;

    // 2. Department member or season for all departments
    const isDeptMember = !seasonDept || seasonDept === 'tất cả' || seasonDept === 'tất cả ban' || (userDept && (userDept.includes(seasonDept) || seasonDept.includes(userDept)));
    
    // 3. Assigned scorer/interviewer
    const getInterviewerIds = (interviewerIdsVal) => {
      if (!interviewerIdsVal) return [];
      if (Array.isArray(interviewerIdsVal)) return interviewerIdsVal;
      try { return JSON.parse(interviewerIdsVal); } catch (e) { return []; }
    };
    const isAssignedScorer = getInterviewerIds(season.interviewer_ids).includes(currentUser?.id) ||
      (Array.isArray(candidates) && candidates.some(c => 
        (c.interviewer_ids || []).includes(currentUser?.id) ||
        (c.teamwork_scorer_ids || []).includes(currentUser?.id) ||
        (c.challenge_process_scorer_ids || []).includes(currentUser?.id) ||
        (c.challenge_result_scorer_ids || []).includes(currentUser?.id)
      ));

    return isDeptMember || isAssignedScorer;
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
  const [showTeamworkModal, setShowTeamworkModal] = useState(false);
  const [selectedTeamworkScorers, setSelectedTeamworkScorers] = useState([]);
  const [selectedSeasonForTeamwork, setSelectedSeasonForTeamwork] = useState(null);
  const [selectedCandidateTeamworkScorers, setSelectedCandidateTeamworkScorers] = useState([]);
  const [showCandidateInterviewerModal, setShowCandidateInterviewerModal] = useState(false);
  const [showCandidateTeamworkModal, setShowCandidateTeamworkModal] = useState(false);
  const [showCandidateChallengeModal, setShowCandidateChallengeModal] = useState(false);
  const [selectedCandidateChallengeProcessScorers, setSelectedCandidateChallengeProcessScorers] = useState([]);
  const [selectedCandidateChallengeResultScorers, setSelectedCandidateChallengeResultScorers] = useState([]);
  const [selectedCandidateChallengeTopic, setSelectedCandidateChallengeTopic] = useState('');
  const [showSeasonChallengeModal, setShowSeasonChallengeModal] = useState(false);
  const [selectedSeasonForChallenge, setSelectedSeasonForChallenge] = useState(null);
  const [selectedSeasonChallengeProcessScorers, setSelectedSeasonChallengeProcessScorers] = useState([]);
  const [selectedSeasonChallengeResultScorers, setSelectedSeasonChallengeResultScorers] = useState([]);
  const [scoringTypeFilter, setScoringTypeFilter] = useState(null);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [currentScoringCandidateIndex, setCurrentScoringCandidateIndex] = useState(0);
  const [scoringComments, setScoringComments] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressCandidate, setProgressCandidate] = useState(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [draftInfo, setDraftInfo] = useState('');

  const getCandidateStageInfo = (c) => {
    if (!c) return { label: '⏳ Đang đánh giá', round: 'Chưa mở', badgeClass: 'bg-slate-800 text-slate-400' };
    const summary = scoresSummary.find(s => 
      String(s.candidate_id) === String(c.id) || 
      String(s.candidate_id) === String(c.interview_code) ||
      String(s.interview_code) === String(c.interview_code) ||
      String(s.interview_code) === String(c.id)
    ) || {};
    const rScores = summary.round_scores || c.round_scores || {};
    const status = c.status || summary.result_status || 'pending';
    const submittedScorersMap = summary.submitted_scorers || c.submitted_scorers || {};
    const activeRound = currentSeason?.active_round || 'don';
    const isRound1Closed = activeRound !== 'don' || currentSeason?.status === 'closed' || currentSeason?.status === 'completed';

    if (status === 'passed') {
      return { label: '🎉 Đã Trúng Tuyển', round: 'Trúng Tuyển', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' };
    }
    if (status === 'failed') {
      return { label: '❌ Không Trúng Tuyển', round: 'Không Trúng Tuyển', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30' };
    }
    if (status === 'reserve') {
      return { label: '⏳ Danh Sách Dự Bị', round: 'Dự Bị', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' };
    }

    const checkFullyGraded = (rawAssignedIds, roundKey) => {
      let assigned = [];
      if (Array.isArray(rawAssignedIds)) assigned = rawAssignedIds;
      else { try { assigned = JSON.parse(rawAssignedIds); } catch (e) { assigned = []; } }
      const submitted = (submittedScorersMap[roundKey] || []).map(String);
      if (assigned.length > 0) {
        return assigned.every(id => submitted.includes(String(id)));
      }
      return rScores[roundKey] !== undefined || submitted.length > 0;
    };

    if (activeRound.includes('teamwork') || rScores.teamwork !== undefined) {
      const v4Assigned = c.teamwork_scorer_ids || summary.teamwork_scorer_ids || [];
      const isDone = checkFullyGraded(v4Assigned, 'teamwork');
      return {
        label: `👥 Vòng 4: Teamwork (${isDone ? 'Đã chấm' : 'Đang chấm'})`,
        round: 'Vòng 4: Teamwork',
        badgeClass: isDone ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30 animate-pulse'
      };
    }

    if (activeRound.includes('thuthach') || rScores.thuthach_quatrinh !== undefined || rScores.thuthach_ketqua !== undefined || rScores.thuthach !== undefined) {
      const v3Proc = c.challenge_process_scorer_ids || summary.challenge_process_scorer_ids || [];
      const v3Res = c.challenge_result_scorer_ids || summary.challenge_result_scorer_ids || [];
      const isProcDone = checkFullyGraded(v3Proc, 'thuthach_quatrinh') || checkFullyGraded(v3Proc, 'thuthach');
      const isResDone = checkFullyGraded(v3Res, 'thuthach_ketqua') || checkFullyGraded(v3Res, 'thuthach');
      const isDone = isProcDone && isResDone;
      return {
        label: `⚡ Vòng 3: Thử Thách (${isDone ? 'Đã chấm' : 'Đang chấm'})`,
        round: 'Vòng 3: Thử Thách',
        badgeClass: isDone ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
      };
    }

    if (activeRound.includes('phongvan') || rScores.phongvan !== undefined) {
      const v2Assigned = c.interviewer_ids || summary.interviewer_ids || [];
      const isDone = checkFullyGraded(v2Assigned, 'phongvan');
      return {
        label: `🎙️ Vòng 2: Phỏng Vấn (${isDone ? 'Đã chấm' : 'Đang chấm'})`,
        round: 'Vòng 2: Phỏng Vấn',
        badgeClass: isDone ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30 animate-pulse'
      };
    }

    // Default Vòng 1 (Bài Đơn): Đang chấm until Vòng 1 is stopped / closed
    const isV1Done = isRound1Closed || rScores.don !== undefined;
    return {
      label: `📝 Vòng 1: Bài Đơn (${isV1Done ? 'Đã chấm' : 'Đang chấm'})`,
      round: 'Vòng 1: Bài Đơn',
      badgeClass: isV1Done ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30 animate-pulse'
    };
  };

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
    const canScoreTeamwork = scoringTypes.includes('teamwork') && (
      (currentSeason?.interviewer_ids || []).includes(currentUser?.id) ||
      (Array.isArray(candidates) && candidates.some(c => 
        (c.teamwork_scorer_ids || []).includes(currentUser?.id) ||
        (c.interviewer_ids || []).includes(currentUser?.id)
      ))
    );
    const canScorePhongvan = scoringTypes.includes('phongvan') && (
      isBCN || isAdvisor || isDeptMember ||
      (currentSeason?.interviewer_ids || []).includes(currentUser?.id) ||
      (Array.isArray(candidates) && candidates.some(c => 
        (c.interviewer_ids || []).includes(currentUser?.id)
      ))
    );
    const canScoreChallengeProcess = scoringTypes.includes('thuthach_quatrinh') && (
      isBCN || isAdvisor || isDeptMember ||
      (Array.isArray(candidates) && candidates.some(c => 
        (c.challenge_process_scorer_ids || []).includes(currentUser?.id)
      ))
    );
    const canScoreChallengeResult = scoringTypes.includes('thuthach_ketqua') && (
      isBCN || isAdvisor || isDeptMember ||
      (Array.isArray(candidates) && candidates.some(c => 
        (c.challenge_result_scorer_ids || []).includes(currentUser?.id)
      ))
    );
    
    return canScoreDon || canScoreTeamwork || canScorePhongvan || canScoreChallengeProcess || canScoreChallengeResult;
  }, [currentSeason, currentUser, candidates]);


  // Form states
  const [seasonForm, setSeasonForm] = useState({ name: '', quota: 0, department: '', scoring_type: [] });
  const [criteriaForm, setCriteriaForm] = useState({ criteria_name: '', max_score: 10, sort_order: 0, round_type: 'teamwork' });
  const [activeCandidateDetailId, setActiveCandidateDetailId] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [questionComments, setQuestionComments] = useState({});
  const [selectedCandidateForAnswers, setSelectedCandidateForAnswers] = useState(null);
  const [candidateAnswersData, setCandidateAnswersData] = useState({});
  const [leadInterviewerId, setLeadInterviewerId] = useState(null);
  const [localSelectedQuestions, setLocalSelectedQuestions] = useState([]);
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

  // Persistent Draft Cache for Scoring (Teamwork, Challenge, Interview, Application)
  useEffect(() => {
    if (!selectedCandidate || !currentSeason || !currentUser) {
      setDraftInfo('');
      setIsDraftSaved(false);
      return;
    }

    const draftKey = `VMC_DRAFT_SCORE_${currentSeason.id}_${scoringTypeFilter || 'default'}_${selectedCandidate.id}_${currentUser.id}`;
    const savedDraftStr = localStorage.getItem(draftKey);

    if (savedDraftStr) {
      try {
        const draft = JSON.parse(savedDraftStr);
        setScoringData(draft.scoringData || {});
        setScoringComments(draft.scoringComments || '');
        setQuestionComments(draft.questionComments || {});
        if (draft.candidateAnswersData && Object.keys(draft.candidateAnswersData).length > 0) {
          setCandidateAnswersData(draft.candidateAnswersData);
        }
        setDraftInfo(draft.updatedAtText ? `Đã tải nháp tự động (${draft.updatedAtText})` : 'Đã tải nháp tự động');
        setIsDraftSaved(true);
      } catch (e) {
        console.warn('Lỗi đọc nháp:', e);
        setScoringData({});
        setScoringComments('');
        setQuestionComments({});
        setDraftInfo('');
        setIsDraftSaved(false);
      }
    } else {
      setScoringData({});
      setScoringComments('');
      setQuestionComments({});
      setDraftInfo('');
      setIsDraftSaved(false);
    }
  }, [selectedCandidate?.id, scoringTypeFilter, currentSeason?.id, currentUser?.id]);

  // Save draft to localStorage on every change to scores/comments
  useEffect(() => {
    if (!selectedCandidate || !currentSeason || !currentUser) return;

    const draftKey = `VMC_DRAFT_SCORE_${currentSeason.id}_${scoringTypeFilter || 'default'}_${selectedCandidate.id}_${currentUser.id}`;
    
    const hasScores = Object.values(scoringData).some(v => parseFloat(v) > 0);
    const hasComments = String(scoringComments || '').trim().length > 0;
    const hasQComments = Object.values(questionComments).some(v => String(v || '').trim().length > 0);

    if (hasScores || hasComments || hasQComments) {
      const nowText = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
      const draftObj = {
        scoringData,
        scoringComments,
        questionComments,
        candidateAnswersData,
        updatedAt: Date.now(),
        updatedAtText: nowText
      };
      localStorage.setItem(draftKey, JSON.stringify(draftObj));
      setIsDraftSaved(true);
      setDraftInfo(`Tự động lưu nháp lúc ${nowText}`);
    }
  }, [scoringData, scoringComments, questionComments, candidateAnswersData, selectedCandidate?.id, scoringTypeFilter, currentSeason?.id, currentUser?.id]);

  const clearCurrentCandidateDraft = () => {
    if (!selectedCandidate || !currentSeason || !currentUser) return;
    const draftKey = `VMC_DRAFT_SCORE_${currentSeason.id}_${scoringTypeFilter || 'default'}_${selectedCandidate.id}_${currentUser.id}`;
    localStorage.removeItem(draftKey);
    setScoringData({});
    setScoringComments('');
    setQuestionComments({});
    setCandidateAnswersData({});
    setIsDraftSaved(false);
    setDraftInfo('');
    showToast('🧹 Đã xóa bản nháp của ứng viên này', 'info');
  };

  // Helper for natural alphanumeric candidate sorting by interview_code / id
  const sortCandidatesByCode = (list) => {
    if (!Array.isArray(list)) return [];
    return [...list].sort((a, b) => {
      const codeA = (a.interview_code || a.id || '').toString();
      const codeB = (b.interview_code || b.id || '').toString();
      return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
    });
  };

  // Helper for sorting criteria deterministically by sort_order ASC, id ASC
  const sortCriteria = (list) => {
    if (!Array.isArray(list)) return [];
    return [...list].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || String(a.id || '').localeCompare(String(b.id || ''), undefined, { numeric: true }));
  };

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
      (c.interview_code || '').toLowerCase().includes(query) ||
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
      } else if (filterType === 'thuthach_quatrinh') {
        list = list.filter(c => (c.challenge_process_scorer_ids || []).includes(currentUser?.id));
      } else if (filterType === 'thuthach_ketqua') {
        list = list.filter(c => (c.challenge_result_scorer_ids || []).includes(currentUser?.id));
      }
    }

    const sortedList = sortCandidatesByCode(list);
    setFilteredCandidates(sortedList);

    if (sortedList.length > 0) {
      if (selectedCandidate) {
        const existingIdx = sortedList.findIndex(c => String(c.id) === String(selectedCandidate.id) || String(c.interview_code) === String(selectedCandidate.interview_code));
        if (existingIdx !== -1) {
          setCurrentScoringCandidateIndex(existingIdx);
          setSelectedCandidate(sortedList[existingIdx]);
          return;
        }
      }
      setCurrentScoringCandidateIndex(0);
      setSelectedCandidate(sortedList[0]);
    } else {
      setCurrentScoringCandidateIndex(0);
      setSelectedCandidate(null);
    }
  }, [candidates, scoringTypeFilter, candidateSearchQuery, currentSeason, currentUser]);

  // Sync candidateAnswersData when selectedCandidate changes
  useEffect(() => {
    if (selectedCandidate && selectedCandidate.application_answers) {
      try {
        const parsed = typeof selectedCandidate.application_answers === 'string'
          ? JSON.parse(selectedCandidate.application_answers)
          : selectedCandidate.application_answers;
        if (typeof parsed === 'object' && parsed !== null) {
          setCandidateAnswersData(parsed);
        } else {
          setCandidateAnswersData({ general: String(selectedCandidate.application_answers) });
        }
      } catch (e) {
        setCandidateAnswersData({ general: String(selectedCandidate.application_answers) });
      }
    } else {
      setCandidateAnswersData({});
    }
  }, [selectedCandidate?.id, selectedCandidate?.application_answers]);

  // Fetch data
  useEffect(() => {
    fetchSeasons();
  }, []);

  useEffect(() => {
    if (currentSeason) {
      fetchCriteria(currentSeason.id);
      fetchCandidates(currentSeason.id);
      fetchScoresSummary(currentSeason.id);
      if (currentUser?.id) {
        fetchSubmittedCandidates(currentSeason.id, scoringTypeFilter);
      }

      // Auto Polling every 4 seconds to sync live scores across evaluators & admin
      const intervalId = setInterval(() => {
        if (currentSeason?.id) {
          fetchCandidates(currentSeason.id);
          fetchScoresSummary(currentSeason.id);
        }
      }, 4000);

      return () => clearInterval(intervalId);
    }
  }, [currentSeason?.id, currentUser?.id, scoringTypeFilter]);

  const fetchSeasons = async () => {
    try {
      const res = await fetch('/api/recruitment/seasons', { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Filter seasons accessible by user
        const filteredSeasons = data.data.filter(s => canAccessSeason(s));
        
        setSeasons(filteredSeasons);
        const active = filteredSeasons.find(s => s.is_active === 1);
        if (active) {
          setCurrentSeason(active);
        } else if (filteredSeasons.length > 0) {
          setCurrentSeason(filteredSeasons[0]);
        } else {
          setCurrentSeason(null);
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
        setCriteria(sortCriteria(data.data));
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
        setCandidates(sortCandidatesByCode(data.data));
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

  const fetchSubmittedCandidates = async (seasonId, roundType) => {
    if (!seasonId || !currentUser?.id) return;
    const rType = roundType || scoringTypeFilter || currentSeason?.active_round || 'don';
    try {
      const res = await fetch(`/api/recruitment/scores/submitted?season_id=${seasonId}&interviewer_id=${currentUser.id}&round_type=${rType}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
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

  const assignTeamworkScorers = async (seasonId, scorerIds) => {
    try {
      const res = await fetch(`/api/recruitment/seasons/${seasonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ teamwork_scorer_ids: scorerIds })
      });
      if (res.ok) {
        showToast('✅ Đã phân công Teamwork!', 'success');
        fetchSeasons();
        setShowTeamworkModal(false);
        setSelectedTeamworkScorers([]);
      }
    } catch (e) {
      showToast('❌ Lỗi phân công Teamwork!', 'error');
    }
  };

  const assignSeasonChallengeScorers = async (seasonId, processScorerIds, resultScorerIds) => {
    try {
      const res = await fetch(`/api/recruitment/seasons/${seasonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          challenge_process_scorer_ids: processScorerIds,
          challenge_result_scorer_ids: resultScorerIds
        })
      });
      if (res.ok) {
        showToast('✅ Đã phân công Vòng Thử Thách thành công!', 'success');
        fetchSeasons();
        setShowSeasonChallengeModal(false);
        setSelectedSeasonForChallenge(null);
        setSelectedSeasonChallengeProcessScorers([]);
        setSelectedSeasonChallengeResultScorers([]);
      }
    } catch (e) {
      showToast('❌ Lỗi phân công Vòng Thử Thách!', 'error');
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
        setCriteriaForm({ criteria_name: '', max_score: 10, sort_order: 0, round_type: 'don', difficulty: 'Trung bình' });
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
        id: candidateForm.interview_code,
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
        setCandidateForm({ full_name: '', class_name: '', phone: '', email: '', desired_dept: '', notes: '', interview_code: '', application_answers: '' });
        fetchCandidates(currentSeason.id);
      } else {
        showToast('❌ Lỗi thêm ứng viên!', 'error');
      }
    } catch (e) {
      showToast('❌ Lỗi kết nối server!', 'error');
    }
    setLoading(false);
  };

  const assignCandidateToInterviewer = async (candidateId, interviewerIds, leadId) => {
    try {
      const res = await fetch(`/api/recruitment/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ interviewer_ids: interviewerIds, lead_interviewer_id: leadId })
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

  const assignCandidateChallengeScorers = async (candidateId, processScorerIds, resultScorerIds, topicVal) => {
    try {
      const res = await fetch(`/api/recruitment/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          challenge_process_scorer_ids: processScorerIds,
          challenge_result_scorer_ids: resultScorerIds,
          challenge_topic: topicVal !== undefined ? topicVal : selectedCandidateChallengeTopic
        })
      });
      if (res.ok) {
        showToast('✅ Đã phân công Vòng Thử Thách & đề thi thành công!', 'success');
        fetchCandidates(currentSeason.id);
        setSelectedCandidateChallengeProcessScorers([]);
        setSelectedCandidateChallengeResultScorers([]);
        setSelectedCandidateChallengeTopic('');
      }
    } catch (e) {
      showToast('❌ Lỗi phân công!', 'error');
    }
  };


  const saveCandidateAnswers = async () => {
    if (!selectedCandidateForAnswers) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/recruitment/candidates/${selectedCandidateForAnswers.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          application_answers: JSON.stringify(candidateAnswersData)
        })
      });
      if (res.ok) {
        showToast('✅ Đã lưu câu trả lời thành công!', 'success');
        setCandidates(prev => prev.map(c => 
          c.id === selectedCandidateForAnswers.id 
            ? { ...c, application_answers: JSON.stringify(candidateAnswersData) }
            : c
        ));
      } else {
        showToast('❌ Lỗi lưu câu trả lời!', 'error');
      }
    } catch (e) {
      showToast('❌ Lỗi kết nối!', 'error');
    }
    setLoading(false);
  };

  // Scoring operations
  const submitScores = async () => {
    if (!selectedCandidate || !currentSeason) return;
    setLoading(true);
    try {
      const activeCriteria = criteria.filter(crit => (crit.round_type || 'teamwork') === (scoringTypeFilter || 'teamwork'));
      
      // For phongvan, filter scores by selected questions only!
      const scoredCriteria = scoringTypeFilter === 'phongvan'
        ? activeCriteria.filter(c => selectedQuestions[c.id])
        : activeCriteria;

      if (scoringTypeFilter === 'phongvan' && scoredCriteria.length === 0) {
        showToast('⚠️ Vui lòng chọn ít nhất một câu hỏi để chấm điểm!', 'error');
        setLoading(false);
        return;
      }

      // Save application_answers if user typed/edited answers for 'don'
      if (scoringTypeFilter === 'don' && Object.keys(candidateAnswersData).length > 0) {
        try {
          await fetch(`/api/recruitment/candidates/${selectedCandidate.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({
              application_answers: JSON.stringify(candidateAnswersData)
            })
          });
        } catch (e) {
          console.error('Error saving application answers:', e);
        }
      }

      const scoresArray = scoredCriteria.map(c => ({
        criteria_id: c.id,
        score: scoringData[c.id] || 0,
        comments: scoringTypeFilter === 'phongvan' ? (questionComments[c.id] || '') : ''
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
        // Clear draft cache upon successful submission
        const draftKey = `VMC_DRAFT_SCORE_${currentSeason.id}_${scoringTypeFilter || 'default'}_${selectedCandidate.id}_${currentUser.id}`;
        localStorage.removeItem(draftKey);
        setIsDraftSaved(false);
        setDraftInfo('');

        showToast('✅ Đã nộp điểm thành công! Bản nháp đã được lưu chính thức.', 'success');
        setShowScoringModal(false);
        setScoringData({});
        setScoringComments('');
        setSelectedQuestions({});
        setQuestionComments({});
        setSubmittedCandidates([...submittedCandidates, selectedCandidate.id]);
        fetchSubmittedCandidates(currentSeason.id, scoringTypeFilter);
        fetchCandidates(currentSeason.id);
        fetchScoresSummary(currentSeason.id);
        
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
      const username = (m.username || '').toLowerCase().trim();
      const code = (m.memberCode || m.member_code || '').toUpperCase().trim();
      if (username === 'admin' || code === 'ADMIN') return false;

      const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase().trim();
      const deptName = (m.deptName || m.department || '').toLowerCase().trim();

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
              <>
                <button
                  onClick={() => setActiveTab('criteria')}
                  className={`ds-btn ${activeTab === 'criteria' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
                >
                  Tiêu Chí
                </button>
              </>
            )}
            
            <button
              onClick={() => setActiveTab('candidates')}
              className={`ds-btn ${activeTab === 'candidates' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
            >
              Ứng Viên
            </button>

            {(isSuperAdmin || isAdmin || isHRHead || isDeptHead) && (
              <button
                onClick={() => {
                  setActiveTab('appAnswers');
                  setSelectedCandidateForAnswers(null);
                  setCandidateAnswersData({});
                }}
                className={`ds-btn ${activeTab === 'appAnswers' ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
              >
                Nhập Bài Đơn
              </button>
            )}
            
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
                           Vòng đang mở: {(() => {
                            const act = season.active_round || 'none';
                            if (act === 'none') return '🔒 Chưa mở vòng nào';
                            const list = act === 'all' ? scoringTypes : act.split(',');
                            return list.map(r => 
                              r === 'don' ? '📝 Đơn' 
                              : r === 'phongvan' ? '🎙️ PV' 
                              : r === 'teamwork' ? '👥 TW' 
                              : r === 'thuthach_quatrinh' ? '⚡ TT Quá Trình' 
                              : r === 'thuthach_ketqua' ? '🏆 TT Kết Quả' 
                              : r
                            ).join(', ');
                          })()}
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
                       {(isSuperAdmin || isAdmin || isHRHead) && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setSelectedSeasonForInterviewers(season);
                                setSelectedInterviewers(season.interviewer_ids || []);
                                setLeadInterviewerId(season.lead_interviewer_id || null);
                                setShowInterviewerModal(true);
                              }}
                              className="ds-btn ds-btn-primary ds-btn-xs"
                              title="Phân công Phỏng vấn"
                            >
                              <Users className="w-3.5 h-3.5 mr-0.5" />PV
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSeasonForTeamwork(season);
                                setSelectedTeamworkScorers(season.teamwork_scorer_ids || []);
                                setShowTeamworkModal(true);
                              }}
                              className="ds-btn ds-btn-xs bg-slate-800 text-slate-300 border border-slate-600 hover:text-white"
                              title="Phân công Teamwork"
                            >
                              <Users className="w-3.5 h-3.5 mr-0.5" />TW
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSeasonForChallenge(season);
                                setSelectedSeasonChallengeProcessScorers(season.challenge_process_scorer_ids || []);
                                setSelectedSeasonChallengeResultScorers(season.challenge_result_scorer_ids || []);
                                setShowSeasonChallengeModal(true);
                              }}
                              className="ds-btn ds-btn-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                              title="Phân công Vòng Thử Thách (Chấm Quá trình & Kết quả)"
                            >
                              <Users className="w-3.5 h-3.5 mr-0.5" />TT
                            </button>
                          </div>
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
                    {season.is_active === 1 && canManageSeason && (() => {
                      const active = season.active_round || 'none';
                      const openRounds = active === 'all' ? scoringTypes : (active === 'none' ? [] : active.split(','));
                      const donOpen = openRounds.includes('don');
                      const pvOpen = openRounds.includes('phongvan');
                      const twOpen = openRounds.includes('teamwork');
                      const ttQuatrinhOpen = openRounds.includes('thuthach_quatrinh');
                      const ttKetquaOpen = openRounds.includes('thuthach_ketqua');

                      // Toggle a round on or off with sequential rules:
                      // - OPEN: only allowed if the PREVIOUS round is currently open
                      // - CLOSE: always allowed regardless of other rounds
                      // - RE-OPEN backward: blocked if any LATER round is currently open
                      const toggleRound = (round) => {
                        let next = [...openRounds];
                        if (next.includes(round)) {
                          // Close: always allowed
                          next = next.filter(r => r !== round);
                        } else {
                          // Open: only if prerequisite is met
                          // don: can open only if phongvan is NOT open (no going backward)
                          // phongvan: can open only if don is currently open
                          // teamwork: can open only if phongvan is currently open
                          if (round === 'don' && pvOpen) return; // blocked: phongvan already open
                          if (round === 'phongvan' && !donOpen) return; // blocked: don not open yet
                          if (round === 'phongvan' && twOpen) return; // blocked: teamwork already open
                          if (round === 'teamwork' && !pvOpen) return; // blocked: phongvan not open yet
                          next.push(round);
                        }
                        const val = next.length === 0 ? 'none' : next.join(',');
                        updateActiveRound(season.id, val);
                      };

                      const roundBtn = (key, emoji, label, isOpen, disabled, disabledReason, color) => (
                        <button
                          onClick={() => toggleRound(key)}
                          disabled={disabled}
                          title={disabled ? disabledReason : (isOpen ? `Đang mở — nhấn để đóng ${label}` : `Mở ${label}`)}
                          className={`ds-btn ds-btn-xs transition-all ${
                            isOpen
                              ? `${color} text-white`
                              : disabled
                              ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-40'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                          }`}
                        >
                          {emoji} {isOpen ? `✓ ${label}` : label}
                        </button>
                      );

                      return (
                        <div className="mt-4 pt-4 border-t border-[#1f2937] bg-[#0f172a] p-3 rounded-xl space-y-2">
                          <span className="text-xs text-slate-300 font-medium">🛡️ Điều khiển vòng chấm điểm:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {scoringTypes.includes('don') && roundBtn(
                              'don', '📝', 'Đơn', donOpen,
                              !donOpen && pvOpen, // can't re-open don if phongvan is already open
                              'Không thể mở lại Vòng Đơn khi Phỏng Vấn đang mở',
                              'bg-amber-600'
                            )}
                            {scoringTypes.includes('phongvan') && roundBtn(
                              'phongvan', '🎙️', 'PV', pvOpen,
                              !pvOpen && (!donOpen || twOpen), // can't open if don not open, or if teamwork open (backward)
                              !donOpen ? 'Cần mở Vòng Đơn trước' : 'Không thể mở lại PV khi Teamwork đang mở',
                              'bg-blue-600'
                            )}
                            {scoringTypes.includes('teamwork') && roundBtn(
                              'teamwork', '👥', 'TW', twOpen,
                              !twOpen && !pvOpen,
                              'Cần mở Vòng Phỏng Vấn trước',
                              'bg-emerald-600'
                            )}
                            {(scoringTypes.includes('thuthach_quatrinh') || scoringTypes.includes('thuthach')) && roundBtn(
                              'thuthach_quatrinh', '⚡', 'TT Quá Trình', ttQuatrinhOpen,
                              false,
                              '',
                              'bg-amber-500'
                            )}
                            {(scoringTypes.includes('thuthach_ketqua') || scoringTypes.includes('thuthach')) && roundBtn(
                              'thuthach_ketqua', '🏆', 'TT Kết Quả', ttKetquaOpen,
                              false,
                              '',
                              'bg-purple-600'
                            )}
                            <div className="h-5 border-l border-slate-700 mx-0.5" />
                            <button
                              onClick={() => updateActiveRound(season.id, scoringTypes.join(','))}
                              className="ds-btn ds-btn-xs bg-violet-700 text-white hover:bg-violet-600"
                              title="Mở tất cả vòng cùng lúc"
                            >
                              ⚡ Mở Cả (${scoringTypes.length})
                            </button>
                            <button
                              onClick={() => updateActiveRound(season.id, 'none')}
                              className="ds-btn ds-btn-xs bg-slate-900 text-rose-400 border border-rose-800 hover:bg-rose-900"
                              title="Tắt tất cả vòng chấm"
                            >
                              🔒 Tắt Tất Cả
                            </button>
                          </div>
                          {openRounds.length > 0 && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              Đang mở: {openRounds.map(r => r === 'don' ? '📝 Đơn' : r === 'phongvan' ? '🎙️ PV' : r === 'teamwork' ? '👥 TW' : r === 'thuthach_quatrinh' ? '⚡ TT Quá Trình' : r === 'thuthach_ketqua' ? '🏆 TT Kết Quả' : r).join(' → ')}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        )}

       {/* Criteria Tab - grouped by round */}
       {activeTab === 'criteria' && currentSeason && (isSuperAdmin || isAdmin || isHRHead || isDeptHead) && (() => {
          const roundGroups = [
            { key: 'don', label: '📝 Vòng Đơn', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5', badge: 'bg-amber-500/20 text-amber-300' },
            { key: 'phongvan', label: '🎙️ Vòng Phỏng Vấn', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5', badge: 'bg-blue-500/20 text-blue-300' },
            { key: 'teamwork', label: '👥 Vòng Teamwork', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/20 text-emerald-300' },
            { key: 'thuthach', label: '⚡ Kho Đề Thử Thách', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5', badge: 'bg-amber-500/20 text-amber-300' },
          ];

          return (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Câu Hỏi & Tiêu Chí - {currentSeason.name}</h2>
                <button
                  onClick={() => {
                    setCriteriaForm({ criteria_name: '', max_score: 10, sort_order: 0, round_type: 'don', difficulty: 'Trung bình' });
                    setShowCriteriaModal(true);
                  }}
                  className="ds-btn ds-btn-primary"
                >
                  <Plus className="w-4 h-4" /> Thêm Câu Hỏi / Tiêu Chí
                </button>
              </div>

              {roundGroups.map(group => {
                const groupCriteria = sortCriteria(criteria.filter(c => {
                  const rt = c.round_type || 'teamwork';
                  if (group.key === 'thuthach') return rt.startsWith('thuthach');
                  return rt === group.key;
                }));

                return (
                  <div key={group.key} className={`rounded-2xl border ${group.border} ${group.bg} p-5 space-y-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-base ${group.color}`}>{group.label}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${group.badge}`}>
                          {groupCriteria.length} {group.key === 'thuthach' ? 'đề thử thách' : 'câu hỏi'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setCriteriaForm({ criteria_name: '', max_score: 10, sort_order: 0, round_type: group.key, difficulty: 'Trung bình' });
                          setShowCriteriaModal(true);
                        }}
                        className="ds-btn ds-btn-xs ds-btn-secondary border border-slate-600"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm
                      </button>
                    </div>

                    {groupCriteria.length === 0 ? (
                      <p className="text-slate-500 text-sm italic py-2">
                        {group.key === 'thuthach' ? 'Chưa có đề thử thách nào trong kho đề.' : 'Chưa có câu hỏi / tiêu chí nào cho vòng này.'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {groupCriteria.map((c, idx) => (
                          <div key={c.id} className="flex items-center justify-between gap-3 bg-[#0f172a] rounded-xl border border-[#1f2937] px-4 py-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <span className="text-slate-500 text-xs font-mono mt-0.5 shrink-0">#{idx + 1}</span>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-100 text-sm leading-snug">{c.criteria_name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {group.key === 'thuthach' ? (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      c.difficulty === 'Dễ' 
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                        : c.difficulty === 'Khó' 
                                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    }`}>
                                      Mức độ: {c.difficulty === 'Dễ' ? '🟢 Dễ' : c.difficulty === 'Khó' ? '🔴 Khó' : '🟡 Trung bình'}
                                    </span>
                                  ) : (
                                    <p className="text-slate-500 text-xs">Điểm tối đa: <span className="text-slate-300 font-medium">{c.max_score}</span></p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteCriteria(c.id)}
                              className="ds-btn ds-btn-danger ds-btn-xs shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
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
             {candidates.map(c => {
                const isDetailOpen = activeCandidateDetailId === c.id;
                return (
                  <div 
                    key={c.id} 
                    className="ds-card p-4 hover:border-slate-700 transition-all cursor-pointer"
                    onClick={() => setActiveCandidateDetailId(isDetailOpen ? null : c.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white text-lg">{c.full_name}</h3>
                        <p className="text-slate-400 text-sm">Mùa tuyển sinh: {currentSeason.name} | Mã ứng viên: <strong className="text-cyan-400 font-mono text-xs">{c.interview_code || c.id}</strong></p>

                        <p className="text-slate-500 text-xs mt-1">Ban nguyện vọng: {c.desired_dept || 'Tất cả'} (Click để xem chi tiết)</p>
                        {c.challenge_topic && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="ds-badge bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                              🎯 Đề TT: {c.challenge_topic}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {(() => {
                            const stage = getCandidateStageInfo(c);
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProgressCandidate(c);
                                  setShowProgressModal(true);
                                }}
                                className={`ds-badge text-xs font-semibold px-2.5 py-1 border rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 ${stage.badgeClass}`}
                                title="Nhấn vào đây để xem chi tiết tiến trình vòng thi của ứng viên này"
                              >
                                <span>{stage.label}</span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        {(isSuperAdmin || isAdmin || isHRHead || isDeptHead) && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedCandidate(c);
                                setSelectedCandidateInterviewers(c.interviewer_ids || []);
                                setLeadInterviewerId(c.lead_interviewer_id || null);
                                setShowCandidateInterviewerModal(true);
                              }}
                              className="ds-btn ds-btn-xs ds-btn-primary"
                              title="Phân công Phỏng Vấn cho ứng viên này"
                            >
                              <Users className="w-3.5 h-3.5 mr-1" /> PV
                            </button>

                            <button
                              onClick={() => {
                                setSelectedCandidate(c);
                                setSelectedCandidateTeamworkScorers(c.teamwork_scorer_ids || []);
                                setShowCandidateTeamworkModal(true);
                              }}
                              className="ds-btn ds-btn-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                              title="Phân công Teamwork cho ứng viên này"
                            >
                              <Users className="w-3.5 h-3.5 mr-1" /> TW
                            </button>

                            <button
                              onClick={() => {
                                setSelectedCandidate(c);
                                setSelectedCandidateChallengeTopic(c.challenge_topic || '');
                                setSelectedCandidateChallengeProcessScorers(c.challenge_process_scorer_ids || []);
                                setSelectedCandidateChallengeResultScorers(c.challenge_result_scorer_ids || []);
                                setShowCandidateChallengeModal(true);
                              }}
                              className="ds-btn ds-btn-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                              title="Phân công Vòng Thử Thách cho ứng viên này"
                            >
                              ⚡ Thử Thách
                            </button>
                          </>
                        )}
                      </div>

                    </div>

                    {/* Collapsible Candidate Info Detail block (No application answers) */}
                    {isDetailOpen && (
                      <div className="mt-4 pt-4 border-t border-[#1f2937] space-y-3 text-xs bg-[#0f172a] p-4 rounded-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-400 block mb-0.5">Mùa tuyển sinh:</span>
                            <span className="text-slate-200 font-medium">{currentSeason.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Mã ứng viên:</span>
                            <span className="text-slate-200 font-medium font-mono">{c.interview_code || c.id}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Số điện thoại:</span>
                            <span className="text-slate-200 font-medium">{c.phone || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Email:</span>
                            <span className="text-slate-200 font-medium">{c.email || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Ban mong muốn:</span>
                            <span className="text-slate-200 font-medium">{c.desired_dept || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Facebook:</span>
                            {c.facebook ? (
                              <a href={c.facebook.startsWith('http') ? c.facebook : `https://${c.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-medium flex items-center gap-1">
                                🔗 Xem trang Facebook
                              </a>
                            ) : (
                              <span className="text-slate-500 italic">Chưa cập nhật</span>
                            )}
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Trạng thái:</span>
                            <span className="text-slate-200 font-medium capitalize">{c.status}</span>
                          </div>
                        </div>
                        {c.notes && (
                          <div className="pt-2">
                            <span className="text-slate-400 block mb-1">Ghi chú tuyển sinh:</span>
                            <p className="text-slate-300 leading-relaxed bg-[#111827] p-3 rounded-lg border border-slate-800">{c.notes}</p>
                          </div>
                        )}
                        {(() => {
                          const summaryItem = scoresSummary.find(s => s.candidate_id === c.id);
                          const candComments = summaryItem?.comments || [];
                          return candComments.length > 0 ? (
                            <div className="pt-3 border-t border-slate-800/80">
                              <span className="text-amber-400 font-semibold block mb-1.5 text-xs flex items-center gap-1.5">💬 Nhận xét theo vòng ({candComments.length}):</span>
                              <div className="space-y-2">
                                {candComments.map((cmt, cIdx) => (
                                  <div key={cIdx} className="bg-[#111827] p-3 rounded-lg border border-slate-800 text-slate-300 text-xs">
                                    <div className="flex items-center text-[10px] text-slate-400 mb-1.5">
                                      <span className="ds-badge ds-badge-secondary py-0.5 px-2 text-[9.5px] uppercase font-semibold">
                                        {cmt.round_type === 'don' ? '📝 Vòng Đơn' : cmt.round_type === 'phongvan' ? '🎙️ Vòng Phỏng Vấn' : cmt.round_type === 'teamwork' ? '👥 Vòng Teamwork' : cmt.round_type === 'thuthach_quatrinh' ? '⚡ Thử Thách Quá Trình' : '🏆 Thử Thách Kết Quả'}
                                      </span>
                                    </div>
                                    <p className="italic leading-relaxed text-slate-200">"{cmt.comments}"</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null;
                        })()}

                      </div>
                    )}
                  </div>
                );
              })}
           </div>
         </div>
       )}

       {/* App Answers Tab - Nhập Bài Đơn */}
       {activeTab === 'appAnswers' && currentSeason && (isSuperAdmin || isAdmin || isHRHead || isDeptHead) && (() => {
         const donCriteria = sortCriteria(criteria.filter(c => (c.round_type || 'teamwork') === 'don'));
         return (
           <div className="space-y-4">
             <h2 className="text-xl font-bold text-white">Nhập Bài Đơn - {currentSeason.name}</h2>
             <p className="text-sm text-slate-400">Nhập câu trả lời của từng ứng viên cho các câu hỏi vòng đơn.</p>
             
             {/* Candidate selector */}
             <div className="flex flex-col sm:flex-row gap-3">
               <div className="flex-1">
                 <label className="ds-field-label mb-1">Chọn ứng viên</label>
                 <select
                   value={selectedCandidateForAnswers?.id || ''}
                   onChange={(e) => {
                     const found = candidates.find(c => c.id === e.target.value);
                     setSelectedCandidateForAnswers(found || null);
                     if (found) {
                       try {
                         const parsed = found.application_answers ? JSON.parse(found.application_answers) : {};
                         setCandidateAnswersData(typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {});
                       } catch (_) {
                         setCandidateAnswersData({});
                       }
                     } else {
                       setCandidateAnswersData({});
                     }
                   }}
                   className="ds-input bg-slate-900 border border-slate-700 text-white"
                 >
                   <option value="">-- Chọn ứng viên --</option>
                   {sortCandidatesByCode(candidates).map(c => (
                     <option key={c.id} value={c.id}>{c.full_name} ({c.interview_code || c.id})</option>
                   ))}
                 </select>
               </div>
             </div>

             {candidates.length === 0 && (
               <div className="text-center py-10 text-slate-400 text-sm">Chưa có ứng viên nào trong mùa tuyển sinh này.</div>
             )}

             {selectedCandidateForAnswers && (
               <div className="ds-card p-6 space-y-5">
                 <div className="pb-3 border-b border-[#1f2937]">
                   <h3 className="font-bold text-white text-lg">{selectedCandidateForAnswers.full_name}</h3>
                   <p className="text-slate-400 text-xs mt-0.5">Mã: {selectedCandidateForAnswers.interview_code || selectedCandidateForAnswers.id} | Ban: {selectedCandidateForAnswers.desired_dept || 'N/A'}</p>
                 </div>

                 {donCriteria.length === 0 ? (
                   <p className="text-slate-400 text-sm italic">Chưa có câu hỏi nào được thêm cho vòng đơn. Vui lòng thêm tiêu chí với loại "Vòng Đơn" ở tab Tiêu Chí.</p>
                 ) : (
                   <div className="space-y-4">
                     {donCriteria.map(crit => (
                       <div key={crit.id} className="space-y-1.5">
                         <label className="text-sm font-semibold text-slate-200">{crit.criteria_name}</label>
                         <textarea
                           value={candidateAnswersData[crit.id] || ''}
                           onChange={(e) => setCandidateAnswersData(prev => ({ ...prev, [crit.id]: e.target.value }))}
                           placeholder="Nhập câu trả lời của ứng viên..."
                           rows={4}
                           className="ds-textarea w-full text-sm leading-relaxed"
                         />
                       </div>
                     ))}
                   </div>
                 )}

                 {donCriteria.length > 0 && (
                   <div className="flex justify-end pt-2 border-t border-[#1f2937]">
                     <button
                       onClick={saveCandidateAnswers}
                       disabled={loading}
                       className="ds-btn ds-btn-primary"
                     >
                       <Save className="w-4 h-4 mr-1" />
                       {loading ? 'Đang lưu...' : 'Lưu Bài Đơn'}
                     </button>
                   </div>
                 )}
               </div>
             )}
           </div>
         );
       })()}

        {/* Scoring Tab - redesigned with candidate search and single candidate form */}
        {activeTab === 'scoring' && (canScore || isSuperAdmin) && currentSeason && (() => {

          const userDept = (currentUser?.deptName || currentUser?.department || '').toLowerCase().trim();
          const seasonDept = (currentSeason.department || '').toLowerCase().trim();
          const isSeasonDeptHead = isDeptHead && userDept.includes(seasonDept);
          const isRoundOpen = isSuperAdmin || isAdmin || isHRHead || isSeasonDeptHead || (() => {
            const active = currentSeason.active_round || 'don';
            if (active === 'all') return true;
            if (active === 'none') return false;
            return active.split(',').includes(scoringTypeFilter);
          })();

          return (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                Chấm Điểm Ứng Viên - {currentSeason.name}
              </h2>
              
              {/* Filter by scoring type if multiple are enabled */}
              {(() => {
                const rawTypes = currentSeason.scoring_type;
                let typesArr = [];
                if (Array.isArray(rawTypes)) typesArr = rawTypes;
                else if (typeof rawTypes === 'string') {
                  try {
                    const p = JSON.parse(rawTypes);
                    if (Array.isArray(p)) typesArr = p;
                    else typesArr = [rawTypes];
                  } catch { typesArr = [rawTypes]; }
                }
                const roundOrder = ['don', 'phongvan', 'thuthach_quatrinh', 'thuthach_ketqua', 'teamwork'];
                const uniqueTypes = Array.from(new Set(typesArr)).sort((a, b) => {
                  const ia = roundOrder.indexOf(a) !== -1 ? roundOrder.indexOf(a) : 99;
                  const ib = roundOrder.indexOf(b) !== -1 ? roundOrder.indexOf(b) : 99;
                  return ia - ib;
                });

                if (uniqueTypes.length <= 1) return null;

                return (
                  <div className="flex flex-wrap gap-2">
                    {uniqueTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setScoringTypeFilter(type)}
                        className={`ds-btn ds-btn-xs ${scoringTypeFilter === type ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
                      >
                        {type === 'don' ? '📝 Vòng Đơn' : type === 'phongvan' ? '🎙️ Phỏng Vấn' : type === 'thuthach_quatrinh' ? '⚡ TT Quá Trình' : type === 'thuthach_ketqua' ? '🏆 TT Kết Quả' : type === 'teamwork' ? '👥 Teamwork' : type}
                      </button>
                    ))}
                  </div>
                );
              })()}

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
               const userRoleTitle = (currentUser?.roleTitle || '').toLowerCase();
               const isBCN = userRoleTitle.includes('chủ nhiệm') || userRoleTitle.includes('phó chủ nhiệm');
               const isAdvisor = userRoleTitle.includes('cố vấn') || userRoleTitle.includes('advisor');

               if (isBCN || isAdvisor || isSuperAdmin || isAdmin || isHRHead) return true;

               if (filterType === 'don') {
                 const seasonDept = currentSeason.department?.toLowerCase() || '';
                 const userDept = (currentUser?.deptName || currentUser?.department || '').toLowerCase();
                 const isDeptMember = seasonDept && userDept.includes(seasonDept);
                 return isDeptMember;
               } else if (filterType === 'teamwork') {
                 return (c.teamwork_scorer_ids || []).includes(currentUser?.id) || 
                        (currentSeason?.interviewer_ids || []).includes(currentUser?.id);
               } else if (filterType === 'phongvan') {
                 return (c.interviewer_ids || []).includes(currentUser?.id) || 
                        (currentSeason?.interviewer_ids || []).includes(currentUser?.id);
               } else if (filterType === 'thuthach_quatrinh') {
                 return (c.challenge_process_scorer_ids || []).includes(currentUser?.id);
               } else if (filterType === 'thuthach_ketqua') {
                 return (c.challenge_result_scorer_ids || []).includes(currentUser?.id);
               }
               return false;
             })();

             
             const isSubmitted = submittedCandidates.includes(c.id);
             
             return (
               <div className="ds-card p-6">
                 {/* Candidate info */}
                 

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[var(--border-default)]">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">{c.full_name}</h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1">
                        Mã: <span className="font-mono font-bold text-cyan-400">{c.interview_code || c.id}</span> | Lớp: <span className="font-medium text-slate-200">{c.class_name}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                        Ban mong muốn: <span className="font-medium text-slate-200">{c.desired_dept}</span>
                      </p>
                    </div>
                   <div className="flex flex-wrap gap-2 items-center">
                     <select
                       value={selectedCandidate?.id || ''}
                       onChange={(e) => {
                         const idx = filteredCandidates.findIndex(cand => String(cand.id) === String(e.target.value));
                         if (idx !== -1) {
                           setCurrentScoringCandidateIndex(idx);
                           setSelectedCandidate(filteredCandidates[idx]);
                         }
                       }}
                       className="ds-input bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs py-1.5 px-3 rounded-xl cursor-pointer hover:border-slate-600 transition-colors max-w-[240px] truncate"
                       title="Chọn nhanh ứng viên để chấm"
                     >
                       {filteredCandidates.map((cand, idx) => (
                         <option key={cand.id} value={cand.id}>
                           #{idx + 1} - {cand.interview_code || cand.id} - {cand.full_name}
                         </option>
                       ))}
                     </select>

                     <button
                       onClick={() => {
                         if (currentScoringCandidateIndex > 0) {
                           const newIndex = currentScoringCandidateIndex - 1;
                           setCurrentScoringCandidateIndex(newIndex);
                           setSelectedCandidate(filteredCandidates[newIndex]);
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
                     {sortCriteria(criteria.filter(crit => (crit.round_type || 'teamwork') === (scoringTypeFilter || 'teamwork'))).map(crit => (
                       <div key={crit.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3 shadow-sm">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60 w-full">
                            <div className="flex-1 min-w-0 w-full">
                              <label className="text-slate-100 font-bold text-sm sm:text-base block leading-normal tracking-wide text-left w-full whitespace-normal break-words">
                                {crit.criteria_name}
                              </label>
                              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded bg-slate-700/60 text-slate-300 text-[11px] font-medium border border-slate-600/40">
                                Thang điểm: 0 - {crit.max_score}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                              <span className="text-xs text-slate-300 font-medium">Điểm:</span>
                              <input
                                type="number"
                                min="0"
                                max={crit.max_score}
                                value={scoringData[crit.id] ?? ''}
                                onChange={(e) => setScoringData(prev => ({
                                  ...prev,
                                  [crit.id]: parseFloat(e.target.value) || 0
                                }))}
                                placeholder="0"
                                className="ds-input w-20 sm:w-24 text-center font-bold text-base sm:text-lg text-emerald-400 bg-slate-950 border-slate-700 focus:border-emerald-500 py-1"
                              />
                            </div>
                          </div>

                         {/* Answer / Response Section based on round type */}
                          {scoringTypeFilter === 'don' && (
                            <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-700/70">
                              <div className="text-xs font-semibold text-blue-400 mb-1.5 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                                <span>Bài làm / Câu trả lời của ứng viên (từ Đơn CSDL):</span>
                              </div>
                              {(() => {
                                let candidateAnsText = '';
                                if (c.application_answers) {
                                  try {
                                    const parsed = typeof c.application_answers === 'string' ? JSON.parse(c.application_answers) : c.application_answers;
                                    if (typeof parsed === 'object' && parsed !== null) {
                                      candidateAnsText = parsed[crit.id] || parsed[crit.criteria_name] || '';
                                    } else if (typeof parsed === 'string') {
                                      candidateAnsText = parsed;
                                    }
                                  } catch (_) {
                                    candidateAnsText = c.application_answers;
                                  }
                                }
                                return candidateAnsText ? (
                                  <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed pl-5">
                                    {candidateAnsText}
                                  </p>
                                ) : (
                                  <p className="text-slate-500 text-xs italic pl-5">
                                    (Chưa có câu trả lời trong CSDL)
                                  </p>
                                );
                              })()}
                            </div>
                          )}

                          {(scoringTypeFilter === 'phongvan' || scoringTypeFilter === 'thuthach_quatrinh') && (
                            <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-700/70">
                              <div className="text-xs font-semibold text-blue-400 mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                                  <span>Ghi chú câu trả lời / Bài làm ứng viên:</span>
                                </span>
                                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                                  ✏️ Người chấm điền
                                </span>
                              </div>
                              <textarea
                                rows={3}
                                value={questionComments[crit.id] ?? candidateAnswersData[crit.id] ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestionComments(prev => ({ ...prev, [crit.id]: val }));
                                  setCandidateAnswersData(prev => ({ ...prev, [crit.id]: val }));
                                }}
                                placeholder="Nhập câu trả lời / ghi chú bài làm của ứng viên..."
                                className="ds-textarea text-xs bg-slate-950 text-slate-100 border-slate-700/80 focus:border-blue-500 w-full"
                              />
                            </div>
                          )}
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
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-[var(--border-default)]">
                        <div className="text-white font-bold text-base">
                                                     {(() => {
                             const activeCriteria = criteria.filter(crit => (crit.round_type || 'teamwork') === (scoringTypeFilter || 'teamwork'));
                             const activeCritList = scoringTypeFilter === 'phongvan'
                               ? activeCriteria.filter(crit => selectedQuestions[crit.id])
                               : activeCriteria;
                            const isDonOrTtKetqua = scoringTypeFilter === 'don' || scoringTypeFilter === 'thuthach_ketqua';
                            let sum = 0;
                            let count = 0;
                            activeCritList.forEach(crit => {
                              const val = parseFloat(scoringData[crit.id]) || 0;
                              if (isDonOrTtKetqua) {
                                sum += val;
                                count += 1;
                              } else {
                                if (val > 0) {
                                  sum += val;
                                  count += 1;
                                }
                              }
                            });
                            const avg = count > 0 ? (sum / count).toFixed(2) : '0';
                            return (
                              <div className="flex flex-wrap items-center gap-2">
                                <span>Tổng điểm: <strong className="text-emerald-400 text-lg">{sum}</strong></span>
                                <span className="text-xs text-slate-400 font-normal">
                                  (ĐTB {scoringTypeFilter === 'don' ? 'Đơn' : scoringTypeFilter === 'thuthach_ketqua' ? 'TT Kết quả' : 'vòng'}: <strong className="text-blue-400">{avg}</strong> tính trên {count} tiêu chí{isDonOrTtKetqua ? '' : ' > 0đ'})
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        <button
                          onClick={() => submitScores()}
                          className="ds-btn ds-btn-primary shrink-0"
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
       {activeTab === 'results' && currentSeason && (() => {
         const scoringTypes = (() => {
           if (!currentSeason || !currentSeason.scoring_type) return [];
           const raw = currentSeason.scoring_type;
           if (Array.isArray(raw)) return raw;
           if (typeof raw === 'string') {
             try {
               const parsed = JSON.parse(raw);
               if (Array.isArray(parsed)) return parsed;
             } catch (e) {}
             return [raw];
           }
           return [];
         })();

         const hasDon = scoringTypes.includes('don') || scoresSummary.some(s => s.round_scores?.don !== undefined);
         const hasPv = scoringTypes.includes('phongvan') || scoresSummary.some(s => s.round_scores?.phongvan !== undefined);
         const hasTw = scoringTypes.includes('teamwork') || scoresSummary.some(s => s.round_scores?.teamwork !== undefined);
         const hasTtQuatrinh = scoringTypes.includes('thuthach_quatrinh') || scoringTypes.includes('thuthach') || scoresSummary.some(s => s.round_scores?.thuthach_quatrinh !== undefined);
         const hasTtKetqua = scoringTypes.includes('thuthach_ketqua') || scoringTypes.includes('thuthach') || scoresSummary.some(s => s.round_scores?.thuthach_ketqua !== undefined);

         // Build summary list: use scoresSummary if available, else fallback to candidates list
         let summaryList = [];
         if (Array.isArray(candidates) && candidates.length > 0) {
           summaryList = candidates.map((c, idx) => {
             const matchSummary = (scoresSummary || []).find(s => 
               String(s.candidate_id) === String(c.id) || 
               String(s.candidate_id) === String(c.interview_code) ||
               String(s.interview_code) === String(c.interview_code) ||
               String(s.interview_code) === String(c.id)
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
             <div className="flex justify-between items-center flex-wrap gap-3">
               <div>
                 <h2 className="text-xl font-bold text-white">Bảng Tổng Hợp Kết Quả - {currentSeason.name}</h2>
                 <p className="text-xs text-slate-400 mt-0.5">Hiển thị chi tiết điểm trung bình từng phần, tổng điểm và xếp hạng ứng viên.</p>
               </div>
               <button
                 onClick={() => fetchScoresSummary(currentSeason.id)}
                 className="ds-btn ds-btn-secondary text-xs"
               >
                 🔄 Cập Nhật Kết Quả
               </button>
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
                     {hasTtQuatrinh && <th className="py-3 px-3 text-center text-amber-300">⚡ TT Quá Trình</th>}
                     {hasTtKetqua && <th className="py-3 px-3 text-center text-purple-300">🏆 TT Kết Quả</th>}
                     <th className="py-3 px-3 text-center">Tổng Điểm</th>
                     <th className="py-3 px-3 text-center">Kết Quả</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800/60 text-xs">
                   {summaryList.length === 0 ? (
                     <tr>
                       <td colSpan={12} className="text-center py-8 text-slate-500 italic">
                         Chưa có ứng viên nào trong mùa tuyển sinh này.
                       </td>
                     </tr>
                   ) : (
                     summaryList.map((s, idx) => {
                        const code = s.interview_code || s.candidate_code || (candidates.find(c => c.id === s.candidate_id)?.interview_code) || s.candidate_id;
                       const rScores = s.round_scores || {};
                       const getRoundScore = (rk) => {
                         if (rScores[rk] !== undefined) return rScores[rk];
                         if ((rk === 'phongvan' || rk === 'don') && rScores.teamwork !== undefined) return rScores.teamwork;
                         const vals = Object.values(rScores);
                         return vals.length > 0 ? vals[0] : undefined;
                       };
                       const displayTotal = (s.total_score && s.total_score > 0) ? s.total_score : (Object.values(rScores).length > 0 ? parseFloat(Object.values(rScores).reduce((a, b) => a + (parseFloat(b) || 0), 0).toFixed(2)) : 0);
                       
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
                                  {getRoundScore('don') !== undefined ? getRoundScore('don') : <span className="text-slate-600">-</span>}
                                </td>
                              )}
                              {hasPv && (
                                <td className="py-3 px-3 text-center font-mono text-blue-300">
                                  {getRoundScore('phongvan') !== undefined ? getRoundScore('phongvan') : <span className="text-slate-600">-</span>}
                                </td>
                              )}
                              {hasTw && (
                                <td className="py-3 px-3 text-center font-mono text-emerald-300">
                                  {getRoundScore('teamwork') !== undefined ? getRoundScore('teamwork') : <span className="text-slate-600">-</span>}
                                </td>
                              )}
                              {hasTtQuatrinh && (
                                <td className="py-3 px-3 text-center font-mono text-amber-300">
                                  {getRoundScore('thuthach_quatrinh') !== undefined ? getRoundScore('thuthach_quatrinh') : <span className="text-slate-600">-</span>}
                                </td>
                              )}
                              {hasTtKetqua && (
                                <td className="py-3 px-3 text-center font-mono text-purple-300">
                                  {getRoundScore('thuthach_ketqua') !== undefined ? getRoundScore('thuthach_ketqua') : <span className="text-slate-600">-</span>}
                                </td>
                              )}
                              <td className="py-3 px-3 text-center font-bold text-white font-mono text-sm">
                                {displayTotal}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {(() => {
                                  const candObj = candidates.find(cand => String(cand.id) === String(s.candidate_id)) || s;
                                  const stage = getCandidateStageInfo(candObj);
                                  return (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setProgressCandidate(candObj);
                                        setShowProgressModal(true);
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
       })()}

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
          setLeadInterviewerId(null);
        }}
        selectedSeason={selectedSeasonForInterviewers}
        availableInterviewers={availableInterviewers}
        selectedInterviewers={selectedInterviewers}
        setSelectedInterviewers={setSelectedInterviewers}
        leadInterviewerId={leadInterviewerId}
        setLeadInterviewerId={setLeadInterviewerId}
        onSubmit={() => assignInterviewers(selectedSeasonForInterviewers.id, selectedInterviewers, leadInterviewerId)}
        loading={loading}
      />

      <InterviewerModal
        show={showTeamworkModal}
        onClose={() => {
          setShowTeamworkModal(false);
          setSelectedTeamworkScorers([]);
          setSelectedSeasonForTeamwork(null);
        }}
        selectedSeason={selectedSeasonForTeamwork}
        availableInterviewers={availableInterviewers}
        selectedInterviewers={selectedTeamworkScorers}
        setSelectedInterviewers={setSelectedTeamworkScorers}
        onSubmit={() => assignTeamworkScorers(selectedSeasonForTeamwork.id, selectedTeamworkScorers)}
        loading={loading}
        title="Phân Công Chấm Teamwork"
        showLead={false}
      />

      <CandidateInterviewerModal
        show={showCandidateInterviewerModal}
        onClose={() => {
          setShowCandidateInterviewerModal(false);
          setSelectedCandidate(null);
          setSelectedCandidateInterviewers([]);
          setLeadInterviewerId(null);
        }}
        candidate={selectedCandidate}
        availableInterviewers={availableInterviewers}
        selectedInterviewers={selectedCandidateInterviewers}
        setSelectedInterviewers={setSelectedCandidateInterviewers}
        leadInterviewerId={leadInterviewerId}
        setLeadInterviewerId={setLeadInterviewerId}
        onSubmit={() => {
          assignCandidateToInterviewer(selectedCandidate.id, selectedCandidateInterviewers, leadInterviewerId);
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

      <CandidateChallengeModal
        show={showSeasonChallengeModal}
        onClose={() => {
          setShowSeasonChallengeModal(false);
          setSelectedSeasonForChallenge(null);
          setSelectedSeasonChallengeProcessScorers([]);
          setSelectedSeasonChallengeResultScorers([]);
        }}
        season={selectedSeasonForChallenge}
        availableInterviewers={availableInterviewers}
        selectedProcessScorers={selectedSeasonChallengeProcessScorers}
        setSelectedProcessScorers={setSelectedSeasonChallengeProcessScorers}
        selectedResultScorers={selectedSeasonChallengeResultScorers}
        setSelectedResultScorers={setSelectedSeasonChallengeResultScorers}
        onSubmit={() => {
          if (selectedSeasonForChallenge) {
            assignSeasonChallengeScorers(
              selectedSeasonForChallenge.id,
              selectedSeasonChallengeProcessScorers,
              selectedSeasonChallengeResultScorers
            );
          }
        }}
        loading={loading}
      />

      <CandidateChallengeModal
        show={showCandidateChallengeModal}
        onClose={() => {
          setShowCandidateChallengeModal(false);
          setSelectedCandidate(null);
          setSelectedCandidateChallengeProcessScorers([]);
          setSelectedCandidateChallengeResultScorers([]);
          setSelectedCandidateChallengeTopic('');
        }}
        candidate={selectedCandidate}
        availableInterviewers={availableInterviewers}
        selectedProcessScorers={selectedCandidateChallengeProcessScorers}
        setSelectedProcessScorers={setSelectedCandidateChallengeProcessScorers}
        selectedResultScorers={selectedCandidateChallengeResultScorers}
        setSelectedResultScorers={setSelectedCandidateChallengeResultScorers}
        challengeTopic={selectedCandidateChallengeTopic}
        setChallengeTopic={setSelectedCandidateChallengeTopic}
        sampleTopics={criteria.filter(crit => (crit.round_type || '').includes('thuthach'))}
        currentUser={currentUser}
        onSubmit={() => {
          assignCandidateChallengeScorers(
            selectedCandidate.id,
            selectedCandidateChallengeProcessScorers,
            selectedCandidateChallengeResultScorers,
            selectedCandidateChallengeTopic
          );
        }}
        loading={loading}
      />

      <CandidateProgressModal
        show={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        candidate={progressCandidate}
        currentSeason={currentSeason}
        scoresSummary={scoresSummary}
        members={members}
      />

    </div>
  );
};

