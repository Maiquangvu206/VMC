import React, { useState, useEffect } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export const ScoringModal = ({ 
  show, 
  onClose, 
  candidate, 
  criteria, 
  onSubmit, 
  loading,
  currentUser,
  currentSeason,
  submittedCandidates,
  candidates,
  onNavigate
}) => {
  const [scoringData, setScoringData] = useState({});
  const [comments, setComments] = useState('');
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);

  useEffect(() => {
    if (candidate) {
      const initialScores = {};
      criteria.forEach(c => {
        initialScores[c.id] = 0;
      });
      setScoringData(initialScores);
      setComments('');
    }
  }, [candidate, criteria]);

  useEffect(() => {
    if (Array.isArray(candidates)) {
      const filtered = candidates.filter(c => 
        !submittedCandidates.includes(c.id) &&
        (c.full_name?.toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
         c.class_name?.toLowerCase().includes(candidateSearchQuery.toLowerCase()))
      );
      setFilteredCandidates(filtered);
    }
  }, [candidates, submittedCandidates, candidateSearchQuery]);

  const handleSubmit = () => {
    const scores = criteria.map(c => ({
      criteria_id: c.id,
      score: scoringData[c.id] || 0
    }));
    onSubmit(candidate.id, scores, comments);
  };

  const handleNavigate = (direction) => {
    if (onNavigate) {
      onNavigate(direction);
    }
  };

  if (!show || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Chấm Điểm - {candidate.full_name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Candidate Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm ứng viên..."
              value={candidateSearchQuery}
              onChange={(e) => setCandidateSearchQuery(e.target.value)}
              className="w-full bg-slate-800 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-700"
            />
          </div>
        </div>

        {/* Scoring Form */}
        <div className="space-y-4 mb-6">
          {criteria.map(c => (
            <div key={c.id} className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-white">{c.criteria_name}</h4>
                <span className="text-slate-400 text-sm">Max: {c.max_score}</span>
              </div>
              <input
                type="number"
                min="0"
                max={c.max_score}
                value={scoringData[c.id] || 0}
                onChange={(e) => setScoringData({ ...scoringData, [c.id]: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600"
              />
            </div>
          ))}
        </div>

        {/* Comments */}
        <div className="mb-6">
          <label className="block text-slate-300 text-sm mb-2">Nhận xét</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
            rows="3"
            placeholder="Nhận xét về ứng viên..."
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleNavigate('prev')}
            disabled={currentCandidateIndex === 0}
            className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Trước
          </button>
          <button
            onClick={() => handleNavigate('next')}
            disabled={currentCandidateIndex >= filteredCandidates.length - 1}
            className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Sau <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Đang lưu...' : 'Lưu Điểm'}
          </button>
        </div>
      </div>
    </div>
  );
};
