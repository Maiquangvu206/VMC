import React from 'react';
import { Plus, X } from 'lucide-react';

export const CriteriaModal = ({ show, onClose, criteriaForm, setCriteriaForm, onSubmit, loading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Thêm Tiêu Chí Chấm Điểm</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Tên tiêu chí</label>
            <input
              type="text"
              value={criteriaForm.criteria_name}
              onChange={(e) => setCriteriaForm({ ...criteriaForm, criteria_name: e.target.value })}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
              placeholder="VD: Thái độ, Kỹ năng giao tiếp"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Điểm tối đa</label>
            <input
              type="number"
              value={criteriaForm.max_score}
              onChange={(e) => setCriteriaForm({ ...criteriaForm, max_score: parseInt(e.target.value) || 10 })}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
              placeholder="10"
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
            {loading ? 'Đang thêm...' : 'Thêm Tiêu Chí'}
          </button>
        </div>
      </div>
    </div>
  );
};
