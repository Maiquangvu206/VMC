import React from 'react';
import { Plus, X } from 'lucide-react';

export const SeasonModal = ({ show, onClose, seasonForm, setSeasonForm, onSubmit, loading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="ds-card p-6 w-full max-w-md bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#1f2937]">
          <h3 className="font-heading text-lg font-bold text-white">Tạo Mùa Tuyển Mới</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="ds-field-label">Tên mùa tuyển *</label>
            <input
              type="text"
              value={seasonForm.name}
              onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
              className="ds-input"
              placeholder="VD: Tuyển Gen 6 - 2025"
            />
          </div>

          <div>
            <label className="ds-field-label">Chỉ tiêu *</label>
            <input
              type="number"
              value={seasonForm.quota}
              onChange={(e) => setSeasonForm({ ...seasonForm, quota: parseInt(e.target.value) || 0 })}
              className="ds-input"
              placeholder="Số lượng thành viên"
            />
          </div>

          <div>
            <label className="ds-field-label">Ban phụ trách *</label>
            <select
              value={seasonForm.department}
              onChange={(e) => setSeasonForm({ ...seasonForm, department: e.target.value })}
              className="ds-input ds-select"
            >
              <option value="" disabled hidden>-- Chọn Ban Phụ Trách --</option>
              <option value="Ban Sản Xuất">Ban Sản Xuất</option>
              <option value="Ban Nội Dung - Phát Thanh">Ban Nội Dung - Phát Thanh</option>
              <option value="Ban Đối Ngoại - Nhân Sự">Ban Đối Ngoại - Nhân Sự</option>
            </select>
          </div>

          <div>
            <label className="ds-field-label">Loại chấm điểm *</label>
            <div className="flex flex-wrap gap-2 pt-1">
              <label className="ds-card p-3 flex items-center gap-2 cursor-pointer bg-[#0f172a] border border-[#1f2937] hover:border-slate-700 rounded-xl flex-1 justify-center">
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
                <span className="text-xs font-semibold text-slate-200">Đơn</span>
              </label>

              <label className="ds-card p-3 flex items-center gap-2 cursor-pointer bg-[#0f172a] border border-[#1f2937] hover:border-slate-700 rounded-xl flex-1 justify-center">
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
                <span className="text-xs font-semibold text-slate-200">Teamwork</span>
              </label>

              <label className="ds-card p-3 flex items-center gap-2 cursor-pointer bg-[#0f172a] border border-[#1f2937] hover:border-slate-700 rounded-xl flex-1 justify-center">
                <input
                  type="checkbox"
                  checked={seasonForm.scoring_type.includes('phongvan')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSeasonForm({ ...seasonForm, scoring_type: [...seasonForm.scoring_type, 'phongvan'] });
                    } else {
                      setSeasonForm({ ...seasonForm, scoring_type: seasonForm.scoring_type.filter(t => t !== 'phongvan') });
                    }
                  }}
                />
                <span className="text-xs font-semibold text-slate-200">Phỏng vấn</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-[#1f2937]">
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
            {loading ? 'Đang tạo...' : 'Tạo Mùa Tuyển'}
          </button>
        </div>
      </div>
    </div>
  );
};
