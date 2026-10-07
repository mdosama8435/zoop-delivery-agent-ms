'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all animate-fadeIn ${
              isSuccess
                ? 'bg-dark-900/95 border-emerald-500/40 text-emerald-400'
                : isError
                ? 'bg-dark-900/95 border-rose-500/40 text-rose-400'
                : 'bg-dark-900/95 border-indigo-500/40 text-indigo-400'
            }`}
          >
            <div className="mr-3 mt-0.5 flex-shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-indigo-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-white">{toast.title}</h5>
              {toast.message && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="ml-3 text-slate-400 hover:text-white transition"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
