import React from 'react';
import { useClub } from '../context/ClubContext';
import { UserPlus, ToggleLeft, ToggleRight } from 'lucide-react';

export const InternalRecruitment = () => {
  const { currentUser, isAdmin, isHRHead, isRecruitmentSeasonActive, toggleRecruitmentSeason } = useClub();

  return (
    <div className="container py-8 space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1 flex items-center gap-3">
            <UserPlus className="text-violet-400 w-8 h-8" /> Quản Lý Tuyển Gen Nội Bộ
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hệ thống chấm điểm mù, phân công phỏng vấn và tổng hợp kết quả tuyển gen.
          </p>
        </div>

        {/* Toggle mùa tuyển — chỉ Admin/HR Head */}
        {(isAdmin || isHRHead) && (
          <button
            onClick={toggleRecruitmentSeason}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              isRecruitmentSeasonActive
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isRecruitmentSeasonActive
              ? <ToggleRight className="w-5 h-5 text-emerald-400" />
              : <ToggleLeft className="w-5 h-5 text-slate-500" />
            }
            {isRecruitmentSeasonActive ? 'Mùa Tuyển: ĐANG BẬT' : 'Mùa Tuyển: ĐÃ TẮT'}
          </button>
        )}
      </div>

      {/* Status banner */}
      <div className={`rounded-2xl border p-5 text-sm ${
        isRecruitmentSeasonActive
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
          : 'bg-slate-900/60 border-slate-800 text-slate-400'
      }`}>
        {isRecruitmentSeasonActive ? (
          <p>🟢 <strong>Mùa tuyển gen đang hoạt động.</strong> Các tính năng cấu hình tiêu chí, phân công phỏng vấn và chấm điểm sẽ được hiển thị tại đây.</p>
        ) : (
          <p>🔴 Mùa tuyển gen hiện <strong>chưa được kích hoạt</strong>. Chỉ Admin/Trưởng Ban mới thấy trang này.</p>
        )}
      </div>

      {/* Placeholder — sẽ được mở rộng thành full module */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
        <UserPlus className="w-16 h-16 text-violet-500/40" />
        <div className="text-slate-400 text-sm max-w-md">
          <p className="font-bold text-slate-300 text-base mb-2">Module đang được phát triển</p>
          <p>Các tính năng sắp ra mắt: Cấu hình tiêu chí chấm điểm, phân công Interviewer, form chấm điểm mù và bảng tổng hợp kết quả.</p>
        </div>
      </div>
    </div>
  );
};
