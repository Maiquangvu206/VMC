import React from 'react';
import { X, Sparkles, Calendar, Award } from 'lucide-react';

export const MilestoneModal = ({ show, onClose, msTitle, setMsTitle, msDate, setMsDate, msBadge, setMsBadge, onSubmit, loading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
       <div className="ds-card p-6 max-w-md w-full shadow-2xl space-y-4">
         <div className="flex justify-between items-center pb-2 border-b border-[var(--border-default)]">
           <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-amber-400" />
             <span>Thêm Cột Mốc Lịch Sử Mới</span>
           </h3>
           <button onClick={onClose} className="ds-btn ds-btn-ghost p-1">
             <X className="w-5 h-5" />
           </button>
         </div>

         <div className="space-y-3">
           <div>
             <label className="ds-field-label">Tiêu đề cột mốc</label>
             <input
               type="text"
               value={msTitle}
               onChange={(e) => setMsTitle(e.target.value)}
               className="ds-input"
               placeholder="VD: Hoàn thành dự án X, Tham gia sự kiện Y..."
             />
           </div>

           <div>
             <label className="ds-field-label">Ngày đạt được</label>
             <div className="relative">
               <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input
                 type="text"
                 value={msDate}
                 onChange={(e) => setMsDate(e.target.value)}
                 className="ds-input pl-10"
                 placeholder="DD/MM/YYYY"
               />
             </div>
           </div>

           <div>
             <label className="ds-field-label">Hiển thị huy hiệu</label>
             <div className="relative">
               <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input
                 type="text"
                 value={msBadge}
                 onChange={(e) => setMsBadge(e.target.value)}
                 className="ds-input pl-10"
                 placeholder="VD: [Cột mốc], [Thành tích]..."
               />
             </div>
           </div>
         </div>

         <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-default)]">
           <button onClick={onClose} className="ds-btn ds-btn-secondary ds-btn-xs">Hủy</button>
           <button onClick={onSubmit} disabled={loading} className="ds-btn ds-btn-primary ds-btn-xs">
             {loading ? 'Đang thêm...' : 'Xác Nhận Thêm'}
           </button>
         </div>
       </div>
     </div>
  );
};
