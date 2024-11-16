import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
} from "react-native";
import {
  Search,
  User,
  Mail,
  Phone,
  Plus,
  ClipboardList,
  AlertCircle,
  Camera,
} from "lucide-react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import NetInfo from "@react-native-community/netinfo";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import axios from "axios";

const API_URL = "https://suporte.zapto.org:3001";

interface Categoria {
  descricao: string;
  enum: "ALTA" | "MEDIA" | "BAIXA";
  prioridade: number;
}

interface Client {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

interface Vistoria {
  id: number;
  dataHora: string;
  contemAnomalia: boolean;
  anomalia?: {
    id: number;
    nome: string;
  };
  categoria?: Categoria;
  observacao?: string;
  fotos?: string[];
}

type RootStackParamList = {
  NovoCliente: undefined;
  NovaVistoria: undefined;
  DetalhesVistoria: { vistoriaId: number };
};

type SharedListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const SharedListScreen: React.FC<SharedListScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<"clients" | "vistorias">(
    "clients"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [filteredVistorias, setFilteredVistorias] = useState<Vistoria[]>([]);

  useEffect(() => {
    checkConnectivity();
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    filterData();
  }, [searchQuery]);

  const checkConnectivity = async () => {
    const networkStatus = await NetInfo.fetch();
    setIsOffline(!networkStatus.isConnected);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "clients") {
        const response = await axios.get(`${API_URL}/cliente/all`);
        setClients(response.data);
        setFilteredClients(response.data);
      } else {
        const response = await axios.get(`${API_URL}/vistoria/all`);
        setVistorias(response.data);
        setFilteredVistorias(response.data);
      }
    } catch (error) {
      console.error(`Erro ao buscar ${activeTab}:`, error);
      Alert.alert("Erro", `Não foi possível carregar os ${activeTab}`);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const filterData = () => {
    const query = searchQuery.toLowerCase();

    if (activeTab === "clients") {
      setFilteredClients(
        clients.filter(
          (client) =>
            client.nome.toLowerCase().includes(query) ||
            (client.email && client.email.toLowerCase().includes(query)) ||
            (client.telefone && client.telefone.toLowerCase().includes(query))
        )
      );
    } else {
      setFilteredVistorias(
        vistorias.filter(
          (vistoria) =>
            (vistoria.observacao &&
              vistoria.observacao.toLowerCase().includes(query)) ||
            (vistoria.anomalia?.nome &&
              vistoria.anomalia.nome.toLowerCase().includes(query)) ||
            (vistoria.categoria?.descricao &&
              vistoria.categoria.descricao.toLowerCase().includes(query))
        )
      );
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <View style={styles.nameContainer}>
          <User size={20} color="#666" style={styles.icon} />
          <Text style={styles.name}>{item.nome}</Text>
        </View>

        {item.email && (
          <View style={styles.detailContainer}>
            <Mail size={16} color="#666" style={styles.icon} />
            <Text style={styles.detail}>{item.email}</Text>
          </View>
        )}

        {item.telefone && (
          <View style={styles.detailContainer}>
            <Phone size={16} color="#666" style={styles.icon} />
            <Text style={styles.detail}>{item.telefone}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderVistoriaItem = ({ item }: { item: Vistoria }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("DetalhesVistoria", { vistoriaId: item.id })
      }
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.vistoriaHeader}>
          <Text style={styles.date}>
            {format(new Date(item.dataHora), "dd 'de' MMMM', às' HH:mm", {
              locale: ptBR,
            })}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.categoria?.enum) },
            ]}
          >
            <Text style={styles.statusText}>
              {item.categoria?.descricao || "Sem Categoria"}
            </Text>
          </View>
        </View>

        {item.contemAnomalia && item.anomalia?.nome && (
          <View style={styles.anomaliaContainer}>
            <AlertCircle size={16} color="#dc3545" />
            <Text style={styles.anomaliaText}>{item.anomalia.nome}</Text>
          </View>
        )}

        {item.observacao && (
          <Text style={styles.observacao} numberOfLines={2}>
            {item.observacao}
          </Text>
        )}

        {Array.isArray(item.fotos) && item.fotos.length > 0 && (
          <View style={styles.fotosContainer}>
            <Camera size={16} color="#666" />
            <Text style={styles.fotosText}>
              {`${item.fotos.length} foto${item.fotos.length !== 1 ? "s" : ""}`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (categoria?: "ALTA" | "MEDIA" | "BAIXA"): string => {
    switch (categoria) {
      case "ALTA":
        return "#dc3545";
      case "MEDIA":
        return "#ffc107";
      case "BAIXA":
        return "#198754";
      default:
        return "#6c757d";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Buscar ${
                activeTab === "clients" ? "clientes" : "vistorias"
              }...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "clients" && styles.activeTab]}
            onPress={() => setActiveTab("clients")}
          >
            <User
              size={20}
              color={activeTab === "clients" ? "#007AFF" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "clients" && styles.activeTabText,
              ]}
            >
              Clientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "vistorias" && styles.activeTab]}
            onPress={() => setActiveTab("vistorias")}
          >
            <ClipboardList
              size={20}
              color={activeTab === "vistorias" ? "#007AFF" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "vistorias" && styles.activeTabText,
              ]}
            >
              Vistorias
            </Text>
          </TouchableOpacity>
        </View>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              Modo Offline - Dados podem estar desatualizados
            </Text>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : activeTab === "clients" ? (
          <FlatList
            data={filteredClients}
            renderItem={renderClientItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "Nenhum cliente encontrado"
                    : "Nenhum cliente cadastrado"}
                </Text>
              </View>
            )}
          />
        ) : (
          <FlatList
            data={filteredVistorias}
            renderItem={renderVistoriaItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "Nenhuma vistoria encontrada"
                    : "Nenhuma vistoria cadastrada"}
                </Text>
              </View>
            )}
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            navigation.navigate(
              activeTab === "clients" ? "NovoCliente" : "NovaVistoria"
            )
          }
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1 },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#007AFF" },
  tabText: { fontSize: 14, fontWeight: "500", color: "#666" },
  activeTabText: { color: "#007AFF" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: { flex: 1 },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  name: { fontSize: 18, fontWeight: "600", color: "#333", flex: 1 },
  detailContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  detail: { fontSize: 14, color: "#666", flex: 1 },
  icon: { marginRight: 8 },
  vistoriaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  date: { fontSize: 14, color: "#666" },
  anomaliaContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  anomaliaText: { fontSize: 14, color: "#dc3545", fontWeight: "500" },
  observacao: { fontSize: 14, color: "#666", marginBottom: 8 },
  fotosContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  fotosText: { fontSize: 12, color: "#666" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 16, color: "#666" },
  offlineBanner: {
    backgroundColor: "#FFF3CD",
    padding: 8,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#FFE69C",
  },
  offlineText: { color: "#856404", fontSize: 14 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  listContainer: {
    padding: 16,
  },
});

export default SharedListScreen;
