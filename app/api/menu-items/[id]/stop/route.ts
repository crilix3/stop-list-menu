import { NextResponse } from 'next/server';
import { validateStopPayload } from '@/features/stop-list/model/validations';
import { findItem, setStopped } from '@/server/menu-store';
import type { MenuItem } from '@/types/menu';

export const dynamic = 'force-dynamic';

const RESPONSE_DELAY_MS = 600;
const FAILURE_RATE = 0.2;

interface RouteContext {
  params: Promise<{ id: string }>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request, { params }: RouteContext): Promise<NextResponse> {
  const { id } = await params;
  await sleep(RESPONSE_DELAY_MS);

  const item = findItem(id);
  if (!item) {
    return NextResponse.json({ message: 'Позиция не найдена' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Некорректный JSON в теле запроса' }, { status: 400 });
  }

  const validation = validateStopPayload(body);
  if (!validation.ok) {
    return NextResponse.json(
      { message: 'Проверьте параметры стопа', errors: validation.errors },
      { status: 422 },
    );
  }

  // Искусственный сбой — проверка оптимистичного обновления и отката.
  if (Math.random() < FAILURE_RATE) {
    return NextResponse.json({ message: 'Сервис временно недоступен, попробуйте ещё раз' }, { status: 503 });
  }

  const updated = setStopped(id, validation.data);
  if (!updated) {
    return NextResponse.json({ message: 'Позиция не найдена' }, { status: 404 });
  }

  return NextResponse.json<MenuItem>(updated);
}
