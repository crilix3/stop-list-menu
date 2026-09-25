export type Shop = 'kitchen' | 'bar' | 'pastry';

export type StopReason = 'out_of_stock' | 'equipment' | 'quality' | 'menu_change';

export type MenuItemStatus =
  | { kind: 'available' }
  | { kind: 'stopped'; reason: StopReason; until: string | null };

export interface MenuItem {
  id: string;
  title: string;
  shop: Shop;
  stock: number;
  status: MenuItemStatus;
  updatedAt: string;
}

export interface StopItemPayload {
  reason: StopReason;
  until: string | null;
}

export interface MenuItemsResponse {
  items: MenuItem[];
}

export type ShopFilter = Shop | 'all';
export type StatusFilter = 'all' | 'available' | 'stopped';

export interface MenuFilters {
  shop: ShopFilter;
  status: StatusFilter;
}
