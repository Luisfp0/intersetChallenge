import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppSelector } from "../hooks/useAppSelector";
import { useAppDispatch } from "../hooks/useAppDispatch";
import {
  loginFailure,
  loginStart,
  loginSuccess,
} from "../store/slice/authSlice";

const MOCK_CREDENTIALS = {
  email: "admin@admin.com",
  senha: "123456",
};

const MOCK_RESPONSE = {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock",
  user: {
    id: 1,
    name: "Admin",
    email: "admin@admin.com",
  },
};

type RootStackParamList = {
  SharedList: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SharedList"
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    try {
      dispatch(loginStart());

      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (
        email === MOCK_CREDENTIALS.email &&
        password === MOCK_CREDENTIALS.senha
      ) {
        dispatch(
          loginSuccess({
            user: MOCK_RESPONSE.user,
            token: MOCK_RESPONSE.token,
          })
        );
        navigation.navigate("SharedList");
      } else {
        dispatch(loginFailure("Credenciais inválidas"));
        Alert.alert("Erro", "Email ou senha inválidos");
      }
    } catch (error) {
      dispatch(loginFailure("Erro ao realizar login"));
      Alert.alert("Erro", "Ocorreu um erro ao realizar o login");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
          testID="email-input"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
          testID="password-input"
        />

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          testID="login-button"
          accessibilityRole="button"
          accessibilityState={{ disabled: isLoading }}
        >
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color="#fff"
              testID="loading-indicator"
            />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.helpText}>Use admin@admin.com / 123456</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#007AFF80",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  helpText: {
    marginTop: 15,
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  errorText: {
    color: "#dc3545",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
  },
});

export default LoginScreen;
