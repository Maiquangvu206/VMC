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
       <div className="ds-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
         <h3 className="font-heading text-xl font-bold text-white mb-4">Phân công Phỏng vấn - {candidate.full_name}</h3>
         <div className="space-y-3">
           {availableInterviewers.map(m => (
             <div key={m.id} className="ds-card p-3 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <img 
                   src={m.avatar || '/default-avatar.png'} 
                   alt={m.name} 
                   className="w-10 h-10 rounded-full object-cover border border-[var(--border-default)]"
                   onError={(e) => { e.target.src = '/default-avatar.png'; }}
                 />
                 <div>
                   <div className="font-bold text-white text-sm">{m.name}</div>
                   <div className="text-xs text-slate-400">{m.roleTitle}</div>
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
             className="ds-btn ds-btn-secondary flex-1"
           >
             Hủy
           </button>
           <button 
             onClick={onSubmit}
             disabled={loading}
             className="ds-btn ds-btn-primary flex-1"
           >
             {loading ? 'Đang lưu...' : 'Lưu Phân Công'}
           </button>
         </div>
       </div>
     </div>
  );
};
