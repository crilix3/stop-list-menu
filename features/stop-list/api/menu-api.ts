import { http } from '@/shared/api/http';
import type { MenuFilters, MenuItem, MenuItemsResponse, StopItemPayload } from '@/types/menu';

export async function fetchMenuItems(filters: MenuFilters): Promise<MenuItem[]> {
  const params: Record<string, string> = {};
  if (filters.shop !== 'all') params.shop = filters.shop;
  if (filters.status !== 'all') params.status = filters.status;

  const { data } = await http.get<MenuItemsResponse>('/menu-items', { params });
  return data.items;
}

export async function stopMenuItem(id: string, payload: StopItemPayload): Promise<MenuItem> {
  const { data } = await http.post<MenuItem>(`/menu-items/${id}/stop`, payload);
  return data;
}

export async function resumeMenuItem(id: string): Promise<MenuItem> {
  const { data } = await http.post<MenuItem>(`/menu-items/${id}/resume`);
  return data;
}
