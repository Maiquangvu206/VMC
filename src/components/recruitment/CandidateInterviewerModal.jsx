import React from 'react';
import { X, Save } from 'lucide-react';

export const CandidateInterviewerModal = ({ 
  show, 
  onClose, 
  candidate, 
  availableInterviewers, 
  selectedInterviewers, 
  setSelectedInterviewers, 
  onSubmit, 
  loading 
}) => {
  if (!show || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">Phân công Phỏng vấn - {candidate.full_name}</h3>
        <div className="space-y-3">
          {availableInterviewers.map(m => (
            <div key={m.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <img 
                  src={m.avatar || '/default-avatar.png'} 
                  alt={m.name} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-600"
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
                <div>
                  <div className="font-bold text-white text-sm">{m.name}</div>
                  <div className="text-slate-400 text-xs">{m.roleTitle}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
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
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-blue-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
          >
            Hủy
          </button>
          <button 
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu Phân Công'}
          </button>
        </div>
      </div>
    </div>
  );
};
