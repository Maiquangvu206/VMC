import React from 'react';
import { useClub } from '../context/ClubContext';
import { X, Calendar, Clock, MapPin, Ticket, Download, CheckCircle } from 'lucide-react';

export const TicketModal = () => {
  const { activeTicketModal, setActiveTicketModal } = useClub();

  if (!activeTicketModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md animate-slide-up">
       <div className="ds-card-glass p-6 shadow-2xl overflow-hidden text-white w-full max-w-md relative">
         
         {/* Glow accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-600/20 blur-xl rounded-full pointer-events-none" />

         {/* Close Button */}
         <button
           onClick={() => setActiveTicketModal(null)}
           className="absolute top-4 right-4 ds-btn ds-btn-ghost p-2"
         >
           <X className="w-5 h-5" />
         </button>

          {/* Header */}
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3 animate-bounce">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold gradient-text">Đăng Ký Vé Thành Công!</h3>
            <p className="text-xs text-slate-400 mt-1">Vé điện tử VMC Pass đã sẵn sàng cho bạn</p>
          </div>

         {/* Ticket Card */}
         <div className="ds-card p-5 relative overflow-hidden shadow-inner space-y-4">
           <div className="flex justify-between items-center border-b border-[var(--border-default)] pb-3">
             <div className="flex items-center gap-2">
               <Ticket className="w-5 h-5 text-purple-400" />
               <span className="font-heading font-bold text-sm text-purple-300">VMC EVENT PASS</span>
             </div>
             <span className="ds-badge ds-badge-purple text-[10px]">
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
           className="ds-btn ds-btn-primary w-full mt-5"
         >
           <Download className="w-4 h-4" />
           <span>Tải Vé Về Máy</span>
         </button>

       </div>
     </div>
  );
};
