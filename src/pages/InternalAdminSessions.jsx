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
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'online', 'revoked'
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
      <div className="container px-4 py-16 text-center space-y-4">
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
    if (statusFilter === 'revoked') return Number(s.is_active) === 0 && s.logout_reason === 'revoked';
    return true;
  });

  return (
    <div className="container px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-xl text-white tracking-tight">Quản Lý Phiên Làm Việc</h1>
                <span className="badge bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold px-2 py-0.5">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Theo dõi toàn bộ các phiên đăng nhập, thiết bị di động/máy tính & cưỡng chế đăng xuất từ xa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn đăng xuất TẤT CẢ các phiên khác ngoại trừ phiên hiện tại?')) {
                  revokeAllSessions();
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng Xuất Tất Cả Phiên Trừ Tôi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards - 3 Distinct Statuses */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Đang Hoạt Động</span>
            <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{activeSessions.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Phiên đang kết nối thực tế</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-700 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Kết Thúc Phiên</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-300 font-mono">{endedSessions.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Tự đăng xuất hoặc hết hạn</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Bị Hủy</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{revokedSessions.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Admin cưỡng chế thu hồi</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-purple-500/30 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Thiết Bị</span>
            <Monitor className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base font-bold text-white flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-purple-300 font-mono">
              <Monitor className="w-3.5 h-3.5" /> {desktopCount} PC
            </span>
            <span className="flex items-center gap-1 text-xs text-pink-300 font-mono">
              <Smartphone className="w-3.5 h-3.5" /> {mobileCount} Mobile
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Máy tính / Điện thoại</div>
        </div>
      </div>

      {/* Filter & Search Bar - 3 Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã TV, địa chỉ IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end overflow-x-auto">
          <span className="text-xs text-slate-400 shrink-0">Lọc:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Tất Cả ({sessions.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            🟢 Đang Hoạt Động ({activeSessions.length})
          </button>
          <button
            onClick={() => setStatusFilter('ended')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'ended' ? 'bg-slate-700 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            ⏸️ Kết Thúc Phiên ({endedSessions.length})
          </button>
          <button
            onClick={() => setStatusFilter('revoked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'revoked' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            🔴 Bị Hủy ({revokedSessions.length})
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Thành Viên</th>
                <th className="px-4 py-3.5">Thiết Bị & IP</th>
                <th className="px-4 py-3.5">Đăng Nhập</th>
                <th className="px-4 py-3.5">Hoạt Động Gần Nhất</th>
                <th className="px-4 py-3.5 text-center">Trạng Thái</th>
                <th className="px-4 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500 italic">
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

                  const displayCode = memberObj?.memberCode || memberObj?.member_code || ((s.username === 'admin' || s.member_id === 'ADMIN') ? 'VMC-8350' : (s.member_id || s.username || 'VMC-0000'));
                  const displayRole = memberObj?.roleTitle || memberObj?.role_title || ((s.username === 'admin' || s.member_id === 'ADMIN') ? 'Cố Vấn CLB' : (s.role_title || 'Thành Viên VMC'));
                  const displayName = (memberObj?.name && memberObj.name !== 'Quản Trị Viên') 
                    ? memberObj.name 
                    : (s.name && s.name !== 'Quản Trị Viên' ? s.name : 'Vũ Mai Quang');

                  const lastActiveDate = s.last_active ? new Date(s.last_active) : null;
                  const isRecent = lastActiveDate && ((now - lastActiveDate) / (1000 * 60)) <= 5;

                  return (
                    <tr key={s.id} className={`hover:bg-white/5 transition-all ${isCurrent ? 'bg-cyan-500/10' : ''}`}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold font-heading shrink-0 border border-blue-500/30">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{displayName}</span>
                              {isCurrent && (
                                <span className="bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-cyan-500/30">
                                  Bạn (Phiên này)
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <span className="text-cyan-400 font-bold">{displayCode}</span>
                              <span>•</span>
                              <span className="text-purple-400 font-semibold">{displayRole}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {isMobile ? (
                            <Smartphone className="w-4 h-4 text-pink-400 shrink-0" />
                          ) : (
                            <Monitor className="w-4 h-4 text-purple-400 shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold text-slate-200">{s.device_type || 'Desktop / PC'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{s.ip_address || '127.0.0.1'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-300">
                        {s.login_time ? new Date(s.login_time).toLocaleString('vi-VN') : 'Mới đây'}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className={isRecent ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                            {s.last_active ? new Date(s.last_active).toLocaleTimeString('vi-VN') : 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Đang Hoạt Động
                          </span>
                        ) : s.logout_reason === 'revoked' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" /> Bị Hủy
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            <Clock className="w-3 h-3 text-slate-400" /> Kết Thúc Phiên
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {isActive && !isCurrent && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc muốn đăng xuất từ xa tài khoản ${s.name}?`)) {
                                revokeSession(s.id);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Thu Hồi</span>
                          </button>
                        )}
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
