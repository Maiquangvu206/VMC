import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Camera, CheckCircle, Clock, ShieldCheck, X, AlertTriangle, ArrowRight } from 'lucide-react';

export const InternalEquipment = () => {
  const { 
    equipment, 
    borrowEquipment, 
    returnEquipment, 
    currentUser,
    addEquipment
  } = useClub();

  const [selectedEq, setSelectedEq] = useState(null);
  const [returnDate, setReturnDate] = useState('2026-07-30');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEq, setNewEq] = useState({ name: '', category: 'CAMERA', code: '', condition: 'Tốt' });

  const isAdmin = currentUser?.roleTitle?.toLowerCase().includes('trưởng') || currentUser?.role === 'admin' || currentUser?.memberCode === 'ADMIN';

  const handleBorrowSubmit = (e) => {
    e.preventDefault();
    if (!selectedEq) return;
    borrowEquipment(selectedEq.id, returnDate);
    setSelectedEq(null);
    alert(`Đã đăng ký mượn ${selectedEq.name} thành công! Vui lòng bảo quản cẩn thận.`);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addEquipment(newEq);
    setNewEq({ name: '', category: 'CAMERA', code: '', condition: 'Tốt' });
    setShowAddForm(false);
  };

  return (
    <div className="container py-8 space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-cyan">Kho Thiết Bị VMC</span>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
            Quản Lý & <span className="gradient-text">Mượn Máy Ảnh CLB</span>
          </h1>
          <p className="text-xs text-slate-400">
            Hệ thống đăng ký mượn máy ảnh Canon/Sony, Lens, Gimbal DJI, Micro không dây cho các sự kiện trường.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="p-3 rounded-2xl bg-slate-900 border border-blue-500/30 text-xs text-slate-300 space-y-0.5 hidden md:block">
            <div className="font-bold text-blue-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Quy định mượn máy:
            </div>
            <div>Mượn trước 24h • Kiểm tra tình trạng pin/thẻ nhớ trước khi trả</div>
          </div>
          
          {isAdmin && (
            <button onClick={() => setShowAddForm(true)} className="btn-primary text-xs px-4 py-2 self-start md:self-center shrink-0">
              + Thêm Thiết Bị
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-slate-900 p-5 rounded-2xl border border-cyan-500/30 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Tên thiết bị</label>
              <input required type="text" className="input-field" placeholder="VD: Máy ảnh Sony A7IV" value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Mã quản lý</label>
              <input required type="text" className="input-field" placeholder="VD: VMC-CAM-03" value={newEq.code} onChange={e => setNewEq({...newEq, code: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Loại</label>
              <select className="input-field" value={newEq.category} onChange={e => setNewEq({...newEq, category: e.target.value})}>
                <option value="CAMERA">CAMERA</option>
                <option value="ỐNG KÍNH">ỐNG KÍNH</option>
                <option value="GIMBAL">GIMBAL</option>
                <option value="ÂM THANH">ÂM THANH</option>
                <option value="KHÁC">KHÁC</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Tình trạng</label>
              <input required type="text" className="input-field" placeholder="VD: Tốt / Hỏng móp méo..." value={newEq.condition} onChange={e => setNewEq({...newEq, condition: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Hủy</button>
            <button type="submit" className="btn-primary py-2 px-6">Thêm mới</button>
          </div>
        </form>
      )}

      {/* Equipment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map(item => (
          <div
            key={item.id}
            className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 h-full"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="badge badge-purple">{item.category}</span>
                <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                  {item.code}
                </span>
              </div>

              <h3 className="font-heading font-bold text-base text-white">
                {item.name}
              </h3>

              <div className="space-y-1 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                <div>Tình trạng: <span className="text-slate-400">{item.condition}</span></div>
                {item.status === 'borrowed' && (
                  <div className="text-amber-400 font-medium pt-1 border-t border-white/5">
                    Đang mượn bởi: <strong>{item.borrower}</strong> (Trả ngày: {item.returnDate})
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                item.status === 'available'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {item.status === 'available' ? 'SẴN SÀNG MƯỢN' : 'ĐANG ĐƯỢC MƯỢN'}
              </span>

              {item.status === 'available' ? (
                <button
                  onClick={() => setSelectedEq(item)}
                  className="btn-primary text-xs px-4 py-2"
                >
                  <span>Mượn Thiết Bị</span>
                </button>
              ) : (
                <button
                  onClick={() => returnEquipment(item.id)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Xác Nhận Trả Máy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Borrow Modal */}
      {selectedEq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-slide-up">
          <div className="relative w-full max-w-md bg-slate-900 border border-blue-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-heading font-bold text-lg text-white">Đăng Ký Mượn Thiết Bị</h3>
              <button onClick={() => setSelectedEq(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1 text-xs">
              <div className="font-bold text-blue-400">{selectedEq.name}</div>
              <div className="text-slate-400">Mã: {selectedEq.code}</div>
            </div>

            <form onSubmit={handleBorrowSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Người mượn *</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.name} (${currentUser.class})`}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ngày dự kiến trả máy *</label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Thành viên cam kết bảo quản cẩn thận máy ảnh, ống kính và sạc pin đầy đủ trước khi trả về tủ thiết bị.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2"
                >
                  Xác Nhận Mượn
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
