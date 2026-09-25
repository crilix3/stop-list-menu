import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import type { ToastData } from '@/shared/ui/Toast';
import { resumeItem, stopItem } from './menu-slice';

interface UiState {
  panelItemId: string | null;
  toasts: ToastData[];
}

const initialState: UiState = {
  panelItemId: null,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openStopPanel(state, action: PayloadAction<string>) {
      state.panelItemId = action.payload;
    },
    closeStopPanel(state) {
      state.panelItemId = null;
    },
    pushToast: {
      reducer(state, action: PayloadAction<ToastData>) {
        state.toasts.push(action.payload);
      },
      prepare(payload: { kind: ToastData['kind']; message: string }) {
        return { payload: { id: nanoid(), kind: payload.kind, message: payload.message } };
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(stopItem.fulfilled, (state, action) => {
        if (state.panelItemId === action.payload.id) state.panelItemId = null;
      })
      .addCase(resumeItem.fulfilled, (state, action) => {
        if (state.panelItemId === action.payload.id) state.panelItemId = null;
      })
      .addCase(stopItem.rejected, (state, action) => {
        state.toasts.push({
          id: nanoid(),
          kind: 'error',
          message: action.payload ?? action.error.message ?? 'Не удалось поставить позицию в стоп-лист',
        });
      })
      .addCase(resumeItem.rejected, (state, action) => {
        state.toasts.push({
          id: nanoid(),
          kind: 'error',
          message: action.payload ?? action.error.message ?? 'Не удалось вернуть позицию в продажу',
        });
      });
  },
});

export const { openStopPanel, closeStopPanel, pushToast, dismissToast } = uiSlice.actions;
export default uiSlice.reducer;
