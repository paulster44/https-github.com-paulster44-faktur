import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useLanguage } from '../i18n/LanguageProvider';

type ToastType = 'success' | 'error';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners: Array<(toasts: ToastMessage[]) => void> = [];

const toastStore = {
  toasts: [] as ToastMessage[],
  addToast(message: string, type: ToastType) {
    this.toasts = [...this.toasts, { id: toastId++, message, type }];
    this.emitChange();
  },
  removeToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.emitChange();
  },
  subscribe(listener: (toasts: ToastMessage[]) => void) {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  },
  emitChange() {
    for (const listener of listeners) {
      listener(this.toasts);
    }
  },
};

export const toast = {
  success: (message: string) => toastStore.addToast(message, 'success'),
  error: (message: string) => toastStore.addToast(message, 'error'),
};


const Toast: React.FC<{ message: ToastMessage; onDismiss: (id: number) => void }> = ({ message, onDismiss }) => {
  const { t } = useLanguage();
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(message.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  const baseClasses = "flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800";
  const typeClasses = {
    success: "text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200",
    error: "text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200",
  };
  const Icon = {
    success: () => (
      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
      </svg>
    ),
    error: () => (
      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
      </svg>
    ),
  };
  const CurrentIcon = Icon[message.type];

  return (
    <div className={baseClasses} role="alert">
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${typeClasses[message.type]} rounded-lg`}>
        <CurrentIcon />
        <span className="sr-only">{message.type} icon</span>
      </div>
      <div className="ms-3 text-sm font-normal">{message.message}</div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        aria-label={t('common.close')}
        onClick={() => onDismiss(message.id)}
      >
        <span className="sr-only">{t('common.close')}</span>
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
        </svg>
      </button>
    </div>
  );
};

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState(toastStore.toasts);

  const handleDismiss = useCallback((id: number) => {
    toastStore.removeToast(id);
  }, []);

  useEffect(() => {
    const unsubscribe = toastStore.subscribe(setToasts);
    return () => unsubscribe();
  }, []);
  
  const portalRoot = document.body;
  if (!portalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed top-5 right-5 z-50">
      {toasts.map(t => (
        <Toast key={t.id} message={t} onDismiss={handleDismiss} />
      ))}
    </div>,
    portalRoot
  );
};