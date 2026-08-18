"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface User {
  id: number;
  email: string;
  role: string;
  store_name?: string;
  store_description?: string;
  store_image_url?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  switchRole: (storeName: string, storeDesc?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        bodyData: { email, password }
      });
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      
      if (data.user.role === "seller") {
        router.push("/seller");
      } else {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: string) => {
    setLoading(true);
    try {
      await apiRequest("/auth/register", {
        method: "POST",
        bodyData: { email, password, role }
      });
      // Login otomatis setelah registrasi berhasil
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  const switchRole = async (storeName: string, storeDesc?: string) => {
    setLoading(true);
    try {
      const updatedUser = await apiRequest("/auth/role-switch", {
        method: "POST",
        bodyData: { store_name: storeName, store_description: storeDesc }
      });
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      router.push("/seller");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}
