import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import {
  Users,
  Award,
  ShieldCheck,
  Phone,
  UserPlus,
  Lock,
  Key,
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
  Trash2,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { NewAccountModal } from '../components/members/NewAccountModal';
import { MemberDetailModal } from '../components/members/MemberDetailModal';
import { EditMemberModal } from '../components/members/EditMemberModal';
import { MilestoneModal } from '../components/members/MilestoneModal';

const formatGen = (termStr) => {
  if (!termStr) return 'Gen 6';
  if (termStr.includes('2025') || termStr.includes('2026')) return 'Gen 6';
  if (termStr.includes('2024')) return 'Gen 5';
  if (termStr.includes('2023')) return 'Gen 4';
  if (termStr.includes('2022')) return 'Gen 3';
  return termStr;
};

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

export const InternalMembers = () => {
  const {
    members,
    currentUser,
    isHRMember,
    isHRHead,
    createMemberAccount,
    deleteMemberAccount,
    resetAccountPassword,
    resetMemberPassword,
    toggleAccountStatus,
    updateMemberByTech,
    addMemberMilestone,
    isNewAccountModalOpen,
    setIsNewAccountModalOpen,
    showToast,
    generations = [],
    membersFilterDept,
    setMembersFilterDept
  } = useClub();

  const canManageAccountsPermission = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUser?.roleTitle?.includes('Super Admin') ||
    (currentUser?.roleTitle?.includes('Kỹ Thuật') && (
      currentUser?.deptName?.includes('Đối Ngoại') ||
      currentUser?.deptName?.includes('Nhân Sự') ||
      currentUser?.deptName?.includes('ĐN-NS') ||
      currentUser?.department?.includes('Đối Ngoại') ||
      currentUser?.department?.includes('Nhân Sự')
    ))
  );

  const isAdmin = canManageAccountsPermission;

  const isSuperAdmin = Boolean(
    currentUser?.memberCode === 'ADMIN' ||
    currentUser?.roleTitle?.includes('Super Admin')
  );

  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  const [isAddMsModalOpen, setIsAddMsModalOpen] = useState(false);
  const [msTitle, setMsTitle] = useState('');
  const [msDate, setMsDate] = useState('');
  const [msBadge, setMsBadge] = useState('[Cột mốc]');

  const handleCreateMilestone = () => {
    if (!msTitle.trim() || !selectedMember) return;
    const cleanTitle = msTitle.trim();
    const cleanDate = msDate.trim() || new Date().toLocaleDateString('vi-VN');
    const cleanBadge = msBadge.trim() || '[Cột mốc]';

    addMemberMilestone(selectedMember.id, {
      title: cleanTitle,
      date: cleanDate,
      badgeText: cleanBadge
    });

    setSelectedMember(prev => ({
      ...prev,
      milestones: [...(prev?.milestones || []), {
        id: 'm-' + Date.now(),
        date: cleanDate,
        title: cleanTitle,
        badgeText: cleanBadge,
        badgeStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      }]
    }));

    setMsTitle('');
    setMsDate('');
    setMsBadge('[Cột mốc]');
    setIsAddMsModalOpen(false);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  React.useEffect(() => {
    if (!membersFilterDept) return;
    if (membersFilterDept === 'ALL') {
      setSelectedDept('ALL');
      return;
    }
    setSelectedDept(membersFilterDept);
  }, [membersFilterDept]);

  React.useEffect(() => {
    if (!membersFilterDept || membersFilterDept === selectedDept) return;
    setMembersFilterDept(selectedDept);
  }, [selectedDept, membersFilterDept, setMembersFilterDept]);

  const hasSuperAdmin = members.some(m => m.roleTitle?.includes('Super Admin'));

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    class: '10A1',
    role: 'member',
    roleTitle: 'Thành Viên VMC',
    department: 'production',
    deptName: 'Ban Sản Xuất',
    term: 'Gen 6',
    termName: 'Gen 6',
    phone: '',
    email: '',
    dob: '01/01/2009',
    address: 'Thị trấn Vĩnh Bảo, Vĩnh Bảo, Hải Phòng',
    facebook: 'https://facebook.com/'
  });

  const permissionOptions = [
    { value: 'chairperson', label: 'Chủ Nhiệm CLB', role: 'admin', roleTitle: 'Chủ Nhiệm CLB', deptName: 'Ban Chủ Nhiệm' },
    { value: 'vice-chairperson', label: 'Phó Chủ Nhiệm CLB', role: 'member', roleTitle: 'Phó Chủ Nhiệm CLB', deptName: 'Ban Chủ Nhiệm' },
    { value: 'advisor', label: 'Cố Vấn CLB', role: 'member', roleTitle: 'Cố Vấn CLB', deptName: 'Ban Cố Vấn' },
    { value: 'head-hr', label: 'Trưởng Ban Đối Ngoại - Nhân Sự', role: 'member', roleTitle: 'Trưởng Ban Đối Ngoại - Nhân Sự', deptName: 'Ban Đối Ngoại - Nhân Sự' },
    { value: 'technical-hr', label: 'Kỹ Thuật Ban Đối Ngoại - Nhân Sự', role: 'member', roleTitle: 'Kỹ Thuật Ban Đối Ngoại - Nhân Sự', deptName: 'Ban Đối Ngoại - Nhân Sự' },
    { value: 'vice-hr', label: 'Phó Ban Đối Ngoại - Nhân Sự', role: 'member', roleTitle: 'Phó Ban Đối Ngoại - Nhân Sự', deptName: 'Ban Đối Ngoại - Nhân Sự' },
    { value: 'member-hr', label: 'Thành Viên Ban Đối Ngoại - Nhân Sự', role: 'member', roleTitle: 'Thành Viên Ban Đối Ngoại - Nhân Sự', deptName: 'Ban Đối Ngoại - Nhân Sự' },
    { value: 'head-production', label: 'Trưởng Ban Sản Xuất', role: 'member', roleTitle: 'Trưởng Ban Sản Xuất', deptName: 'Ban Sản Xuất' },
    { value: 'vice-production', label: 'Phó Ban Sản Xuất', role: 'member', roleTitle: 'Phó Ban Sản Xuất', deptName: 'Ban Sản Xuất' },
    { value: 'member-production', label: 'Thành Viên Ban Sản Xuất', role: 'member', roleTitle: 'Thành Viên Ban Sản Xuất', deptName: 'Ban Sản Xuất' },
    { value: 'head-content', label: 'Trưởng Ban Nội Dung - Phát Thanh', role: 'member', roleTitle: 'Trưởng Ban Nội Dung - Phát Thanh', deptName: 'Ban Nội Dung - Phát Thanh' },
    { value: 'vice-content', label: 'Phó Ban Nội Dung - Phát Thanh', role: 'member', roleTitle: 'Phó Ban Nội Dung - Phát Thanh', deptName: 'Ban Nội Dung - Phát Thanh' },
    { value: 'member-content', label: 'Thành Viên Ban Nội Dung - Phát Thanh', role: 'member', roleTitle: 'Thành Viên Ban Nội Dung - Phát Thanh', deptName: 'Ban Nội Dung - Phát Thanh' }
  ];

  const resolvePermissionValue = (member) => {
    if (!member) return 'member-production';
    const matched = permissionOptions.find(opt =>
      opt.role === (member.role || 'member') &&
      opt.roleTitle === member.roleTitle &&
      opt.deptName === member.deptName
    );
    return matched ? matched.value : 'custom';
  };

  const getPermissionOptionsByDept = (deptName) => {
    if (!deptName) return [];
    return permissionOptions.filter(opt => opt.deptName === deptName);
  };

  const handleEditDepartmentChange = (deptName) => {
    if (!editingMember) return;
    if (!isAdmin) {
      setEditingMember({ ...editingMember, deptName });
      return;
    }
    const deptPermissionOptions = getPermissionOptionsByDept(deptName);
    const currentPermission = permissionOptions.find(opt =>
      opt.role === (editingMember.role || 'member') &&
      opt.roleTitle === editingMember.roleTitle &&
      opt.deptName === editingMember.deptName
    );
    if (currentPermission && currentPermission.deptName === deptName) {
      setEditingMember({ ...editingMember, deptName });
      return;
    }
    const fallbackPermission = deptPermissionOptions[0];
    if (!fallbackPermission) {
      setEditingMember({ ...editingMember, deptName });
      return;
    }
    setEditingMember({
      ...editingMember,
      deptName,
      role: fallbackPermission.role,
      roleTitle: fallbackPermission.roleTitle
    });
  };

  const handleSubmitNewAccount = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.name || !formData.phone) {
      showToast('Vui lòng nhập đầy đủ Tên đăng nhập, Họ tên và Số điện thoại!', 'warning');
      return;
    }
    createMemberAccount(formData);
    setIsNewAccountModalOpen(false);
    setFormData({
      username: '', name: '', class: '10A1', role: 'member',
      roleTitle: 'Thành Viên VMC', department: 'production', deptName: 'Ban Sản Xuất',
      term: 'Gen 6', termName: 'Gen 6', phone: '', email: '',
      dob: '01/01/2009', address: 'Thị trấn Vĩnh Bảo, Vĩnh Bảo, Hải Phòng',
      facebook: 'https://facebook.com/'
    });
  };

  const handleTechUpdateMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    await updateMemberByTech(editingMember.id, editingMember);
    setEditingMember(null);
  };

  const nonAdminMembers = React.useMemo(() => {
    return members.filter(m => {
      const roleTitle = (m.roleTitle || m.role_title || '').toLowerCase();
      const code = (m.memberCode || m.member_code || '').toUpperCase();
      const uname = (m.username || '').toLowerCase();
      return !roleTitle.includes('super admin') && code !== 'ADMIN' && uname !== 'admin';
    });
  }, [members]);

  const filteredMembers = React.useMemo(() => {
    return nonAdminMembers.filter(m => {
      const memberGen = formatGen(m.termName || m.term || '');
      const memberDept = normalizeText(m.deptName || m.department || '');
      const matchesTerm = selectedTerm === 'ALL' || memberGen === selectedTerm;
      const selectedDeptNormalized = normalizeText(selectedDept);
      const matchesDept =
        selectedDept === 'ALL' ||
        memberDept === selectedDeptNormalized ||
        memberDept.includes(selectedDeptNormalized);
      const q = normalizeText(searchQuery);
      const matchesQuery = !q ||
        normalizeText(m.name).includes(q) ||
        normalizeText(m.memberCode).includes(q) ||
        normalizeText(m.class).includes(q) ||
        normalizeText(m.deptName || m.department).includes(q) ||
        normalizeText(m.roleTitle).includes(q) ||
        normalizeText(m.phone).includes(q);
      return matchesTerm && matchesDept && matchesQuery;
    });
  }, [nonAdminMembers, searchQuery, selectedTerm, selectedDept]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">

      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center gap-3">
        <Users className="w-8 h-8 text-blue-400" />
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100">Danh Sách Thành Viên</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Tất cả thành viên có quyền tìm kiếm thông tin thành viên qua từng thời kỳ từ khóa sáng lập đến đương nhiệm.
        </p>

        <button
          onClick={() => {
            if (!isAdmin) {
              showToast('⛔ Quyền bị từ chối! Chỉ có bộ phận kỹ thuật ban Đối Ngoại - Nhân Sự mới có quyền cấp tài khoản thành viên mới!', 'error');
              return;
            }
            setIsNewAccountModalOpen(true);
          }}
          className={`ds-btn ${!isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
          title={isAdmin ? 'Cấp tài khoản mới (Admin)' : 'Chỉ Chủ Nhiệm CLB (Admin) mới có quyền cấp tài khoản mới'}
        >
          <UserPlus className="w-4 h-4" />
          <span>Cấp Tài Khoản Mới</span>
        </button>
      </div>

      {/* Toolbar / Filter Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full bg-[#10172a] p-4 rounded-xl border border-gray-800 shadow-md">

        {/* Search Input Box */}
        <div className="relative flex items-center w-full md:flex-1 min-w-0">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo Tên, Mã TV, Lớp, SĐT..."
            className="ds-input pl-10 pr-9 w-full bg-slate-900/80 border-slate-700/80 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">

          {/* Period / Term Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-sm font-semibold text-gray-400 whitespace-nowrap flex items-center gap-1.5 shrink-0">
              <Calendar className="w-4 h-4 text-purple-400 shrink-0" /> Thế Hệ:
            </span>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="ds-input ds-select w-full sm:w-auto min-w-[150px] bg-slate-900/80 border-slate-700/80 text-sm"
            >
              <option value="ALL">🌐 Tất Cả Thế Hệ</option>
              {generations.map(g => (
                <option key={g.id} value={g.name}>{g.description || g.name}</option>
              ))}
            </select>
          </div>

          {/* Department Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-sm font-semibold text-gray-400 whitespace-nowrap flex items-center gap-1.5 shrink-0">
              <Filter className="w-4 h-4 text-cyan-400 shrink-0" /> Ban:
            </span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="ds-input ds-select w-full sm:w-auto min-w-[170px] bg-slate-900/80 border-slate-700/80 text-sm"
            >
              <option value="ALL">Tất Cả Các Ban</option>
              <option value="Ban Chủ Nhiệm">Ban Chủ Nhiệm</option>
              <option value="Ban Cố Vấn">Ban Cố Vấn</option>
              <option value="Ban Đối Ngoại - Nhân Sự">Ban Đối Ngoại - Nhân Sự</option>
              <option value="Ban Sản Xuất">Ban Sản Xuất</option>
              <option value="Ban Nội Dung - Phát Thanh">Ban Nội Dung - Phát Thanh</option>
            </select>
          </div>

        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-slate-400 px-1">
        <span>Hiển thị <strong className="text-slate-100 font-bold">{filteredMembers.length}</strong> / {nonAdminMembers.length} thành viên</span>
        {(searchQuery || selectedTerm !== 'ALL' || selectedDept !== 'ALL') && (
          <button
            onClick={() => { setSearchQuery(''); setSelectedTerm('ALL'); setSelectedDept('ALL'); }}
            className="text-blue-400 hover:underline flex items-center gap-1.5 text-sm"
          >
            <X className="w-3.5 h-3.5" /> Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Account Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
        {filteredMembers.map(m => (
          <div
            key={m.id}
            className="ds-card-glass bg-[#10172a]/95 p-5 sm:p-6 rounded-xl border border-gray-800 flex flex-col h-full justify-between hover:border-blue-500/40 transition-all shadow-xl overflow-hidden min-w-0"
          >
            {/* Upper Content Box */}
            <div className="flex-1 flex flex-col justify-between space-y-4 mb-4 min-w-0">

              {/* Header: Avatar + Identity Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-blue-500/50 shrink-0 shadow-md"
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-slate-100 truncate min-w-0 leading-snug" title={m.name}>
                    {m.name}
                  </h3>
                  <span className="text-xs sm:text-sm text-blue-400 font-semibold block truncate min-w-0 leading-tight mt-0.5" title={m.roleTitle}>
                    {m.roleTitle}
                  </span>
                  <span className="text-xs text-slate-400 font-mono block truncate min-w-0 leading-tight mt-0.5">
                    Mã TV: {m.memberCode} • Lớp {m.class}
                  </span>
                </div>
              </div>

              {/* Quick Info Preview Card */}
              <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/80 space-y-1 text-sm min-w-0">
                <div className="flex items-center justify-between gap-2 py-1 text-sm min-w-0">
                  <span className="text-gray-400 shrink-0">Thế hệ:</span>
                  <span className="ds-badge ds-badge-purple font-medium truncate text-right shrink-0">
                    {formatGen(m.term)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 py-1 text-sm min-w-0">
                  <span className="text-gray-400 shrink-0">Ban chuyên môn:</span>
                  <span className="text-slate-100 font-medium truncate text-right min-w-0" title={m.deptName}>
                    {m.deptName}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 py-1 text-sm min-w-0">
                  <span className="text-gray-400 shrink-0">SĐT / Zalo:</span>
                  <span className="text-slate-100 font-mono font-medium truncate text-right min-w-0" title={m.phone || 'Chưa có'}>
                    {m.phone || 'Chưa có'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 py-1 text-sm min-w-0">
                  <span className="text-gray-400 shrink-0">Ngày sinh:</span>
                  <span className="text-amber-300 font-mono font-medium truncate text-right shrink-0">
                    {m.dob || 'Chưa có'}
                  </span>
                </div>
              </div>

            </div>

            {/* Pinned Card Action Buttons Footer */}
            <div className="mt-auto pt-3 border-t border-gray-800/80 flex items-center justify-between gap-1.5 w-full min-w-0 shrink-0">
              {/* Xem Chi Tiết Button */}
              <button
                onClick={() => setSelectedMember(m)}
                className="ds-btn ds-btn-primary px-2.5 sm:px-3 py-1.5 text-xs flex-1 min-w-0 h-9 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
                title="Xem chi tiết thông tin thành viên"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span className="truncate font-semibold min-w-0">Xem Chi Tiết</span>
              </button>

              {/* Icon Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Edit Button */}
                <button
                  onClick={() => {
                    if (!isHRMember) {
                      showToast('⛔ Quyền bị từ chối! Chỉ có thành viên Ban Đối Ngoại - Nhân Sự hoặc Admin mới có quyền chỉnh sửa thông tin thành viên!', 'error');
                      return;
                    }
                    const msList = (Array.isArray(m.milestones) && m.milestones.length > 0) ? m.milestones : [
                      {
                        id: 'm-def-1-' + m.id,
                        date: '20/09/2024',
                        title: `Gia nhập VMC (${m.deptName || m.department || 'Ban Chuyên Môn'})`,
                        badgeText: '[Gia nhập]',
                        badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      },
                      {
                        id: 'm-def-2-' + m.id,
                        date: '01/06/2025',
                        title: `Bổ nhiệm chức vụ: ${m.roleTitle || m.role_title || 'Thành Viên VMC'}`,
                        badgeText: '[Chức vụ]',
                        badgeStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }
                    ];
                    setEditingMember({ ...m, milestones: msList });
                  }}
                  className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                    isHRMember 
                      ? 'bg-slate-800/80 text-slate-200 border border-slate-700/70 hover:bg-blue-600 hover:text-white hover:border-blue-500' 
                      : 'bg-slate-800/40 text-slate-500 border border-slate-800 opacity-50 cursor-not-allowed'
                  }`}
                  title={isHRMember ? 'Chỉnh sửa thông tin thành viên' : 'Chỉ Ban Đối Ngoại - Nhân Sự mới được sửa'}
                >
                  <Edit className="w-4 h-4 shrink-0" />
                </button>

                {isAdmin && (
                  <>
                    {/* Reset Password */}
                    <button
                      onClick={() => resetAccountPassword(m.username)}
                      className="w-9 h-9 shrink-0 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/70 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center"
                      title="Reset mật khẩu mặc định"
                    >
                      <RefreshCw className="w-4 h-4 shrink-0" />
                    </button>

                    {/* Lock / Unlock */}
                    <button
                      onClick={() => toggleAccountStatus(m.id)}
                      className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all border ${
                        m.status === 'Active'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-slate-950'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950'
                      }`}
                      title={m.status === 'Active' ? 'Tạm khóa tài khoản' : 'Mở khóa'}
                    >
                      <Lock className="w-4 h-4 shrink-0" />
                    </button>
                  </>
                )}

                {isSuperAdmin && (
                  <button
                    onClick={() => deleteMemberAccount(m.id)}
                    className="w-9 h-9 shrink-0 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center justify-center"
                    title="Xóa vĩnh viễn tài khoản thành viên"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      <MemberDetailModal
        show={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        onEdit={() => setEditingMember(selectedMember)}
        onLock={() => toggleAccountStatus(selectedMember.id)}
        onResetPassword={() => resetPassword(selectedMember.id)}
        isHRMember={isHRMember}
        onAddMilestone={() => setIsAddMsModalOpen(true)}
      />

      <EditMemberModal
        show={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        formData={editingMember}
        setFormData={setEditingMember}
        onSubmit={handleTechUpdateMember}
        loading={false}
      />

      <NewAccountModal
        show={isNewAccountModalOpen}
        onClose={() => setIsNewAccountModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmitNewAccount}
        loading={false}
      />

      <MilestoneModal
        show={isAddMsModalOpen}
        onClose={() => setIsAddMsModalOpen(false)}
        msTitle={msTitle}
        setMsTitle={setMsTitle}
        msDate={msDate}
        setMsDate={setMsDate}
        msBadge={msBadge}
        setMsBadge={setMsBadge}
        onSubmit={handleCreateMilestone}
        loading={false}
      />

    </div>
  );
};
