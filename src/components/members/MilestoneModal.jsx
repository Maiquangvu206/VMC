import React from 'react';
import { X, Sparkles, Calendar, Award } from 'lucide-react';

export const MilestoneModal = ({ show, onClose, msTitle, setMsTitle, msDate, setMsDate, msBadge, setMsBadge, onSubmit, loading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Thêm Cột Mốc Lịch Sử Mới</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Tiêu đề cột mốc</label>
            <input
              type="text"
              value={msTitle}
              onChange={(e) => setMsTitle(e.target.value)}
              className="w-full bg-slate-800 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
              placeholder="VD: Hoàn thành dự án X, Tham gia sự kiện Y..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Ngày đạt được</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={msDate}
                onChange={(e) => setMsDate(e.target.value)}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Hiển thị huy hiệu</label>
            <div className="relative">
              <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={msBadge}
                onChange={(e) => setMsBadge(e.target.value)}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                placeholder="VD: [Cột mốc], [Thành tích]..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="btn-secondary text-xs px-4 py-2">Hủy</button>
          <button onClick={onSubmit} disabled={loading} className="btn-primary text-xs px-4 py-2 disabled:opacity-50">
            {loading ? 'Đang thêm...' : 'Xác Nhận Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
};
