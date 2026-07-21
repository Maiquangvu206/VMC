import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { useClub } from '../context/ClubContext';
import { CLUB_INFO } from '../data/mockData';
import { 
  Camera, 
  Video, 
  Palette, 
  Music, 
  Heart, 
  Eye, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Clock,
  Sparkles,
  Users,
  CheckCircle
} from 'lucide-react';

export const HomePage = () => {
  const { works, events, setActiveTab, registerEvent, likeWork } = useClub();
  const [selectedWork, setSelectedWork] = useState(null);

  const deptIcons = {
    photo: Camera,
    media: Video,
    design: Palette,
    music: Music
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <Hero />

      {/* 4 Ban Chuyên Môn */}
      <section className="container">
        <div className="text-center space-y-3 mb-12">
          <span className="badge badge-purple">4 Trụ Cột Sáng Tạo</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Các Ban Chuyên Môn Tại <span className="gradient-text">VMC</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Mỗi ban là một môi trường rèn luyện thực chiến, kết hợp giữa đam mê và kỹ năng chuyên nghiệp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CLUB_INFO.departments.map(dept => {
            const Icon = deptIcons[dept.id] || Sparkles;
            return (
              <div
                key={dept.id}
                className="glass-card p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {dept.desc}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('gallery')}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 pt-2"
                >
                  <span>Xem tác phẩm ban</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tác phẩm nổi bật */}
      <section className="container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="badge badge-pink mb-2">Showcase VMC</span>
            <h2 className="font-heading text-3xl font-bold text-white">
              Tác Phẩm Tiêu Biểu Từ <span className="gradient-text">Thành Viên</span>
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('gallery')}
            className="btn-secondary text-sm self-start sm:self-auto"
          >
            <span>Xem tất cả tác phẩm ({works.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {works.slice(0, 3).map(work => (
            <div
              key={work.id}
              onClick={() => setSelectedWork(work)}
              className="glass-card rounded-2xl overflow-hidden cursor-pointer group border border-white/10"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <span className="absolute top-3 left-3 badge badge-purple">
                  {work.category}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-heading font-bold text-lg text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                  {work.title}
                </h3>
                
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <img src={work.avatar} alt={work.author} className="w-6 h-6 rounded-full object-cover" />
                    <span>{work.author}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-pink-400">
                      <Heart className="w-3.5 h-3.5 fill-pink-400" /> {work.likes}
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Eye className="w-3.5 h-3.5" /> {work.views}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sự kiện sắp diễn ra */}
      <section className="container">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-purple-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <span className="badge badge-amber">Sự Kiện Hot Sắp Diễn Ra</span>
              <h2 className="font-heading text-3xl font-bold text-white">
                {events[0].title}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {events[0].desc}
              </p>

              <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-2">
                <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/10">
                  <Calendar className="w-4 h-4 text-purple-400" /> {events[0].date}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/10">
                  <Clock className="w-4 h-4 text-cyan-400" /> {events[0].time}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/10">
                  <MapPin className="w-4 h-4 text-amber-400" /> {events[0].location}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 shrink-0">
              <span className="text-xs text-emerald-400 font-semibold">
                Còn lại {events[0].spotsLeft}/{events[0].maxSpots} chỗ ngồi
              </span>
              <button
                onClick={() => registerEvent(events[0])}
                className="btn-primary px-8 py-3.5 shadow-lg shadow-purple-600/40 text-base"
              >
                <span>Nhận Vé Tham Dự</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Detail Modal */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl p-6 text-white space-y-4">
            <button
              onClick={() => setSelectedWork(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            
            <img src={selectedWork.image} alt={selectedWork.title} className="w-full h-80 object-cover rounded-2xl" />
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-heading text-2xl font-bold">{selectedWork.title}</h3>
                <p className="text-xs text-purple-400">Tác giả: {selectedWork.author} • {selectedWork.role}</p>
              </div>
              <button
                onClick={() => likeWork(selectedWork.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500 hover:text-white transition-all text-xs font-bold"
              >
                <Heart className="w-4 h-4 fill-pink-400" /> Thích ({selectedWork.likes})
              </button>
            </div>

            <p className="text-slate-300 text-sm">{selectedWork.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
};
