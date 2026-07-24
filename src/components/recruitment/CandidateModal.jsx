import React from 'react';
import { Plus, X } from 'lucide-react';

export const CandidateModal = ({ show, onClose, candidateForm, setCandidateForm, onSubmit, loading, currentSeason }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">Thêm Ứng Viên Mới</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Họ và tên</label>
            <input
              type="text"
              value={candidateForm.full_name}
              onChange={(e) => setCandidateForm({ ...candidateForm, full_name: e.target.value })}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
              placeholder="Họ tên ứng viên"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Lớp</label>
            <input
              type="text"
              value={candidateForm.class_name}
              onChange={(e) => setCandidateForm({ ...candidateForm, class_name: e.target.value })}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
              placeholder="VD: 12A1"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Số điện thoại</label>
            <input
              type="text"
              value={candidateForm.phone}
              onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
              placeholder="Số điện thoại"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Email</label>
            <input
              type="email"
              value={candidateForm.email}
              onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
              placeholder="Email"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Ban mong muốn</label>
            <input
              type="text"
              value={candidateForm.desired_dept}
              onChange={(e) => setCandidateForm({ ...candidateForm, desired_dept: e.target.value })}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
              placeholder={currentSeason?.department || 'Ban muốn tham gia'}
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Ghi chú</label>
            <textarea
              value={candidateForm.notes}
              onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
              rows="3"
              placeholder="Ghi chú về ứng viên"
            />
          </div>
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
            className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
          >
            {loading ? 'Đang thêm...' : 'Thêm Ứng Viên'}
          </button>
        </div>
      </div>
    </div>
  );
};
