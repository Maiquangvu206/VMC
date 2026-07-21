import React from 'react';
import { useClub } from '../context/ClubContext';
import { ShoppingBag, Star, Plus, Check } from 'lucide-react';

export const StorePage = () => {
  const { products, addToCart, cart } = useClub();

  return (
    <div className="container py-10 space-y-10 pb-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="badge badge-cyan">Cửa Hàng VMC</span>
        <h1 className="font-heading text-4xl font-extrabold text-white">
          Merchandise & <span className="gradient-text">Vật Phẩm CLB</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Sở hữu những món đồ độc quyền mang bản sắc VMC. Toàn bộ lợi nhuận được quyên góp vào Quỹ Phát triển Dự án Nghệ thuật.
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(prod => {
          const inCart = cart.find(i => i.id === prod.id);

          return (
            <div
              key={prod.id}
              className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between group"
            >
              <div className="relative h-60 overflow-hidden bg-slate-950">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {prod.badge && (
                  <span className="absolute top-3 left-3 badge badge-purple">
                    {prod.badge}
                  </span>
                )}
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{prod.rating}</span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {prod.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="font-heading font-bold text-lg text-purple-400 font-mono">
                    {prod.price.toLocaleString('vi-VN')} VNĐ
                  </span>

                  <button
                    onClick={() => addToCart(prod)}
                    className={`p-2.5 rounded-xl font-medium transition-all flex items-center gap-1.5 text-xs ${
                      inCart
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'btn-primary'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>({inCart.qty})</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Thêm</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
