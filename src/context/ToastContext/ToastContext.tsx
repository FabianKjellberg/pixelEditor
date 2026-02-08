'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styles from './ToastContext.module.css';

export type ToastType = 'success' | 'warning' | 'error';

export type ToastData = {
  id: string;
  message: string;
  type?: ToastType;
};

type ToastContextValue = {
  onToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const onToast = useCallback((message: string, type?: ToastType) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ onToast }), [onToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('cant access context from here');
  }
  return ctx;
};

function ToastItem({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.toast}>
      <p className={styles.toastMessage}>
        {toast.type === 'success' && <span className={styles.typePrefixSuccess}>success: </span>}
        {toast.type === 'warning' && <span className={styles.typePrefixWarning}>warning: </span>}
        {toast.type === 'error' && <span className={styles.typePrefixError}>error: </span>}
        {toast.message}
      </p>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
    </div>
  );
}
