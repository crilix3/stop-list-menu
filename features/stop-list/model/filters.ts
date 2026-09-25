import type { MenuFilters, ShopFilter, StatusFilter } from '@/types/menu';

export const SHOP_FILTERS: readonly ShopFilter[] = ['all', 'kitchen', 'bar', 'pastry'];
export const STATUS_FILTERS: readonly StatusFilter[] = ['all', 'available', 'stopped'];

export const DEFAULT_FILTERS: MenuFilters = { shop: 'all', status: 'all' };

function toShopFilter(value: string | null | undefined): ShopFilter {
  return SHOP_FILTERS.find((shop) => shop === value) ?? 'all';
}

function toStatusFilter(value: string | null | undefined): StatusFilter {
  return STATUS_FILTERS.find((status) => status === value) ?? 'all';
}

export function parseFilters(params: Record<string, string | string[] | undefined>): MenuFilters {
  const pick = (key: string): string | undefined => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    shop: toShopFilter(pick('shop')),
    status: toStatusFilter(pick('status')),
  };
}

export function buildFilterQuery(filters: MenuFilters): string {
  const params = new URLSearchParams();
  if (filters.shop !== 'all') params.set('shop', filters.shop);
  if (filters.status !== 'all') params.set('status', filters.status);

  const query = params.toString();
  return query ? `?${query}` : '';
}

/** Ключ, по которому сравниваются наборы данных и запросы. */
export function filtersKey(filters: MenuFilters): string {
  return `${filters.shop}|${filters.status}`;
}
