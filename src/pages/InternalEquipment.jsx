import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { CheckCircle, Clock, ShieldCheck, X, AlertTriangle, ArrowRight, Camera } from 'lucide-react';

export const InternalEquipment = () => {
  const { 
    equipment, 
    borrowEquipment, 
    returnEquipment, 
    currentUser,
    addEquipment,
    showToast
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
    showToast(`🎉 Đã đăng ký mượn ${selectedEq.name} thành công! Vui lòng bảo quản cẩn thận.`, 'success');
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addEquipment(newEq);
    setNewEq({ name: '', category: 'CAMERA', code: '', condition: 'Tốt' });
    setShowAddForm(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <span className="ds-badge ds-badge-cyan">Kho Thiết Bị VMC</span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2 truncate">
            Quản Lý & <span className="text-blue-400">Mượn Máy Ảnh CLB</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hệ thống đăng ký mượn máy ảnh Canon/Sony, Lens, Gimbal DJI, Micro không dây cho các sự kiện trường.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="ds-card p-3 text-xs text-slate-300 space-y-0.5 hidden lg:block max-w-xs">
            <div className="font-bold text-blue-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" /> Quy định mượn máy:
            </div>
            <div className="text-[11px] text-slate-400">Mượn trước 24h • Kiểm tra pin & thẻ nhớ trước khi trả</div>
          </div>
          
          {isAdmin && (
            <button onClick={() => setShowAddForm(true)} className="ds-btn ds-btn-primary text-xs">
              + Thêm Thiết Bị
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="ds-card p-5 sm:p-6 space-y-4 rounded-xl border border-[#1f2937] bg-[#111827]">
          <h3 className="font-heading font-bold text-sm text-white">Thêm Thiết Bị Mới Vào Kho</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="ds-field-label">Tên thiết bị</label>
              <input required type="text" className="ds-input" placeholder="VD: Máy ảnh Sony A7IV" value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} />
            </div>
            <div>
              <label className="ds-field-label">Mã quản lý</label>
              <input required type="text" className="ds-input" placeholder="VD: VMC-CAM-03" value={newEq.code} onChange={e => setNewEq({...newEq, code: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="ds-field-label">Loại</label>
              <select className="ds-input ds-select" value={newEq.category} onChange={e => setNewEq({...newEq, category: e.target.value})}>
                <option value="CAMERA">CAMERA</option>
                <option value="ỐNG KÍNH">ỐNG KÍNH</option>
                <option value="GIMBAL">GIMBAL</option>
                <option value="ÂM THANH">ÂM THANH</option>
                <option value="KHÁC">KHÁC</option>
              </select>
            </div>
            <div>
              <label className="ds-field-label">Tình trạng</label>
              <input required type="text" className="ds-input" placeholder="VD: Tốt / Hỏng móp méo..." value={newEq.condition} onChange={e => setNewEq({...newEq, condition: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-[#1f2937]">
            <button type="button" onClick={() => setShowAddForm(false)} className="ds-btn ds-btn-secondary text-xs">Hủy</button>
            <button type="submit" className="ds-btn ds-btn-primary text-xs">Thêm mới</button>
          </div>
        </form>
      )}

      {/* Equipment List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full items-stretch">
        {equipment.map(item => (
          <div
            key={item.id}
            className="ds-card p-5 flex flex-col justify-between space-y-4 h-full min-w-0 overflow-hidden bg-[#111827] border border-[#1f2937] rounded-xl shadow-lg hover:border-slate-700 transition-all"
          >
            <div className="space-y-3 min-w-0">
              <div className="flex justify-between items-center gap-2 min-w-0">
                <span className="ds-badge ds-badge-purple text-[10.5px] truncate max-w-[140px] shrink-0">{item.category}</span>
                <span className="font-mono text-xs text-slate-400 px-2.5 py-1 rounded-lg bg-[#0f172a] border border-[#1f2937] truncate shrink-0">
                  {item.code}
                </span>
              </div>

              <h3 className="font-heading font-bold text-base text-slate-100 truncate min-w-0" title={item.name}>
                {item.name}
              </h3>

              <div className="p-3 bg-[#0f172a] rounded-lg border border-[#1f2937] space-y-1.5 text-xs text-slate-300 min-w-0">
                <div className="truncate">Tình trạng: <span className="text-slate-400 font-medium">{item.condition}</span></div>
                {item.status === 'borrowed' && (
                  <div className="text-amber-400 font-semibold pt-1.5 border-t border-[#1f2937] text-[11px] truncate">
                    Đang mượn bởi: <strong>{item.borrower}</strong> (Trả: {item.returnDate})
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1f2937] flex items-center justify-between gap-2 shrink-0 min-w-0">
              <span className={`ds-badge text-[10px] shrink-0 ${
                item.status === 'available'
                  ? 'ds-badge-emerald'
                  : 'ds-badge-amber'
              }`}>
                {item.status === 'available' ? 'SẴN SÀNG MƯỢN' : 'ĐANG ĐƯỢC MƯỢN'}
              </span>

              {item.status === 'available' ? (
                <button
                  onClick={() => setSelectedEq(item)}
                  className="ds-btn ds-btn-primary text-xs px-3 py-1.5 h-8 shrink-0"
                >
                  <span>Mượn Máy</span>
                </button>
              ) : (
                <button
                  onClick={() => returnEquipment(item.id)}
                  className="ds-btn ds-btn-secondary text-xs px-3 py-1.5 h-8 shrink-0"
                >
                  Trả Máy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Borrow Modal */}
      {selectedEq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-slide-up">
          <div className="ds-card p-6 w-full max-w-md bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl text-white space-y-5">
            
            <div className="flex justify-between items-center pb-3 border-b border-[#1f2937]">
              <h3 className="font-heading font-bold text-base text-slate-100">Đăng Ký Mượn Thiết Bị</h3>
              <button onClick={() => setSelectedEq(null)} className="text-slate-400 hover:text-white p-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#0f172a] rounded-xl border border-[#1f2937] space-y-1 text-xs">
              <div className="font-bold text-blue-400 text-sm">{selectedEq.name}</div>
              <div className="text-slate-400 font-mono">Mã: {selectedEq.code}</div>
            </div>

            <form onSubmit={handleBorrowSubmit} className="space-y-4 text-xs">
              <div>
                <label className="ds-field-label">Người mượn *</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser?.name || 'Thành viên VMC'} (${currentUser?.class || 'CLB'})`}
                  className="ds-input"
                />
              </div>

              <div>
                <label className="ds-field-label">Ngày dự kiến trả máy *</label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="ds-input"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Lưu ý:</strong> Vui lòng bàn giao thiết bị trực tiếp cho Kỹ thuật viên quản lý kho và kiểm tra máy trước khi nhận.
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1f2937]">
                <button
                  type="button"
                  onClick={() => setSelectedEq(null)}
                  className="ds-btn ds-btn-secondary text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="ds-btn ds-btn-primary text-xs"
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
