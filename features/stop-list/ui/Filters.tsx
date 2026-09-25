'use client';

import { Select } from '@/shared/ui/Select';
import type { MenuFilters, ShopFilter, StatusFilter } from '@/types/menu';
import { SHOP_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../model/labels';

interface FiltersProps {
  value: MenuFilters;
  disabled?: boolean;
  onChange: (next: MenuFilters) => void;
}

export function Filters({ value, disabled = false, onChange }: FiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select
        id="filter-shop"
        name="shop"
        label="Цех"
        value={value.shop}
        disabled={disabled}
        options={SHOP_FILTER_OPTIONS}
        onChange={(event) => onChange({ ...value, shop: event.target.value as ShopFilter })}
        className="min-w-47.5"
      />

      <Select
        id="filter-status"
        name="status"
        label="Статус"
        value={value.status}
        disabled={disabled}
        options={STATUS_FILTER_OPTIONS}
        onChange={(event) => onChange({ ...value, status: event.target.value as StatusFilter })}
        className="min-w-47.5"
      />
    </div>
  );
}
