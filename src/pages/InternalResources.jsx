import React from 'react';
import { useClub } from '../context/ClubContext';
import { FolderGit2, Download, Zap, Sparkles, FileText } from 'lucide-react';

export const InternalResources = () => {
  const { resources } = useClub();

  const handleDownload = (res) => {
    alert(`Đã bắt đầu tải xuống tài nguyên nội bộ: ${res.name} (${res.size})`);
  };

  return (
    <div className="container py-8 space-y-8 pb-20">
      
      {/* Header */}
      <div>
        <span className="badge badge-purple">VMC Cloud Drive</span>
        <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
          Kho Tài Nguyên & <span className="gradient-text">File Gốc Nội Bộ</span>
        </h1>
        <p className="text-xs text-slate-400">
          Lưu trữ Lightroom Presets chuẩn màu VMC, Template Poster PSD, Sound Effects và mẫu kịch bản truyền thông.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {resources.map(res => (
          <div
            key={res.id}
            className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 hover:border-blue-500/40"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="badge badge-purple">{res.category}</span>
                <span className="text-[10px] font-mono text-slate-400">{res.type} • {res.size}</span>
              </div>

              <h3 className="font-heading font-bold text-base text-white">
                {res.name}
              </h3>
            </div>

            <button
              onClick={() => handleDownload(res)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Tải File Này</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
