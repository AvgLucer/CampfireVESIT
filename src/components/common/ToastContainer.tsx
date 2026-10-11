import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> :
          toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" /> :
          toast.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /> :
          <Info className="w-5 h-5 text-sky-600 shrink-0" />;

        const borderStyle =
          toast.type === 'success' ? 'border-emerald-200 bg-white' :
          toast.type === 'error' ? 'border-rose-200 bg-white' :
          toast.type === 'warning' ? 'border-amber-200 bg-white' :
          'border-neutral-200 bg-white';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg shadow-black/5 ${borderStyle} transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
          >
            {icon}
            <div className="flex-1 text-xs leading-relaxed text-[#20231F] font-medium pt-0.5">
              {toast.message}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#737871] hover:text-[#20231F] p-0.5 transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
