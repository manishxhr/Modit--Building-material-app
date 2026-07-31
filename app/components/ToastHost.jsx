'use client';

import { useEffect, useState } from 'react';

let toastCounter = 0;

export function notifyToast(message, tone = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('modit:toast', { detail: { message, tone } }));
}

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onToast(event) {
      const payload = event.detail || {};
      const id = ++toastCounter;
      setToasts((items) => [...items, { id, message: payload.message || 'Action complete.', tone: payload.tone || 'info' }]);
      setTimeout(() => {
        setToasts((items) => items.filter((item) => item.id !== id));
      }, 3200);
    }

    window.addEventListener('modit:toast', onToast);
    return () => window.removeEventListener('modit:toast', onToast);
  }, []);

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={'toast toast-' + toast.tone}>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
