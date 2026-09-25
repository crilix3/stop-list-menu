import type { MenuItem, StopItemPayload } from '@/types/menu';

const STEP_MS = 15 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function roundUpToStep(ts: number): number {
  return Math.ceil(ts / STEP_MS) * STEP_MS;
}

function iso(ts: number): string {
  return new Date(ts).toISOString();
}

function seed(): MenuItem[] {
  const now = Date.now();
  const soon = iso(roundUpToStep(now + 2 * HOUR_MS));
  const later = iso(roundUpToStep(now + 5 * HOUR_MS));
  const recent = iso(now - 40 * 60 * 1000);

  return [
    { id: 'k-01', title: 'Том-ям с креветками', shop: 'kitchen', stock: 12, status: { kind: 'available' }, updatedAt: recent },
    { id: 'k-02', title: 'Пад Тай с курицей', shop: 'kitchen', stock: 7, status: { kind: 'available' }, updatedAt: recent },
    { id: 'k-03', title: 'Том Кха с грибами', shop: 'kitchen', stock: 0, status: { kind: 'stopped', reason: 'out_of_stock', until: null }, updatedAt: recent },
    { id: 'k-04', title: 'Зелёный карри', shop: 'kitchen', stock: 9, status: { kind: 'available' }, updatedAt: recent },
    { id: 'k-05', title: 'Лапша вок с говядиной', shop: 'kitchen', stock: 3, status: { kind: 'stopped', reason: 'equipment', until: soon }, updatedAt: recent },
    { id: 'k-06', title: 'Спринг-роллы', shop: 'kitchen', stock: 24, status: { kind: 'available' }, updatedAt: recent },
    { id: 'k-07', title: 'Курица терияки', shop: 'kitchen', stock: 15, status: { kind: 'available' }, updatedAt: recent },
    { id: 'b-01', title: 'Лимонад облепиховый', shop: 'bar', stock: 30, status: { kind: 'available' }, updatedAt: recent },
    { id: 'b-02', title: 'Коктейль «Пина колада»', shop: 'bar', stock: 0, status: { kind: 'stopped', reason: 'out_of_stock', until: null }, updatedAt: recent },
    { id: 'b-03', title: 'Смузи манго', shop: 'bar', stock: 6, status: { kind: 'stopped', reason: 'quality', until: later }, updatedAt: recent },
    { id: 'b-04', title: 'Эспрессо', shop: 'bar', stock: 99, status: { kind: 'available' }, updatedAt: recent },
    { id: 'b-05', title: 'Матча латте', shop: 'bar', stock: 11, status: { kind: 'available' }, updatedAt: recent },
    { id: 'p-01', title: 'Чизкейк Нью-Йорк', shop: 'pastry', stock: 4, status: { kind: 'available' }, updatedAt: recent },
    { id: 'p-02', title: 'Тарт с лимоном', shop: 'pastry', stock: 2, status: { kind: 'stopped', reason: 'menu_change', until: null }, updatedAt: recent },
    { id: 'p-03', title: 'Круассан миндальный', shop: 'pastry', stock: 8, status: { kind: 'available' }, updatedAt: recent },
  ];
}

const globalStore = globalThis as typeof globalThis & { __menuStore?: MenuItem[] };

export function listItems(): MenuItem[] {
  if (!globalStore.__menuStore) globalStore.__menuStore = seed();
  return globalStore.__menuStore;
}

export function findItem(id: string): MenuItem | null {
  return listItems().find((item) => item.id === id) ?? null;
}

export function setStopped(id: string, payload: StopItemPayload): MenuItem | null {
  const items = listItems();
  const index = items.findIndex((item) => item.id === id);
  const current = items[index];
  if (!current) return null;

  const next: MenuItem = {
    ...current,
    status: { kind: 'stopped', reason: payload.reason, until: payload.until },
    updatedAt: new Date().toISOString(),
  };
  items[index] = next;
  return next;
}

export function setAvailable(id: string): MenuItem | null {
  const items = listItems();
  const index = items.findIndex((item) => item.id === id);
  const current = items[index];
  if (!current) return null;

  const next: MenuItem = {
    ...current,
    status: { kind: 'available' },
    updatedAt: new Date().toISOString(),
  };
  items[index] = next;
  return next;
}
