import React from 'react';
import { Plus, X } from 'lucide-react';

export const CandidateModal = ({ show, onClose, candidateForm, setCandidateForm, onSubmit, loading, currentSeason }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
       <div className="ds-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
         <h3 className="font-heading text-xl font-bold text-white mb-4">Thêm Ứng Viên Mới</h3>
         <div className="space-y-4">
           <div>
             <label className="ds-field-label">Họ và tên</label>
             <input
               type="text"
               value={candidateForm.full_name}
               onChange={(e) => setCandidateForm({ ...candidateForm, full_name: e.target.value })}
               className="ds-input"
               placeholder="Họ tên ứng viên"
             />
           </div>
           <div>
             <label className="ds-field-label">Lớp</label>
             <input
               type="text"
               value={candidateForm.class_name}
               onChange={(e) => setCandidateForm({ ...candidateForm, class_name: e.target.value })}
               className="ds-input"
               placeholder="VD: 12A1"
             />
           </div>
           <div>
             <label className="ds-field-label">Số điện thoại</label>
             <input
               type="text"
               value={candidateForm.phone}
               onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
               className="ds-input"
               placeholder="Số điện thoại"
             />
           </div>
           <div>
             <label className="ds-field-label">Email</label>
             <input
               type="email"
               value={candidateForm.email}
               onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
               className="ds-input"
               placeholder="Email"
             />
           </div>
           <div>
             <label className="ds-field-label">Ban mong muốn</label>
             <input
               type="text"
               value={candidateForm.desired_dept}
               onChange={(e) => setCandidateForm({ ...candidateForm, desired_dept: e.target.value })}
               className="ds-input"
               placeholder={currentSeason?.department || 'Ban muốn tham gia'}
             />
           </div>
           <div>
             <label className="ds-field-label">Ghi chú</label>
             <textarea
               value={candidateForm.notes}
               onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
               className="ds-textarea"
               rows="3"
               placeholder="Ghi chú về ứng viên"
             />
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
             {loading ? 'Đang thêm...' : 'Thêm Ứng Viên'}
           </button>
         </div>
       </div>
     </div>
  );
};
