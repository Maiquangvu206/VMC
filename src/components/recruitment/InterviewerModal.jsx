import React from 'react';
import { X, Save } from 'lucide-react';

export const InterviewerModal = ({ 
  show, 
  onClose, 
  selectedSeason, 
  availableInterviewers, 
  selectedInterviewers, 
  setSelectedInterviewers, 
  leadInterviewerId,
  setLeadInterviewerId,
  onSubmit, 
  loading,
  title = "Phân Công Phỏng Vấn",
  showLead = true
}) => {
  if (!show || !selectedSeason) return null;

  const targetDept = (selectedSeason?.department || '').toLowerCase().trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="ds-card p-6 w-full max-w-lg max-h-[90vh] flex flex-col bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl space-y-4 overflow-hidden">
        <div className="flex justify-between items-center pb-2 border-b border-[#1f2937] shrink-0">
          <div>
            <h3 className="font-heading text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-blue-400 font-medium mt-0.5">{selectedSeason.name} • {selectedSeason.department || 'Tất cả ban'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-[50vh]">
          {availableInterviewers.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4 text-center">Chưa tìm thấy thành viên Ban Cố Vấn, Ban Chủ Nhiệm hoặc Ban Phụ Trách.</p>
          ) : (
            availableInterviewers.map(m => {
              const memberDept = (m.deptName || m.department || '').toLowerCase().trim();
              const isDeptInCharge = targetDept && (memberDept.includes(targetDept) || targetDept.includes(memberDept));

              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isDeptInCharge
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-[#0f172a] border-[#1f2937]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
                      alt={m.name} 
                      className="w-10 h-10 rounded-full object-cover border border-blue-500/30 shrink-0"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'; }}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {isDeptInCharge && (
                          <span className="ds-badge ds-badge-blue text-[9px] py-0.5 px-1.5">
                            ⭐ Ban Phụ Trách
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {m.roleTitle || 'Thành Viên'} • {m.deptName || m.department || 'Ban Chuyên Môn'}
                      </div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      checked={selectedInterviewers.includes(m.id)} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInterviewers([...selectedInterviewers, m.id]);
                        } else {
                          setSelectedInterviewers(selectedInterviewers.filter(id => id !== m.id));
                        }
                      }}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-blue-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
              );
            })
          )}
        </div>

        {/* Lead Interviewer Selection */}
        {showLead && selectedInterviewers.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-3 border-t border-[#1f2937] shrink-0">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              👑 Người phỏng vấn chính *
            </label>
            <select
              value={leadInterviewerId || ''}
              onChange={(e) => setLeadInterviewerId(e.target.value)}
              className="ds-input bg-slate-900 border border-slate-700 text-white text-xs py-2"
              required
            >
              <option value="">-- Chọn người phỏng vấn chính --</option>
              {selectedInterviewers.map(id => {
                const m = availableInterviewers.find(x => x.id === id);
                return (
                  <option key={id} value={id}>{m ? m.name : id}</option>
                );
              })}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-[#1f2937] shrink-0">
          <button 
            onClick={onClose}
            className="ds-btn ds-btn-secondary text-xs flex-1"
          >
            Hủy
          </button>
          <button 
            onClick={onSubmit}
            disabled={loading}
            className="ds-btn ds-btn-primary text-xs flex-1"
          >
            {loading ? 'Đang lưu...' : 'Lưu Phân Công'}
          </button>
        </div>
      </div>
    </div>
  );
};
