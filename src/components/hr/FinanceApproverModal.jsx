import React, { useState, useMemo, useEffect } from 'react';
import { X, ShieldCheck, Search, Check, AlertCircle, UserCheck } from 'lucide-react';
import { RoleTitleDisplay } from '../../utils/roleHelper';

export const FinanceApproverModal = ({
  show,
  onClose,
  members = [],
  financeApproverIds = [],
  onSave
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  useEffect(() => {
    if (show) {
      setSelectedIds(Array.isArray(financeApproverIds) ? [...financeApproverIds] : []);
    }
  }, [show, financeApproverIds]);

  // Lọc danh sách thành viên (loại trừ Admin hệ thống ảo, chỉ tính người thật)
  const availableMembers = useMemo(() => {
    return (members || []).filter(m => {
      const code = (m.memberCode || m.member_code || '').toUpperCase();
      const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase();
      if (code === 'ADMIN' || roleTitle.includes('super admin')) return false;
      return true;
    });
  }, [members]);

  const filteredMembers = useMemo(() => {
    let list = availableMembers;

    if (deptFilter !== 'ALL') {
      list = list.filter(m => {
        const dept = (m.deptName || m.department || '').toLowerCase();
        return dept.includes(deptFilter.toLowerCase());
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.memberCode || m.member_code || '').toLowerCase().includes(q) ||
        (m.deptName || m.department || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [availableMembers, deptFilter, searchQuery]);

  const toggleMember = (memberId) => {
    const sId = String(memberId);
    setSelectedIds(prev => {
      if (prev.some(id => String(id) === sId)) {
        return prev.filter(id => String(id) === sId ? false : true);
      } else {
        return [...prev, sId];
      }
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(selectedIds);
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-md animate-slide-up">
      <div className="ds-card p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-[var(--border-default)]">

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-default)] gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">
                Phân Quyền Duyệt Thu Chi & Dự Trù Kinh Phí
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3 shrink-0">
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="ds-input text-xs sm:w-44"
          >
            <option value="ALL">Tất cả các ban</option>
            <option value="chủ nhiệm">Ban Chủ Nhiệm</option>
            <option value="đối ngoại">Đối Ngoại - Nhân Sự</option>
            <option value="nội dung">Ban Nội Dung</option>
            <option value="sản xuất">Ban Sản Xuất</option>
            <option value="truyền thông">Ban Truyền Thông</option>
          </select>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-secondary)] text-xs italic">
              Không tìm thấy thành viên phù hợp.
            </div>
          ) : (
            filteredMembers.map(m => {
              const mId = String(m.id);
              const isSelected = selectedIds.some(id => String(id) === mId);

              return (
                <div
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                      ? 'bg-blue-500/10 border-blue-500/40 shadow-sm'
                      : 'bg-[var(--bg-card)] border-[var(--border-default)] hover:border-slate-500/50'
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={m.avatar || m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={m.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-700/50"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[var(--text-primary)] truncate">
                          {m.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {m.memberCode || m.member_code || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] mt-0.5">
                        <span>{m.deptName || m.department || 'Ban Chuyên Môn'}</span>
                        <span>•</span>
                        <RoleTitleDisplay roleTitle={m.roleTitle || m.role_title} className="text-blue-400 font-medium" />
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isSelected ? (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> Được cấp quyền
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/60">
                        Chưa cấp
                      </span>
                    )}
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-600 bg-slate-800/40 text-transparent'
                      }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs shrink-0">
          <div className="text-[var(--text-secondary)]">
            Đã cấp quyền cho: <strong className="text-blue-400">{selectedIds.length}</strong> thành viên
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="ds-btn ds-btn-secondary ds-btn-sm text-xs font-semibold px-3"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="ds-btn ds-btn-primary ds-btn-sm text-xs font-semibold px-4 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu Cấu Hình</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FinanceApproverModal;
