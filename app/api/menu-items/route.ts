import { NextResponse } from 'next/server';
import { listItems } from '@/server/menu-store';
import type { MenuItemsResponse, Shop } from '@/types/menu';

export const dynamic = 'force-dynamic';

const RESPONSE_DELAY_MS = 700;
const SHOPS: readonly string[] = ['kitchen', 'bar', 'pastry'];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request): Promise<NextResponse<MenuItemsResponse>> {
  await sleep(RESPONSE_DELAY_MS);

  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const status = searchParams.get('status');

  let items = listItems();

  if (shop && SHOPS.includes(shop)) {
    items = items.filter((item) => item.shop === (shop as Shop));
  }
  if (status === 'available') {
    items = items.filter((item) => item.status.kind === 'available');
  }
  if (status === 'stopped') {
    items = items.filter((item) => item.status.kind === 'stopped');
  }

  return NextResponse.json<MenuItemsResponse>({ items });
}
