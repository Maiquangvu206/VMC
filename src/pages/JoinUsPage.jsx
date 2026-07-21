import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { UserPlus, Sparkles, CheckCircle, ArrowRight, ArrowLeft, Camera, Video, Palette, Music } from 'lucide-react';

export const JoinUsPage = () => {
  const { triggerConfetti } = useClub();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [appId, setAppId] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    facebook: '',
    department: 'photo',
    portfolioUrl: '',
    experience: '',
    motivation: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const generatedId = 'VMC-GEN6-' + Math.floor(1000 + Math.random() * 9000);
    setAppId(generatedId);
    setIsSubmitted(true);
    triggerConfetti();
  };

  return (
    <div className="container py-10 space-y-10 max-w-3xl mx-auto pb-20">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="badge badge-purple">Tuyển Thành Viên VMC Gen 6</span>
        <h1 className="font-heading text-4xl font-extrabold text-white">
          Trở Thành Một Phần Của <span className="gradient-text">VMC Family</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Hãy cùng chúng tôi biến những ý tưởng sáng tạo thành tác phẩm thực thụ. Hoàn thành đơn ứng tuyển dưới đây chỉ trong 2 phút!
        </p>
      </div>

      {!isSubmitted ? (
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-purple-500/30 relative shadow-2xl">
          
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10 text-xs font-semibold">
            {[
              { num: 1, label: 'Thông tin cá nhân' },
              { num: 2, label: 'Ban chuyên môn' },
              { num: 3, label: 'Động lực & Gửi' }
            ].map(s => (
              <div key={s.num} className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                  step === s.num
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : step > s.num
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {s.num}
                </span>
                <span className={step === s.num ? 'text-white' : 'text-slate-500'}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4 animate-slide-up">
                <h3 className="font-heading font-bold text-lg text-white">Bước 1: Thông Tin Cá Nhân</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email liên hệ *</label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nguyenvana@gmail.com"
                      className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Số điện thoại / Zalo *</label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0987654321"
                      className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Link Facebook / Instagram cá nhân</label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/username"
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.fullName || !formData.email || !formData.phone) {
                        alert('Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại!');
                        return;
                      }
                      setStep(2);
                    }}
                    className="btn-primary text-sm px-6 py-2.5"
                  >
                    <span>Tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-5 animate-slide-up">
                <h3 className="font-heading font-bold text-lg text-white">Bước 2: Chọn Ban Chuyên Môn & Portfolio</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Ban bạn muốn ứng tuyển *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'photo', label: 'Ban Nhiếp Ảnh', icon: Camera },
                      { id: 'media', label: 'Ban Phim & Media', icon: Video },
                      { id: 'design', label: 'Ban Thiết Kế', icon: Palette },
                      { id: 'music', label: 'Ban Âm Nhạc', icon: Music }
                    ].map(d => {
                      const Icon = d.icon;
                      const selected = formData.department === d.id;
                      return (
                        <div
                          key={d.id}
                          onClick={() => setFormData(prev => ({ ...prev, department: d.id }))}
                          className={`p-4 rounded-xl border text-center cursor-pointer space-y-2 transition-all ${
                            selected
                              ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                              : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto" />
                          <span className="text-xs font-semibold block">{d.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Link Portfolio / Google Drive tác phẩm cá nhân (nếu có)
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://behance.net/you hoặc https://drive.google.com/..."
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kinh nghiệm hoặc công cụ bạn thường sử dụng (Lightroom, Premiere, Photoshop, FL Studio,...)
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Ví dụ: Đã sử dụng Lightroom 1 năm, có máy ảnh Canon 700D..."
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary text-sm px-6 py-2.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-primary text-sm px-6 py-2.5"
                  >
                    <span>Tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4 animate-slide-up">
                <h3 className="font-heading font-bold text-lg text-white">Bước 3: Động Lực & Xác Nhận</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Vì sao bạn muốn gia nhập VMC và bạn kỳ vọng điều gì nhất tại CLB? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    placeholder="Chia sẻ lý do và định hướng sáng tạo của bạn..."
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-500/20 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-purple-400">Xác nhận thông tin ứng tuyển:</div>
                  <p>Họ tên: {formData.fullName} ({formData.phone})</p>
                  <p>Ban đăng ký: Ban {formData.department.toUpperCase()}</p>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-secondary text-sm px-6 py-2.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="submit"
                    className="btn-primary text-sm px-8 py-3 shadow-lg shadow-purple-600/40"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Nộp Đơn Đăng Ký</span>
                  </button>
                </div>
              </div>
            )}

          </form>

        </div>
      ) : (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/40 text-center space-y-6 animate-slide-up">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-3xl font-bold text-white">Nộp Đơn Thành Công!</h2>
            <p className="text-slate-300 text-sm">
              Cảm ơn <strong className="text-white">{formData.fullName}</strong> đã đăng ký gia nhập VMC.
            </p>
          </div>

          <div className="inline-block p-4 rounded-2xl bg-slate-900 border border-white/10 text-center space-y-1 font-mono">
            <div className="text-xs text-slate-400">Mã Đơn Ứng Tuyển Của Bạn:</div>
            <div className="text-2xl font-bold text-purple-400">{appId}</div>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Ban Nhân sự VMC sẽ gửi email xác nhận và lịch phỏng vấn thử thách năng lực qua Email <strong className="text-purple-300">{formData.email}</strong> trong vòng 48h.
          </p>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setStep(1);
              setFormData({
                fullName: '',
                email: '',
                phone: '',
                facebook: '',
                department: 'photo',
                portfolioUrl: '',
                experience: '',
                motivation: ''
              });
            }}
            className="btn-secondary text-xs px-6 py-2.5"
          >
            Nộp đơn đăng ký khác
          </button>
        </div>
      )}

    </div>
  );
};
