import React, { useState } from 'react';
import { MEMBERS } from '../data/mockData';
import { Users, Award, ExternalLink, Sparkles } from 'lucide-react';

export const MembersPage = () => {
  const [selectedDept, setSelectedDept] = useState('all');

  const filteredMembers = MEMBERS.filter(m => {
    return selectedDept === 'all' || m.dept === selectedDept;
  });

  return (
    <div className="container py-10 space-y-10 pb-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="badge badge-purple">Gia Đình VMC</span>
        <h1 className="font-heading text-4xl font-extrabold text-white">
          Đội Ngũ & <span className="gradient-text">Ban Điều Hành</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Những gương mặt dẫn dắt và tạo nên linh hồn cho các hoạt động sáng tạo nghệ thuật của CLB.
        </p>
      </div>

      {/* Dept Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { id: 'all', label: 'Tất cả thành viên' },
          { id: 'photo', label: 'Ban Nhiếp Ảnh' },
          { id: 'media', label: 'Ban Phim & Media' },
          { id: 'design', label: 'Ban Thiết Kế' },
          { id: 'music', label: 'Ban Âm Nhạc' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedDept(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedDept === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMembers.map(m => (
          <div
            key={m.id}
            className="glass-card p-6 rounded-2xl border border-white/10 text-center space-y-4 hover:border-purple-500/40 group"
          >
            <div className="relative w-28 h-28 mx-auto rounded-full p-1 bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400">
              <img
                src={m.avatar}
                alt={m.name}
                className="w-full h-full object-cover rounded-full"
              />
              <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-900 border border-purple-500 text-amber-400" title="Điểm đóng góp">
                <Award className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-bold text-lg text-white group-hover:text-purple-300 transition-colors">
                {m.name}
              </h3>
              <p className="text-xs text-purple-400 font-semibold">{m.role}</p>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">
              "{m.bio}"
            </p>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Đóng góp: <strong className="text-white font-mono">{m.points} pts</strong></span>
              <button
                onClick={() => alert(`Xem Portfolio cá nhân của ${m.name}`)}
                className="hover:text-purple-400 flex items-center gap-1 font-semibold"
              >
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
