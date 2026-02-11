import { createContext, useContext } from 'react';
import { toast as sonnerToast } from 'sonner';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const addToast = (message, type = 'success') => {
    if (type === 'error') {
      sonnerToast.error(message);
    } else {
      sonnerToast.success(message);
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
