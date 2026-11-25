import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-16 inset-x-4 sm:inset-x-auto sm:end-6 lg:bottom-6 z-50 flex flex-col gap-2 sm:max-w-sm pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-md transition-all ${
              isError
                ? 'border-red-200 bg-red-50 text-red-900'
                : isSuccess
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-[#E2E8F0] bg-white text-[#0F172A]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isError ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
              ) : isSuccess ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16A34A]" />
              ) : (
                <Info className="h-4 w-4 shrink-0 text-[#1E3A8A]" />
              )}
              <span className="truncate">{toast.text}</span>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-0.5 opacity-70 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
