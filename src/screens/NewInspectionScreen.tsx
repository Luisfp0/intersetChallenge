import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { Camera, Save, Upload, X, Check } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import DropDownPicker from "react-native-dropdown-picker";
import NetInfo from "@react-native-community/netinfo";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const API_URL = "https://suporte.zapto.org:3001";

type RootStackParamList = {
  NovaVistoria: undefined;
  Vistorias: undefined;
};

type NovaVistoriaScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "NovaVistoria"
>;

interface NovaVistoriaScreenProps {
  navigation: NovaVistoriaScreenNavigationProp;
  onSaveInspection?: (data: { description: string }) => void;
}

interface AnomaliaResponseDTO {
  id: number;
  nome: string;
}

interface VistoriaForm {
  tipo: "ENDOGENA" | "EXOGENA" | "FUNCIONAL" | "";
  categoria: "ALTA" | "MEDIA" | "BAIXA" | "";
  contemAnomalia: boolean;
  anomalia_id: number | null;
  observacao: string;
}

interface FormErrors {
  tipo?: string;
  categoria?: string;
  anomaliaNome?: string;
  observacao?: string;
}

const NewInspectionScreen: React.FC<NovaVistoriaScreenProps> = ({
  navigation,
  onSaveInspection,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<VistoriaForm>({
    tipo: "",
    categoria: "",
    contemAnomalia: false,
    anomalia_id: null,
    observacao: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [fotos, setFotos] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [openTipo, setOpenTipo] = useState(false);
  const [openCategoria, setOpenCategoria] = useState(false);
  const [openAnomalia, setOpenAnomalia] = useState(false);
  const [anomalias, setAnomalias] = useState<AnomaliaResponseDTO[]>([]);

  const tipoItems = [
    { label: "Endógena", value: "ENDOGENA" },
    { label: "Exógena", value: "EXOGENA" },
    { label: "Funcional", value: "FUNCIONAL" },
  ];

  const categoriaItems = [
    { label: "Alta", value: "ALTA" },
    { label: "Média", value: "MEDIA" },
    { label: "Baixa", value: "BAIXA" },
  ];

  useEffect(() => {
    checkConnectivity();
    requestPermissions();
    fetchAnomalias();
  }, []);

  const fetchAnomalias = async () => {
    try {
      const response = await axios.get<AnomaliaResponseDTO[]>(
        `${API_URL}/anomalia/all`
      );
      setAnomalias(response.data);
    } catch (error) {
      console.error("Erro ao buscar anomalias:", error);
    }
  };

  const checkConnectivity = async () => {
    const networkState = await NetInfo.fetch();
    setIsOffline(!networkState.isConnected);
  };

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para acessar suas fotos."
        );
      }

      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para usar a câmera."
        );
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.tipo) {
      newErrors.tipo = "Tipo é obrigatório";
    }

    if (!form.categoria) {
      newErrors.categoria = "Categoria é obrigatória";
    }

    if (form.contemAnomalia && !form.anomalia_id) {
      newErrors.anomaliaNome = "Selecione uma anomalia";
    }

    if (!form.observacao.trim()) {
      newErrors.observacao = "Observação é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async (useCamera: boolean = false) => {
    try {
      const result = await (useCamera
        ? ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsMultipleSelection: true,
            allowsEditing: true,
          }));

      if (!result.canceled) {
        const newFotos = result.assets.map((asset) => asset.uri);
        setFotos((prevFotos) => [...prevFotos, ...newFotos]);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem");
    }
  };

  const removePhoto = (index: number) => {
    setFotos((prevFotos) => prevFotos.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert("Erro", "Por favor, corrija os erros no formulário");
      return;
    }

    if (isOffline) {
      Alert.alert(
        "Modo Offline",
        "Os dados serão salvos localmente e sincronizados quando houver conexão"
      );
      return;
    }

    try {
      setLoading(true);

      const vistoriaResponse = await axios.post(`${API_URL}/vistoria`, {
        areaVistoriaInterna_id: 1,
        dataHora: new Date().toISOString(),
        contemAnomalia: form.contemAnomalia,
        anomalia_id: form.contemAnomalia ? form.anomalia_id : null,
        tipo: form.tipo,
        categoria: form.categoria,
        observacao: form.observacao,
      });

      const vistoriaId = vistoriaResponse.data.id;

      if (fotos.length > 0) {
        const formData = new FormData();

        fotos.forEach((foto, index) => {
          const filename = foto.split("/").pop() || `foto${index}.jpg`;
          formData.append("file", {
            uri: foto,
            type: "image/jpeg",
            name: filename,
          } as any);
        });

        try {
          const uploadResponse = await axios.post(
            `${API_URL}/vistoria/upload?id=${vistoriaId}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Accept: "application/json",
              },
              transformRequest: [
                function (data) {
                  return data;
                },
              ],
            }
          );
        } catch (uploadError) {
          console.error("Erro no upload:", uploadError);
          if (axios.isAxiosError(uploadError)) {
            console.log(
              "Detalhes do erro de upload:",
              uploadError.response?.data
            );
          }

          Alert.alert(
            "Aviso",
            "Vistoria foi salva, mas houve um problema ao enviar as fotos.",
            [
              {
                text: "OK",
                onPress: () => navigation.goBack(),
              },
            ]
          );
          return;
        }
      }

      Alert.alert("Sucesso", "Vistoria cadastrada com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Erro ao cadastrar vistoria:", error);
      if (axios.isAxiosError(error)) {
        Alert.alert(
          "Erro",
          `Não foi possível cadastrar a vistoria: ${
            error.response?.data?.message || "Erro desconhecido"
          }`
        );
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível cadastrar a vistoria. Tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container} testID="new-inspection-screen">
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === "ios"}
      >
        {isOffline && (
          <View style={styles.offlineBanner} testID="offline-banner">
            <Text style={styles.offlineText}>
              Modo Offline - Os dados serão salvos localmente
            </Text>
          </View>
        )}

        <View style={styles.form}>
          {/* Tipo */}
          <View style={[styles.inputContainer, { zIndex: 3000 }]}>
            <Text style={styles.label}>Tipo</Text>
            <DropDownPicker
              testID="tipo-picker"
              open={openTipo}
              value={form.tipo}
              items={tipoItems}
              setOpen={setOpenTipo}
              setValue={(value) => {
                setForm((prev) => ({ ...prev, tipo: value(prev.tipo) }));
                if (errors.tipo)
                  setErrors((prev) => ({ ...prev, tipo: undefined }));
              }}
              style={[styles.dropdown, errors.tipo && styles.inputError]}
              dropDownContainerStyle={styles.dropdownContainer}
              placeholder="Selecione o tipo"
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
            {errors.tipo && (
              <Text style={styles.errorText} testID="tipo-error">
                {errors.tipo}
              </Text>
            )}
          </View>

          {/* Categoria */}
          <View style={[styles.inputContainer, { zIndex: 2000 }]}>
            <Text style={styles.label}>Categoria</Text>
            <DropDownPicker
              testID="categoria-picker"
              open={openCategoria}
              value={form.categoria}
              items={categoriaItems}
              setOpen={setOpenCategoria}
              setValue={(value) => {
                setForm((prev) => ({
                  ...prev,
                  categoria: value(prev.categoria),
                }));
                if (errors.categoria)
                  setErrors((prev) => ({ ...prev, categoria: undefined }));
              }}
              style={[styles.dropdown, errors.categoria && styles.inputError]}
              dropDownContainerStyle={styles.dropdownContainer}
              placeholder="Selecione a categoria"
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
            {errors.categoria && (
              <Text style={styles.errorText} testID="categoria-error">
                {errors.categoria}
              </Text>
            )}
          </View>

          {/* Checkbox Anomalia */}
          <TouchableOpacity
            testID="anomalia-checkbox"
            style={styles.checkboxContainer}
            onPress={() =>
              setForm((prev) => ({
                ...prev,
                contemAnomalia: !prev.contemAnomalia,
                anomalia_id: !prev.contemAnomalia ? null : prev.anomalia_id,
              }))
            }
          >
            <View
              style={[
                styles.checkbox,
                form.contemAnomalia && styles.checkboxChecked,
              ]}
            >
              {form.contemAnomalia && <Check size={18} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Contém Anomalia</Text>
          </TouchableOpacity>

          {/* Seletor de Anomalia */}
          {form.contemAnomalia && (
            <View style={[styles.inputContainer, { zIndex: 1000 }]}>
              <Text style={styles.label}>Anomalia</Text>
              <DropDownPicker
                testID="anomalia-picker"
                open={openAnomalia}
                value={form.anomalia_id || null}
                items={anomalias.map((a) => ({
                  label: a.nome,
                  value: a.id,
                }))}
                setOpen={setOpenAnomalia}
                setValue={(callback) => {
                  const value = callback(form.anomalia_id || null);
                  setForm((prev) => ({
                    ...prev,
                    anomalia_id: value as number | null,
                  }));
                  if (errors.anomaliaNome) {
                    setErrors((prev) => ({ ...prev, anomaliaNome: undefined }));
                  }
                }}
                style={[
                  styles.dropdown,
                  errors.anomaliaNome && styles.inputError,
                ]}
                dropDownContainerStyle={styles.dropdownContainer}
                placeholder="Selecione a anomalia"
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
              />
              {errors.anomaliaNome && (
                <Text style={styles.errorText} testID="anomalia-error">
                  {errors.anomaliaNome}
                </Text>
              )}
            </View>
          )}

          {/* Campo de Observação */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Observação</Text>
            <TextInput
              testID="observacao-input"
              style={[
                styles.input,
                styles.textArea,
                errors.observacao && styles.inputError,
              ]}
              value={form.observacao}
              onChangeText={(text) => {
                setForm((prev) => ({ ...prev, observacao: text }));
                if (errors.observacao)
                  setErrors((prev) => ({ ...prev, observacao: undefined }));
              }}
              placeholder="Digite suas observações"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.observacao && (
              <Text style={styles.errorText} testID="observacao-error">
                {errors.observacao}
              </Text>
            )}
          </View>

          {/* Seção de Fotos */}
          <View style={styles.photosSection} testID="fotos-section">
            <Text style={styles.label}>Fotos</Text>
            <View style={styles.photoButtons}>
              <TouchableOpacity
                testID="camera-button"
                style={styles.photoButton}
                onPress={() => pickImage(true)}
              >
                <Camera size={20} color="#fff" />
                <Text style={styles.photoButtonText}>Câmera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="galeria-button"
                style={styles.photoButton}
                onPress={() => pickImage(false)}
              >
                <Upload size={20} color="#fff" />
                <Text style={styles.photoButtonText}>Galeria</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              testID="fotos-list"
              horizontal
              style={styles.photosList}
              contentContainerStyle={styles.photosListContent}
              nestedScrollEnabled={true}
            >
              {fotos.map((foto, index) => (
                <View
                  key={index}
                  style={styles.photoContainer}
                  testID={`foto-${index}`}
                >
                  <Image source={{ uri: foto }} style={styles.photoThumbnail} />
                  <TouchableOpacity
                    testID={`remove-foto-${index}`}
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          testID="save-button"
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" testID="loading-indicator" />
          ) : (
            <>
              <Save size={20} color="#fff" style={styles.saveIcon} />
              <Text style={styles.saveButtonText}>Salvar Vistoria</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 50,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderTopWidth: 0,
    borderRadius: 8,
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },
  photosSection: {
    marginBottom: 16,
  },
  photoButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  photoButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  photosList: {
    maxHeight: 120,
  },
  photosListContent: {
    gap: 12,
  },
  photoContainer: {
    position: "relative",
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  removePhotoButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  offlineBanner: {
    backgroundColor: "#FFF3CD",
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineText: {
    color: "#856404",
    fontSize: 14,
    textAlign: "center",
  },
});

export default NewInspectionScreen;
