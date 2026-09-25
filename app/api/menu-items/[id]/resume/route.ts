import { NextResponse } from 'next/server';
import { findItem, setAvailable } from '@/server/menu-store';
import type { MenuItem } from '@/types/menu';

export const dynamic = 'force-dynamic';

const RESPONSE_DELAY_MS = 600;
const FAILURE_RATE = 0.2;

interface RouteContext {
  params: Promise<{ id: string }>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const { id } = await params;
  await sleep(RESPONSE_DELAY_MS);

  const item = findItem(id);
  if (!item) {
    return NextResponse.json({ message: 'Позиция не найдена' }, { status: 404 });
  }

  if (item.status.kind === 'available') {
    return NextResponse.json({ message: 'Позиция уже в продаже' }, { status: 409 });
  }

  if (item.stock <= 0) {
    return NextResponse.json(
      { message: 'Нельзя вернуть в продажу: остаток 0' },
      { status: 409 },
    );
  }

  if (Math.random() < FAILURE_RATE) {
    return NextResponse.json({ message: 'Сервис временно недоступен, попробуйте ещё раз' }, { status: 503 });
  }

  const updated = setAvailable(id);
  if (!updated) {
    return NextResponse.json({ message: 'Позиция не найдена' }, { status: 404 });
  }

  return NextResponse.json<MenuItem>(updated);
}
