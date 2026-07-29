import React from 'react';
import { Plus, X, User, Hash, BookOpen, Phone, Mail, Building, FileText } from 'lucide-react';

export const CandidateModal = ({ show, onClose, candidateForm, setCandidateForm, onSubmit, loading, currentSeason }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="ds-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#1f2937]">
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Thêm Ứng Viên Mới</h3>
            <p className="text-xs text-blue-400 mt-0.5">{currentSeason?.name || 'Mùa tuyển hiện tại'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1f2937]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 text-xs">
          
          {/* Row 1: Họ tên + Mã phỏng vấn */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="ds-field-label">Họ và tên *</label>
              <div className="relative flex items-center w-full">
                <User className="absolute left-3 w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={candidateForm.full_name || ''}
                  onChange={(e) => setCandidateForm({ ...candidateForm, full_name: e.target.value })}
                  className="ds-input pl-10"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div>
              <label className="ds-field-label">Mã Phỏng Vấn *</label>
              <div className="relative flex items-center w-full">
                <Hash className="absolute left-3 w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={candidateForm.interview_code || ''}
                  onChange={(e) => setCandidateForm({ ...candidateForm, interview_code: e.target.value.toUpperCase() })}
                  className="ds-input pl-10 font-mono font-bold text-cyan-300 uppercase"
                  placeholder="PV-01"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Lớp + Số điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ds-field-label">Lớp học</label>
              <div className="relative flex items-center w-full">
                <BookOpen className="absolute left-3 w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={candidateForm.class_name || ''}
                  onChange={(e) => setCandidateForm({ ...candidateForm, class_name: e.target.value })}
                  className="ds-input pl-10"
                  placeholder="VD: 10A1, 11B2..."
                />
              </div>
            </div>

            <div>
              <label className="ds-field-label">Số điện thoại</label>
              <div className="relative flex items-center w-full">
                <Phone className="absolute left-3 w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={candidateForm.phone || ''}
                  onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                  className="ds-input pl-10"
                  placeholder="0987654321"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Email + Ban mong muốn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ds-field-label">Email liên hệ</label>
              <div className="relative flex items-center w-full">
                <Mail className="absolute left-3 w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  value={candidateForm.email || ''}
                  onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                  className="ds-input pl-10"
                  placeholder="ungvien@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="ds-field-label">Ban mong muốn</label>
              <div className="relative flex items-center w-full">
                <Building className="absolute left-3 w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={candidateForm.desired_dept || ''}
                  onChange={(e) => setCandidateForm({ ...candidateForm, desired_dept: e.target.value })}
                  className="ds-input pl-10"
                  placeholder={currentSeason?.department || 'Ban mong muốn tham gia'}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Ghi chú - Clean Full-width Textarea Layout */}
          <div className="pt-1">
            <label className="ds-field-label flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Ghi chú về ứng viên</span>
            </label>
            <textarea
              value={candidateForm.notes || ''}
              onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
              className="w-full bg-[#0f172a] border border-[#1f2937] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 leading-relaxed resize-y transition-all"
              rows={2}
              placeholder="Nhập nhận xét sơ bộ, kinh nghiệm cá nhân hoặc ghi chú đặc biệt..."
            />
          </div>

          {/* Row 5: Bài làm vòng đơn - Clean Full-width Textarea Layout */}
          <div className="pt-1">
            <label className="ds-field-label flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Bài làm vòng đơn (Câu hỏi & Câu trả lời)</span>
            </label>
            <textarea
              value={candidateForm.application_answers || ''}
              onChange={(e) => setCandidateForm({ ...candidateForm, application_answers: e.target.value })}
              className="w-full bg-[#0f172a] border border-[#1f2937] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 leading-relaxed resize-y transition-all"
              rows={4}
              placeholder="Nhập các câu hỏi và câu trả lời vòng đơn của ứng viên..."
            />
          </div>

        </div>

        {/* Action Buttons */}
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
            {loading ? 'Đang thêm...' : 'Thêm Ứng Viên'}
          </button>
        </div>

      </div>
    </div>
  );
};
