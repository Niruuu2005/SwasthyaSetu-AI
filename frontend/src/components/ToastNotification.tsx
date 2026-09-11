import React from 'react';

interface ToastNotificationProps {
  message: string | null;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full bg-inverse-surface text-inverse-on-surface font-label-md text-label-md shadow-lg pointer-events-none transition-all duration-300 z-50 flex items-center gap-2 border border-outline/30 animate-in fade-in slide-in-from-bottom-2">
      <span className="material-symbols-outlined text-[18px] text-primary-fixed">
        check_circle
      </span>
      <span>{message}</span>
    </div>
  );
};
