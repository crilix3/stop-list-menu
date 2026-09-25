import { useEffect, useRef, type ReactNode } from 'react';

export interface ToastData {
  id: string;
  kind: 'error' | 'success' | 'info';
  message: string;
}

const KIND_STYLES: Record<ToastData['kind'], string> = {
  error: 'border-accent/40 bg-(--accent-color) text-white',
  success: 'border-success/40 bg-success/[0.08]',
  info: 'border-line bg-surface',
};

export function ToastViewport({ children }: { children: ReactNode }) {
  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Уведомления"
      className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-90 max-w-[calc(100vw-3rem)] flex-col gap-3"
    >
      {children}
    </div>
  );
}

export function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  const dismissRef = useRef(onDismiss);

  // Обновляем ref в эффекте — это безопасно и разрешено React.
  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  // Таймер настраиваем один раз при монтировании.
  useEffect(() => {
    const timer = window.setTimeout(() => dismissRef.current(), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm text-ink shadow-lg ${KIND_STYLES[toast.kind]}`}
    >
      <p className="flex-1 leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Закрыть уведомление"
        className="text-lg leading-none text-muted transition-colors hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}
