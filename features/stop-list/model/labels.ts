import type { Shop, ShopFilter, StatusFilter, StopReason } from '@/types/menu';
import { STOP_REASONS } from './validations';

export const SHOP_TITLE: Record<Shop, string> = {
  kitchen: 'Кухня',
  bar: 'Бар',
  pastry: 'Кондитерская',
};

export const SHOP_FILTER_OPTIONS: readonly { value: ShopFilter; label: string }[] = [
  { value: 'all', label: 'Все цеха' },
  { value: 'kitchen', label: 'Кухня' },
  { value: 'bar', label: 'Бар' },
  { value: 'pastry', label: 'Кондитерская' },
];

export const STATUS_FILTER_OPTIONS: readonly { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все статусы' },
  { value: 'available', label: 'В продаже' },
  { value: 'stopped', label: 'В стоп-листе' },
];

export const STOP_REASON_LABELS: Record<StopReason, string> = {
  out_of_stock: 'Закончились продукты',
  equipment: 'Сломалось оборудование',
  quality: 'Вопросы к качеству партии',
  menu_change: 'Позиция выведена из меню смены',
};

export const STOP_REASON_OPTIONS: readonly { value: StopReason; label: string }[] = STOP_REASONS.map(
  (reason) => ({ value: reason, label: STOP_REASON_LABELS[reason] }),
);
