'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import type { MenuFilters, MenuItem, StopItemPayload } from '@/types/menu';
import { buildFilterQuery, parseFilters } from '../model/filters';
import { loadMenuItems, resumeItem, stopItem } from '../model/menu-slice';
import { closeStopPanel, openStopPanel } from '../model/ui-slice';
import { Filters } from './Filters';
import { StopListTable } from './StopListTable';
import { StopReasonPanel } from './StopReasonPanel';
import { Toaster } from './Toaster';

interface StopListScreenProps {
  initialFilters: MenuFilters;
}

export function StopListScreen({ initialFilters }: StopListScreenProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.toString();
  const filters = useMemo<MenuFilters>(
    () => (search ? parseFilters(Object.fromEntries(new URLSearchParams(search))) : initialFilters),
    [search, initialFilters],
  );

  const items = useAppSelector((state) => state.menu.items);
  const status = useAppSelector((state) => state.menu.status);
  const error = useAppSelector((state) => state.menu.error);
  const pendingIds = useAppSelector((state) => state.menu.pendingIds);
  const panelItemId = useAppSelector((state) => state.ui.panelItemId);

  const panelItem = useMemo(
    () => items.find((item) => item.id === panelItemId) ?? null,
    [items, panelItemId],
  );

  useEffect(() => {
    void dispatch(loadMenuItems(filters));
  }, [dispatch, filters]);

  const handleFiltersChange = useCallback(
    (next: MenuFilters) => {
      router.push(`${pathname}${buildFilterQuery(next)}`, { scroll: false });
    },
    [pathname, router],
  );

  const handleOpenPanel = useCallback(
    (item: MenuItem) => {
      dispatch(openStopPanel(item.id));
    },
    [dispatch],
  );

  const handleClosePanel = useCallback(() => {
    dispatch(closeStopPanel());
  }, [dispatch]);

  const handleSubmitStop = useCallback(
    (payload: StopItemPayload) => {
      if (!panelItem) return;
      void dispatch(stopItem({ id: panelItem.id, payload }));
    },
    [dispatch, panelItem],
  );

  const handleResume = useCallback(
    (item: MenuItem) => {
      void dispatch(resumeItem({ id: item.id }));
    },
    [dispatch],
  );

  const handleRetry = useCallback(() => {
    void dispatch(loadMenuItems(filters));
  }, [dispatch, filters]);

  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Смена · сегодня</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink text-(--accent-color)">Стоп-лист кухни</h1>
        <p className="text-sm text-muted">
          Позиции, которые сейчас нельзя продать. Менеджер зала видит меню смены и управляет стопом.
        </p>
      </header>

      <Filters value={filters} disabled={status === 'loading'} onChange={handleFiltersChange} />

      <StopListTable
        items={items}
        status={status}
        error={error}
        pendingIds={pendingIds}
        onOpenPanel={handleOpenPanel}
        onResume={handleResume}
        onRetry={handleRetry}
      />

      {panelItem ? (
        <StopReasonPanel
          key={panelItem.id}
          item={panelItem}
          isSubmitting={pendingIds.includes(panelItem.id)}
          onClose={handleClosePanel}
          onSubmit={handleSubmitStop}
        />
      ) : null}

      <Toaster />
    </>
  );
}
