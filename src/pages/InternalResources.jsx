import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  FolderGit2, 
  Download, 
  ExternalLink, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Cloud, 
  FileText, 
  Sparkles, 
  Filter, 
  HardDrive,
  UserCheck,
  Crown,
  Mic,
  Film,
  Users,
  Edit3,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

export const InternalResources = () => {
  const { 
    resources = [], 
    addResource, 
    deleteResource, 
    departmentDrives = [], 
    updateDepartmentDrive,
    currentUser,
    showToast
  } = useClub();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit Department Drive Link Modal State
  const [editingDept, setEditingDept] = useState(null);
  const [newDeptDriveUrl, setNewDeptDriveUrl] = useState('');

  // Form State for New File Resource
  const [formData, setFormData] = useState({
    name: '',
    category: 'Preset',
    department: 'production',
    type: '.ZIP',
    size: 'Cloud Drive',
    driveUrl: ''
  });

  const categories = ['All', 'Preset', 'Template PSD', 'Audio', 'Kịch Bản', 'Design System', 'Đối Ngoại'];

  const getDeptIcon = (iconName) => {
    switch (iconName) {
      case 'Crown': return <Crown className="w-6 h-6 text-amber-400" />;
      case 'Mic': return <Mic className="w-6 h-6 text-emerald-400" />;
      case 'Film': return <Film className="w-6 h-6 text-purple-400" />;
      case 'Users': return <Users className="w-6 h-6 text-cyan-400" />;
      default: return <FolderGit2 className="w-6 h-6 text-blue-400" />;
    }
  };

  const getDeptBadgeClass = (deptId) => {
    switch (deptId) {
      case 'bcn': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'content_radio': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'production': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'hr_external': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Filter resources
  const filteredResources = resources.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (res.uploader && res.uploader.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
    const matchesDept = selectedDeptFilter === 'all' || res.department === selectedDeptFilter;
    
    return matchesSearch && matchesCategory && matchesDept;
  });

  const handleOpenDrive = (url) => {
    const driveLink = url || 'https://drive.google.com/';
    window.open(driveLink, '_blank', 'noopener,noreferrer');
  };

  const handleOpenEditDeptModal = (dept) => {
    setEditingDept(dept);
    setNewDeptDriveUrl(dept.driveUrl || '');
  };

  const handleSaveDeptDrive = (e) => {
    e.preventDefault();
    if (!editingDept || !newDeptDriveUrl.trim()) return;
    updateDepartmentDrive(editingDept.id, newDeptDriveUrl.trim());
    setEditingDept(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên tài nguyên!', 'warning');
      return;
    }
    if (!formData.driveUrl.trim()) {
      showToast('Vui lòng nhập đường dẫn Google Drive!', 'warning');
      return;
    }

    addResource(formData);
    setFormData({
      name: '',
      category: 'Preset',
      department: 'production',
      type: '.ZIP',
      size: 'Cloud Drive',
      driveUrl: ''
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="page-wrap space-y-10 pb-20">
      
      {/* Header Banner */}
      <div className="ds-card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-3">
            <span className="ds-badge ds-badge-purple">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span>VMC Department Drive Network</span>
            </span>
            <span className="text-sm text-slate-400 font-mono">4 Ban Chuyên Môn</span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100">
            Kho Google Drive <span className="text-blue-400">Riêng Từng Ban Chuyên Môn</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
            Kết nối trực tiếp tới thư mục Google Drive của từng Ban (Ban Chủ Nhiệm, Ban Nội Dung - Phát Thanh, Ban Sản Xuất, Ban Đối Ngoại - Nhân Sự). Lưu trữ và truy cập dữ liệu dễ dàng.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="relative z-10 self-start sm:self-auto ds-btn ds-btn-primary"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Link File Mới</span>
        </button>
      </div>

      {/* Section 1: Thư Mục Google Drive Trực Tiếp Của Từng Ban */}
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <FolderOpen className="w-6 h-6 text-amber-400" />
          <h2 className="font-heading text-2xl font-bold text-slate-100">Thư Mục Google Drive Trực Tiếp Từng Ban</h2>
          <span className="text-sm text-slate-400">Click để mở trực tiếp Folder Drive của Ban</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departmentDrives.map(dept => (
            <div
              key={dept.id}
              className="ds-card p-6 flex flex-col justify-between space-y-5 group relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 ds-card border border-[var(--border-default)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getDeptIcon(dept.icon)}
                  </div>
                  
                  <button
                    onClick={() => handleOpenEditDeptModal(dept)}
                    title="Chỉnh sửa link Drive của Ban"
                    className="ds-btn ds-btn-ghost ds-btn-xs"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-sm text-amber-300 font-semibold mt-1">
                    Trưởng ban: {dept.lead}
                  </p>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {dept.desc}
                </p>
              </div>

              <button
                onClick={() => handleOpenDrive(dept.driveUrl)}
                className="ds-btn ds-btn-primary w-full"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Truy Cập Drive Ban</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[var(--border-default)]" />

      {/* Section 2: Kho File & Tài Nguyên Chi Tiết */}
      <div className="space-y-6">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <HardDrive className="w-6 h-6 text-cyan-400" />
            <h2 className="font-heading text-2xl font-bold text-slate-100">Kho File Chi Tiết & Tài Nguyên Theo Ban</h2>
            <p className="text-sm text-slate-400 mt-2">Danh sách các file lẻ, Preset, Template PSD được phân loại theo Ban</p>
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center w-full">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm file, loại định dạng, người đăng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ds-input pl-12 pr-10"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Filter Controls: Department Pills & Category Pills */}
        <div className="ds-card p-5 space-y-4">
          
          {/* Department Filter Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-sm font-semibold text-slate-400 whitespace-nowrap pr-2">Lọc Theo Ban:</span>
            <button
              onClick={() => setSelectedDeptFilter('all')}
              className={`ds-btn ${selectedDeptFilter === 'all' ? 'ds-btn-primary' : 'ds-btn-secondary'} shrink-0`}
            >
              Tất Cả Các Ban
            </button>

            {departmentDrives.map(dept => (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptFilter(dept.id)}
                className={`ds-btn shrink-0 ${selectedDeptFilter === dept.id ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
              >
                {dept.name}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-3 overflow-x-auto pt-2 scrollbar-none border-t border-[var(--border-default)]">
            <span className="text-sm font-semibold text-slate-400 whitespace-nowrap pr-2">Loại Dữ Liệu:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`ds-btn ds-btn-xs shrink-0 ${selectedCategory === cat ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
              >
                {cat === 'All' ? 'Tất Cả Loại' : cat}
              </button>
            ))}
          </div>

        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className="ds-card p-12 text-center space-y-4">
            <HardDrive className="w-16 h-16 text-slate-500 mx-auto" />
            <h3 className="text-slate-100 font-bold text-lg">Không tìm thấy tài nguyên nào phù hợp</h3>
            <p className="text-sm text-slate-400">Hãy thử tìm kiếm với từ khóa khác hoặc đổi Ban filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(res => (
              <div
                key={res.id}
                className="ds-card p-6 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center gap-3">
                    <span className="ds-badge ds-badge-purple">{res.category}</span>
                    <span className={`ds-badge ${res.department === 'bcn' ? 'ds-badge-amber' : res.department === 'content_radio' ? 'ds-badge-emerald' : res.department === 'production' ? 'ds-badge-purple' : res.department === 'hr_external' ? 'ds-badge-cyan' : 'ds-badge-blue'}`}>
                      {res.deptName || 'Chưa phân ban'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="ds-badge ds-badge-blue">
                      {res.type} • {res.size}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {res.name}
                  </h3>

                  {res.uploader && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <UserCheck className="w-4 h-4 text-blue-400" />
                      <span>Người đăng: <strong className="text-slate-300 font-normal">{res.uploader}</strong></span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[var(--border-default)] flex items-center gap-3">
                  <button
                    onClick={() => handleOpenDrive(res.driveUrl)}
                    className="ds-btn ds-btn-primary flex-1"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Mở Google Drive</span>
                  </button>

                  <button
                    onClick={() => deleteResource(res.id)}
                    title="Xóa tài nguyên này"
                    className="ds-btn ds-btn-danger ds-btn-xs"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal: Thêm Tài Nguyên Mới vào Kho Drive Ban */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg ds-card ds-card-elevated border border-blue-500/30 p-6 sm:p-8 shadow-2xl space-y-6 text-white animate-slide-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-3">
                <Cloud className="w-6 h-6 text-cyan-400" />
                <h3 className="font-heading font-bold text-lg text-slate-100">Thêm File Vào Kho Drive Của Ban</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 text-sm">
              
              <div>
                <label className="ds-field-label">
                  Tên File / Bộ Tài Nguyên <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kịch Bản Phát Thanh Số 09 Khóa 60"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="ds-input"
                />
              </div>

              <div>
                <label className="ds-field-label">
                  Chọn Ban Sở Hữu / Phụ Trách <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => {
                    const deptObj = departmentDrives.find(d => d.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      department: e.target.value,
                      deptName: deptObj ? deptObj.name : ''
                    });
                  }}
                  className="ds-input ds-select"
                >
                  <option value="bcn">Ban Chủ Nhiệm</option>
                  <option value="content_radio">Ban Nội Dung - Phát Thanh</option>
                  <option value="production">Ban Sản Xuất</option>
                  <option value="hr_external">Ban Đối Ngoại - Nhân Sự</option>
                </select>
              </div>

              <div>
                <label className="ds-field-label">
                  Đường Dẫn Google Drive File / Folder <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.driveUrl}
                  onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                  className="ds-input font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="ds-field-label">Phân Loại Dữ Liệu</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="ds-input ds-select"
                  >
                    <option value="Preset">Preset</option>
                    <option value="Template PSD">Template PSD</option>
                    <option value="Audio">Audio</option>
                    <option value="Kịch Bản">Kịch Bản</option>
                    <option value="Design System">Design System</option>
                    <option value="Đối Ngoại">Đối Ngoại</option>
                  </select>
                </div>

                <div>
                  <label className="ds-field-label">Định Dạng File</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: .DOCX, .PSD, .XMP"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="ds-input"
                  />
                </div>
              </div>

              <div>
                <label className="ds-field-label">Dung Lượng Uớc Tính</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 45 MB, 1.2 GB, Cloud Folder"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="ds-input"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="ds-btn ds-btn-secondary"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="ds-btn ds-btn-primary"
                >
                  Lưu & Đăng Lên Drive
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Sửa Link Google Drive Gốc Của Ban */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md">
          <div className="relative w-full max-w-md ds-card ds-card-elevated border border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6 text-white animate-slide-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-amber-400" />
                <h3 className="font-heading font-bold text-base text-white">Sửa Link Drive: {editingDept.name}</h3>
              </div>
              <button 
                onClick={() => setEditingDept(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeptDrive} className="space-y-4 text-xs">
              <div>
                <label className="ds-field-label">
                  Link Thư Mục Google Drive Gốc <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={newDeptDriveUrl}
                  onChange={(e) => setNewDeptDriveUrl(e.target.value)}
                  className="ds-input font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="ds-btn ds-btn-secondary"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="ds-btn ds-btn-primary"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cập Nhật Link Ban</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
