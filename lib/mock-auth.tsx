"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockUser } from "./mock-data";

interface MockAuthContextType {
  user: typeof mockUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateBalance: (amount: number) => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

const STORAGE_KEY = "freecoino_mock_user";

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<typeof mockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const loggedInUser = { ...mockUser, email };
    setUser(loggedInUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
  };

  const signup = async (email: string, _password: string, name: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const newUser = { ...mockUser, email, display_name: name };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateBalance = (amount: number) => {
    if (user) {
      const updated = { ...user, coins_balance: user.coins_balance + amount };
      setUser(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <MockAuthContext.Provider value={{ user, isLoading, login, signup, logout, updateBalance }}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error("useMockAuth must be used within MockAuthProvider");
  return ctx;
}