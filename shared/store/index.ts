import { configureStore } from '@reduxjs/toolkit';
import menuReducer from '@/features/stop-list/model/menu-slice';
import uiReducer from '@/features/stop-list/model/ui-slice';

export const makeStore = () =>
  configureStore({
    reducer: { menu: menuReducer, ui: uiReducer },
    devTools: process.env.NODE_ENV !== 'production',
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
