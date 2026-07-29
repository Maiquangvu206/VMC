import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { CheckCircle, Clock, ShieldCheck, X, AlertTriangle, ArrowRight } from 'lucide-react';

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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="ds-badge ds-badge-cyan">Kho Thiết Bị VMC</span>
          <h1 className="font-heading text-3xl font-extrabold text-slate-100 mt-2">
            Quản Lý & <span className="text-blue-400">Mượn Máy Ảnh CLB</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Hệ thống đăng ký mượn máy ảnh Canon/Sony, Lens, Gimbal DJI, Micro không dây cho các sự kiện trường.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="ds-card p-4 text-sm text-slate-300 space-y-1 hidden md:block">
            <div className="font-bold text-blue-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Quy định mượn máy:
            </div>
            <div>Mượn trước 24h • Kiểm tra tình trạng pin/thẻ nhớ trước khi trả</div>
          </div>
          
          {isAdmin && (
            <button onClick={() => setShowAddForm(true)} className="ds-btn ds-btn-primary">
              + Thêm Thiết Bị
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="ds-card p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="ds-field-label">Tên thiết bị</label>
              <input required type="text" className="ds-input" placeholder="VD: Máy ảnh Sony A7IV" value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} />
            </div>
            <div>
              <label className="ds-field-label">Mã quản lý</label>
              <input required type="text" className="ds-input" placeholder="VD: VMC-CAM-03" value={newEq.code} onChange={e => setNewEq({...newEq, code: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-default)]">
            <button type="button" onClick={() => setShowAddForm(false)} className="ds-btn ds-btn-secondary">Hủy</button>
            <button type="submit" className="ds-btn ds-btn-primary">Thêm mới</button>
          </div>
        </form>
      )}

      {/* Equipment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map(item => (
          <div
            key={item.id}
            className="ds-card p-6 flex flex-col justify-between space-y-5 h-full"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="ds-badge ds-badge-purple">{item.category}</span>
                <span className="font-mono text-sm text-slate-400 ds-card px-3 py-1.5 rounded-lg border border-[var(--border-default)]">
                  {item.code}
                </span>
              </div>

              <h3 className="font-heading font-bold text-lg text-slate-100">
                {item.name}
              </h3>

              <div className="p-4 ds-card border border-[var(--border-default)] space-y-2 text-sm text-slate-300">
                <div>Tình trạng: <span className="text-slate-400">{item.condition}</span></div>
                {item.status === 'borrowed' && (
                  <div className="text-amber-400 font-semibold pt-2 border-t border-[var(--border-default)]">
                    Đang mượn bởi: <strong>{item.borrower}</strong> (Trả ngày: {item.returnDate})
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
              <span className={`ds-badge ${
                item.status === 'available'
                  ? 'ds-badge-emerald'
                  : 'ds-badge-amber'
              }`}>
                {item.status === 'available' ? 'SẴN SÀNG MƯỢN' : 'ĐANG ĐƯỢC MƯỢN'}
              </span>

              {item.status === 'available' ? (
                <button
                  onClick={() => setSelectedEq(item)}
                  className="ds-btn ds-btn-primary"
                >
                  <span>Mượn Thiết Bị</span>
                </button>
              ) : (
                <button
                  onClick={() => returnEquipment(item.id)}
                  className="ds-btn ds-btn-secondary"
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
          <div className="ds-card p-6 w-full max-w-md shadow-2xl text-white space-y-6">
            
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border-default)]">
              <h3 className="font-heading font-bold text-lg text-slate-100">Đăng Ký Mượn Thiết Bị</h3>
              <button onClick={() => setSelectedEq(null)} className="text-slate-400 hover:text-white p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 ds-card border border-[var(--border-default)] space-y-2 text-sm">
              <div className="font-bold text-blue-400">{selectedEq.name}</div>
              <div className="text-slate-400">Mã: {selectedEq.code}</div>
            </div>

            <form onSubmit={handleBorrowSubmit} className="space-y-5 text-sm">
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

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>Thành viên cam kết bảo quản cẩn thận máy ảnh, ống kính và sạc pin đầy đủ trước khi trả về tủ thiết bị.</span>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setSelectedEq(null)}
                  className="ds-btn ds-btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="ds-btn ds-btn-primary"
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
