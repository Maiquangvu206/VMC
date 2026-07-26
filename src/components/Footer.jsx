import React from 'react';
import {
  MapPin,
  Mail,
  ArrowUp,
  Camera,
  Share2,
  Video,
  Globe,
  ShieldCheck
} from 'lucide-react';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] pt-12 pb-8 overflow-hidden text-slate-400">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-xl rounded-full pointer-events-none" />

      <div className="page-wrap relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[var(--bg-secondary)] border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/15 overflow-hidden p-0.5 shrink-0">
                <img src="/vmc-logo.jpg" alt="VMC Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-lg tracking-tight text-white block">
                  VMC <span className="text-blue-400">THPT Vĩnh Bảo</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">VINH BAO HIGH SCHOOL MEDIA CLUB</span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">
              Fanpage thông tin và truyền thông chính thức trực thuộc Đoàn TNCS Hồ Chí Minh trường THPT Vĩnh Bảo.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
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
                    className="ds-btn ds-btn-ghost w-9 h-9 p-0"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Departments */}
          <div>
            <h4 className="font-heading text-white font-semibold text-sm mb-4">5 Ban Trong CLB VMC</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-pink-400 font-semibold">
                <span>👑</span> Ban Chủ Nhiệm
              </li>
              <li className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span>🧭</span> Ban Cố Vấn
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

          {/* Contact */}
          <div>
            <h4 className="font-heading text-white font-semibold text-sm mb-4">Địa Chỉ Liên Hệ</h4>
            <ul className="space-y-2.5 text-xs">
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

        <div className="border-t border-[var(--border-subtle)] mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-xs">
          <p className="leading-relaxed text-center sm:text-left">© 2026 Ban Đối Ngoại - Nhân Sự (VMC). All rights reserved.</p>
          <button
            onClick={scrollToTop}
            className="ds-btn ds-btn-secondary ds-btn-xs"
          >
            <span>Lên đầu trang</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
