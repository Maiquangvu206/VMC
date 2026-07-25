import { useState, useMemo } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useMemo(() => {
    return (message, type = 'success', duration = 3000) => {
      const id = 'toast-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      setToasts(prev => [...prev, { id, message, type, duration }]);
    };
  }, []);

  const removeToast = useMemo(() => {
    return (id) => {
      setToasts(prev => prev.filter(t => t.id !== id));
    };
  }, []);

  const success = useMemo(() => {
    return (message, duration) => showToast(message, 'success', duration);
  }, [showToast]);

  const error = useMemo(() => {
    return (message, duration) => showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useMemo(() => {
    return (message, duration) => showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useMemo(() => {
    return (message, duration) => showToast(message, 'info', duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};
