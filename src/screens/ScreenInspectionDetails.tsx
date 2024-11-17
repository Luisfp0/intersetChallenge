import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { Camera, Clock, Edit2, Save, X } from "lucide-react-native";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import DropDownPicker from "react-native-dropdown-picker";
import {
  AnomaliaResponseDTO,
  VistoriaRequestDTO,
  VistoriaResponseDTO,
} from "../types/api";

const API_URL = "https://suporte.zapto.org:3001";

type RootStackParamList = {
  Vistorias: undefined;
  DetalhesVistoria: { vistoriaId: number };
};

type DetalhesVistoriaScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "DetalhesVistoria"
>;

type TipoVistoria = "ENDOGENA" | "EXOGENA" | "FUNCIONAL";
type CategoriaVistoria = "ALTA" | "MEDIA" | "BAIXA";

interface EditedVistoria {
  id: number;
  areaVistoriaInterna_id: number;
  dataHora: string;
  contemAnomalia: boolean;
  anomalia_id?: number;
  tipo: TipoVistoria;
  categoria: CategoriaVistoria;
  observacao: string;
  fotos: string[];
}

const ScreenInspectionDetails: React.FC<DetalhesVistoriaScreenProps> = ({
  navigation,
  route,
}) => {
  const { vistoriaId } = route.params;
  const [anomalias, setAnomalias] = useState<AnomaliaResponseDTO[]>([]);
  const [vistoria, setVistoria] = useState<VistoriaResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editedVistoria, setEditedVistoria] = useState<EditedVistoria>({
    id: 0,
    areaVistoriaInterna_id: 0,
    dataHora: "",
    contemAnomalia: false,
    tipo: "ENDOGENA",
    categoria: "BAIXA",
    observacao: "",
    fotos: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [openTipo, setOpenTipo] = useState(false);
  const [openCategoria, setOpenCategoria] = useState(false);
  const [openAnomalia, setOpenAnomalia] = useState(false);

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

  const fetchVistoriaDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<VistoriaResponseDTO[]>(
        `${API_URL}/vistoria/all`
      );

      const vistoriaData = response.data.find((v) => v.id === vistoriaId);

      if (!vistoriaData) {
        throw new Error("Vistoria não encontrada");
      }

      setVistoria(vistoriaData);
      setEditedVistoria({
        id: vistoriaData.id,
        areaVistoriaInterna_id: vistoriaData.areaVistoriaInterna_id,
        dataHora: vistoriaData.dataHora,
        contemAnomalia: vistoriaData.contemAnomalia,
        anomalia_id: vistoriaData.anomalia?.id,
        tipo: vistoriaData.tipo?.enum ?? "ENDOGENA",
        categoria: vistoriaData.categoria?.enum ?? "BAIXA",
        observacao: vistoriaData.observacao || "",
        fotos: vistoriaData.fotos || [],
      });
    } catch (error) {
      console.error("Erro ao buscar detalhes da vistoria:", error);
      Alert.alert("Erro", "Não foi possível carregar os detalhes da vistoria");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVistoriaDetails();
    fetchAnomalias();
  }, [vistoriaId]);

  const formatData = (data: string): string => {
    try {
      const parsedDate = parseISO(data);

      if (isNaN(parsedDate.getTime())) {
        return "Data não disponível";
      }

      return format(parsedDate, "dd/MM/yy HH:mm", {
        locale: ptBR,
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data não disponível";
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (!editedVistoria.tipo || !editedVistoria.categoria) {
        Alert.alert("Erro", "Tipo e categoria são obrigatórios");
        return;
      }

      const vistoriaToSave: VistoriaRequestDTO = {
        areaVistoriaInterna_id: editedVistoria.areaVistoriaInterna_id,
        dataHora: editedVistoria.dataHora,
        contemAnomalia: editedVistoria.contemAnomalia,
        anomalia_id: editedVistoria.anomalia_id || null,
        tipo: editedVistoria.tipo,
        categoria: editedVistoria.categoria,
        observacao: editedVistoria.observacao,
      };

      await axios.put(`${API_URL}/vistoria/${vistoriaId}`, vistoriaToSave);
      await fetchVistoriaDetails();
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao atualizar vistoria:", error);
      if (axios.isAxiosError(error) && error.response) {
        Alert.alert(
          "Erro",
          `Não foi possível atualizar a vistoria: ${
            error.response.data.message || "Erro desconhecido"
          }`
        );
      } else {
        Alert.alert("Erro", "Não foi possível atualizar a vistoria");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (vistoria) {
      setEditedVistoria({
        id: vistoria.id,
        areaVistoriaInterna_id: vistoria.areaVistoriaInterna_id,
        dataHora: vistoria.dataHora,
        contemAnomalia: vistoria.contemAnomalia,
        anomalia_id: vistoria.anomalia?.id,
        tipo: vistoria.tipo.enum,
        categoria: vistoria.categoria.enum,
        observacao: vistoria.observacao,
        fotos: vistoria.fotos,
      });
    }
  };

  if (isLoading || !vistoria) {
    return (
      <View style={styles.centered} testID="loading-indicator">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content} testID="inspection-details">
          <View style={styles.header}>
            <View style={styles.dataContainer}>
              <Clock size={20} color="#666" />
              <Text style={styles.dataText} testID="inspection-title">
                {formatData(vistoria.dataHora)}
              </Text>
            </View>

            <View style={styles.headerButtons}>
              {!isEditing ? (
                <>
                  <TouchableOpacity
                    testID="edit-button"
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Edit2 size={20} color="#007AFF" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    testID="save-button"
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Save size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID="cancel-button"
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <X size={20} color="#666" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {showSuccess && (
            <Text testID="success-message" style={styles.successMessage}>
              Vistoria atualizada com sucesso
            </Text>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo e Categoria</Text>
            <View style={[styles.row, { zIndex: 3000 }]}>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Tipo</Text>
                {isEditing ? (
                  <DropDownPicker
                    testID="tipo-picker"
                    open={openTipo}
                    value={editedVistoria.tipo}
                    items={tipoItems}
                    setOpen={setOpenTipo}
                    setValue={(callback) => {
                      const value = callback(editedVistoria.tipo);
                      if (value) {
                        setEditedVistoria({
                          ...editedVistoria,
                          tipo: value as TipoVistoria,
                        });
                      }
                    }}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownList}
                    placeholder="Selecione o tipo"
                    listMode="SCROLLVIEW"
                    zIndex={3000}
                  />
                ) : (
                  <Text testID="tipo-text" style={styles.valueText}>
                    {vistoria.tipo?.enum ?? "Sem descrição"}
                  </Text>
                )}
              </View>

              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Categoria</Text>
                {isEditing ? (
                  <DropDownPicker
                    testID="categoria-picker"
                    open={openCategoria}
                    value={editedVistoria.categoria}
                    items={categoriaItems}
                    setOpen={setOpenCategoria}
                    setValue={(callback) => {
                      const value = callback(editedVistoria.categoria);
                      if (value) {
                        setEditedVistoria({
                          ...editedVistoria,
                          categoria: value as CategoriaVistoria,
                        });
                      }
                    }}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownList}
                    placeholder="Selecione a categoria"
                    listMode="SCROLLVIEW"
                    zIndex={2000}
                  />
                ) : (
                  <Text testID="categoria-text" style={styles.valueText}>
                    {vistoria.categoria?.enum ?? "Sem categoria"}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {vistoria.contemAnomalia && (
            <View style={[styles.section, { zIndex: 1000 }]}>
              <Text style={styles.sectionTitle}>Anomalia</Text>
              {isEditing ? (
                <DropDownPicker
                  testID="anomalia-picker"
                  open={openAnomalia}
                  value={editedVistoria.anomalia_id || null}
                  items={anomalias.map((a) => ({
                    label: a.nome,
                    value: a.id,
                  }))}
                  setOpen={setOpenAnomalia}
                  setValue={(callback) => {
                    const value = callback(editedVistoria.anomalia_id || null);
                    if (value !== null) {
                      setEditedVistoria((prev) => ({
                        ...prev,
                        contemAnomalia: true,
                        anomalia_id: value,
                      }));
                    }
                  }}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownList}
                  placeholder="Selecione a anomalia"
                  listMode="SCROLLVIEW"
                  zIndex={1000}
                />
              ) : (
                <Text testID="anomalia-text" style={styles.valueText}>
                  {vistoria.anomalia?.nome || "Sem descrição da anomalia"}
                </Text>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observação</Text>
            {isEditing ? (
              <TextInput
                testID="input-field"
                style={[styles.input, styles.observacaoInput]}
                value={editedVistoria.observacao}
                onChangeText={(text) =>
                  setEditedVistoria({ ...editedVistoria, observacao: text })
                }
                placeholder="Adicione uma observação"
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text testID="observacao-text" style={styles.valueText}>
                {vistoria.observacao || "Sem observações"}
              </Text>
            )}
          </View>

          {vistoria.fotos && vistoria.fotos.length > 0 && (
            <View style={styles.section} testID="fotos-section">
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Fotos</Text>
                <Camera size={20} color="#666" />
                <Text style={styles.fotosCount}>
                  {vistoria.fotos.length} foto
                  {vistoria.fotos.length !== 1 && "s"}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.fotosContainer}
                testID="fotos-container"
              >
                {vistoria.fotos.map((foto, index) => (
                  <Image
                    key={index}
                    source={{ uri: foto }}
                    style={styles.fotoPreview}
                    testID={`foto-${index}`}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingRight: 8,
  },
  dataContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 8,
  },
  cancelButton: {
    padding: 8,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  dropdownLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderColor: "#dee2e6",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 45,
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderColor: "#dee2e6",
    borderWidth: 1,
    borderTopWidth: 0,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  observacaoInput: {
    height: 100,
    textAlignVertical: "top",
  },
  valueText: {
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  fotosCount: {
    fontSize: 14,
    color: "#666",
  },
  fotosContainer: {
    flexDirection: "row",
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  fotoPreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  dataText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  successMessage: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default ScreenInspectionDetails;
