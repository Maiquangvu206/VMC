import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  Users, 
  Award, 
  ShieldCheck, 
  Phone, 
  UserPlus, 
  Lock, 
  RefreshCw, 
  X,
  Laptop,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Eye,
  Edit,
  Save,
  Hash,
  User,
  GraduationCap,
  Briefcase,
  Search,
  Filter,
  Sparkles,
  History
} from 'lucide-react';

export const InternalMembers = () => {
  const { 
    members, 
    currentUser, 
    createMemberAccount, 
    resetAccountPassword, 
    toggleAccountStatus,
    updateMemberByTech,
    isNewAccountModalOpen,
    setIsNewAccountModalOpen
  } = useClub();

  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  // Search & Period Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    class: '10A1',
    role: 'member',
    roleTitle: 'Thành Viên VMC',
    department: 'production',
    deptName: 'Ban Sản Xuất',
    term: '2025-2026',
    termName: 'Nhiệm Kỳ 2025 - 2026',
    phone: '',
    email: '',
    dob: '01/01/2009',
    address: 'Thị trấn Vĩnh Bảo, Vĩnh Bảo, Hải Phòng',
    facebook: 'https://facebook.com/'
  });

  const handleSubmitNewAccount = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.name || !formData.phone) {
      alert('Vui lòng nhập đầy đủ Tên đăng nhập, Họ tên và Số điện thoại!');
      return;
    }
    createMemberAccount(formData);
    setIsNewAccountModalOpen(false);
  };

  const handleTechUpdateMember = (e) => {
    e.preventDefault();
    if (!editingMember) return;
    updateMemberByTech(editingMember.id, editingMember);
    setEditingMember(null);
  };

  // Filter Members Logic by Search Query & Period/Term & Department
  const filteredMembers = members.filter(m => {
    // 1. Period / Term match
    const matchesTerm = selectedTerm === 'ALL' || m.term === selectedTerm || (m.termName && m.termName.includes(selectedTerm));

    // 2. Department match
    const matchesDept = selectedDept === 'ALL' || m.department === selectedDept || (m.deptName && m.deptName.includes(selectedDept));

    // 3. Search text query match
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      m.name?.toLowerCase().includes(q) ||
      m.memberCode?.toLowerCase().includes(q) ||
      m.class?.toLowerCase().includes(q) ||
      m.deptName?.toLowerCase().includes(q) ||
      m.roleTitle?.toLowerCase().includes(q) ||
      m.phone?.includes(q);

    return matchesTerm && matchesDept && matchesQuery;
  });

  return (
    <div className="container py-8 space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-purple flex items-center gap-1.5 w-fit mb-1.5">
            <History className="w-3.5 h-3.5" /> Tra Cứu Thành Viên CLB VMC Qua Các Thời Kỳ
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
            Danh Sách Thành Viên & <span className="gradient-text">Tra Cứu Theo Nhiệm Kỳ</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tất cả thành viên có quyền tìm kiếm thông tin thành viên qua từng thời kỳ từ khóa sáng lập đến đương nhiệm.
          </p>
        </div>

        <button
          onClick={() => setIsNewAccountModalOpen(true)}
          className="btn-primary text-xs px-5 py-2.5 shadow-blue-600/40 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cấp Tài Khoản Mới</span>
        </button>
      </div>

      {/* Toolbar: Search Input + Period Select + Department Select */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-md flex flex-col md:flex-row items-center gap-4 justify-between shadow-xl">
        
        {/* Search Input Box */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo Tên, Mã TV, Lớp, SĐT..."
            className="w-full bg-slate-950/70 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Period / Term Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> Nhiệm Kỳ:
            </span>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="bg-slate-950/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
            >
              <option value="ALL">🌐 Tất Cả Thời Kỳ (Toàn Bộ Khóa)</option>
              <option value="2025-2026">✨ Nhiệm Kỳ 2025 - 2026 (Khóa 25 - Đương Nhiệm)</option>
              <option value="2024-2025">🎓 Nhiệm Kỳ 2024 - 2025 (Khóa 24)</option>
              <option value="2023-2024">🏆 Nhiệm Kỳ 2023 - 2024 (Khóa 23)</option>
              <option value="2022-2023">👑 Nhiệm Kỳ 2022 - 2023 (Khóa Sáng Lập)</option>
            </select>
          </div>

          {/* Department Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Ban:
            </span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              <option value="ALL">Tất Cả Các Ban</option>
              <option value="Ban Chủ Nhiệm">Ban Chủ Nhiệm</option>
              <option value="Ban Đối Ngoại - Nhân Sự">Ban Đối Ngoại - Nhân Sự</option>
              <option value="Ban Sản Xuất">Ban Sản Xuất</option>
              <option value="Ban Nội Dung">Ban Nội Dung - Phát Thanh</option>
              <option value="Ban Truyền Thông">Ban Truyền Thông</option>
            </select>
          </div>

        </div>
      </div>

      {/* Results Count Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Hiển thị <strong className="text-white font-bold">{filteredMembers.length}</strong> / {members.length} thành viên</span>
        {(searchQuery || selectedTerm !== 'ALL' || selectedDept !== 'ALL') && (
          <button 
            onClick={() => { setSearchQuery(''); setSelectedTerm('ALL'); setSelectedDept('ALL'); }}
            className="text-blue-400 hover:underline flex items-center gap-1 text-xs"
          >
            <X className="w-3 h-3" /> Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Account Roster Cards Grid (items-stretch) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filteredMembers.map(m => (
          <div
            key={m.id}
            className="glass-card p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col h-full justify-between hover:border-blue-500/40 transition-all shadow-xl"
          >
            {/* Upper Content Box (flex-1 to fill space evenly) */}
            <div className="flex-1 flex flex-col justify-between space-y-4 mb-4">
              
              {/* Header: Avatar + Identity Info */}
              <div className="flex items-center gap-4 min-w-0">
                <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/50 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="font-heading font-bold text-base text-white truncate leading-snug">{m.name}</h3>
                  </div>
                  <span className="text-xs text-blue-400 font-semibold block truncate leading-tight">{m.roleTitle}</span>
                  <span className="text-[10px] text-slate-400 font-mono block truncate leading-tight">Mã TV: {m.memberCode} • Lớp {m.class}</span>
                </div>
              </div>

              {/* Quick Info Preview Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/60 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 shrink-0">Thời kỳ / Nhiệm kỳ:</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 truncate">
                    {m.termName || 'Nhiệm Kỳ 2025 - 2026'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 shrink-0">Ban chuyên môn:</span>
                  <strong className="text-slate-100 truncate text-right">{m.deptName}</strong>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 shrink-0">SĐT / Zalo:</span>
                  <strong className="text-slate-100 font-mono truncate text-right">{m.phone || 'Chưa có'}</strong>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 shrink-0">Ngày sinh:</span>
                  <strong className="text-amber-300 font-mono shrink-0">{m.dob || 'Chưa có'}</strong>
                </div>
              </div>

            </div>

            {/* Pinned Card Footer (mt-auto pt-4 border-t border-slate-800/60) */}
            <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedMember(m)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs font-semibold transition-all"
                  title="Xem chi tiết 10 thông tin thành viên"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Chi Tiết</span>
                </button>

                <button
                  onClick={() => setEditingMember({ ...m })}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg text-xs font-semibold transition-all"
                  title="Kỹ Thuật chỉnh sửa thông tin thành viên"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Sửa (Kỹ Thuật)</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => resetAccountPassword(m.username)}
                  className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs transition-all"
                  title="Reset mật khẩu mặc định VMC2026@VinhBao"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                </button>

                <button
                  onClick={() => toggleAccountStatus(m.id)}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                    m.status === 'Active'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                  title={m.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa'}
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Detail Member Modal (10 Fields View) */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up">
          <div className="relative w-full max-w-xl bg-slate-900 border border-blue-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <img src={selectedMember.avatar} alt={selectedMember.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="font-heading font-bold text-base text-white">{selectedMember.name}</h3>
                  <span className="text-xs text-purple-400 font-mono">{selectedMember.termName || 'Nhiệm Kỳ 2025 - 2026'}</span>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400 block text-[10px]">1. Mã Thành Viên</span>
                <strong className="text-blue-400 font-mono text-xs">{selectedMember.memberCode}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400 block text-[10px]">2. Họ và Tên</span>
                <strong className="text-white text-xs">{selectedMember.name}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400 block text-[10px]">3. Lớp</span>
                <strong className="text-slate-200 text-xs">{selectedMember.class}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400 block text-[10px]">4. Ban Chuyên Môn</span>
                <strong className="text-cyan-300 text-xs">{selectedMember.deptName}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400 block text-[10px]">5. Chức Vụ Trong CLB</span>
                <strong className="text-purple-400 text-xs">{selectedMember.roleTitle}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400 block text-[10px]">6. Số Điện Thoại</span>
                <strong className="text-slate-200 font-mono text-xs">{selectedMember.phone || 'Chưa có'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400 block text-[10px]">7. Email Học Sinh</span>
                <strong className="text-slate-200 text-xs truncate block">{selectedMember.email || 'Chưa có'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400 block text-[10px]">8. Ngày Sinh</span>
                <strong className="text-amber-300 font-mono text-xs">{selectedMember.dob || 'Chưa có'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 col-span-1 sm:col-span-2">
                <span className="text-slate-400 block text-[10px]">9. Địa Chỉ Thường Trú</span>
                <strong className="text-slate-200 text-xs">{selectedMember.address || 'Chưa có'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 col-span-1 sm:col-span-2">
                <span className="text-slate-400 block text-[10px]">10. Facebook Cá Nhân</span>
                <a href={selectedMember.facebook} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs truncate block">
                  {selectedMember.facebook || 'Chưa có'}
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedMember(null)} className="btn-secondary text-xs px-5 py-2">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Tech Modal (Full 10 Fields Edit) */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-white">Chỉnh Sửa Thông Tin Thành Viên</h3>
                  <span className="text-xs text-amber-400 font-mono">Quyền Kỹ Thuật • Mã TV: {editingMember.memberCode}</span>
                </div>
              </div>
              <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTechUpdateMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">1. Mã Thành Viên (Kỹ thuật sếp cấp)</label>
                  <input
                    type="text"
                    required
                    value={editingMember.memberCode}
                    onChange={(e) => setEditingMember({ ...editingMember, memberCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">2. Họ và Tên Thành Viên</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">3. Lớp Học</label>
                  <input
                    type="text"
                    required
                    value={editingMember.class}
                    onChange={(e) => setEditingMember({ ...editingMember, class: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">4. Ban Chuyên Môn</label>
                  <select
                    value={editingMember.deptName}
                    onChange={(e) => setEditingMember({ ...editingMember, deptName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
                  >
                    <option value="Ban Chủ Nhiệm">Ban Chủ Nhiệm</option>
                    <option value="Ban Đối Ngoại - Nhân Sự (Kỹ Thuật)">Ban Đối Ngoại - Nhân Sự (Kỹ Thuật)</option>
                    <option value="Ban Sản Xuất">Ban Sản Xuất</option>
                    <option value="Ban Truyền Thông">Ban Truyền Thông</option>
                    <option value="Ban Nội Dung - Phát Thanh">Ban Nội Dung - Phát Thanh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">5. Chức Vụ Trong CLB</label>
                  <input
                    type="text"
                    required
                    value={editingMember.roleTitle}
                    onChange={(e) => setEditingMember({ ...editingMember, roleTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Thời Kỳ / Nhiệm Kỳ</label>
                  <select
                    value={editingMember.term || '2025-2026'}
                    onChange={(e) => setEditingMember({ ...editingMember, term: e.target.value, termName: e.target.options[e.target.selectedIndex].text })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
                  >
                    <option value="2025-2026">Nhiệm Kỳ 2025 - 2026</option>
                    <option value="2024-2025">Nhiệm Kỳ 2024 - 2025</option>
                    <option value="2023-2024">Nhiệm Kỳ 2023 - 2024</option>
                    <option value="2022-2023">Nhiệm Kỳ 2022 - 2023</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">6. Số Điện Thoại / Zalo</label>
                  <input
                    type="tel"
                    required
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">7. Email Học Sinh</label>
                  <input
                    type="email"
                    required
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">9. Địa Chỉ Thường Trú</label>
                <input
                  type="text"
                  required
                  value={editingMember.address}
                  onChange={(e) => setEditingMember({ ...editingMember, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">10. Liên Hệ Facebook Cá Nhân</label>
                <input
                  type="url"
                  required
                  value={editingMember.facebook}
                  onChange={(e) => setEditingMember({ ...editingMember, facebook: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-6 py-2 shadow-amber-600/30 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi (Kỹ Thuật)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cấp Tài Khoản Mới */}
      {isNewAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-blue-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-white">Cấp Tài Khoản Thành Viên Mới</h3>
                  <span className="text-xs text-slate-400">Dành cho Tổ Kỹ thuật cấp mã và mật khẩu ban đầu</span>
                </div>
              </div>
              <button onClick={() => setIsNewAccountModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">1. Tên Đăng Nhập (Username) *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="vd: hoanglong.vmc"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">2. Họ và Tên Thành Viên *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="vd: Vũ Hoàng Long"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">3. Lớp Học *</label>
                  <input
                    type="text"
                    required
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    placeholder="vd: 11A2"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">4. Ban Chuyên Môn *</label>
                  <select
                    value={formData.deptName}
                    onChange={(e) => {
                      const dept = e.target.value;
                      setFormData({ ...formData, deptName: dept });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
                  >
                    <option value="Ban Chủ Nhiệm">Ban Chủ Nhiệm</option>
                    <option value="Ban Đối Ngoại - Nhân Sự">Ban Đối Ngoại - Nhân Sự (Kỹ Thuật)</option>
                    <option value="Ban Sản Xuất">Ban Sản Xuất</option>
                    <option value="Ban Truyền Thông">Ban Truyền Thông</option>
                    <option value="Ban Nội Dung">Ban Nội Dung - Phát Thanh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">5. Chức Vụ Trong CLB *</label>
                  <input
                    type="text"
                    required
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    placeholder="vd: Thành Viên VMC / Phó Ban"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">6. Số Điện Thoại / Zalo *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0981234567"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAccountModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-6 py-2 shadow-blue-600/30 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Xác Nhận Tạo Tài Khoản</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
