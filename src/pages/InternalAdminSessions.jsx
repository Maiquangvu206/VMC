import React, { useEffect, useState } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  ShieldCheck, 
  Monitor, 
  Smartphone, 
  Activity, 
  RefreshCw, 
  LogOut, 
  Search, 
  AlertTriangle,
  Clock,
  Wifi,
  UserCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const InternalAdminSessions = () => {
  const { 
    currentUser, 
    isSuperAdmin, 
    sessions, 
    members,
    currentSessionId, 
    loadSqlSessions, 
    revokeSession, 
    revokeAllSessions 
  } = useClub();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'ended'
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSqlSessions();
  }, []);

  // Auto refresh every 3 seconds for real-time live database updates
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadSqlSessions();
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (!isSuperAdmin) {
    return (
      <div className="page-wrap px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Quyền Truy Cập Bị Hạn Chế</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Trang quản trị phiên làm việc chỉ dành riêng cho tài khoản **Super Admin** của CLB VMC. Vui lòng liên hệ Chủ nhiệm CLB nếu bạn cần hỗ trợ.
        </p>
      </div>
    );
  }

  // Calculate session metrics for 3 distinct statuses
  const now = new Date();
  const activeSessions = sessions.filter(s => Number(s.is_active) === 1);
  const endedSessions = sessions.filter(s => Number(s.is_active) === 0 && s.logout_reason !== 'revoked');
  const revokedSessions = sessions.filter(s => Number(s.is_active) === 0 && s.logout_reason === 'revoked');

  const mobileCount = activeSessions.filter(s => (s.device_type || '').toLowerCase().includes('mobile')).length;
  const desktopCount = activeSessions.length - mobileCount;

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = 
      (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.ip_address || '').includes(searchTerm);

    if (!matchesSearch) return false;

    if (statusFilter === 'active') return Number(s.is_active) === 1;
    if (statusFilter === 'ended') return Number(s.is_active) === 0 && s.logout_reason !== 'revoked';
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="ds-card p-5 sm:p-6 border border-cyan-500/30 relative overflow-hidden bg-[var(--bg-primary)] rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading font-black text-lg sm:text-xl text-white tracking-tight truncate">Quản Lý Phiên Làm Việc</h1>
                <span className="ds-badge ds-badge-cyan text-[10px] font-mono font-bold px-2 py-0.5 shrink-0">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Theo dõi toàn bộ các phiên đăng nhập, thiết bị di động/máy tính & cưỡng chế đăng xuất từ xa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn đăng xuất TẤT CẢ các phiên khác ngoại trừ phiên hiện tại?')) {
                  revokeAllSessions();
                }
              }}
              className="ds-btn ds-btn-danger ds-btn-xs w-full sm:w-auto whitespace-nowrap"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Đăng Xuất Tất Cả Phiên Trừ Tôi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="ds-card p-5 border border-emerald-500/30 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Đang Hoạt Động</span>
            <Wifi className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{activeSessions.length}</div>
          <div className="text-[11px] text-slate-400">Phiên đang kết nối thực tế</div>
        </div>

        <div className="ds-card p-5 border border-slate-700 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Kết Thúc Phiên</span>
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="text-2xl font-black text-slate-300 font-mono">{endedSessions.length}</div>
          <div className="text-[11px] text-slate-400">Tự đăng xuất hoặc hết hạn</div>
        </div>

        <div className="ds-card p-5 border border-rose-500/30 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Bị Hủy</span>
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{revokedSessions.length}</div>
          <div className="text-[11px] text-slate-400">Admin cưỡng chế thu hồi</div>
        </div>

        <div className="ds-card p-5 border border-purple-500/30 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Thiết Bị</span>
            <Monitor className="w-4 h-4 text-purple-400 shrink-0" />
          </div>
          <div className="text-base font-bold text-white flex items-center gap-3 pt-0.5">
            <span className="flex items-center gap-1 text-xs text-purple-300 font-mono">
              <Monitor className="w-3.5 h-3.5 shrink-0" /> {desktopCount} PC
            </span>
            <span className="flex items-center gap-1 text-xs text-pink-300 font-mono">
              <Smartphone className="w-3.5 h-3.5 shrink-0" /> {mobileCount} Mobile
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Máy tính / Điện thoại</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#10172a] p-4 rounded-xl border border-gray-800 shadow-md w-full">
        <div className="relative flex items-center w-full sm:flex-1 min-w-0">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã TV, địa chỉ IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ds-input pl-10 w-full bg-slate-900/80 border-slate-700/80 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end overflow-x-auto shrink-0 pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-semibold shrink-0">Lọc:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`ds-btn ds-btn-xs shrink-0 ${
              statusFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            Tất Cả ({sessions.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`ds-btn ds-btn-xs shrink-0 ${
              statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            🟢 Đang Hoạt Động ({activeSessions.length})
          </button>
          <button
            onClick={() => setStatusFilter('ended')}
            className={`ds-btn ds-btn-xs shrink-0 ${
              statusFilter === 'ended' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            ⏸️ Kết Thúc Phiên ({endedSessions.length})
          </button>
        </div>
      </div>

      {/* Sessions Table - Clean No-Scroll Stacked Layout */}
      <div className="ds-card rounded-xl border border-gray-800 shadow-xl w-full bg-[#10172a] p-4">
        <div className="w-full overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-xs text-slate-400 border-b border-gray-800">
                <th className="py-3 px-3 font-semibold">Thành Viên</th>
                <th className="py-3 px-3 font-semibold">Thiết Bị & IP</th>
                <th className="py-3 px-3 font-semibold hidden sm:table-cell">Đăng Nhập & Hoạt Động</th>
                <th className="py-3 px-3 text-right font-semibold">Trạng Thái & Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-500 italic">
                    Không tìm thấy phiên làm việc nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s) => {
                  const isCurrent = s.id === currentSessionId;
                  const isActive = Number(s.is_active) === 1;
                  const isMobile = (s.device_type || '').toLowerCase().includes('mobile');
                  
                  const memberObj = (members || []).find(m => 
                    String(m.id) === String(s.member_id) || 
                    String(m.memberCode || '').toUpperCase() === String(s.member_id || '').toUpperCase() ||
                    String(m.username || '').toLowerCase() === String(s.username || '').toLowerCase()
                  );

                  const displayCode = memberObj?.memberCode || memberObj?.member_code || ((s.username === 'admin' || s.member_id === 'ADMIN') ? 'ADMIN' : (s.member_id || s.username || 'VMC-0000'));
                  const displayRole = memberObj?.roleTitle || memberObj?.role_title || ((s.username === 'admin' || s.member_id === 'ADMIN') ? 'Super Admin' : (s.role_title || 'Thành Viên VMC'));
                  const displayDept = memberObj?.deptName || memberObj?.department || ((s.username === 'admin' || s.member_id === 'ADMIN') ? 'Super Admin' : 'Ban Chuyên Môn');
                  const displayName = s.name || memberObj?.name || 'Thành Viên VMC';

                  const lastActiveDate = s.last_active ? new Date(s.last_active) : null;
                  const isRecent = lastActiveDate && ((now - lastActiveDate) / (1000 * 60)) <= 5;

                  return (
                    <tr key={s.id} className={`hover:bg-slate-900/50 transition-colors ${isCurrent ? 'bg-cyan-500/10' : ''}`}>
                      {/* Column 1: Member Info (4 Dòng riêng biệt) */}
                      <td className="py-3 px-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold font-heading shrink-0 border border-blue-500/30 mt-0.5">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            {/* Dòng 1: Tên thành viên + Badge Bạn */}
                            <div className="font-bold text-white flex items-center gap-1.5 truncate">
                              <span className="truncate">{displayName}</span>
                              {isCurrent && (
                                <span className="ds-badge ds-badge-cyan text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-cyan-500/30 shrink-0">
                                  Bạn
                                </span>
                              )}
                            </div>
                            {/* Dòng 2: Mã thành viên font mono xanh cyan */}
                            <div className="text-[10px] text-cyan-400 font-mono font-bold truncate mt-0.5">
                              {displayCode}
                            </div>
                            {/* Dòng 3: Chức vụ */}
                            <div className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                              {displayRole}
                            </div>
                            {/* Dòng 4: Ban phụ trách màu tím */}
                            <div className="text-[10px] text-purple-300 font-bold truncate mt-0.5">
                              {displayDept}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Device & IP (Tạm ẩn IP, rỏ chuột để xem) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 min-w-0 group cursor-pointer">
                          {isMobile ? (
                            <Smartphone className="w-4 h-4 text-pink-400 shrink-0" />
                          ) : (
                            <Monitor className="w-4 h-4 text-purple-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-200 text-xs truncate">
                              {s.device_type || 'Desktop / PC'}
                            </div>
                            <div className="text-[10px] font-mono transition-colors">
                              <span className="group-hover:hidden text-slate-500 italic">IP: xem thêm</span>
                              <span className="hidden group-hover:inline text-cyan-400 font-bold">{s.ip_address || '127.0.0.1'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Login & Last Active (Xuống dòng) */}
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <div className="text-slate-300 flex items-center gap-1">
                            <span className="text-slate-500 text-[10px]">Vào:</span>
                            <span>{s.login_time ? new Date(s.login_time).toLocaleString('vi-VN') : 'Mới đây'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 text-[10px]">Hoạt động:</span>
                            <span className={isRecent ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                              {s.last_active ? new Date(s.last_active).toLocaleTimeString('vi-VN') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Status & Action Button */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {isActive ? (
                            <span className="ds-badge ds-badge-emerald text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Hoạt Động
                            </span>
                          ) : s.logout_reason === 'revoked' ? (
                            <span className="ds-badge ds-badge-rose text-[10px]">
                              <XCircle className="w-3 h-3" /> Bị Hủy
                            </span>
                          ) : (
                            <span className="ds-badge ds-badge-cyan text-[10px]">
                              <Clock className="w-3 h-3 text-slate-400" /> Kết Thúc
                            </span>
                          )}

                          {isActive && !isCurrent && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc muốn đăng xuất từ xa tài khoản ${s.name}?`)) {
                                  revokeSession(s.id);
                                }
                              }}
                              className="ds-btn ds-btn-danger ds-btn-xs text-[10px] !py-0.5 !px-2"
                            >
                              <LogOut className="w-3 h-3 shrink-0" />
                              <span>Thu Hồi</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
