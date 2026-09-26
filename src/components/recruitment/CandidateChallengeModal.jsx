import React, { useState } from 'react';
import { X, Zap, Trophy } from 'lucide-react';

export const CandidateChallengeModal = ({ 
  show, 
  onClose, 
  candidate, 
  season,
  availableInterviewers, 
  selectedProcessScorers, 
  setSelectedProcessScorers, 
  selectedResultScorers, 
  setSelectedResultScorers,
  challengeTopic,
  setChallengeTopic,
  sampleTopics = [],
  currentUser,
  onSubmit, 
  loading 
}) => {
  const [activeSubTab, setActiveSubTab] = useState('process');

  if (!show || (!candidate && !season)) return null;

  const handleTopicSelect = (topic) => {
    if (setChallengeTopic) {
      setChallengeTopic(topic);
    }
    // Auto add currentUser as process scorer if selecting topic for candidate
    if (currentUser?.id && !selectedProcessScorers.includes(currentUser.id)) {
      setSelectedProcessScorers([...selectedProcessScorers, currentUser.id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="ds-card p-6 w-full max-w-lg max-h-[90vh] flex flex-col bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl space-y-4 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#1f2937] shrink-0">
          <div>
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              🔥 Phân Công Vòng Thử Thách
            </h3>
            <p className="text-xs text-amber-400 font-medium mt-0.5">
              {candidate ? `Ứng viên: ${candidate.full_name}` : season ? `Mùa tuyển: ${season.name}` : ''}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Topic Assignment Box */}
        {candidate && setChallengeTopic && (
          <div className="p-3 bg-[#0f172a] border border-amber-500/30 rounded-xl space-y-2 shrink-0">
            <label className="text-xs font-bold text-amber-300 block mb-1">
              🎯 Chọn Đề Thử Thách Cho Ứng Viên:
            </label>

            <select
              value={challengeTopic || ''}
              onChange={(e) => handleTopicSelect(e.target.value)}
              className="w-full bg-[#111827] border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Chọn đề từ kho đề thử thách --</option>
              {sampleTopics.map((t, idx) => {
                const name = typeof t === 'string' ? t : t.criteria_name;
                const diff = typeof t === 'object' && t.difficulty ? t.difficulty : 'Trung bình';
                const badge = diff === 'Dễ' ? '🟢 Dễ' : diff === 'Khó' ? '🔴 Khó' : '🟡 Trung bình';
                return (
                  <option key={t.id || idx} value={name}>
                    Đề {idx + 1}: {name} [{badge}]
                  </option>
                );
              })}
            </select>

            <input
              type="text"
              value={challengeTopic || ''}
              onChange={(e) => handleTopicSelect(e.target.value)}
              placeholder="Hoặc nhập đề thử thách tùy chỉnh cho ứng viên..."
              className="w-full bg-[#111827] border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        {/* Sub-tab selection */}
        <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('process')}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeSubTab === 'process'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            1. Chấm Quá Trình ({selectedProcessScorers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('result')}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeSubTab === 'result'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-purple-400" />
            2. Chấm Kết Quả ({selectedResultScorers.length})
          </button>
        </div>

        {/* Member List */}
        <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 max-h-[55vh]">
          {availableInterviewers.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs italic">
              Chưa có thành viên nào khả dụng.
            </div>
          ) : (
            availableInterviewers.map(m => {
              const currentList = activeSubTab === 'process' ? (selectedProcessScorers || []) : (selectedResultScorers || []);
              const safeList = (Array.isArray(currentList) ? currentList : []).map(id => String(id));
              const setList = activeSubTab === 'process' ? setSelectedProcessScorers : setSelectedResultScorers;
              const mIdStr = String(m.id);
              const isChecked = safeList.includes(mIdStr);

              return (
                <div 
                  key={m.id} 
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isChecked 
                      ? (activeSubTab === 'process' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-purple-500/10 border-purple-500/30')
                      : 'bg-[#0f172a] border-[#1f2937]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={m.avatar || '/default-avatar.png'} 
                      alt={m.name} 
                      className="w-9 h-9 rounded-full object-cover border border-[#1f2937] shrink-0"
                      onError={(e) => { e.target.src = '/default-avatar.png'; }}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{m.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {m.roleTitle || 'Thành viên'} • {m.deptName || m.department || 'Ban Chuyên Môn'}
                      </div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setList([...safeList, mIdStr]);
                        } else {
                          setList(safeList.filter(id => id !== mIdStr));
                        }
                      }}
                      className="sr-only peer" 
                    />
                    <div className={`w-10 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                      activeSubTab === 'process' ? 'peer-checked:bg-amber-500' : 'peer-checked:bg-purple-500'
                    }`}></div>
                  </label>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t border-[#1f2937] shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="ds-btn ds-btn-secondary text-xs flex-1"
          >
            Hủy
          </button>
          <button 
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="ds-btn ds-btn-primary text-xs flex-1"
          >
            {loading ? 'Đang lưu...' : 'Lưu Phân Công Thử Thách'}
          </button>
        </div>
      </div>
    </div>
  );
};
