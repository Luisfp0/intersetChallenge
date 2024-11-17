import clientsReducer, {
  fetchClientsStart,
  fetchClientsSuccess,
  fetchClientsFailure,
  updateLocalClients,
} from "../store/slice/clientsSlice";

describe("clientsSlice", () => {
  const initialState = {
    clients: [],
    isLoading: false,
    error: null,
    lastSync: null,
  };

  it("should return the initial state", () => {
    const result = clientsReducer(undefined, { type: "" });
    expect(result).toEqual(initialState);
  });

  it("should handle fetchClientsStart", () => {
    const state = clientsReducer(initialState, fetchClientsStart());
    expect(state).toEqual({
      ...initialState,
      isLoading: true,
    });
  });

  it("should handle fetchClientsSuccess", () => {
    const clients = [
      {
        id: 1,
        nome: "Cliente 1",
        email: "cliente1@example.com",
        telefone: "123456789",
      },
      {
        id: 2,
        nome: "Cliente 2",
        email: "cliente2@example.com",
        telefone: "987654321",
      },
    ];
    const state = clientsReducer(initialState, fetchClientsSuccess(clients));
    expect(state.clients).toEqual(clients);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.lastSync).not.toBeNull();
  });

  it("should handle fetchClientsFailure", () => {
    const error = "Failed to fetch clients";
    const state = clientsReducer(initialState, fetchClientsFailure(error));
    expect(state).toEqual({
      ...initialState,
      isLoading: false,
      error,
    });
  });

  it("should handle updateLocalClients", () => {
    const clients = [
      {
        id: 1,
        nome: "Cliente 1",
        email: "cliente1@example.com",
        telefone: "123456789",
      },
    ];
    const state = clientsReducer(initialState, updateLocalClients(clients));
    expect(state).toEqual({
      ...initialState,
      clients,
    });
  });
});
