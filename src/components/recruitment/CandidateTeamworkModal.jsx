import React from 'react';
import { X, Save } from 'lucide-react';

export const CandidateTeamworkModal = ({ 
  show, 
  onClose, 
  candidate, 
  availableInterviewers = [], 
  selectedScorers = [], 
  setSelectedScorers, 
  onSubmit, 
  loading 
}) => {
  if (!show || !candidate) return null;

  const targetDept = (candidate?.desired_dept || '').toLowerCase().trim();
  const safeSelected = (Array.isArray(selectedScorers) ? selectedScorers : []).map(id => String(id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
       <div className="ds-card p-6 w-full max-w-lg max-h-[90vh] flex flex-col bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl space-y-4 overflow-hidden">
         <div className="flex justify-between items-center pb-2 border-b border-[#1f2937] shrink-0">
           <h3 className="font-heading text-lg font-bold text-white">Phân công Chấm Teamwork</h3>
           <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
             <X className="w-5 h-5" />
           </button>
         </div>
         <p className="text-xs text-purple-400 font-medium shrink-0">Ứng viên: {candidate.full_name}</p>

         <div className="space-y-3 overflow-y-auto flex-1 pr-1 max-h-[60vh]">
           {availableInterviewers.map(m => {
             const memberDept = (m.deptName || m.department || '').toLowerCase().trim();
             const isDeptInCharge = targetDept && (memberDept.includes(targetDept) || targetDept.includes(memberDept));
             const mIdStr = String(m.id);
             const isChecked = safeSelected.includes(mIdStr);

             return (
               <div key={m.id} className="ds-card p-3 flex items-center justify-between bg-[#0f172a] border-[#1f2937]">
                 <div className="flex items-center gap-3">
                   <img 
                     src={m.avatar || '/default-avatar.png'} 
                     alt={m.name} 
                     className="w-10 h-10 rounded-full object-cover border border-[var(--border-default)]"
                     onError={(e) => { e.target.src = '/default-avatar.png'; }}
                   />
                   <div>
                     <div className="font-bold text-white text-sm flex items-center gap-1.5">
                       <span>{m.name}</span>
                       {isDeptInCharge && (
                         <span className="ds-badge ds-badge-blue text-[9px] py-0.5 px-1.5">
                           ⭐ Ban Phụ Trách
                         </span>
                       )}
                     </div>
                     <div className="text-xs text-slate-400">{m.roleTitle}</div>
                   </div>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={isChecked} 
                     onChange={(e) => {
                       if (e.target.checked) {
                         setSelectedScorers([...safeSelected, mIdStr]);
                       } else {
                         setSelectedScorers(safeSelected.filter(id => id !== mIdStr));
                       }
                     }}
                     className="sr-only peer" 
                   />
                   <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-purple-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                 </label>
               </div>
             );
           })}
         </div>
         <div className="flex gap-3 pt-4 border-t border-[#1f2937] shrink-0">
           <button 
             type="button"
             onClick={onClose}
             className="ds-btn ds-btn-secondary flex-1"
           >
             Hủy
           </button>
           <button 
             type="button"
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

