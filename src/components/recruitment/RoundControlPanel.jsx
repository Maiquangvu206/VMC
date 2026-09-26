import React from 'react';

export const RoundControlPanel = ({
  season,
  canControlRound,
  updateActiveRound
}) => {
  if (!season || season.is_active !== 1 || !canControlRound) return null;

  const ALL_ROUNDS = ['don', 'phongvan', 'thuthach_quatrinh', 'thuthach_ketqua', 'teamwork'];
  const active = season.active_round || 'none';
  const openRounds = active === 'all' ? ALL_ROUNDS : (active === 'none' ? [] : active.split(','));
  const donOpen = openRounds.includes('don');
  const pvOpen = openRounds.includes('phongvan');
  const twOpen = openRounds.includes('teamwork');
  const ttQuatrinhOpen = openRounds.includes('thuthach_quatrinh');
  const ttKetquaOpen = openRounds.includes('thuthach_ketqua');

  const toggleRound = (round) => {
    let next = [...openRounds];
    if (next.includes(round)) {
      next = next.filter(r => r !== round);
    } else {
      next.push(round);
    }
    const val = next.length === 0 ? 'none' : next.join(',');
    if (updateActiveRound) updateActiveRound(season.id, val);
  };

  const roundBtn = (key, emoji, label, isOpen, color) => (
    <button
      type="button"
      onClick={() => toggleRound(key)}
      title={isOpen ? `Đang mở — nhấn để đóng ${label}` : `Mở ${label}`}
      className={`ds-btn ds-btn-xs transition-all cursor-pointer ${isOpen
        ? `${color} text-white`
        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
        }`}
    >
      {emoji} {isOpen ? `✓ ${label}` : label}
    </button>
  );

  return (
    <div className="mt-4 pt-4 border-t border-[#1f2937] bg-[#0f172a] p-3 rounded-xl space-y-2">
      <span className="text-xs text-slate-300 font-medium">Bảng điều khiển vòng chấm điểm:</span>
      <div className="flex flex-wrap gap-2 mt-1">
        {roundBtn('don', '📝', 'Đơn', donOpen, 'bg-amber-600')}
        {roundBtn('phongvan', '🎙️', 'PV', pvOpen, 'bg-blue-600')}
        {roundBtn('thuthach_quatrinh', '⚡', 'TT Quá Trình', ttQuatrinhOpen, 'bg-amber-500')}
        {roundBtn('thuthach_ketqua', '🏆', 'TT Kết Quả', ttKetquaOpen, 'bg-purple-600')}
        {roundBtn('teamwork', '👥', 'TW', twOpen, 'bg-emerald-600')}

        <div className="h-5 border-l border-slate-700 mx-0.5" />

        <button
          type="button"
          onClick={() => updateActiveRound && updateActiveRound(season.id, ALL_ROUNDS.join(','))}
          className="ds-btn ds-btn-xs bg-violet-700 text-white hover:bg-violet-600 cursor-pointer"
          title="Mở tất cả vòng cùng lúc"
        >
          ⚡ Mở Tất Cả
        </button>
        <button
          type="button"
          onClick={() => updateActiveRound && updateActiveRound(season.id, 'none')}
          className="ds-btn ds-btn-xs bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 cursor-pointer"
          title="Khóa tất cả các vòng"
        >
          🔒 Khóa Tất Cả
        </button>
      </div>

      {openRounds.length > 0 && (
        <p className="text-[10px] text-slate-500 mt-1">
          Đang mở: {openRounds.map(r =>
            r === 'don' ? '📝 Đơn' :
              r === 'phongvan' ? '🎙️ PV' :
                r === 'thuthach_quatrinh' ? '⚡ TT Quá Trình' :
                  r === 'thuthach_ketqua' ? '🏆 TT Kết Quả' :
                    r === 'teamwork' ? '👥 TW' : r
          ).join(' → ')}
        </p>
      )}
    </div>
  );
};
