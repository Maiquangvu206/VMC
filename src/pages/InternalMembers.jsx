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
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { NewAccountModal, generateRandomVmcUsername, generateRandomPassword } from '../components/members/NewAccountModal';
import { MemberDetailModal } from '../components/members/MemberDetailModal';
import { EditMemberModal } from '../components/members/EditMemberModal';
import { MilestoneModal } from '../components/members/MilestoneModal';
import { ConfirmDeleteModal } from '../components/members/ConfirmDeleteModal';
import { RoleTitleDisplay } from '../utils/roleHelper';

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
    .replace(/[–—−-]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

const resolveDeptValue = (dept) => {
  if (!dept || dept === 'ALL') return 'ALL';
  const norm = normalizeText(dept);
  if (norm.includes('noi dung') || norm.includes('phat thanh')) return 'Ban Nội Dung - Phát Thanh';
  if (norm.includes('san xuat')) return 'Ban Sản Xuất';
  if (norm.includes('doi ngoai') || norm.includes('nhan su') || norm.includes('dn-ns')) return 'Ban Đối Ngoại - Nhân Sự';
  if (norm.includes('co van')) return 'Ban Cố Vấn';
  if (norm.includes('chu nhiem')) return 'Ban Chủ Nhiệm';
  return dept;
};

export const InternalMembers = () => {
  const {
    members,
    currentUser,
    isHRMember,
    isHRHead,
    isAdmin,
    isSuperAdmin,
    isAdvisor,
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

  // 1. Quyền Chỉnh Sửa Thẻ: Chỉ Admin và Ban ĐN-NS (các ban khác & Cố vấn KHÔNG hiện)
  const canEditMember = !isAdvisor && Boolean(isAdmin || isSuperAdmin || isHRMember || isHRHead);

  // 2. Quyền Quản Trị Hệ Thống (Reset mật khẩu, Khóa tài khoản, Xóa vĩnh viễn): CHỈ ADMIN HIỆN
  const canManageAccount = !isAdvisor && Boolean(isAdmin || isSuperAdmin);

  // 3. Có quyền mở menu thao tác (nếu không có cả 2 quyền trên thì ẩn hoàn toàn menu 3-dots)
  const canPerformAnyAction = canEditMember || canManageAccount;

  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  React.useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.member-popover-menu') && !e.target.closest('.member-popover-toggle')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handleTechUpdateMember = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingMember) return;
    const targetId = editingMember.id || editingMember.memberCode || editingMember.member_code;
    if (typeof updateMemberByTech === 'function') {
      const res = await updateMemberByTech(targetId, editingMember);
      if (res !== false) {
        setEditingMember(null);
      }
    } else {
      setEditingMember(null);
    }
  };

  const [isAddMsModalOpen, setIsAddMsModalOpen] = useState(false);
  const [msTitle, setMsTitle] = useState('');
  const [msDate, setMsDate] = useState('');
  const [msBadge, setMsBadge] = useState('[Cột mốc]');

  const handleCreateMilestone = () => {
    if (!isAdmin && !isSuperAdmin) {
      showToast('⚠️ Chỉ Quản Trị Viên (Admin) mới có quyền thêm cột mốc chức vụ!', 'error');
      return;
    }
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
  const [selectedDept, setSelectedDept] = useState(resolveDeptValue(membersFilterDept) || 'ALL');

  React.useEffect(() => {
    if (membersFilterDept) {
      const resolved = resolveDeptValue(membersFilterDept);
      if (resolved !== selectedDept) {
        setSelectedDept(resolved);
      }
    }
  }, [membersFilterDept]);

  const handleDeptChange = (newDept) => {
    setSelectedDept(newDept);
    setMembersFilterDept(newDept);
  };

  const hasSuperAdmin = members.some(m => m.roleTitle?.includes('Super Admin'));

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [formData, setFormData] = useState({
    username: generateRandomVmcUsername(members),
    password: generateRandomPassword(),
    name: '',
    class: '10A1',
    role: 'member',
    roleTitle: 'Thành viên',
    department: 'production',
    deptName: 'Ban Sản Xuất Media',
    term: 'Gen 8',
    termName: 'Gen 8',
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

  const handleSubmitNewAccount = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.username || !formData.name || !formData.phone) {
      showToast('Vui lòng nhập đầy đủ Mã thành viên, Họ tên và Số điện thoại!', 'warning');
      return;
    }
    if (!formData.email) {
      showToast('Vui lòng nhập địa chỉ Email để hệ thống gửi mật khẩu ngẫu nhiên tới thành viên!', 'warning');
      return;
    }
    setIsCreatingAccount(true);
    try {
      const res = await createMemberAccount(formData);
      if (res !== false) {
        setIsNewAccountModalOpen(false);
        setFormData({
          username: generateRandomVmcUsername(members),
          password: generateRandomPassword(),
          name: '', class: '10A1', role: 'member',
          roleTitle: 'Thành viên', department: 'production', deptName: 'Ban Sản Xuất Media',
          term: 'Gen 8', termName: 'Gen 8', phone: '', email: '',
          dob: '01/01/2009', address: 'Thị trấn Vĩnh Bảo, Vĩnh Bảo, Hải Phòng',
          facebook: 'https://facebook.com/'
        });
      }
    } finally {
      setIsCreatingAccount(false);
    }
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
      let matchesDept = selectedDept === 'ALL';
      if (!matchesDept) {
        const memberRoleTitle = normalizeText(m.roleTitle || m.role_title || '');
        if (
          memberDept === selectedDeptNormalized ||
          memberDept.includes(selectedDeptNormalized) ||
          selectedDeptNormalized.includes(memberDept)
        ) {
          matchesDept = true;
        } else if (
          (selectedDeptNormalized.includes('noi dung') && (memberDept.includes('noi dung') || memberRoleTitle.includes('noi dung') || memberRoleTitle.includes('phat thanh'))) ||
          (selectedDeptNormalized.includes('san xuat') && (memberDept.includes('san xuat') || memberRoleTitle.includes('san xuat'))) ||
          (selectedDeptNormalized.includes('doi ngoai') && (memberDept.includes('doi ngoai') || memberDept.includes('nhan su') || memberDept.includes('dn-ns') || memberRoleTitle.includes('doi ngoai') || memberRoleTitle.includes('nhan su') || memberRoleTitle.includes('dn-ns'))) ||
          (selectedDeptNormalized.includes('co van') && (memberDept.includes('co van') || memberRoleTitle.includes('co van'))) ||
          (selectedDeptNormalized.includes('chu nhiem') && (memberDept.includes('chu nhiem') || memberRoleTitle.includes('chu nhiem') || memberRoleTitle.includes('pcn')))
        ) {
          matchesDept = true;
        }
      }
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
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500 shrink-0" />
            <span>Danh Sách Thành Viên</span>
          </h1>
        </div>

        {canManageAccount && (
          <button
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                username: generateRandomVmcUsername(members)
              }));
              setIsNewAccountModalOpen(true);
            }}
            className="ds-btn ds-btn-primary text-xs shrink-0"
            title="Cấp tài khoản mới (Chỉ Admin)"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Cấp Tài Khoản Mới</span>
          </button>
        )}
      </div>

      {/* Toolbar / Filter Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-default)] shadow-sm">

        {/* Search Input Box */}
        <div className="relative flex items-center w-full md:flex-1 min-w-0">
          <Search className="absolute left-3.5 w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo Tên, Mã TV, Lớp, SĐT..."
            className="ds-input pl-10 pr-9 w-full text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">

          {/* Period / Term Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap flex items-center gap-1.5 shrink-0">
              <Calendar className="w-4 h-4 text-purple-500 shrink-0" /> Thế Hệ:
            </span>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="ds-input ds-select w-full sm:w-auto min-w-[150px] text-sm"
            >
              <option value="ALL">🌐 Tất Cả Thế Hệ</option>
              {generations.map(g => (
                <option key={g.id} value={g.name}>{g.description || g.name}</option>
              ))}
            </select>
          </div>

          {/* Department Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap flex items-center gap-1.5 shrink-0">
              <Filter className="w-4 h-4 text-cyan-500 shrink-0" /> Ban:
            </span>
            <select
              value={selectedDept}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="ds-input ds-select w-full sm:w-auto min-w-[170px] text-sm"
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
      <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] px-1">
        <span>Hiển thị <strong className="text-[var(--text-primary)] font-bold">{filteredMembers.length}</strong> / {nonAdminMembers.length} thành viên</span>
        {(searchQuery || selectedTerm !== 'ALL' || selectedDept !== 'ALL') && (
          <button
            onClick={() => { setSearchQuery(''); setSelectedTerm('ALL'); handleDeptChange('ALL'); }}
            className="text-blue-500 hover:underline flex items-center gap-1.5 text-sm"
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
            className={`ds-card p-5 sm:p-6 rounded-xl flex flex-col h-full justify-between hover:border-blue-500/40 transition-all shadow-md overflow-visible min-w-0 relative ${String(activeMenuId) === String(m.id) ? 'z-50' : 'z-10'}`}
          >
            {/* Upper Content Box */}
            <div className="flex-1 flex flex-col justify-between space-y-4 mb-4 min-w-0">

              {/* Header: Avatar + Identity Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={m.avatar || m.avatar_url || '/vmc-logo.jpg'}
                  alt={m.name}
                  onError={(e) => { e.currentTarget.src = '/vmc-logo.jpg'; }}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-blue-500/50 shrink-0 shadow-sm"
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--text-primary)] truncate min-w-0 leading-snug" title={m.name}>
                    {m.name}
                  </h3>
                  <RoleTitleDisplay roleTitle={m.roleTitle || m.role_title} className="text-xs sm:text-sm text-blue-500 dark:text-blue-400 font-semibold min-w-0 leading-tight mt-0.5" />
                  <span className="text-xs text-[var(--text-muted)] font-mono block truncate min-w-0 leading-tight mt-0.5">
                    Mã TV: {m.memberCode}
                  </span>
                </div>
              </div>

              {/* Quick Info Preview Card */}
              <div className="bg-[var(--bg-tertiary)] p-3.5 rounded-lg border border-[var(--border-default)] space-y-1 text-sm min-w-0">
                <div className="flex items-center justify-between gap-2 py-1 text-sm min-w-0">
                  <span className="text-[var(--text-secondary)] shrink-0">Thế hệ:</span>
                  <span className="ds-badge ds-badge-purple font-medium truncate text-right shrink-0">
                    {formatGen(m.term)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 py-1 text-sm min-w-0">
                  <span className="text-[var(--text-secondary)] shrink-0">Ban chuyên môn:</span>
                  <span className="text-[var(--text-primary)] font-medium truncate text-right min-w-0" title={m.deptName}>
                    {m.deptName}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 py-1 text-sm min-w-0">
                  <span className="text-[var(--text-secondary)] shrink-0">SĐT / Zalo:</span>
                  <span className="text-[var(--text-primary)] font-mono font-medium truncate text-right min-w-0" title={m.phone || 'Chưa có'}>
                    {m.phone || 'Chưa có'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 py-1 text-sm min-w-0">
                  <span className="text-[var(--text-secondary)] shrink-0">Ngày sinh:</span>
                  <span className="text-amber-500 dark:text-amber-300 font-mono font-medium truncate text-right shrink-0">
                    {m.dob || 'Chưa có'}
                  </span>
                </div>
              </div>

            </div>

            {/* Pinned Card Action Buttons Footer */}
            <div className="mt-auto pt-3 border-t border-[var(--border-default)] flex items-center justify-between gap-2 w-full min-w-0 shrink-0 relative">
              {/* Xem Chi Tiết Button */}
              <button
                onClick={() => setSelectedMember(m)}
                className="ds-btn ds-btn-primary px-3 py-2 text-xs flex-1 min-w-0 h-9 rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
                title="Xem chi tiết thông tin thành viên"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span className="truncate font-semibold min-w-0">Xem Chi Tiết</span>
              </button>

              {/* 3-Dots Action Popover Menu: Chỉ hiện nếu có quyền Sửa (Admin & ĐN-NS) hoặc quyền Quản trị (Admin) */}
              {canPerformAnyAction && (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(String(activeMenuId) === String(m.id) ? null : m.id);
                    }}
                    className="member-popover-toggle w-9 h-9 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer"
                    title="Thao tác nâng cao"
                  >
                    <MoreVertical className="w-4 h-4 shrink-0 pointer-events-none" />
                  </button>

                  {/* Dropdown Menu Overlay */}
                  {String(activeMenuId) === String(m.id) && (
                    <div
                      className="member-popover-menu absolute right-0 bottom-full mb-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-1.5 shadow-2xl z-50 space-y-1 animate-slide-up"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Edit Option: Hiện với Admin và Ban ĐN-NS */}
                      {canEditMember && (
                        <button
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            const msList = (Array.isArray(m.milestones) && m.milestones.length > 0) ? m.milestones : [
                              {
                                id: 'm-def-1-' + m.id,
                                date: '20/09/2024',
                                title: `Gia nhập VMC (${m.deptName || m.department || 'Ban Chuyên Môn'})`,
                                badgeText: '[Gia nhập]',
                                badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              }
                            ];
                            setEditingMember({
                              ...m,
                              name: m.name || m.full_name || '',
                              memberCode: m.memberCode || m.member_code || m.id || '',
                              deptName: m.deptName || m.department || '',
                              roleTitle: m.roleTitle || m.role_title || '',
                              milestones: msList
                            });
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer select-none text-left"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-500 shrink-0 pointer-events-none" />
                          <span className="pointer-events-none">Chỉnh Sửa Thẻ</span>
                        </button>
                      )}

                      {/* Reset Password Option: CHỈ ADMIN HIỆN */}
                      {canManageAccount && (
                        <button
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            const targetId = m.memberCode || m.member_code || m.username || m.id;
                            if (typeof resetAccountPassword === 'function') {
                              await resetAccountPassword(targetId);
                            } else if (typeof resetMemberPassword === 'function') {
                              await resetMemberPassword(m.id);
                            }
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer select-none text-left"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-500 shrink-0 pointer-events-none" />
                          <span className="pointer-events-none">Reset Mật Khẩu</span>
                        </button>
                      )}

                      {/* Lock / Unlock Option: CHỈ ADMIN HIỆN */}
                      {canManageAccount && (() => {
                        const isItemLocked = m.status === 'Locked' || m.status === 'Suspended';
                        return (
                          <button
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={async (e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              const targetId = m.memberCode || m.member_code || m.username || m.id;
                              if (typeof toggleAccountStatus === 'function') {
                                const newSt = await toggleAccountStatus(targetId);
                                if (newSt && selectedMember && (selectedMember.id === m.id || selectedMember.memberCode === m.memberCode)) {
                                  setSelectedMember(prev => prev ? { ...prev, status: newSt } : null);
                                }
                              }
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer select-none text-left"
                          >
                            <Lock className={`w-3.5 h-3.5 shrink-0 pointer-events-none ${isItemLocked ? 'text-emerald-500' : 'text-rose-500'}`} />
                            <span className="pointer-events-none">{isItemLocked ? 'Mở Khóa' : 'Khóa Tài Khoản'}</span>
                          </button>
                        );
                      })()}

                      {/* Delete Option: CHỈ ADMIN HIỆN */}
                      {canManageAccount && (
                        <button
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            setMemberToDelete(m);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer select-none text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0 pointer-events-none" />
                          <span className="pointer-events-none">Xóa Vĩnh Viễn</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      <MemberDetailModal
        show={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        canEdit={canEditMember}
        canManageAccount={canManageAccount}
        onEdit={() => setEditingMember(selectedMember)}
        onLock={async () => {
          const targetId = selectedMember?.id || selectedMember?.memberCode;
          const newSt = await toggleAccountStatus(targetId);
          if (newSt) {
            setSelectedMember(prev => prev ? { ...prev, status: newSt } : null);
          }
        }}
        onResetPassword={() => resetAccountPassword(selectedMember?.memberCode || selectedMember?.id)}
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
        canManageAccount={canManageAccount}
        onResetPassword={() => {
          if (editingMember) {
            resetAccountPassword(editingMember.memberCode || editingMember.id);
          }
        }}
      />

      <NewAccountModal
        show={isNewAccountModalOpen}
        onClose={() => setIsNewAccountModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmitNewAccount}
        loading={isCreatingAccount}
        generations={generations}
        existingMembers={members}
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

      <ConfirmDeleteModal
        show={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        member={memberToDelete}
        loading={isDeletingMember}
        onConfirm={async () => {
          if (!memberToDelete) return;
          setIsDeletingMember(true);
          const targetId = memberToDelete.id || memberToDelete.memberCode || memberToDelete.member_code;
          const ok = await deleteMemberAccount(targetId, true);
          setIsDeletingMember(false);
          if (ok !== false) {
            setMemberToDelete(null);
            if (selectedMember && (selectedMember.id === memberToDelete.id || selectedMember.memberCode === memberToDelete.memberCode)) {
              setSelectedMember(null);
            }
          }
        }}
      />

    </div>
  );
};
