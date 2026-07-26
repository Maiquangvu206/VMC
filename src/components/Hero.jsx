import React from 'react';
import { useClub } from '../context/ClubContext';
import { Sparkles, ArrowRight, ShieldCheck, Play, Award, Users } from 'lucide-react';
import { CLUB_INFO } from '../data/mockData';

export const Hero = () => {
  const { setActiveTab } = useClub();

  return (
    <section className="relative pt-8 pb-16 overflow-hidden">
      {/* Background Ambient Glows */}
       <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/15 blur-[150px] rounded-full pointer-events-none" />
       <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-xl rounded-full pointer-events-none" />

      <div className="page-wrap relative z-10 text-center max-w-4xl mx-auto space-y-8">
        
        {/* Official Affiliation Badge */}
        <div className="ds-badge bg-blue-500/10 border border-blue-500/20 text-blue-300 normal-case gap-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Trực thuộc Đoàn TNCS Hồ Chí Minh Trường THPT Vĩnh Bảo</span>
        </div>

        {/* Official Title */}
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          CLB Truyền Thông <br className="hidden sm:inline" />
          <span className="gradient-text">Trường THPT Vĩnh Bảo</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mx-auto">
          {CLUB_INFO.description}
        </p>

        {/* Buttons CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
           <button
             onClick={() => setActiveTab('join')}
             className="ds-btn ds-btn-primary text-sm"
           >
             <span>Ứng Tuyển Gia Nhập VMC</span>
             <ArrowRight className="w-5 h-5" />
           </button>

           <button
             onClick={() => setActiveTab('gallery')}
             className="ds-btn ds-btn-secondary text-sm"
           >
             <Play className="w-4 h-4 text-blue-400 fill-blue-400" />
             <span>Xem Tác Phẩm & Phim Ngắn</span>
           </button>
        </div>

        {/* Stats Grid */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Thành viên VMC", value: "145+", color: "blue" },
            { label: "Sản phẩm truyền thông", value: "88+", color: "cyan" },
            { label: "Bằng khen Đoàn trường", value: "15+", color: "amber" },
            { label: "Năm thành lập", value: "2020", color: "purple" }
          ].map((stat, idx) => (
           <div
             key={idx}
             className="ds-card-glass p-5 text-center rounded-2xl hover:border-blue-500/30 transition-all group"
           >
              <div className="font-heading text-3xl sm:text-4xl font-extrabold gradient-text group-hover:scale-105 transition-transform">
                {stat.value}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
