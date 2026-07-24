import React from 'react';
import { Plus, X } from 'lucide-react';

export const SeasonModal = ({ show, onClose, seasonForm, setSeasonForm, onSubmit, loading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Tạo Mùa Tuyển Mới</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Tên mùa tuyển</label>
            <input
              type="text"
              value={seasonForm.name}
              onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
              placeholder="VD: Tuyển Gen 6 - 2025"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Chỉ tiêu</label>
            <input
              type="number"
              value={seasonForm.quota}
              onChange={(e) => setSeasonForm({ ...seasonForm, quota: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
              placeholder="Số lượng thành viên"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Ban phụ trách</label>
            <input
              type="text"
              value={seasonForm.department}
              onChange={(e) => setSeasonForm({ ...seasonForm, department: e.target.value })}
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700"
              placeholder="VD: Ban Sản Xuất Media"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">Loại chấm điểm</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
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
                <span className="text-slate-300 text-sm">Đơn</span>
              </label>
              <label className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
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
                <span className="text-slate-300 text-sm">Teamwork</span>
              </label>
            </div>
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
            {loading ? 'Đang tạo...' : 'Tạo Mùa Tuyển'}
          </button>
        </div>
      </div>
    </div>
  );
};
