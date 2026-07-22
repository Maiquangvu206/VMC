import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, ShieldAlert } from 'lucide-react';

export const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/40 bg-slate-900/95 text-emerald-100 shadow-emerald-900/20',
    error: 'border-rose-500/40 bg-slate-900/95 text-rose-100 shadow-rose-900/20',
    warning: 'border-amber-500/40 bg-slate-900/95 text-amber-100 shadow-amber-900/20',
    info: 'border-blue-500/40 bg-slate-900/95 text-blue-100 shadow-blue-900/20'
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl animate-slide-up transition-all ${borders[toast.type || 'success']}`}>
      {icons[toast.type || 'success']}
      <div className="flex-1 text-xs font-semibold leading-relaxed whitespace-pre-line">
        {toast.message}
      </div>
      <button onClick={onRemove} className="text-slate-400 hover:text-white transition-colors p-0.5 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
