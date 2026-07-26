import React from 'react';
import { Plus, X } from 'lucide-react';

export const SeasonModal = ({ show, onClose, seasonForm, setSeasonForm, onSubmit, loading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
       <div className="ds-card p-6 w-full max-w-md">
         <h3 className="font-heading text-xl font-bold text-white mb-4">Tạo Mùa Tuyển Mới</h3>
         <div className="space-y-4">
           <div>
             <label className="ds-field-label">Tên mùa tuyển</label>
             <input
               type="text"
               value={seasonForm.name}
               onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
               className="ds-input"
               placeholder="VD: Tuyển Gen 6 - 2025"
             />
           </div>
           <div>
             <label className="ds-field-label">Chỉ tiêu</label>
             <input
               type="number"
               value={seasonForm.quota}
               onChange={(e) => setSeasonForm({ ...seasonForm, quota: parseInt(e.target.value) || 0 })}
               className="ds-input"
               placeholder="Số lượng thành viên"
             />
           </div>
           <div>
             <label className="ds-field-label">Ban phụ trách</label>
             <input
               type="text"
               value={seasonForm.department}
               onChange={(e) => setSeasonForm({ ...seasonForm, department: e.target.value })}
               className="ds-input"
               placeholder="VD: Ban Sản Xuất Media"
             />
           </div>
           <div>
             <label className="ds-field-label">Loại chấm điểm</label>
             <div className="flex gap-2">
                <label className="ds-card p-3 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seasonForm.scoring_type.includes('don')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSeasonForm({ ...seasonForm, scoring_type: [...seasonForm.scoring_type, 'don'] });
                      } else {
                        setSeasonForm({ ...seasonForm, scoring_type: seasonForm.scoring_type.filter(t => t !== 'don') });
                      }
                    }}
                  />
                  <span className="text-sm text-slate-300">Đơn</span>
                </label>
                <label className="ds-card p-3 flex items-center gap-2 cursor-pointer">
                 <input
                   type="checkbox"
                   checked={seasonForm.scoring_type.includes('teamwork')}
                   onChange={(e) => {
                     if (e.target.checked) {
                       setSeasonForm({ ...seasonForm, scoring_type: [...seasonForm.scoring_type, 'teamwork'] });
                     } else {
                       setSeasonForm({ ...seasonForm, scoring_type: seasonForm.scoring_type.filter(t => t !== 'teamwork') });
                     }
                   }}
                 />
                 <span className="text-sm text-slate-300">Teamwork</span>
               </label>
             </div>
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
             {loading ? 'Đang tạo...' : 'Tạo Mùa Tuyển'}
           </button>
         </div>
       </div>
     </div>
  );
};
