import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Client {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

interface ClientsState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
}

const initialState: ClientsState = {
  clients: [],
  isLoading: false,
  error: null,
  lastSync: null,
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    fetchClientsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchClientsSuccess: (state, action: PayloadAction<Client[]>) => {
      state.isLoading = false;
      state.clients = action.payload;
      state.lastSync = new Date().toISOString();
    },
    fetchClientsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateLocalClients: (state, action: PayloadAction<Client[]>) => {
      state.clients = action.payload;
    },
  },
});

export const {
  fetchClientsStart,
  fetchClientsSuccess,
  fetchClientsFailure,
  updateLocalClients,
} = clientsSlice.actions;
export default clientsSlice.reducer;