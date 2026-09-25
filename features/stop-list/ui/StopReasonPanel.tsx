import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Select';
import type { MenuItem, StopItemPayload, StopReason } from '@/types/menu';
import { STOP_REASON_OPTIONS } from '../model/labels';
import {
  fromDateTimeLocal,
  nextQuarterHourLocal,
  toDateTimeLocalValue,
  validateStopPayload,
  type StopFormErrors,
} from '../model/validations';

type UntilMode = 'shift' | 'time';

interface StopReasonPanelProps {
  item: MenuItem;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: StopItemPayload) => void;
}

const inputClass = (hasError: boolean): string =>
  `w-full rounded-xl border bg-surface px-3 py-2 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60 ${
    hasError ? 'border-accent' : 'border-line'
  }`;

export function StopReasonPanel({ item, isSubmitting, onClose, onSubmit }: StopReasonPanelProps) {
  const fieldId = useId();
  const isEditing = item.status.kind === 'stopped';
  const stoppedUntil = item.status.kind === 'stopped' ? item.status.until : null;

  const [reason, setReason] = useState<StopReason | ''>(() =>
    item.status.kind === 'stopped' ? item.status.reason : '',
  );
  const [untilMode, setUntilMode] = useState<UntilMode>(() => (stoppedUntil ? 'time' : 'shift'));
  const [untilLocal, setUntilLocal] = useState(() =>
    stoppedUntil ? toDateTimeLocalValue(stoppedUntil) : nextQuarterHourLocal(),
  );
  const [errors, setErrors] = useState<StopFormErrors>({});
  const [touched, setTouched] = useState<{ reason: boolean; until: boolean }>({
    reason: false,
    until: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validate = useCallback((): StopFormErrors => {
    const result = validateStopPayload({
      reason,
      until: untilMode === 'shift' ? null : fromDateTimeLocal(untilLocal) ?? '',
    });
    return result.ok ? {} : result.errors;
  }, [reason, untilMode, untilLocal]);

  const handleBlur = (field: keyof StopFormErrors) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ reason: true, until: true });

    const result = validateStopPayload({
      reason,
      until: untilMode === 'shift' ? null : fromDateTimeLocal(untilLocal) ?? '',
    });

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  const reasonError = touched.reason ? errors.reason : undefined;
  const untilError = touched.until ? errors.until : undefined;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Закрыть панель"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/30"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldId}-title`}
        className="relative flex h-full w-110 max-w-full flex-col overflow-y-auto bg-(--color-background) p-6 shadow-2xl"
      >
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={`${fieldId}-title`} className="text-lg font-semibold text-ink">
              {isEditing ? 'Изменить стоп' : 'Поставить в стоп-лист'}
            </h2>
            <p className="text-sm text-muted">{item.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="text-2xl leading-none text-muted transition-colors hover:text-ink"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-6">
          <Select
            id={`${fieldId}-reason`}
            name="reason"
            label="Причина"
            placeholder="Выберите причину"
            value={reason}
            options={STOP_REASON_OPTIONS}
            error={reasonError}
            disabled={isSubmitting}
            autoFocus
            onChange={(event) => {
              setReason(event.target.value as StopReason | '');
              if (touched.reason) setErrors(validate());
            }}
            onBlur={handleBlur('reason')}
          />

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Срок стопа</legend>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name={`${fieldId}-until-mode`}
                checked={untilMode === 'shift'}
                disabled={isSubmitting}
                onChange={() => setUntilMode('shift')}
              />
              До конца смены
            </label>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name={`${fieldId}-until-mode`}
                checked={untilMode === 'time'}
                disabled={isSubmitting}
                onChange={() => setUntilMode('time')}
              />
              Конкретное время
            </label>

            {untilMode === 'time' ? (
              <div className="flex flex-col gap-1.5 pl-6">
                <input
                  id={`${fieldId}-until`}
                  type="datetime-local"
                  step={900}
                  value={untilLocal}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(untilError)}
                  aria-describedby={untilError ? `${fieldId}-until-error` : `${fieldId}-until-hint`}
                  onChange={(event) => {
                    setUntilLocal(event.target.value);
                    if (touched.until) setErrors(validate());
                  }}
                  onBlur={handleBlur('until')}
                  className={inputClass(Boolean(untilError))}
                />

                {untilError ? (
                  <p id={`${fieldId}-until-error`} className="text-xs font-medium text-accent">
                    {untilError}
                  </p>
                ) : (
                  <p id={`${fieldId}-until-hint`} className="text-xs text-muted">
                    Шаг — 15 минут, не дальше 24 часов вперёд.
                  </p>
                )}
              </div>
            ) : null}
          </fieldset>

          <div className="mt-auto flex items-center gap-3 pt-2">
            <Button type="submit" isLoading={isSubmitting} className="flex-1" variant="secondary">
              {isSubmitting ? 'Сохраняем…' : isEditing ? 'Сохранить изменения' : 'Поставить в стоп-лист'}
            </Button>
            <Button variant="restore" onClick={onClose} disabled={isSubmitting}>
              Отмена
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
