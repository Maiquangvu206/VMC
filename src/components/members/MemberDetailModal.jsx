import React from 'react';
import { X, Phone, Mail, Calendar, MapPin, Globe, Award, User, Hash, GraduationCap, Briefcase, Sparkles, Edit, Lock, Key } from 'lucide-react';
import { RoleTitleDisplay } from '../../utils/roleHelper';

export const MemberDetailModal = ({
  show,
  onClose,
  member,
  onEdit,
  onLock,
  onResetPassword,
  isHRMember,
  canEdit = false,
  canManageAccount = false,
  onAddMilestone
}) => {
  if (!show || !member) return null;

  const isAdvisorMember = Boolean(
    member?.deptName?.toLowerCase().includes('cố vấn') ||
    member?.department?.toLowerCase().includes('cố vấn') ||
    member?.roleTitle?.toLowerCase().includes('cố vấn') ||
    member?.role_title?.toLowerCase().includes('cố vấn') ||
    member?.roleTitle?.toLowerCase().includes('cựu') ||
    member?.role_title?.toLowerCase().includes('cựu')
  );

  let milestonesList = [];
  if (Array.isArray(member?.milestones)) {
    milestonesList = member.milestones;
  } else if (typeof member?.milestones === 'string') {
    try {
      const parsed = JSON.parse(member.milestones);
      if (Array.isArray(parsed)) milestonesList = parsed;
      else if (member.milestones.trim()) milestonesList = [{ title: member.milestones.trim() }];
    } catch (_e) {
      if (member.milestones.trim()) milestonesList = [{ title: member.milestones.trim() }];
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
       <div className="ds-card p-3.5 sm:p-6 w-[95%] sm:w-full max-w-xl shadow-2xl text-[var(--text-primary)] flex flex-col my-auto overflow-hidden">
         <div className="flex justify-between items-start pb-3 border-b border-[var(--border-default)] shrink-0 gap-2 min-w-0">
           <div className="flex items-center gap-3 min-w-0 overflow-hidden flex-1">
             <div className="w-12 h-12 rounded-full bg-[var(--accent-blue)] flex items-center justify-center text-lg font-bold shrink-0 overflow-hidden text-white">
               {member.avatar ? (
                 <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
               ) : (
                 member.name?.charAt(0) || '?'
               )}
             </div>
             <div className="min-w-0 flex-1 overflow-hidden">
               <h3 className="font-heading text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate" title={member.name}>{member.name}</h3>
               <RoleTitleDisplay roleTitle={member.role_title || member.roleTitle} className="text-xs text-blue-500 dark:text-blue-400 font-medium mt-0.5" />
             </div>
           </div>
           <button onClick={onClose} className="ds-btn ds-btn-ghost p-1 shrink-0">
             <X className="w-5 h-5" />
           </button>
         </div>

         <div className="flex-1 overflow-y-auto py-4 space-y-3">
           <div className={`grid grid-cols-1 ${!isAdvisorMember ? 'sm:grid-cols-2' : ''} gap-3`}>
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <Hash className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                 <span className="text-[10px] text-[var(--text-muted)] font-semibold">Mã thành viên</span>
               </div>
               <p className="text-sm font-bold text-[var(--text-primary)] truncate">{member.memberCode || member.member_code || 'N/A'}</p>
             </div>
             {!isAdvisorMember && (
               <div className="ds-card p-3 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                   <GraduationCap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                   <span className="text-[10px] text-[var(--text-muted)] font-semibold">Lớp</span>
                 </div>
                 <p className="text-sm font-bold text-[var(--text-primary)] truncate">{member.class || member.class_name || 'N/A'}</p>
               </div>
             )}
           </div>

           <div className="ds-card p-3 min-w-0">
             <div className="flex items-center gap-2 mb-1">
               <Briefcase className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
               <span className="text-[10px] text-[var(--text-muted)] font-semibold">Ban</span>
             </div>
             <p className="text-sm font-bold text-[var(--text-primary)] truncate">{member.deptName || member.department || 'N/A'}</p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <Phone className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                 <span className="text-[10px] text-[var(--text-muted)] font-semibold">SĐT</span>
               </div>
               <p className="text-sm font-bold text-[var(--text-primary)] truncate">{member.phone || 'N/A'}</p>
             </div>
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <Mail className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                 <span className="text-[10px] text-[var(--text-muted)] font-semibold">Email</span>
               </div>
               <p className="text-sm font-bold text-[var(--text-primary)] truncate" title={member.email}>{member.email || 'N/A'}</p>
             </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <Calendar className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                 <span className="text-[10px] text-[var(--text-muted)] font-semibold">Ngày sinh</span>
               </div>
               <p className="text-sm font-bold text-[var(--text-primary)] truncate">{member.dob || 'N/A'}</p>
             </div>
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                 <span className="text-[10px] text-[var(--text-muted)] font-semibold">Địa chỉ</span>
               </div>
               <p className="text-sm font-bold text-[var(--text-primary)] truncate" title={member.address}>{member.address || 'N/A'}</p>
             </div>
           </div>

           <div className="ds-card p-3 min-w-0">
             <div className="flex items-center gap-2 mb-1">
               <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
               <span className="text-[10px] text-[var(--text-muted)] font-semibold">Facebook</span>
             </div>
             <p className="text-sm font-bold text-[var(--text-primary)] truncate" title={member.facebook}>{member.facebook || 'N/A'}</p>
           </div>

           {milestonesList && milestonesList.length > 0 && (
             <div className="ds-card p-3 min-w-0">
               <div className="flex items-center gap-2 mb-2">
                 <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                 <span className="text-[10px] text-[var(--text-muted)] font-semibold">Cột mốc</span>
               </div>
               <div className="space-y-1.5 min-w-0">
                 {milestonesList.map((ms, idx) => (
                   <div key={idx} className="flex items-center gap-2 text-xs min-w-0">
                     <span className="text-amber-500 shrink-0">●</span>
                     <span className="text-[var(--text-secondary)] truncate">{typeof ms === 'object' ? (ms.title || ms.label || JSON.stringify(ms)) : String(ms)}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>

         {(canEdit || canManageAccount) && (
           <div className="pt-3 border-t border-[var(--border-default)] flex flex-wrap gap-2 shrink-0">
             {canEdit && (
               <button
                 onClick={onEdit}
                 className="ds-btn ds-btn-secondary ds-btn-xs flex-1 min-w-[90px]"
               >
                 <Edit className="w-3.5 h-3.5" />
                 Sửa
               </button>
             )}
             {canManageAccount && (
               <button
                 onClick={onLock}
                 className={`ds-btn ds-btn-xs flex-1 min-w-[90px] ${
                   (member.status === 'Locked' || member.status === 'Suspended')
                     ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                     : 'bg-rose-500/20 text-red-300 border border-rose-500/40'
                 }`}
               >
                 <Lock className="w-3.5 h-3.5" />
                 {(member.status === 'Locked' || member.status === 'Suspended') ? 'Mở khóa' : 'Khóa'}
               </button>
             )}
             {canManageAccount && (
               <button
                 onClick={onResetPassword}
                 className="ds-btn ds-btn-secondary ds-btn-xs flex-1 min-w-[90px]"
               >
                 <Key className="w-3.5 h-3.5" />
                 Reset MK
               </button>
             )}
             {canManageAccount && (
               <button
                 onClick={onAddMilestone}
                 className="ds-btn ds-btn-ghost ds-btn-xs text-amber-400 border border-amber-400/30 flex-1 min-w-[110px]"
               >
                 <Sparkles className="w-3 h-3" />
                 Thêm cột mốc
               </button>
             )}
           </div>
         )}
       </div>
     </div>
  );
};
