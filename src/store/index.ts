import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import clientsReducer from './slice/clientsSlice';
import vistoriasReducer from './slice/inspectionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    vistorias: vistoriasReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;