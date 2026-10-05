'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-300 text-emerald-950',
    error: 'bg-rose-50 border-rose-300 text-rose-950',
    info: 'bg-indigo-50 border-indigo-300 text-indigo-950',
  }[toast.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[toast.type];

  const iconColor = {
    success: 'text-emerald-600',
    error: 'text-rose-600',
    info: 'text-indigo-600',
  }[toast.type];

  return (
    <div
      className={`flex items-start p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${bgStyles}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${iconColor}`} />
      <div className="flex-1 text-sm">
        <p className="font-semibold">{toast.title}</p>
        {toast.message && <p className="mt-1 text-xs opacity-90">{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-3 text-slate-400 hover:text-slate-700 transition"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
