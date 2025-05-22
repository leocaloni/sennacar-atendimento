import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

// Tipagem do payload JWT esperado
interface JwtPayload {
  sub: string;
  isAdmin?: boolean;
  is_admin?: boolean;
}

type User = {
  email: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Cria contexto com valores padrão
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: async () => {},
});

// Hook para acessar o contexto
export const useAuth = () => useContext(AuthContext);

// Provider que envolve o app
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Login: salva token, decodifica e guarda user
  const login = async (newToken: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(newToken);

      const usuario: User = {
        email: decoded.sub,
        isAdmin: !!decoded.isAdmin,
      };

      setUser(usuario);
      setToken(newToken);
      await SecureStore.setItemAsync("token", newToken);
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
    }
  };

  // Logout: limpa token do estado e do SecureStore
  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync("token");
  };

  // Restaura token ao abrir o app
  const restoreToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      if (storedToken) {
        await login(storedToken);
      }
    } catch (error) {
      console.error("Erro ao restaurar token:", error);
    }
  };

  useEffect(() => {
    restoreToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
