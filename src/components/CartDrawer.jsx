import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, CheckCircle } from 'lucide-react';

export const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, updateCartQty, triggerConfetti } = useClub();
  const [isCheckoutSubmitted, setIsCheckoutSubmitted] = useState(false);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCheckout = () => {
    setIsCheckoutSubmitted(true);
    triggerConfetti();
    setTimeout(() => {
      setIsCheckoutSubmitted(false);
      setIsCartOpen(false);
      alert('Đặt hàng Merchandise VMC thành công! Ban Quản Lý sẽ liên hệ giao hàng trong 24h.');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-slide-up">
      <div className="w-full max-w-md bg-slate-900 border-l border-white/10 h-full flex flex-col shadow-2xl p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Giỏ Hàng VMC Store</h3>
              <p className="text-xs text-slate-400">{cart.length} vật phẩm đã chọn</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-600" />
              <p>Giỏ hàng của bạn đang trống.</p>
              <p className="text-xs text-slate-500">Hãy chọn món đồ Merchandise VMC yêu thích nhé!</p>
            </div>
          ) : isCheckoutSubmitted ? (
            <div className="text-center py-20 space-y-4 animate-bounce">
              <CheckCircle className="w-16 h-16 mx-auto text-emerald-400" />
              <h4 className="font-heading text-xl font-bold text-white">Đang xử lý đơn hàng...</h4>
              <p className="text-xs text-slate-400">Cảm ơn bạn đã ủng hộ quyên góp cho CLB VMC!</p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.id}
                className="flex gap-4 p-3 rounded-2xl bg-slate-800/60 border border-white/5 items-center"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-semibold text-sm text-white truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-purple-400 font-mono mt-0.5">
                    {item.price.toLocaleString('vi-VN')} VNĐ
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-1">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => updateCartQty(item.id, -item.qty)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && !isCheckoutSubmitted && (
          <div className="border-t border-white/10 pt-4 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Tổng cộng thanh toán:</span>
              <span className="font-heading font-bold text-xl text-purple-400 font-mono">
                {subtotal.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white font-heading font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all"
            >
              <span>Xác Nhận Đặt Hàng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
