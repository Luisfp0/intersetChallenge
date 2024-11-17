import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import SharedListScreen from "../screens/SharedListScreen";
import { Alert } from "react-native";

jest.mock("axios");
jest.mock("@react-native-community/netinfo");
jest.spyOn(Alert, "alert");

const API_URL = "https://suporte.zapto.org:3001";

const mockClients = [
  {
    id: 1,
    nome: "John Doe",
    email: "john@example.com",
    telefone: "123456789",
  },
  {
    id: 2,
    nome: "Jane Smith",
    email: "jane@example.com",
    telefone: "987654321",
  },
];

const mockVistorias = [
  {
    id: 1,
    dataHora: "2024-03-17T10:00:00Z",
    contemAnomalia: true,
    anomalia: {
      id: 1,
      nome: "Anomalia Test",
    },
    categoria: {
      descricao: "Alta Prioridade",
      enum: "ALTA" as const,
      prioridade: 1,
    },
    observacao: "Observação teste",
    fotos: ["foto1.jpg", "foto2.jpg"],
  },
];

const mockNavigation: any = {
  navigate: jest.fn(),
};

jest.setTimeout(10000);

describe("SharedListScreen", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes("/cliente/all")) {
        return Promise.resolve({ data: mockClients });
      }
      if (url.includes("/vistoria/all")) {
        return Promise.resolve({ data: mockVistorias });
      }
    });
  });

  it("deve renderizar corretamente com a tab de clientes ativa", async () => {
    const { getByText, getByPlaceholderText, findByText } = render(
      <SharedListScreen navigation={mockNavigation} />
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(getByText("Clientes")).toBeTruthy();
    expect(getByText("Vistorias")).toBeTruthy();
    expect(getByPlaceholderText("Buscar clientes...")).toBeTruthy();

    const johnDoeText = await findByText("John Doe", {}, { timeout: 5000 });
    expect(johnDoeText).toBeTruthy();
    expect(getByText("john@example.com")).toBeTruthy();
    expect(getByText("123456789")).toBeTruthy();
  });

  it("deve alternar entre as tabs corretamente", async () => {
    const rendered = render(<SharedListScreen navigation={mockNavigation} />);
    const { getByText } = rendered;

    await act(async () => {
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(`${API_URL}/cliente/all`);
      });
    });

    await act(async () => {
      fireEvent.press(getByText("Vistorias"));
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(`${API_URL}/vistoria/all`);
      });
    });

    expect(getByText("Anomalia Test")).toBeTruthy();
    expect(getByText("Observação teste")).toBeTruthy();
  });

  it("deve filtrar clientes corretamente", async () => {
    const { getByPlaceholderText, findByText, queryByText } = render(
      <SharedListScreen navigation={mockNavigation} />
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    await findByText("John Doe", {}, { timeout: 5000 });

    const searchInput = getByPlaceholderText("Buscar clientes...");
    await act(async () => {
      fireEvent.changeText(searchInput, "Jane");
    });

    await waitFor(() => {
      expect(queryByText("John Doe")).toBeNull();
      expect(queryByText("Jane Smith")).toBeTruthy();
    });
  });

  it("deve mostrar mensagem quando offline", async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });

    const { findByText } = render(
      <SharedListScreen navigation={mockNavigation} />
    );

    const offlineText = await findByText(
      "Modo Offline - Dados podem estar desatualizados",
      {},
      { timeout: 5000 }
    );
    expect(offlineText).toBeTruthy();
  });

  it("deve mostrar mensagem quando não há dados", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: [] });

    const { findByText } = render(
      <SharedListScreen navigation={mockNavigation} />
    );

    const emptyText = await findByText(
      "Nenhum cliente cadastrado",
      {},
      { timeout: 5000 }
    );
    expect(emptyText).toBeTruthy();
  });

  it("deve navegar para nova vistoria ao pressionar FAB", async () => {
    const rendered = render(<SharedListScreen navigation={mockNavigation} />);
    const { getByText, getByTestId } = rendered;

    await act(async () => {
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(`${API_URL}/cliente/all`);
      });

      fireEvent.press(getByText("Vistorias"));

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(`${API_URL}/vistoria/all`);
      });
    });

    fireEvent.press(getByTestId("fab-button"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("NovaVistoria");
  });

  it("deve mostrar erro quando falha ao carregar dados", async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Erro de rede"));

    render(<SharedListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Erro",
        "Não foi possível carregar os clients"
      );
    });
  });

  it("deve filtrar vistorias por observação", async () => {
    const rendered = render(<SharedListScreen navigation={mockNavigation} />);
    const { getByText, getByPlaceholderText } = rendered;

    await act(async () => {
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(`${API_URL}/cliente/all`);
      });

      fireEvent.press(getByText("Vistorias"));

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(`${API_URL}/vistoria/all`);
      });
    });

    const searchInput = getByPlaceholderText("Buscar vistorias...");
    fireEvent.changeText(searchInput, "teste");

    expect(getByText("Observação teste")).toBeTruthy();
  });

  it("deve mostrar indicador de fotos corretamente", async () => {
    const rendered = render(<SharedListScreen navigation={mockNavigation} />);
    const { getByText } = rendered;

    await act(async () => {
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(`${API_URL}/cliente/all`);
      });

      fireEvent.press(getByText("Vistorias"));

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(`${API_URL}/vistoria/all`);
      });
    });

    expect(getByText("2 fotos")).toBeTruthy();
  });

  it("deve permitir pull-to-refresh", async () => {
    const { getByTestId, findByText } = render(
      <SharedListScreen navigation={mockNavigation} />
    );

    await findByText("John Doe", {}, { timeout: 5000 });

    const flatList = getByTestId("client-list");

    await act(async () => {
      fireEvent(flatList, "refresh");
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
      });
    });
  });
});
