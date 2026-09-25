import axios from 'axios';

export const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string>;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;
    if (body?.message) {
      const fieldErrors = body.errors ? Object.values(body.errors).join(', ') : '';
      return fieldErrors ? `${body.message}: ${fieldErrors}` : body.message;
    }
    return error.message || 'Не удалось выполнить запрос';
  }
  if (error instanceof Error) return error.message;
  return 'Неизвестная ошибка';
}
