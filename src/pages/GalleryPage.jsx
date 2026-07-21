import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Camera, Heart, Eye, Filter, Search, Sparkles, MessageSquare, Share2 } from 'lucide-react';

export const GalleryPage = () => {
  const { works, likeWork } = useClub();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWork, setSelectedWork] = useState(null);
  const [commentText, setCommentText] = useState('');

  const filteredWorks = works.filter(w => {
    const matchesFilter = activeFilter === 'all' || w.category === activeFilter;
    const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedWork) return;
    selectedWork.comments.push({
      user: "Bạn (Guest)",
      text: commentText
    });
    setCommentText('');
  };

  return (
    <div className="container py-10 space-y-8 pb-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="badge badge-purple">Triển Lãm Trực Tuyến</span>
        <h1 className="font-heading text-4xl font-extrabold text-white">
          Góc Sáng Tạo <span className="gradient-text">VMC Gallery</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Nơi lưu giữ những khung hình, thước phim và giai điệu giàu cảm xúc của các thành viên CLB.
        </p>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Tất cả tác phẩm' },
            { id: 'photo', label: '📸 Nhiếp Ảnh' },
            { id: 'media', label: '🎬 Phim & Media' },
            { id: 'design', label: '🎨 Graphic Design' },
            { id: 'music', label: '🎵 Âm Nhạc' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tác giả, tác phẩm..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorks.map(work => (
          <div
            key={work.id}
            onClick={() => setSelectedWork(work)}
            className="glass-card rounded-2xl overflow-hidden cursor-pointer group border border-white/10 flex flex-col justify-between"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={work.image}
                alt={work.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <span className="absolute top-3 left-3 badge badge-purple">
                {work.category}
              </span>
            </div>

            <div className="p-5 space-y-3">
              <h3 className="font-heading font-bold text-base text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                {work.title}
              </h3>

              <div className="flex flex-wrap gap-1">
                {work.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-900/80 text-slate-400 px-2 py-0.5 rounded border border-white/5">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <img src={work.avatar} alt={work.author} className="w-6 h-6 rounded-full object-cover" />
                  <span className="truncate max-w-[100px]">{work.author}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      likeWork(work.id);
                    }}
                    className="flex items-center gap-1 text-pink-400 hover:scale-110 transition-transform"
                  >
                    <Heart className="w-3.5 h-3.5 fill-pink-400" /> {work.likes}
                  </button>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Eye className="w-3.5 h-3.5" /> {work.views}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal View Detail */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-slide-up">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl p-6 text-white grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedWork(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800"
            >
              ✕
            </button>

            {/* Left Image */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 h-full min-h-[300px]">
              <img src={selectedWork.image} alt={selectedWork.title} className="w-full h-full object-cover" />
            </div>

            {/* Right Details & Comments */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="badge badge-purple">{selectedWork.category}</span>
                <h3 className="font-heading text-2xl font-bold">{selectedWork.title}</h3>
                
                <div className="flex items-center gap-3">
                  <img src={selectedWork.avatar} alt={selectedWork.author} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-semibold text-sm">{selectedWork.author}</h4>
                    <p className="text-xs text-purple-400">{selectedWork.role}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-xl border border-white/5">
                  {selectedWork.desc}
                </p>

                {/* Like & Share Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => likeWork(selectedWork.id)}
                    className="flex-1 py-2.5 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-pink-400" /> Thích tác phẩm ({selectedWork.likes})
                  </button>
                  <button
                    onClick={() => alert('Đã sao chép liên kết tác phẩm!')}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="font-heading font-semibold text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  Bình luận & Đánh giá ({selectedWork.comments.length})
                </h4>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedWork.comments.map((c, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-2.5 rounded-lg text-xs space-y-0.5">
                      <span className="font-bold text-purple-400">{c.user}: </span>
                      <span className="text-slate-300">{c.text}</span>
                    </div>
                  ))}
                </div>

                {/* Add Comment Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Viết nhận xét của bạn..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Gửi
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
