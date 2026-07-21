import React from 'react';
import { useClub } from '../context/ClubContext';
import { SCHEDULES } from '../data/mockData';
import { Calendar, Clock, MapPin, Ticket, User, CheckCircle, ArrowRight } from 'lucide-react';

export const EventsPage = () => {
  const { events, registerEvent, userTickets, setActiveTicketModal } = useClub();

  return (
    <div className="container py-10 space-y-12 pb-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="badge badge-pink">Sự Kiện & Lịch Sinh Hoạt</span>
        <h1 className="font-heading text-4xl font-extrabold text-white">
          Hoạt Động Nổi Bật <span className="gradient-text">VMC Events</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Tham gia các buổi Workshop chuyên môn, Offline săn ảnh và đêm nhạc Jam Session sôi động.
        </p>
      </div>

      {/* Events Grid */}
      <div className="space-y-6">
        <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-400" />
          <span>Sự Kiện Sắp Diễn Ra</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(ev => (
            <div
              key={ev.id}
              className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 badge badge-cyan">{ev.category}</span>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-lg text-white line-clamp-2">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {ev.desc}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span className="truncate">Diễn giả: {ev.speaker}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-pink-400" />
                    <span>Ngày: {ev.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Giờ: {ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold">
                    Còn {ev.spotsLeft}/{ev.maxSpots} chỗ
                  </span>
                  <button
                    onClick={() => registerEvent(ev)}
                    disabled={ev.spotsLeft === 0}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{ev.spotsLeft === 0 ? 'Hết chỗ' : 'Đăng Ký Vé'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registered Tickets Preview Section */}
      {userTickets.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 space-y-4">
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-400" />
            <span>Vé Điện Tử Của Bạn ({userTickets.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTickets.map(t => (
              <div
                key={t.id}
                onClick={() => setActiveTicketModal(t)}
                className="bg-slate-900/90 p-4 rounded-xl border border-white/10 hover:border-purple-500 cursor-pointer space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-purple-400 font-mono font-bold">{t.id}</span>
                  <span className="text-emerald-400 font-bold">Đã xác nhận</span>
                </div>
                <h4 className="font-heading font-semibold text-sm text-white line-clamp-1">{t.eventTitle}</h4>
                <p className="text-[11px] text-slate-400">{t.date} • {t.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lịch sinh hoạt định kỳ hàng tuần */}
      <div className="space-y-6">
        <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-pink-400" />
          <span>Lịch Sinh Hoạt Định Kỳ Hàng Tuần</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCHEDULES.map((sc, idx) => (
            <div
              key={idx}
              className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="badge badge-purple">{sc.day}</span>
                <h3 className="font-heading font-bold text-base text-white">{sc.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> {sc.location}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-xs text-cyan-400 font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-white/10">
                  {sc.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
