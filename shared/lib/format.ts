const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

export function formatUntil(until: string | null): string {
  if (!until) return 'до конца смены';

  const date = new Date(until);
  if (Number.isNaN(date.getTime())) return 'до конца смены';

  const time = timeFormatter.format(date);
  const isTomorrow = date.getDate() !== new Date().getDate();

  return isTomorrow ? `до ${time} (завтра)` : `до ${time}`;
}

export function formatStock(stock: number): string {
  return `${stock} шт.`;
}
