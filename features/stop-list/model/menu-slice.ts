import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApiErrorMessage } from '@/shared/api/http';
import type { RootState } from '@/shared/store';
import type { MenuFilters, MenuItem, MenuItemStatus, StopItemPayload } from '@/types/menu';
import { fetchMenuItems, resumeMenuItem, stopMenuItem } from '../api/menu-api';
import { filtersKey } from './filters';

export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface MenuState {
  items: MenuItem[];
  status: LoadStatus;
  error: string | null;
  filters: MenuFilters;
  /** Ключ фильтров, данные для которого сейчас лежат в `items`. */
  appliedKey: string | null;
  /** Ключ фильтров запроса «в полёте» — защита от дублей. */
  inFlightKey: string | null;
  /** id последнего запроса — защита от гонок. */
  activeRequestId: string | null;
  /** Позиции с незавершённой мутацией (для метки «сохраняется»). */
  pendingIds: string[];
}

const initialState: MenuState = {
  items: [],
  status: 'idle',
  error: null,
  filters: { shop: 'all', status: 'all' },
  appliedKey: null,
  inFlightKey: null,
  activeRequestId: null,
  pendingIds: [],
};

/* Actions объявлены до thunk'ов, чтобы избежать циклических зависимостей. */
export const patchItem = createAction<{ id: string; changes: Partial<MenuItem> }>('menu/patchItem');
export const markPending = createAction<string>('menu/markPending');
export const unmarkPending = createAction<string>('menu/unmarkPending');

export const loadMenuItems = createAsyncThunk<MenuItem[], MenuFilters, { state: RootState; rejectValue: string }>(
  'menu/loadMenuItems',
  async (filters, { rejectWithValue }) => {
    try {
      return await fetchMenuItems(filters);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
  {
    condition: (filters, { getState }) => getState().menu.inFlightKey !== filtersKey(filters),
  },
);

export const stopItem = createAsyncThunk<
  MenuItem,
  { id: string; payload: StopItemPayload },
  { state: RootState; rejectValue: string }
>('menu/stopItem', async ({ id, payload }, { dispatch, getState, rejectWithValue }) => {
  const previous = getState().menu.items.find((item) => item.id === id);
  if (!previous) return rejectWithValue('Позиция больше не отображается в списке');

  const optimisticStatus: MenuItemStatus = {
    kind: 'stopped',
    reason: payload.reason,
    until: payload.until,
  };

  dispatch(markPending(id));
  dispatch(patchItem({ id, changes: { status: optimisticStatus } }));

  try {
    const updated = await stopMenuItem(id, payload);
    // Фоновая ревалидация: список под текущими фильтрами должен остаться консистентным.
    void dispatch(loadMenuItems(getState().menu.filters));
    return updated;
  } catch (error) {
    dispatch(patchItem({ id, changes: { status: previous.status, updatedAt: previous.updatedAt } }));
    return rejectWithValue(getApiErrorMessage(error));
  } finally {
    dispatch(unmarkPending(id));
  }
});

export const resumeItem = createAsyncThunk<
  MenuItem,
  { id: string },
  { state: RootState; rejectValue: string }
>('menu/resumeItem', async ({ id }, { dispatch, getState, rejectWithValue }) => {
  const previous = getState().menu.items.find((item) => item.id === id);
  if (!previous) return rejectWithValue('Позиция больше не отображается в списке');

  dispatch(markPending(id));
  dispatch(patchItem({ id, changes: { status: { kind: 'available' } } }));

  try {
    const updated = await resumeMenuItem(id);
    void dispatch(loadMenuItems(getState().menu.filters));
    return updated;
  } catch (error) {
    dispatch(patchItem({ id, changes: { status: previous.status, updatedAt: previous.updatedAt } }));
    return rejectWithValue(getApiErrorMessage(error));
  } finally {
    dispatch(unmarkPending(id));
  }
});

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(patchItem, (state, action) => {
        const item = state.items.find((candidate) => candidate.id === action.payload.id);
        if (item) Object.assign(item, action.payload.changes);
      })
      .addCase(markPending, (state, action) => {
        if (!state.pendingIds.includes(action.payload)) state.pendingIds.push(action.payload);
      })
      .addCase(unmarkPending, (state, action) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.payload);
      })
      .addCase(loadMenuItems.pending, (state, action) => {
        const key = filtersKey(action.meta.arg);

        state.filters = action.meta.arg;
        state.inFlightKey = key;
        state.activeRequestId = action.meta.requestId;
        state.error = null;

        // Спиннер показываем только при смене набора данных — не при фоновой ревалидации.
        if (state.appliedKey !== key) {
          state.status = 'loading';
          state.items = [];
          state.appliedKey = null;
        }
      })
      .addCase(loadMenuItems.fulfilled, (state, action) => {
        if (state.inFlightKey === filtersKey(action.meta.arg)) state.inFlightKey = null;
        if (action.meta.requestId !== state.activeRequestId) return;

        state.status = 'succeeded';
        state.items = action.payload;
        state.appliedKey = filtersKey(action.meta.arg);
      })
      .addCase(loadMenuItems.rejected, (state, action) => {
        if (state.inFlightKey === filtersKey(action.meta.arg)) state.inFlightKey = null;
        if (action.meta.requestId !== state.activeRequestId) return;

        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Не удалось загрузить меню';
        state.items = [];
        state.appliedKey = null;
      })
      .addCase(stopItem.fulfilled, (state, action) => {
        const item = state.items.find((candidate) => candidate.id === action.payload.id);
        if (item) Object.assign(item, action.payload);
      })
      .addCase(resumeItem.fulfilled, (state, action) => {
        const item = state.items.find((candidate) => candidate.id === action.payload.id);
        if (item) Object.assign(item, action.payload);
      });
  },
});

export default menuSlice.reducer;
