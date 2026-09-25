'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { Toast, ToastViewport } from '@/shared/ui/Toast';
import { dismissToast } from '../model/ui-slice';

export function Toaster() {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();

  const handleDismiss = useCallback(
    (id: string) => {
      dispatch(dismissToast(id));
    },
    [dispatch],
  );

  if (toasts.length === 0) return null;

  return (
    <ToastViewport>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => handleDismiss(toast.id)} />
      ))}
    </ToastViewport>
  );
}
