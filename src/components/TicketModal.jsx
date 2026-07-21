import React from 'react';
import { useClub } from '../context/ClubContext';
import { X, Calendar, Clock, MapPin, Ticket, Download, CheckCircle } from 'lucide-react';

export const TicketModal = () => {
  const { activeTicketModal, setActiveTicketModal } = useClub();

  if (!activeTicketModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/40 rounded-3xl p-6 shadow-2xl overflow-hidden text-white">
        
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-600/20 blur-2xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setActiveTicketModal(null)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3 animate-bounce">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-xl font-bold gradient-text">Đăng Ký Vé Thành Công!</h3>
          <p className="text-xs text-slate-400 mt-1">Vé điện tử VMC Pass đã sẵn sàng cho bạn</p>
        </div>

        {/* Ticket Card */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 relative overflow-hidden shadow-inner space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-400" />
              <span className="font-heading font-bold text-sm text-purple-300">VMC EVENT PASS</span>
            </div>
            <span className="text-xs font-mono bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
              {activeTicketModal.id}
            </span>
          </div>

          <div>
            <h4 className="font-heading text-base font-semibold text-white line-clamp-2">
              {activeTicketModal.eventTitle}
            </h4>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-400" />
              <span>Ngày: {activeTicketModal.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Thời gian: {activeTicketModal.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Địa điểm: {activeTicketModal.location}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-3 rounded-xl w-36 h-36 mx-auto flex items-center justify-center shadow-lg">
            <img
              src={activeTicketModal.qrCodeUrl}
              alt="Ticket QR Code"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-center text-[11px] text-slate-400 font-mono">
            Họ tên: <span className="text-white font-semibold">{activeTicketModal.userName}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            alert('Đã lưu vé điện tử về thiết bị thành công!');
            setActiveTicketModal(null);
          }}
          className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-heading font-semibold flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-purple-600/30"
        >
          <Download className="w-4 h-4" />
          <span>Tải Vé Về Máy</span>
        </button>

      </div>
    </div>
  );
};
