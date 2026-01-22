'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 10);

    // Auto close after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: {
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-500 dark:border-green-600',
      text: 'text-green-800 dark:text-green-200',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-500 dark:border-red-600',
      text: 'text-red-800 dark:text-red-200',
      icon: '✕',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-500 dark:border-blue-600',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'ℹ',
    },
  };

  const style = colors[type];

  return (
    <div
      className={`fixed top-20 right-4 z-[100] max-w-md transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${style.bg} ${style.border} ${style.text} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3`}
      >
        <div className="text-xl flex-shrink-0">{style.icon}</div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Toast Container to manage multiple toasts
interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

let toastCounter = 0;
let toastCallback: ((toast: ToastMessage) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  if (toastCallback) {
    toastCallback({
      id: toastCounter++,
      message,
      type,
    });
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastCallback = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);
    };

    return () => {
      toastCallback = null;
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
