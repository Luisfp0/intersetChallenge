import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Vistoria {
  id: number;
  areaVistoriaInterna_id: number;
  dataHora: string;
  contemAnomalia: boolean;
  anomalia?: {
    id: number;
    nome: string;
  };
  tipo?: "ENDOGENA" | "EXOGENA" | "FUNCIONAL";
  categoria?: "ALTA" | "MEDIA" | "BAIXA";
  observacao?: string;
  fotos?: string[];
}

interface VistoriasState {
  vistorias: Vistoria[];
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
}

const initialState: VistoriasState = {
  vistorias: [],
  isLoading: false,
  error: null,
  lastSync: null,
};

const inspectionSlice = createSlice({
  name: 'vistorias',
  initialState,
  reducers: {
    fetchVistoriasStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchVistoriasSuccess: (state, action: PayloadAction<Vistoria[]>) => {
      state.isLoading = false;
      state.vistorias = action.payload;
      state.lastSync = new Date().toISOString();
    },
    fetchVistoriasFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchVistoriasStart,
  fetchVistoriasSuccess,
  fetchVistoriasFailure,
} = inspectionSlice.actions;

export default inspectionSlice.reducer;