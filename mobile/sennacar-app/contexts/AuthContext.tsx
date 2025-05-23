import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { router } from "expo-router";

interface JwtPayload {
  sub: string;
  isAdmin?: boolean;
  email?: string;
  nome?: string;
}

type User = {
  id: string;
  email: string;
  nome: string;
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
      console.log("Decoded JWT:", decoded);

      const usuario: User = {
        id: decoded.sub,
        email: decoded.email || "",
        nome: decoded.nome || "",
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
    await SecureStore.deleteItemAsync("token");
    setUser(null);
    router.replace("/login"); // 👈 força a ida pra tela de login
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
