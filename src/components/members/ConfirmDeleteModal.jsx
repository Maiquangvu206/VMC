import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

export const ConfirmDeleteModal = ({ show, onClose, onConfirm, member, loading }) => {
  if (!show || !member) return null;

  const memberName = member.name || member.full_name || 'Thành viên';
  const memberCode = member.memberCode || member.member_code || member.id || 'N/A';
  const memberDept = member.deptName || member.department || 'Ban Chuyên Môn';
  const memberRole = member.roleTitle || member.role_title || 'Thành viên';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="ds-card p-5 sm:p-6 max-w-md w-full shadow-2xl border border-rose-500/30 space-y-4 bg-[#111827]">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <span>Xác Nhận Xóa Vĩnh Viễn</span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Preview Card */}
        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden">
              {member.avatar ? (
                <img src={member.avatar} alt={memberName} className="w-full h-full object-cover" />
              ) : (
                memberName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-white truncate">{memberName}</h4>
              <p className="text-xs text-slate-400 truncate">{memberRole} • {memberDept}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Mã thành viên:</span>
            <span className="font-mono text-amber-300 font-bold">{memberCode}</span>
          </div>
        </div>

        {/* Warning Message */}
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">Cảnh báo hệ thống:</p>
            <p className="text-rose-300/90 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của <strong className="text-white">{memberName} - {memberCode} </strong>?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{loading ? 'Đang xóa...' : 'Đồng Ý'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
