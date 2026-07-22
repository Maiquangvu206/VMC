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
  const { members, updateMemberPoints, isHRHead } = useClub();
  
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

  if (!isHRHead) return null; // Only HR Heads can manage points manually

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-xl">
          <Award className="text-indigo-400 w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Quản Lý Điểm Số (ĐN-NS)</h3>
          <p className="text-xs text-slate-400">Cộng/Trừ điểm chuyên cần, kỷ luật. Ban ĐN-NS sẽ bị nhân đôi điểm phạt.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Chọn Thành Viên</label>
            <select required className="input-field w-full" value={form.memberId} onChange={e => setForm({...form, memberId: e.target.value})}>
              <option value="">-- Chọn thành viên --</option>
              {members.filter(m => !m.roleTitle?.includes('Super Admin')).map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.deptName}) - Hiện có: {m.points || 0}đ</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Nội dung tính điểm</label>
            <select required className="input-field w-full" value={form.ruleId} onChange={e => setForm({...form, ruleId: e.target.value})}>
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
          <button type="submit" className="btn-primary" disabled={!form.memberId || !form.ruleId}>
            Áp dụng Điểm
          </button>
        </div>
      </form>
      
      <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/80">
        <strong className="text-amber-400 block mb-1">Quy định Nhân đôi Phạt:</strong>
        Thành viên thuộc Ban Đối Ngoại - Nhân Sự (khi bị trừ điểm) sẽ tự động bị x2 hệ số phạt để làm gương cho các ban khác.
      </div>
    </div>
  );
};
