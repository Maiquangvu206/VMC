import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Award, Star, AlertTriangle, UserMinus } from 'lucide-react';

const POINT_RULES = [
  { id: 'r1', label: 'Share bài viết mới trên page', points: 1 },
  { id: 'r2', label: 'Thả cảm xúc bài viết mới trên page', points: 1 },
  { id: 'r3', label: 'Tối thiểu 3 comment bài viết mới trên page', points: 1 },
  { id: 'r4', label: 'Hăng hái phát biểu ý kiến (Mức 1)', points: 1 },
  { id: 'r5', label: 'Hăng hái phát biểu ý kiến (Mức 2)', points: 2 },
  { id: 'r6', label: 'Tham gia đầy đủ tất cả các buổi sinh hoạt', points: 5 },
  { id: 'r7', label: 'Không share bài viết / share kín', points: -1 },
  { id: 'r8', label: 'Không reaction bài viết mới', points: -1 },
  { id: 'r9', label: 'Không comment đủ số lượng', points: -1 },
  { id: 'r10', label: 'Đi muộn không có lý do', points: -3 },
  { id: 'r11', label: 'Hoàn thành chậm deadline (Có lý do chính đáng)', points: -1 },
  { id: 'r12', label: 'Hoàn thành không đúng / chậm deadline', points: -5 },
  { id: 'r13', label: 'Trì trệ, thiếu tích cực trong hoạt động', points: -5 },
  { id: 'r14', label: 'Vắng sinh hoạt không lý do', points: -10 },
  { id: 'r15', label: 'Gây gổ, làm mất đoàn kết thành viên', points: -15 }
];

export const PointManagement = () => {
  const { members, updateMemberPoints, isHRMember } = useClub();

  const [form, setForm] = useState({ memberId: '', ruleId: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.memberId || !form.ruleId) return;

    const rule = POINT_RULES.find(r => r.id === form.ruleId);
    if (rule) {
      updateMemberPoints(form.memberId, rule.points, rule.label);
      setForm({ memberId: '', ruleId: '' });
    }
  };

  if (!isHRMember) return null;

  return (
    <div className="ds-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-xl">
          <Award className="text-indigo-400 w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Quản Lý Điểm Số</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="ds-field-label">Chọn Thành Viên</label>
            <select required className="ds-input w-full" value={form.memberId} onChange={e => setForm({ ...form, memberId: e.target.value })}>
              <option value="">-- Chọn thành viên --</option>
              {members.filter(m => {
                const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase();
                const deptName = (m.deptName || m.department || '').toLowerCase();
                const code = (m.memberCode || m.member_code || '').toUpperCase();
                const normRole = roleTitle.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const normDept = deptName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                return (
                  code !== 'ADMIN' &&
                  !normRole.includes('super admin') &&
                  !normRole.includes('co van') &&
                  !normRole.includes('cuu') &&
                  !normDept.includes('co van') &&
                  !deptName.includes('cố vấn') &&
                  !deptName.includes('c? v?n') &&
                  !roleTitle.includes('cố vấn') &&
                  !roleTitle.includes('cựu') &&
                  m.status !== 'Suspended'
                );
              }).map(m => {
                const dName = m.deptName || m.department || 'Ban Chuyên Môn';
                const rTitle = m.roleTitle || m.role_title || 'Thành viên';
                return (
                  <option key={m.id} value={m.id}>{m.name} ({dName}) - Hiện có: {m.points || 0}đ</option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="ds-field-label">Nội dung tính điểm</label>
            <select required className="ds-input w-full" value={form.ruleId} onChange={e => setForm({ ...form, ruleId: e.target.value })}>
              <option value="">-- Chọn nội dung --</option>
              <optgroup label="CỘNG ĐIỂM">
                {POINT_RULES.filter(r => r.points > 0).map(r => (
                  <option key={r.id} value={r.id}>+{r.points} điểm: {r.label}</option>
                ))}
              </optgroup>
              <optgroup label="TRỪ ĐIỂM">
                {POINT_RULES.filter(r => r.points < 0).map(r => (
                  <option key={r.id} value={r.id}>{r.points} điểm: {r.label}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" className="ds-btn ds-btn-primary" disabled={!form.memberId || !form.ruleId}>
            Áp dụng Điểm
          </button>
        </div>
      </form>
    </div>
  );
};
