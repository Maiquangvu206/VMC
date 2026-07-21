import React, { useRef } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle, 
  ShieldCheck, 
  Clock, 
  FileCode,
  HardDrive,
  Users,
  CheckSquare,
  Camera,
  FileText
} from 'lucide-react';

export const InternalDatabase = () => {
  const { 
    db, 
    handleExportDB, 
    handleImportDB, 
    handleResetDB 
  } = useClub();

  const fileInputRef = useRef(null);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImportDB(file);
      e.target.value = '';
    }
  };

  return (
    <div className="container py-8 space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-cyan flex items-center gap-1 w-fit">
            <Database className="w-3.5 h-3.5" /> Quản Trị CSDL Động (Dynamic Local Database)
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
            Trung Tâm CSDL Động & <span className="gradient-text">Sao Lưu Dữ Liệu</span>
          </h1>
          <p className="text-xs text-slate-400">
            Dữ liệu nhiệm vụ, tài khoản, thiết bị và kịch bản được tự động lưu trữ và đồng bộ liên tục vào CSDL Động.
          </p>
        </div>

        {/* Database Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportDB}
            className="btn-primary text-xs px-4 py-2.5 shadow-blue-600/30"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Backup (.JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary text-xs px-4 py-2.5"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Nhập File Backup</span>
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Database Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Tài Khoản Thành Viên</div>
            <div className="font-heading font-extrabold text-2xl text-white font-mono mt-0.5">
              {db.members.length} Users
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Nhiệm Vụ Đang Quản Lý</div>
            <div className="font-heading font-extrabold text-2xl text-white font-mono mt-0.5">
              {db.tasks.length} Tasks
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Máy Ảnh & Thiết Bị</div>
            <div className="font-heading font-extrabold text-2xl text-white font-mono mt-0.5">
              {db.equipment.length} Items
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Bài Đăng & Kịch Bản</div>
            <div className="font-heading font-extrabold text-2xl text-white font-mono mt-0.5">
              {db.drafts.length} Drafts
            </div>
          </div>
        </div>
      </div>

      {/* Database Management Tools */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="font-heading font-bold text-lg text-white">Thao Tác CSDL Động (Database Control)</h2>
              <p className="text-xs text-slate-400">
                Lần đồng bộ CSDL gần nhất: <span className="font-mono text-blue-300">{db.lastUpdated || 'Ngay bây giờ'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleResetDB}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset CSDL Mặc Định</span>
          </button>
        </div>

        {/* Live Raw JSON Viewer */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Live Raw JSON Database Structure:</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Auto-sync Active
            </span>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-[11px] font-mono text-cyan-300 max-h-96 overflow-y-auto leading-relaxed">
            {JSON.stringify(db, null, 2)}
          </pre>
        </div>
      </div>

    </div>
  );
};
