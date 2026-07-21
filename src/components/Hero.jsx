import React from 'react';
import { useClub } from '../context/ClubContext';
import { Sparkles, ArrowRight, ShieldCheck, Play, Award, Users } from 'lucide-react';
import { CLUB_INFO } from '../data/mockData';

export const Hero = () => {
  const { setActiveTab } = useClub();

  return (
    <section className="relative pt-12 pb-20 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-blue-600/20 via-sky-500/15 to-cyan-400/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="container relative z-10 text-center max-w-4xl mx-auto space-y-8">
        
        {/* Official Affiliation Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-semibold uppercase tracking-wider animate-float shadow-lg">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Trực thuộc Đoàn TNCS Hồ Chí Minh Trường THPT Vĩnh Bảo</span>
        </div>

        {/* Official Title */}
        <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15]">
          CLB Truyền Thông <br className="hidden sm:inline" />
          <span className="gradient-text">Trường THPT Vĩnh Bảo</span>
        </h1>

        {/* Subtitle matching image description */}
        <p className="text-slate-300 text-sm sm:text-lg font-normal leading-relaxed max-w-3xl mx-auto">
          {CLUB_INFO.description}
        </p>

        {/* Buttons CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveTab('join')}
            className="btn-primary text-sm sm:text-base px-8 py-3.5 shadow-blue-600/40 hover:scale-105"
          >
            <span>Ứng Tuyển Gia Nhập VMC</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className="btn-secondary text-sm sm:text-base px-8 py-3.5"
          >
            <Play className="w-4 h-4 text-blue-400 fill-blue-400" />
            <span>Xem Tác Phẩm & Phim Ngắn</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Thành viên VMC", value: "145+" },
            { label: "Sản phẩm truyền thông", value: "88+" },
            { label: "Bằng khen Đoàn trường", value: "15+" },
            { label: "Năm thành lập", value: "2020" }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="glass-card p-5 text-center rounded-2xl border border-white/10 hover:border-blue-500/40"
            >
              <div className="font-heading text-3xl sm:text-4xl font-extrabold gradient-text">
                {stat.value}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
