import type { StopItemPayload, StopReason } from '@/types/menu';

export const MAX_AHEAD_MS = 24 * 60 * 60 * 1000;
export const STEP_MS = 15 * 60 * 1000;

export const STOP_REASONS: readonly StopReason[] = ['out_of_stock', 'equipment', 'quality', 'menu_change'];

export function isStopReason(value: unknown): value is StopReason {
  return typeof value === 'string' && (STOP_REASONS as readonly string[]).includes(value);
}

//	Проверяет срок стопа. `null` = до конца смены.
// 	Возвращает текст ошибки или `null`, если значение валидно.
export function validateUntil(value: string | null, now: number = Date.now()): string | null {
  if (value === null) return null;

  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return 'Некорректное время';
  if (ts <= now) return 'Время должно быть в будущем';
  if (ts - now > MAX_AHEAD_MS) return 'Не больше чем на 24 часа вперёд';
  if (ts % STEP_MS !== 0) return 'Шаг — 15 минут';

  return null;
}

export interface StopFormErrors {
  reason?: string;
  until?: string;
}

export type StopPayloadValidation =
  | { ok: true; data: StopItemPayload }
  | { ok: false; errors: StopFormErrors };

//	Единая точка правды: используется и формой, и route handler'ом.
export function validateStopPayload(input: unknown, now: number = Date.now()): StopPayloadValidation {
  const source = (typeof input === 'object' && input !== null ? input : {}) as {
    reason?: unknown;
    until?: unknown;
  };

  const errors: StopFormErrors = {};

  const reason = isStopReason(source.reason) ? source.reason : null;
  if (!reason) errors.reason = 'Выберите причину стопа';

  let until: string | null = null;
  const rawUntil = source.until ?? null;

  if (rawUntil === null) {
    until = null;
  } else if (typeof rawUntil !== 'string') {
    errors.until = 'Некорректное время';
  } else {
    const untilError = validateUntil(rawUntil, now);
    if (untilError) errors.until = untilError;
    else until = rawUntil;
  }

  if (!reason || errors.until) return { ok: false, errors };

  return { ok: true, data: { reason, until } };
}

//	Помощники для <input type="datetime-local">

const pad = (value: number): string => String(value).padStart(2, '0');

export function toDateTimeLocalValue(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDateTimeLocal(value: string): string | null {
  if (!value) return null;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? null : new Date(ts).toISOString();
}

export function nextQuarterHourLocal(now: Date = new Date()): string {
  const ts = Math.ceil((now.getTime() + 1) / STEP_MS) * STEP_MS;
  return toDateTimeLocalValue(new Date(ts));
}
