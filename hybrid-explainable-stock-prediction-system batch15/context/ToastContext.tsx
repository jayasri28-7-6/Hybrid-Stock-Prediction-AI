import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ToastState {
  visible: boolean;
  message: string;
}

interface ToastContextType {
  toast: ToastState;
  showToast: (message: string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' });
  // Use ReturnType<typeof setTimeout> to handle both browser (number) and node (Timeout) environments.
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setToast({ visible: false, message: '' });
  }, [timeoutId]);

  const showToast = useCallback((message: string) => {
    // Hide previous toast before showing a new one
    if (timeoutId) {
        clearTimeout(timeoutId);
    }

    setToast({ visible: true, message });

    // Using setTimeout which may return number or Timeout depending on environment types
    const id = setTimeout(() => {
      hideToast();
    }, 4000); // Auto-hide after 4 seconds
    setTimeoutId(id);
  }, [hideToast, timeoutId]);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};