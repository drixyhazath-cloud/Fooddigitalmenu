import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.slice(0, 3).map((item) => {
        const isCancel = item.type === 'item_cancelled';
        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-md transition-all ${
              isCancel
                ? 'bg-rose-950/90 border-rose-800 text-rose-100'
                : 'bg-neutral-900/95 border-amber-500/40 text-neutral-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isCancel ? (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              ) : item.type === 'order_submitted' ? (
                <Bell className="w-4 h-4 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold">{item.title}</span>
                <span className="text-[10px] text-neutral-400 tabular-nums">{item.timestamp}</span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5 line-clamp-2">{item.message}</p>
            </div>
            <button
              onClick={() => dismissNotification(item.id)}
              className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
