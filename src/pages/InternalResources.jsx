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
    currentUser 
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
      alert('Vui lòng nhập tên tài nguyên!');
      return;
    }
    if (!formData.driveUrl.trim()) {
      alert('Vui lòng nhập đường dẫn Google Drive!');
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
    <div className="container py-8 space-y-10 pb-20">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 sm:p-8 rounded-3xl border border-blue-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="badge badge-purple flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>VMC Department Drive Network</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">4 Ban Chuyên Môn</span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Kho Google Drive <span className="gradient-text">Riêng Từng Ban Chuyên Môn</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Kết nối trực tiếp tới thư mục Google Drive của từng Ban (Ban Chủ Nhiệm, Ban Nội Dung - Phát Thanh, Ban Sản Xuất, Ban Đối Ngoại - Nhân Sự). Lưu trữ và truy cập dữ liệu dễ dàng.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="relative z-10 self-start sm:self-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-blue-600/30 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Link File Mới</span>
        </button>
      </div>

      {/* Section 1: Thư Mục Google Drive Trực Tiếp Của Từng Ban */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-extrabold text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-amber-400" />
            <span>Thư Mục Google Drive Trực Tiếp Từng Ban</span>
          </h2>
          <span className="text-xs text-slate-400">Click để mở trực tiếp Folder Drive của Ban</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {departmentDrives.map(dept => (
            <div
              key={dept.id}
              className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 group-hover:scale-110 transition-transform">
                    {getDeptIcon(dept.icon)}
                  </div>
                  
                  <button
                    onClick={() => handleOpenEditDeptModal(dept)}
                    title="Chỉnh sửa link Drive của Ban"
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition-all text-xs flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-[11px] text-amber-300 font-medium mt-0.5">
                    Trưởng ban: {dept.lead}
                  </p>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {dept.desc}
                </p>
              </div>

              <button
                onClick={() => handleOpenDrive(dept.driveUrl)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-blue-600 hover:to-indigo-600 text-blue-300 hover:text-white border border-blue-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Truy Cập Drive Ban</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-white/10" />

      {/* Section 2: Kho File & Tài Nguyên Chi Tiết */}
      <div className="space-y-6">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          <div>
            <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              <span>Kho File Chi Tiết & Tài Nguyên Theo Ban</span>
            </h2>
            <p className="text-xs text-slate-400">Danh sách các file lẻ, Preset, Template PSD được phân loại theo Ban</p>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm file, loại định dạng, người đăng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Filter Controls: Department Pills & Category Pills */}
        <div className="space-y-3 glass-card p-4 rounded-2xl border border-white/10">
          
          {/* Department Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap pr-2">Lọc Theo Ban:</span>
            <button
              onClick={() => setSelectedDeptFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDeptFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Tất Cả Các Ban
            </button>

            {departmentDrives.map(dept => (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptFilter(dept.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDeptFilter === dept.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none border-t border-white/5">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap pr-2">Loại Dữ Liệu:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'All' ? 'Tất Cả Loại' : cat}
              </button>
            ))}
          </div>

        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-white/10 space-y-3">
            <HardDrive className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-white font-bold text-base">Không tìm thấy tài nguyên nào phù hợp</h3>
            <p className="text-xs text-slate-400">Hãy thử tìm kiếm với từ khóa khác hoặc đổi Ban filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(res => (
              <div
                key={res.id}
                className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-5 hover:border-blue-500/40 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="badge badge-purple font-semibold">{res.category}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDeptBadgeClass(res.department)}`}>
                      {res.deptName || 'Chưa phân ban'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                      {res.type} • {res.size}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {res.name}
                  </h3>

                  {res.uploader && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Người đăng: <strong className="text-slate-300 font-normal">{res.uploader}</strong></span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDrive(res.driveUrl)}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Mở Google Drive</span>
                  </button>

                  <button
                    onClick={() => deleteResource(res.id)}
                    title="Xóa tài nguyên này"
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal: Thêm Tài Nguyên Mới vào Kho Drive Ban */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white animate-slide-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Cloud className="w-6 h-6 text-cyan-400" />
                <h3 className="font-heading font-bold text-lg text-white">Thêm File Vào Kho Drive Của Ban</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tên File / Bộ Tài Nguyên <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kịch Bản Phát Thanh Số 09 Khóa 60"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="bcn">Ban Chủ Nhiệm</option>
                  <option value="content_radio">Ban Nội Dung - Phát Thanh</option>
                  <option value="production">Ban Sản Xuất</option>
                  <option value="hr_external">Ban Đối Ngoại - Nhân Sự</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Đường Dẫn Google Drive File / Folder <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.driveUrl}
                  onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phân Loại Dữ Liệu</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
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
                  <label className="block text-slate-300 font-semibold mb-1">Định Dạng File</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: .DOCX, .PSD, .XMP"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dung Lượng Uớc Tính</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 45 MB, 1.2 GB, Cloud Folder"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-all"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white animate-slide-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
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
                <label className="block text-slate-300 font-semibold mb-1">
                  Link Thư Mục Google Drive Gốc <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={newDeptDriveUrl}
                  onChange={(e) => setNewDeptDriveUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-all"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
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
