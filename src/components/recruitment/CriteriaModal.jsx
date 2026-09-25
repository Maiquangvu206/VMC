import React from 'react';
import { Plus, X } from 'lucide-react';

export const CriteriaModal = ({ show, onClose, criteriaForm, setCriteriaForm, onSubmit, loading }) => {
  if (!show) return null;

  const isChallenge = (criteriaForm.round_type || '').startsWith('thuthach');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="ds-card p-6 w-full max-w-md bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#1f2937]">
          <h3 className="font-heading text-lg font-bold text-white">
            {isChallenge ? 'Thêm Đề Thử Thách Mới' : 'Thêm Tiêu Chí Chấm Điểm'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="ds-field-label">{isChallenge ? 'Tên đề thử thách *' : 'Tên tiêu chí *'}</label>
            <input
              type="text"
              required
              value={criteriaForm.criteria_name || ''}
              onChange={(e) => setCriteriaForm({ ...criteriaForm, criteria_name: e.target.value })}
              className="ds-input w-full"
              placeholder={isChallenge ? 'VD: Thiết kế Poster Mùa Tuyển, Viết bài Content PR...' : 'VD: Thái độ, Kỹ năng giao tiếp'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="ds-field-label">Vòng / Mục</label>
              <select
                value={criteriaForm.round_type || 'teamwork'}
                onChange={(e) => setCriteriaForm({ ...criteriaForm, round_type: e.target.value })}
                className="ds-input w-full bg-slate-900 border border-slate-700 text-white font-medium"
              >
                <option value="don">📝 Vòng Đơn</option>
                <option value="phongvan">🎙️ Vòng Phỏng Vấn</option>
                <option value="thuthach">⚡ Kho Đề Thử Thách</option>
                <option value="teamwork">👥 Vòng Teamwork</option>
              </select>
            </div>

            {isChallenge ? (
              <div>
                <label className="ds-field-label">Mức độ đề</label>
                <select
                  value={criteriaForm.difficulty || 'Trung bình'}
                  onChange={(e) => setCriteriaForm({ ...criteriaForm, difficulty: e.target.value })}
                  className="ds-input w-full bg-slate-900 border border-slate-700 text-amber-300 font-bold"
                >
                  <option value="Dễ">🟢 Dễ</option>
                  <option value="Trung bình">🟡 Trung bình</option>
                  <option value="Khó">🔴 Khó</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="ds-field-label">Điểm tối đa</label>
                <input
                  type="number"
                  min="1"
                  value={criteriaForm.max_score || 10}
                  onChange={(e) => setCriteriaForm({ ...criteriaForm, max_score: parseInt(e.target.value) || 10 })}
                  className="ds-input w-full"
                  placeholder="10"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-[#1f2937]">
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
            {loading ? 'Đang thêm...' : isChallenge ? 'Thêm Đề Thử Thách' : 'Thêm Tiêu Chí'}
          </button>
        </div>
      </div>
    </div>
  );
};
