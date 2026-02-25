"use client";

import { api } from "@/lib/api";
import { AuthResponse, AuthUser } from "@/lib/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "ecommerce_auth";

function readStoredAuth(): AuthResponse | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

function persistAuth(auth: AuthResponse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredAuth();
    if (!stored) {
      setLoading(false);
      return;
    }

    setUser(stored.user);
    setToken(stored.accessToken);
    api
      .me(stored.accessToken)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const auth = await api.login(email, password);
    persistAuth(auth);
    setUser(auth.user);
    setToken(auth.accessToken);
  };

  const register = async (payload: RegisterPayload) => {
    const auth = await api.register(payload);
    persistAuth(auth);
    setUser(auth.user);
    setToken(auth.accessToken);
  };

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const current = readStoredAuth();
    const nextUser = await api.me(token);
    setUser(nextUser);
    if (current) {
      persistAuth({
        ...current,
        user: nextUser,
        accessToken: token
      });
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAdmin: user?.roles?.includes("ROLE_ADMIN") ?? false,
      login,
      register,
      refreshUser,
      setUser,
      logout
    }),
    [user, token, loading, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
