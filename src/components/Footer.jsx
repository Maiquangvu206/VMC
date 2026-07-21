import React from 'react';
import { useClub } from '../context/ClubContext';
import { 
  MapPin, 
  Mail, 
  Phone, 
  ArrowUp,
  Camera,
  Share2,
  Video,
  Globe,
  ShieldCheck
} from 'lucide-react';

export const Footer = () => {
  const { setActiveTab } = useClub();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-slate-950 border-t border-white/10 pt-16 pb-8 overflow-hidden text-slate-400">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="container relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        
        {/* Col 1: Brand & Logo */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0a1128] border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/20 overflow-hidden p-0.5 shrink-0">
              <img src="/vmc-logo.jpg" alt="VMC Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white block">
                VMC <span className="text-blue-400">THPT Vĩnh Bảo</span>
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">VINH BAO HIGH SCHOOL MEDIA CLUB</span>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-300">
            Fanpage thông tin và truyền thông chính thức trực thuộc Đoàn TNCS Hồ Chí Minh trường THPT Vĩnh Bảo.
          </p>

          <div className="flex items-center gap-3 pt-2">
            {[
              { icon: Camera, title: "Instagram VMC" },
              { icon: Share2, title: "Facebook VMC THPT Vĩnh Bảo" },
              { icon: Video, title: "Youtube VMC Channel" },
              { icon: Globe, title: "Website THPT Vĩnh Bảo" }
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <a
                  key={idx}
                  href="#"
                  title={s.title}
                  className="w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-blue-400 hover:border-blue-500/50 hover:scale-110 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="font-heading text-white font-semibold text-base mb-4">Phân Hệ Quản Trị</h4>
          <ul className="space-y-2.5 text-xs">
            {[
              { id: 'dashboard', label: 'Tổng Quan Nội Bộ' },
              { id: 'tasks', label: 'Bảng Phân Công Nhiệm Vụ 4 Ban' },
              { id: 'equipment', label: 'Kho Máy Ảnh & Thiết Bị' },
              { id: 'drafts', label: 'Kịch Bản Radio & Duyệt Bài' },
              { id: 'resources', label: 'Kho Tài Nguyên File Gốc' },
              { id: 'members', label: 'Danh Sách Thành Viên' }
            ].map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => { setActiveTab(tab.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: 4 Official Departments */}
        <div>
          <h4 className="font-heading text-white font-semibold text-base mb-4">4 Ban Trong CLB VMC</h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center gap-2 text-pink-400 font-semibold">
              <span>👑</span> Ban Chủ Nhiệm
            </li>
            <li className="flex items-center gap-2 text-cyan-400 font-semibold">
              <span>🎙️</span> Ban Nội Dung - Phát Thanh
            </li>
            <li className="flex items-center gap-2 text-purple-400 font-semibold">
              <span>🎬</span> Ban Sản Xuất
            </li>
            <li className="flex items-center gap-2 text-amber-400 font-semibold">
              <span>🤝</span> Ban Đối Ngoại - Nhân Sự
            </li>
          </ul>
        </div>

        {/* Col 4: Contact & Location */}
        <div>
          <h4 className="font-heading text-white font-semibold text-base mb-4">Địa Chỉ Liên Hệ</h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Trường THPT Vĩnh Bảo, Thị trấn Vĩnh Bảo, Huyện Vĩnh Bảo, Hải Phòng</span>
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Đoàn TNCS Hồ Chí Minh Trường THPT Vĩnh Bảo</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-pink-400 shrink-0" />
              <span>vmc.thptvinhbao@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <p>© 2026 CLB Truyền thông Trường THPT Vĩnh Bảo (VMC). All rights reserved.</p>
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/10 hover:border-blue-500 text-slate-300 hover:text-white transition-all text-xs"
        >
          <span>Lên đầu trang</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
