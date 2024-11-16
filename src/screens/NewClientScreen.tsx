import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { User, Mail, Phone, Save } from "lucide-react-native";
import axios from "axios";

const API_URL = "https://suporte.zapto.org:3001";

type RootStackParamList = {
  NovoCliente: undefined;
  ClientList: undefined;
};

type NovoClienteScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "NovoCliente"
>;

interface NovoClienteScreenProps {
  navigation: NovoClienteScreenNavigationProp;
}

interface ClienteForm {
  nome: string;
  email: string;
  telefone: string;
}

const NewClientScreen: React.FC<NovoClienteScreenProps> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ClienteForm>({
    nome: "",
    email: "",
    telefone: "",
  });
  const [errors, setErrors] = useState<Partial<ClienteForm>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ClienteForm> = {};

    if (!form.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    if (!form.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    } else if (!/^\d{8,11}$/.test(form.telefone.replace(/\D/g, ""))) {
      newErrors.telefone = "Telefone inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = cleaned;

    if (cleaned.length >= 11) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(
        2,
        7
      )}-${cleaned.slice(7, 11)}`;
    } else if (cleaned.length >= 7) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(
        2,
        6
      )}-${cleaned.slice(6)}`;
    } else if (cleaned.length >= 2) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    }

    return formatted;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert("Erro", "Por favor, corrija os erros no formulário");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/cliente`, {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone.replace(/\D/g, ""),
      });

      Alert.alert("Sucesso", "Cliente cadastrado com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      Alert.alert(
        "Erro",
        "Não foi possível cadastrar o cliente. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <User size={20} color="#666" />
              <Text style={styles.label}>Nome</Text>
            </View>
            <TextInput
              style={[styles.input, errors.nome && styles.inputError]}
              placeholder="Digite o nome do cliente"
              value={form.nome}
              onChangeText={(text) => {
                setForm((prev) => ({ ...prev, nome: text }));
                if (errors.nome)
                  setErrors((prev) => ({ ...prev, nome: undefined }));
              }}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Mail size={20} color="#666" />
              <Text style={styles.label}>Email</Text>
            </View>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Digite o email do cliente"
              value={form.email}
              onChangeText={(text) => {
                setForm((prev) => ({ ...prev, email: text }));
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Phone size={20} color="#666" />
              <Text style={styles.label}>Telefone</Text>
            </View>
            <TextInput
              style={[styles.input, errors.telefone && styles.inputError]}
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChangeText={(text) => {
                const formatted = formatPhone(text);
                setForm((prev) => ({ ...prev, telefone: formatted }));
                if (errors.telefone)
                  setErrors((prev) => ({ ...prev, telefone: undefined }));
              }}
              keyboardType="numeric"
              returnKeyType="done"
              maxLength={15}
            />
            {errors.telefone && (
              <Text style={styles.errorText}>{errors.telefone}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Save size={20} color="#fff" style={styles.saveIcon} />
              <Text style={styles.saveButtonText}>Salvar Cliente</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 8,
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
  inputError: {
    borderColor: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
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
});

export default NewClientScreen;
