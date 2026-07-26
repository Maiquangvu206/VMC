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
    <div className="page-wrap space-y-8 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-slate-100 mt-1 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            Danh Sách Thành Viên
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Tất cả thành viên có quyền tìm kiếm thông tin thành viên qua từng thời kỳ từ khóa sáng lập đến đương nhiệm.
          </p>
        </div>

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

      {/* Toolbar */}
      <div className="ds-card-glass p-5 flex flex-col md:flex-row items-center gap-5 justify-between">

        {/* Search Input Box */}
        <div className="relative w-full md:w-96 shrink-0">
          <div className="absolute left-3.5 inset-y-0 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo Tên, Mã TV, Lớp, SĐT..."
            className="ds-input"
          />
          {searchQuery && (
            <div className="absolute right-3 inset-y-0 flex items-center">
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">

          {/* Period / Term Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-400 whitespace-nowrap flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" /> Thế Hệ:
            </span>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="ds-input ds-select"
            >
              <option value="ALL">🌐 Tất Cả Thế Hệ (All Gen)</option>
              {generations.map(g => (
                <option key={g.id} value={g.name}>{g.description || g.name}</option>
              ))}
            </select>
          </div>

          {/* Department Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-400 whitespace-nowrap flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" /> Ban:
            </span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="ds-input ds-select"
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
            className="text-blue-400 hover:underline flex items-center gap-2 text-sm"
          >
            <X className="w-3 h-3" /> Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Account Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filteredMembers.map(m => (
          <div
            key={m.id}
            className="ds-card-glass p-6 flex flex-col h-full justify-between hover:border-blue-500/40 transition-all shadow-xl"
          >
            {/* Upper Content Box */}
            <div className="flex-1 flex flex-col justify-between space-y-5 mb-4">

              {/* Header: Avatar + Identity Info */}
              <div className="flex items-center gap-4 min-w-0">
                <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-xl object-cover border-2 border-blue-500/50 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="font-heading font-bold text-lg text-slate-100 truncate leading-snug">{m.name}</h3>
                  </div>
                  <span className="text-sm text-blue-400 font-semibold block truncate leading-tight">{m.roleTitle}</span>
                  <span className="text-xs text-slate-400 font-mono block truncate leading-tight">Mã TV: {m.memberCode} • Lớp {m.class}</span>
                </div>
              </div>

              {/* Quick Info Preview Card */}
              <div className="ds-card p-4 space-y-2 text-sm text-slate-300">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 shrink-0">Thế hệ:</span>
                  <span className="ds-badge ds-badge-purple truncate">
                    {formatGen(m.term)}
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

            {/* Pinned Card Footer */}
            <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedMember(m)}
                  className="ds-btn ds-btn-primary ds-btn-sm"
                  title="Xem chi tiết 10 thông tin thành viên"
                >
                  <Eye className="w-4 h-4" />
                  <span>Xem Chi Tiết</span>
                </button>

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
                  className={`ds-btn ${isHRMember ? 'ds-btn-secondary' : 'ds-btn-ghost opacity-60 cursor-not-allowed'}`}
                  title={isHRMember ? 'Chỉnh sửa ngày sinh & thông tin (Ban Đối Ngoại - Nhân Sự / Admin)' : 'Chỉ Ban Đối Ngoại - Nhân Sự mới được sửa'}
                >
                  <Edit className="w-4 h-4" />
                  <span>Sửa</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => resetAccountPassword(m.username)}
                      className="ds-btn ds-btn-ghost ds-btn-xs"
                      title="Reset mật khẩu mặc định (Kỹ Thuật / Trưởng Ban ĐN-NS)"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleAccountStatus(m.id)}
                      className={`ds-btn ds-btn-xs ${m.status === 'Active' ? 'ds-btn-secondary' : 'ds-btn-success'}`}
                      title={m.status === 'Active' ? 'Tạm khóa tài khoản' : 'Mở khóa'}
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  </>
                )}

                {isSuperAdmin && (
                  <button
                    onClick={() => deleteMemberAccount(m.id)}
                    className="ds-btn ds-btn-danger ds-btn-xs"
                    title="Xóa vĩnh viễn tài khoản thành viên (Super Admin)"
                  >
                    <Trash2 className="w-4 h-4" />
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
