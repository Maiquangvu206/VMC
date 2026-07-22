import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import { Users, Calendar, Award, Clock, Search, CheckCircle2, Wallet, Plus, ArrowDownRight, ArrowUpRight, Gift } from 'lucide-react';

export const InternalHRDashboard = () => {
  const { members, tasks, currentUser, isHRMember, finances, addFinanceRecord } = useClub();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('points'); // 'points', 'birthdays', 'deadlines', 'finance'

  const [financeForm, setFinanceForm] = useState({ type: 'income', amount: '', description: '', date: '' });

  // No access restriction: All members can view rankings, birthdays, and deadlines

  const normalizeText = (text) => text ? text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const q = normalizeText(searchQuery);
      return !q || normalizeText(m.name).includes(q) || normalizeText(m.memberCode).includes(q);
    });
  }, [members, searchQuery]);

  // Points ranking
  const rankedMembers = [...filteredMembers].sort((a, b) => (b.points || 0) - (a.points || 0));

  // Birthdays parsing
  const getUpcomingBirthdays = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    return [...filteredMembers].filter(m => m.dob).map(m => {
      const parts = m.dob.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        return { ...m, bDay: day, bMonth: month };
      }
      return { ...m, bDay: 0, bMonth: 0 };
    }).filter(m => m.bMonth >= currentMonth || (m.bMonth === currentMonth && m.bDay >= currentDay))
      .sort((a, b) => {
        if (a.bMonth !== b.bMonth) return a.bMonth - b.bMonth;
        return a.bDay - b.bDay;
      });
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  // Deadlines (Tasks mapped to members)
  const getMemberTasks = (memberName) => {
    return tasks.filter(t => t.assignee === memberName || t.assignee === 'Cả Ban');
  };

  const handleAddFinance = (e) => {
    e.preventDefault();
    if (!financeForm.amount || !financeForm.description || !financeForm.date) return;
    addFinanceRecord({
      type: financeForm.type,
      amount: parseInt(financeForm.amount, 10),
      description: financeForm.description,
      date: financeForm.date,
      loggedBy: 'Ban Đối Ngoại - Nhân Sự'
    });
    setFinanceForm({ type: 'income', amount: '', description: '', date: '' });
  };

  const totalBalance = (finances || []).reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);

  return (
    <div className="container py-8 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1 flex items-center gap-3">
            <Users className="text-blue-500 w-8 h-8" /> Thi Đua & Sinh Nhật
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi điểm số, sinh nhật, deadline và thu chi quỹ CLB.
          </p>
        </div>
        
        <div className="relative w-full md:w-64 flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm mã hoặc tên TV..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm leading-tight text-white focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        <button
          onClick={() => setActiveTab('points')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all ${
            activeTab === 'points' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" /> Bảng Xếp Hạng Điểm Thi Đua
        </button>
        <button
          onClick={() => setActiveTab('birthdays')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all ${
            activeTab === 'birthdays' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Sinh Nhật Sắp Tới
        </button>
        <button
          onClick={() => setActiveTab('deadlines')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all ${
            activeTab === 'deadlines' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" /> Tình Trạng Deadline
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all ${
            activeTab === 'meetings' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Điểm Danh & Họp
        </button>
        <button
          onClick={() => setActiveTab('birthday_duty')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all ${
            activeTab === 'birthday_duty' ? 'bg-pink-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" /> Phân Công Sinh Nhật
        </button>
        {(isHRMember || currentUser?.deptName === 'Ban Chủ Nhiệm' || currentUser?.department === 'bcn') && (
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all ${
              activeTab === 'finance' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" /> Quản Lý Thu Chi (Quỹ CLB)
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6">
        
        {/* POINTS TAB */}
        {activeTab === 'points' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-amber-400" /> Bảng Điểm Thi Đua (Ranking)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rankedMembers.map((m, idx) => (
                <div key={m.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-lg ${idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-400/50' : idx === 2 ? 'bg-orange-600/20 text-orange-400 border border-orange-600/50' : 'bg-slate-800 text-slate-500'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{m.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{m.deptName || m.department}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-black text-blue-400 font-mono">{m.points || 0}</div>
                    <div className="text-[9px] text-slate-500">PTS</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BIRTHDAYS TAB */}
        {activeTab === 'birthdays' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="text-rose-400" /> Sinh Nhật Sắp Tới
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingBirthdays.length > 0 ? upcomingBirthdays.map((m) => (
                <div key={m.id} className="bg-slate-950 p-4 rounded-2xl border border-rose-900/30 flex items-center gap-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full -z-0" />
                  <img src={m.avatar || '/placeholder-avatar.jpg'} alt={m.name} className="w-12 h-12 rounded-full object-cover border border-slate-700 z-10" />
                  <div className="flex-1 min-w-0 z-10">
                    <div className="text-sm font-bold text-white truncate">{m.name}</div>
                    <div className="text-xs text-rose-300 font-mono mt-1 font-semibold">
                      🎂 {m.dob}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-slate-400 text-sm">Không tìm thấy sinh nhật nào sắp tới.</div>
              )}
            </div>
          </div>
        )}

        {/* DEADLINES TAB */}
        {activeTab === 'deadlines' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="text-amber-400" /> Theo Dõi Tình Trạng Deadline
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMembers.map((m) => {
                const memberTasks = getMemberTasks(m.name);
                if (memberTasks.length === 0) return null;
                
                const doingTasks = memberTasks.filter(t => t.status === 'doing' || t.status === 'todo');
                const doneTasks = memberTasks.filter(t => t.status === 'done');
                
                return (
                  <div key={m.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <div className="font-bold text-sm text-white">{m.name}</div>
                      <div className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{m.deptName || m.department}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-400">Đang thực hiện ({doingTasks.length})</div>
                      {doingTasks.length > 0 ? doingTasks.map(t => (
                        <div key={t.id} className="flex justify-between items-center bg-slate-900 rounded-lg p-2 border border-amber-500/20">
                          <div className="text-xs text-slate-300 truncate pr-2 max-w-[70%]">{t.title}</div>
                          <div className="text-[10px] text-amber-400 font-mono whitespace-nowrap flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {t.deadline}
                          </div>
                        </div>
                      )) : (
                        <div className="text-xs text-slate-500 italic">Không có công việc đang làm</div>
                      )}
                    </div>
                    
                    <div className="pt-2 border-t border-white/5">
                      <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành ({doneTasks.length})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (isHRMember || currentUser?.deptName === 'Ban Chủ Nhiệm' || currentUser?.department === 'bcn') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="text-emerald-400" /> Quản Lý Quỹ CLB
              </h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-right">
                <div className="text-xs text-slate-400">Tổng Quỹ Hiện Tại</div>
                <div className="text-xl font-mono font-bold text-emerald-400">
                  {totalBalance.toLocaleString()} VNĐ
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Add */}
              {isHRMember && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="font-semibold text-sm text-slate-300">Thêm Giao Dịch Mới</h4>
                  <form onSubmit={handleAddFinance} className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Loại Giao Dịch</label>
                      <select
                        value={financeForm.type}
                        onChange={(e) => setFinanceForm({ ...financeForm, type: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      >
                        <option value="income">Thu Tiền (+)</option>
                        <option value="expense">Chi Tiền (-)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Số Tiền (VNĐ)</label>
                      <input
                        type="number"
                        required
                        value={financeForm.amount}
                        onChange={(e) => setFinanceForm({ ...financeForm, amount: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                        placeholder="VD: 50000"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Nội Dung</label>
                      <input
                        type="text"
                        required
                        value={financeForm.description}
                        onChange={(e) => setFinanceForm({ ...financeForm, description: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                        placeholder="VD: Thu tiền quỹ tháng 8..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Ngày Thực Hiện</label>
                      <input
                        type="date"
                        required
                        value={financeForm.date}
                        onChange={(e) => setFinanceForm({ ...financeForm, date: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <Plus className="w-4 h-4" /> Thêm Giao Dịch
                    </button>
                  </form>
                </div>
              )}

              {/* History List */}
              <div className={`${isHRMember ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar`}>
                {(finances || []).map((f) => (
                  <div key={f.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-600 transition-colors">
                    <div className="flex gap-4 items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${f.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {f.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{f.description}</div>
                        <div className="text-[10px] text-slate-400 flex gap-2">
                          <span>{f.date}</span>
                          <span>•</span>
                          <span>Bởi: {f.loggedBy}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`font-mono font-bold whitespace-nowrap ${f.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {f.type === 'income' ? '+' : '-'}{f.amount.toLocaleString()} đ
                    </div>
                  </div>
                ))}
                {(finances || []).length === 0 && (
                  <div className="text-center py-10 text-slate-500 text-sm">Chưa có giao dịch nào được ghi nhận.</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
