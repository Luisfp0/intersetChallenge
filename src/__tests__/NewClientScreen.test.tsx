import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import axios from "axios";
import { Alert } from "react-native";
import NewClientScreen from "../screens/NewClientScreen";

jest.mock("axios");

interface RootState {
  clients: {
    loading: boolean;
    error: string | null;
    data: any[];
  };
}

const middlewares = [thunk];
const mockStore = configureMockStore<RootState>(middlewares);

const createMockNavigation = () => ({
  goBack: jest.fn(),
  navigate: jest.fn(),
});

describe("NewClientScreen", () => {
  let store = mockStore({
    clients: { loading: false, error: null, data: [] },
  });

  const mockNavigation = createMockNavigation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactNode) => {
    return render(<Provider store={store}>{component}</Provider>);
  };

  it("deve exibir mensagens de erro quando os campos obrigatórios estão vazios", () => {
    const { getByText } = renderWithProvider(
      <NewClientScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByText("Salvar Cliente"));

    expect(getByText("Nome é obrigatório")).toBeTruthy();
    expect(getByText("Email é obrigatório")).toBeTruthy();
    expect(getByText("Telefone é obrigatório")).toBeTruthy();
  });

  it("deve validar o email e exibir uma mensagem de erro se for inválido", () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(
      <NewClientScreen navigation={mockNavigation as any} />
    );

    fireEvent.changeText(
      getByPlaceholderText("Digite o email do cliente"),
      "email-invalido"
    );
    fireEvent.press(getByText("Salvar Cliente"));

    expect(getByText("Email inválido")).toBeTruthy();
  });

  it("deve salvar o cliente corretamente quando o formulário está válido", async () => {
    const mockResponse = { data: {} };
    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    const alertMock = jest
      .spyOn(Alert, "alert")
      .mockImplementation((title, message, buttons) => {
        if (buttons && buttons[0].onPress) {
          buttons[0].onPress();
        }
      });

    const { getByText, getByPlaceholderText } = renderWithProvider(
      <NewClientScreen navigation={mockNavigation as any} />
    );

    fireEvent.changeText(
      getByPlaceholderText("Digite o nome do cliente"),
      "Cliente Teste"
    );
    fireEvent.changeText(
      getByPlaceholderText("Digite o email do cliente"),
      "cliente@teste.com"
    );
    fireEvent.changeText(
      getByPlaceholderText("(00) 00000-0000"),
      "(62) 91234-5678"
    );

    fireEvent.press(getByText("Salvar Cliente"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        "https://suporte.zapto.org:3001/cliente",
        {
          nome: "Cliente Teste",
          email: "cliente@teste.com",
          telefone: "62912345678",
        }
      );
    });

    await waitFor(() => {
      expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
    });

    alertMock.mockRestore();
  });

  it("deve exibir erro caso a requisição falhe", async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error("Erro ao cadastrar"));

    jest.spyOn(Alert, "alert");

    const { getByText, getByPlaceholderText } = renderWithProvider(
      <NewClientScreen navigation={mockNavigation as any} />
    );

    fireEvent.changeText(
      getByPlaceholderText("Digite o nome do cliente"),
      "Cliente Teste"
    );
    fireEvent.changeText(
      getByPlaceholderText("Digite o email do cliente"),
      "cliente@teste.com"
    );
    fireEvent.changeText(
      getByPlaceholderText("(00) 00000-0000"),
      "(62) 91234-5678"
    );

    fireEvent.press(getByText("Salvar Cliente"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Erro",
        "Não foi possível cadastrar o cliente. Tente novamente."
      );
    });
  });
});
