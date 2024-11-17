import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Alert } from "react-native";
import LoginScreen from "../screens/LoginScreen";
import authReducer from "../store/slice/authSlice";
import { NavigationContainer } from "@react-navigation/native";
import { ReactTestInstance } from "react-test-renderer";

// Mock do Alert.alert
jest.spyOn(Alert, "alert");

// Mock das credenciais esperadas
const MOCK_CREDENTIALS = {
  email: "admin@admin.com",
  senha: "123456",
};

// Mock do navigation
const mockNavigation: any = {
  navigate: jest.fn(),
};

// Criando store de teste
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });
};

// Wrapper para o componente
const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <NavigationContainer>{children}</NavigationContainer>
    </Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar corretamente", () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Senha")).toBeTruthy();
    expect(getByText("Entrar")).toBeTruthy();
    expect(getByText("Use admin@admin.com / 123456")).toBeTruthy();
  });

  it("deve mostrar alerta quando tentar fazer login com campos vazios", async () => {
    const { getByText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByText("Entrar"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Erro",
      "Por favor, preencha todos os campos"
    );
  });

  it("deve fazer login com sucesso usando credenciais corretas", async () => {
    const { getByPlaceholderText, getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Email"), MOCK_CREDENTIALS.email);
    fireEvent.changeText(getByPlaceholderText("Senha"), MOCK_CREDENTIALS.senha);

    fireEvent.press(getByTestId("login-button"));

    await waitFor(
      () => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith("SharedList");
      },
      { timeout: 2000 }
    );
  });

  it("deve mostrar erro com credenciais inválidas", async () => {
    const { getByPlaceholderText, getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Email"), "email@invalido.com");
    fireEvent.changeText(getByPlaceholderText("Senha"), "senhaerrada");

    fireEvent.press(getByTestId("login-button"));

    await waitFor(
      () => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Erro",
          "Email ou senha inválidos"
        );
      },
      { timeout: 2000 }
    );
  });

  it("deve mostrar e esconder loading durante o processo de login", async () => {
    const { getByPlaceholderText, getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    // Prepara o formulário
    fireEvent.changeText(getByPlaceholderText("Email"), MOCK_CREDENTIALS.email);
    fireEvent.changeText(getByPlaceholderText("Senha"), MOCK_CREDENTIALS.senha);

    // Inicia o login
    fireEvent.press(getByTestId("login-button"));

    // Verifica se os inputs estão desabilitados durante o loading
    const emailInput = getByPlaceholderText("Email");
    const senhaInput = getByPlaceholderText("Senha");
    expect(emailInput.props.editable).toBe(false);
    expect(senhaInput.props.editable).toBe(false);

    // Espera o login completar
    await waitFor(
      () => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith("SharedList");
      },
      { timeout: 2000 }
    );
  });

  it("deve atualizar o estado conforme o usuário digita", () => {
    const { getByPlaceholderText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText("Email");
    const senhaInput = getByPlaceholderText("Senha");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(senhaInput, "password123");

    expect(emailInput.props.value).toBe("test@example.com");
    expect(senhaInput.props.value).toBe("password123");
  });

  it("deve manter o botão desabilitado durante o loading", async () => {
    const { getByPlaceholderText, getByTestId } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    // Preenche os campos
    fireEvent.changeText(getByPlaceholderText("Email"), MOCK_CREDENTIALS.email);
    fireEvent.changeText(getByPlaceholderText("Senha"), MOCK_CREDENTIALS.senha);

    const loginButton = getByTestId("login-button");
    fireEvent.press(loginButton);

    // Verifica o estado inicial do botão através do accessibilityState
    expect(loginButton.props.accessibilityState.disabled).toBe(true);

    // Espera o login completar
    await waitFor(
      () => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith("SharedList");
      },
      { timeout: 2000 }
    );
  });
});
