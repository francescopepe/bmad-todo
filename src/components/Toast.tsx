'use client';

import { useEffect, useRef, useState } from 'react';

export interface ToastItem {
  id: number;
  message: string;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

function SingleToast({ id, message, onDismiss }: { id: number; message: string; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false);
  const slideOutTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const rafId = requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setVisible(false);
      slideOutTimerRef.current = setTimeout(() => onDismiss(id), 200);
    }, 4000);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      clearTimeout(slideOutTimerRef.current);
    };
  }, [id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`bg-toast-bg text-white text-[0.875rem] font-normal px-4 py-3 rounded-lg shadow-lg transition-all duration-200 ease ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0'
      }`}
    >
      {message}
    </div>
  );
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <SingleToast key={toast.id} id={toast.id} message={toast.message} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
