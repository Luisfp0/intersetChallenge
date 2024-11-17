import inspectionReducer, {
  fetchVistoriasStart,
  fetchVistoriasSuccess,
  fetchVistoriasFailure,
} from "../store/slice/inspectionSlice";
import { Vistoria } from "../store/slice/inspectionSlice";

describe("inspectionSlice", () => {
  const initialState = {
    vistorias: [],
    isLoading: false,
    error: null,
    lastSync: null,
  };

  it("should return the initial state", () => {
    const result = inspectionReducer(undefined, { type: "" });
    expect(result).toEqual(initialState);
  });

  it("should handle fetchVistoriasStart", () => {
    const state = inspectionReducer(initialState, fetchVistoriasStart());
    expect(state).toEqual({
      ...initialState,
      isLoading: true,
    });
  });

  it("should handle fetchVistoriasSuccess", () => {
    const vistorias: Vistoria[] = [
      {
        id: 1,
        areaVistoriaInterna_id: 100,
        dataHora: "2024-11-17T10:00:00Z",
        contemAnomalia: true,
        anomalia: { id: 1, nome: "Fissura" },
        tipo: "ENDOGENA",
        categoria: "ALTA",
        observacao: "Teste de observação",
        fotos: ["foto1.jpg", "foto2.jpg"],
      },
      {
        id: 2,
        areaVistoriaInterna_id: 101,
        dataHora: "2024-11-17T12:00:00Z",
        contemAnomalia: false,
      },
    ];

    const state = inspectionReducer(
      initialState,
      fetchVistoriasSuccess(vistorias)
    );
    expect(state.vistorias).toEqual(vistorias);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.lastSync).not.toBeNull();
  });

  it("should handle fetchVistoriasFailure", () => {
    const error = "Erro ao buscar vistorias";
    const state = inspectionReducer(initialState, fetchVistoriasFailure(error));
    expect(state).toEqual({
      ...initialState,
      isLoading: false,
      error,
    });
  });
});
