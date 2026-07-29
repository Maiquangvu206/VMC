import React from 'react';
import { Plus, X } from 'lucide-react';

export const CriteriaModal = ({ show, onClose, criteriaForm, setCriteriaForm, onSubmit, loading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
       <div className="ds-card p-6 w-full max-w-md">
         <h3 className="font-heading text-xl font-bold text-white mb-4">Thêm Tiêu Chí Chấm Điểm</h3>
         <div className="space-y-4">
           <div>
             <label className="ds-field-label">Tên tiêu chí</label>
             <input
               type="text"
               value={criteriaForm.criteria_name}
               onChange={(e) => setCriteriaForm({ ...criteriaForm, criteria_name: e.target.value })}
               className="ds-input"
               placeholder="VD: Thái độ, Kỹ năng giao tiếp"
             />
           </div>
           <div>
             <label className="ds-field-label">Điểm tối đa</label>
             <input
               type="number"
               value={criteriaForm.max_score}
               onChange={(e) => setCriteriaForm({ ...criteriaForm, max_score: parseInt(e.target.value) || 10 })}
               className="ds-input"
               placeholder="10"
             />
           </div>
           <div>
             <label className="ds-field-label">Vòng Chấm Điểm</label>
             <select
               value={criteriaForm.round_type || 'teamwork'}
               onChange={(e) => setCriteriaForm({ ...criteriaForm, round_type: e.target.value })}
               className="ds-input bg-slate-900 border border-slate-700 text-white"
             >
               <option value="don">📝 Vòng Đơn</option>
               <option value="teamwork">👥 Vòng Teamwork</option>
               <option value="phongvan">🎙️ Vòng Phỏng Vấn</option>
             </select>
           </div>
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
             {loading ? 'Đang thêm...' : 'Thêm Tiêu Chí'}
           </button>
         </div>
       </div>
     </div>
  );
};
