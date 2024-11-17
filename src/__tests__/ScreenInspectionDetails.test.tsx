import {
  render,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react-native";
import { Provider } from "react-redux";
import { store } from "../store";
import ScreenInspectionDetails from "../screens/ScreenInspectionDetails";
import { NavigationContainer } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import axios from "axios";

// Mock do axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Tipos da navegação
type RootStackParamList = {
  Vistorias: undefined;
  DetalhesVistoria: { vistoriaId: number };
};

// Mock data
const mockVistoria = {
  id: 123,
  dataHora: "2024-03-17T10:00:00",
  tipo: { enum: "ENDOGENA" },
  categoria: { enum: "BAIXA" },
  contemAnomalia: false,
  observacao: "Teste",
  areaVistoriaInterna_id: 1,
  fotos: [],
};

// Mock da navegação
const mockNavigation: Partial<
  NativeStackNavigationProp<RootStackParamList, "DetalhesVistoria">
> = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

const mockRoute: Partial<RouteProp<RootStackParamList, "DetalhesVistoria">> = {
  params: {
    vistoriaId: 123,
  },
};

describe("ScreenInspectionDetails", () => {
  beforeEach(() => {
    // Reset dos mocks
    mockedAxios.get.mockClear();
    mockedAxios.put.mockClear();

    // Mock das chamadas à API
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/vistoria/all")) {
        return Promise.resolve({ data: [mockVistoria] });
      }
      if (url.includes("/anomalia/all")) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    mockedAxios.put.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <NavigationContainer>
          <ScreenInspectionDetails
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        </NavigationContainer>
      </Provider>
    );
  };

  it("deve mostrar loading indicator inicialmente", async () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("loading-indicator")).toBeTruthy();
  });

  it("deve carregar os detalhes da vistoria corretamente", async () => {
    const { getByTestId, getByText } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("inspection-details")).toBeTruthy();
    });

    expect(getByTestId("inspection-title")).toBeTruthy();
    expect(getByTestId("tipo-text")).toHaveTextContent("ENDOGENA");
    expect(getByTestId("categoria-text")).toHaveTextContent("BAIXA");
    expect(getByTestId("observacao-text")).toHaveTextContent("Teste");
  });

  it("deve entrar no modo de edição ao clicar no botão de editar", async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("inspection-details")).toBeTruthy();
    });

    const editButton = getByTestId("edit-button");
    fireEvent.press(editButton);

    await waitFor(() => {
      expect(getByTestId("input-field")).toBeTruthy();
      expect(getByTestId("save-button")).toBeTruthy();
      expect(getByTestId("cancel-button")).toBeTruthy();
    });
  });

  it("deve salvar alterações com sucesso", async () => {
    const { getByTestId } = renderComponent();

    // Aguarda carregamento inicial
    await waitFor(() => {
      expect(getByTestId("inspection-details")).toBeTruthy();
    });

    // Entra no modo de edição
    const editButton = getByTestId("edit-button");
    fireEvent.press(editButton);

    // Altera a observação
    const inputField = getByTestId("input-field");
    fireEvent.changeText(inputField, "Nova observação");

    // Salva as alterações
    const saveButton = getByTestId("save-button");
    fireEvent.press(saveButton);

    // Verifica se a API foi chamada corretamente
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining("/vistoria/123"),
        expect.objectContaining({
          observacao: "Nova observação",
        })
      );
    });

    // Verifica se a mensagem de sucesso aparece
    await waitFor(() => {
      expect(getByTestId("success-message")).toBeTruthy();
    });
  });

  it("deve cancelar a edição e restaurar valores originais", async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("inspection-details")).toBeTruthy();
    });

    // Entra no modo de edição
    const editButton = getByTestId("edit-button");
    fireEvent.press(editButton);

    // Altera a observação
    const inputField = getByTestId("input-field");
    fireEvent.changeText(inputField, "Nova observação");

    // Cancela a edição
    const cancelButton = getByTestId("cancel-button");
    fireEvent.press(cancelButton);

    // Verifica se voltou ao valor original
    await waitFor(() => {
      expect(getByTestId("observacao-text")).toHaveTextContent("Teste");
    });
  });

  it("deve lidar com erro na API ao salvar", async () => {
    // Mock do erro da API
    mockedAxios.put.mockRejectedValueOnce(new Error("Erro ao salvar"));

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("inspection-details")).toBeTruthy();
    });

    // Entra no modo de edição
    const editButton = getByTestId("edit-button");
    fireEvent.press(editButton);

    // Tenta salvar
    const saveButton = getByTestId("save-button");
    fireEvent.press(saveButton);

    // Verifica se continua no modo de edição
    await waitFor(() => {
      expect(getByTestId("input-field")).toBeTruthy();
    });
  });
});
