import React from 'react';
import { X, Phone, Mail, Calendar, MapPin, Globe, Award, User, Hash, GraduationCap, Briefcase, Sparkles, Edit, Lock, Key } from 'lucide-react';

export const MemberDetailModal = ({ show, onClose, member, onEdit, onLock, onResetPassword, isHRMember, onAddMilestone }) => {
  if (!show || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
       <div className="ds-card p-3.5 sm:p-6 w-[95%] sm:w-full max-w-xl shadow-2xl text-white flex flex-col my-auto overflow-hidden">
         <div className="flex justify-between items-start pb-3 border-b border-[var(--border-default)] shrink-0 gap-2 min-w-0">
           <div className="flex items-center gap-3 min-w-0 overflow-hidden flex-1">
             <div className="w-12 h-12 rounded-full bg-[var(--accent-blue)] flex items-center justify-center text-lg font-bold shrink-0 overflow-hidden">
               {member.avatar ? (
                 <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
               ) : (
                 member.name?.charAt(0) || '?'
               )}
             </div>
             <div className="min-w-0 flex-1 overflow-hidden">
               <h3 className="font-heading text-lg sm:text-xl font-bold text-white truncate" title={member.name}>{member.name}</h3>
               <p className="text-xs text-slate-400 truncate" title={member.role_title || member.roleTitle}>{member.role_title || member.roleTitle || 'Thành viên'}</p>
             </div>
           </div>
           <button onClick={onClose} className="ds-btn ds-btn-ghost p-1 shrink-0">
             <X className="w-5 h-5" />
           </button>
         </div>

         <div className="flex-1 overflow-y-auto py-4 space-y-3">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <Hash className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                 <span className="text-[10px] text-slate-400 font-semibold">Mã thành viên</span>
               </div>
               <p className="text-sm font-bold text-white truncate">{member.memberCode || member.member_code || 'N/A'}</p>
             </div>
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                 <span className="text-[10px] text-slate-400 font-semibold">Lớp</span>
               </div>
               <p className="text-sm font-bold text-white truncate">{member.class || member.class_name || 'N/A'}</p>
             </div>
           </div>

           <div className="ds-card p-3 min-w-0">
             <div className="flex items-center gap-2 mb-1">
               <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
               <span className="text-[10px] text-slate-400 font-semibold">Ban</span>
             </div>
             <p className="text-sm font-bold text-white truncate">{member.deptName || member.department || 'N/A'}</p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                 <span className="text-[10px] text-slate-400 font-semibold">SĐT</span>
               </div>
               <p className="text-sm font-bold text-white truncate">{member.phone || 'N/A'}</p>
             </div>
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <Mail className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                 <span className="text-[10px] text-slate-400 font-semibold">Email</span>
               </div>
               <p className="text-sm font-bold text-white truncate" title={member.email}>{member.email || 'N/A'}</p>
             </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <Calendar className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                 <span className="text-[10px] text-slate-400 font-semibold">Ngày sinh</span>
               </div>
               <p className="text-sm font-bold text-white truncate">{member.dob || 'N/A'}</p>
             </div>
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                 <span className="text-[10px] text-slate-400 font-semibold">Địa chỉ</span>
               </div>
               <p className="text-sm font-bold text-white truncate" title={member.address}>{member.address || 'N/A'}</p>
             </div>
           </div>

           <div className="ds-card p-3 min-w-0">
             <div className="flex items-center gap-2 mb-1">
               <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
               <span className="text-[10px] text-slate-400 font-semibold">Facebook</span>
             </div>
             <p className="text-sm font-bold text-white truncate" title={member.facebook}>{member.facebook || 'N/A'}</p>
           </div>

           {member.milestones && member.milestones.length > 0 && (
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-2">
                 <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                 <span className="text-[10px] text-slate-400 font-semibold">Cột mốc</span>
               </div>
               <div className="space-y-1.5 min-w-0">
                 {member.milestones.map((ms, idx) => (
                   <div key={idx} className="flex items-center gap-2 text-xs min-w-0">
                     <span className="text-amber-400 shrink-0">●</span>
                     <span className="text-slate-300 truncate">{ms.title || ms}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>

         <div className="pt-3 border-t border-[var(--border-default)] flex flex-wrap gap-2 shrink-0">
           <button
             onClick={onEdit}
             className="ds-btn ds-btn-secondary ds-btn-xs flex-1 min-w-[90px]"
           >
             <Edit className="w-3.5 h-3.5" />
             Sửa
           </button>
           <button
             onClick={onLock}
             className={`ds-btn ds-btn-xs flex-1 min-w-[90px] ${
               member.status === 'Locked'
                 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                 : 'bg-rose-500/20 text-red-300 border border-rose-500/40'
             }`}
           >
             <Lock className="w-3.5 h-3.5" />
             {member.status === 'Locked' ? 'Mở khóa' : 'Khóa'}
           </button>
           <button
             onClick={onResetPassword}
             className="ds-btn ds-btn-secondary ds-btn-xs flex-1 min-w-[90px]"
           >
             <Key className="w-3.5 h-3.5" />
             Reset MK
           </button>
           {isHRMember && (
             <button
               onClick={onAddMilestone}
               className="ds-btn ds-btn-ghost ds-btn-xs text-amber-400 border border-amber-400/30 flex-1 min-w-[110px]"
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
