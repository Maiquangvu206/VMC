import React from 'react';
import { X, Phone, Mail, Calendar, MapPin, Globe, Award, User, Hash, GraduationCap, Briefcase, Sparkles, Edit, Lock, Key } from 'lucide-react';

export const MemberDetailModal = ({ show, onClose, member, onEdit, onLock, onResetPassword, isHRMember, onAddMilestone }) => {
  if (!show || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
      <div className="relative w-[95%] sm:w-full max-w-xl max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-blue-500/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl text-white flex flex-col my-auto overflow-hidden">
        <div className="flex justify-between items-start border-b border-white/10 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-lg font-bold shrink-0">
              {member.name?.charAt(0) || '?'}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">{member.name}</h3>
              <p className="text-xs text-slate-400">{member.role_title || member.roleTitle || 'Thành viên'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] text-slate-400 font-semibold">Mã thành viên</span>
              </div>
              <p className="text-sm font-bold text-white">{member.member_code || 'N/A'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] text-slate-400 font-semibold">Lớp</span>
              </div>
              <p className="text-sm font-bold text-white">{member.class_name || member.class || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-slate-400 font-semibold">Ban</span>
            </div>
            <p className="text-sm font-bold text-white">{member.department || member.deptName || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] text-slate-400 font-semibold">SĐT</span>
              </div>
              <p className="text-sm font-bold text-white">{member.phone || 'N/A'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[10px] text-slate-400 font-semibold">Email</span>
              </div>
              <p className="text-sm font-bold text-white truncate">{member.email || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-[10px] text-slate-400 font-semibold">Ngày sinh</span>
              </div>
              <p className="text-sm font-bold text-white">{member.dob || 'N/A'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[10px] text-slate-400 font-semibold">Địa chỉ</span>
              </div>
              <p className="text-sm font-bold text-white truncate">{member.address || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] text-slate-400 font-semibold">Facebook</span>
            </div>
            <p className="text-sm font-bold text-white truncate">{member.facebook || 'N/A'}</p>
          </div>

          {member.milestones && member.milestones.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] text-slate-400 font-semibold">Cột mốc</span>
              </div>
              <div className="space-y-1.5">
                {member.milestones.map((ms, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="text-amber-400">●</span>
                    <span className="text-slate-300">{ms.title || ms}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="flex-1 min-w-[100px] btn-secondary text-xs px-3 py-2 flex items-center justify-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            Sửa
          </button>
          <button
            onClick={onLock}
            className={`flex-1 min-w-[100px] text-xs px-3 py-2 flex items-center justify-center gap-1.5 rounded-lg border transition-all ${
              member.status === 'Locked'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {member.status === 'Locked' ? 'Mở khóa' : 'Khóa'}
          </button>
          <button
            onClick={onResetPassword}
            className="flex-1 min-w-[100px] btn-secondary text-xs px-3 py-2 flex items-center justify-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            Reset MK
          </button>
          {isHRMember && (
            <button
              onClick={onAddMilestone}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
            >
              <Sparkles className="w-3 h-3" />
              Thêm cột mốc
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
