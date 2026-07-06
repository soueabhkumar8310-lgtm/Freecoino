"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type ThemeMode = "dark" | "light";

interface ThemeContextType {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}

const ThemeCtx = createContext<ThemeContextType>({
  mode: "dark",
  toggle: () => {},
  setMode: () => {},
});

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("freecoino-theme") as ThemeMode | null;
    if (saved === "light" || saved === "dark") {
      setModeState(saved);
    }
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("freecoino-theme", next);
      return next;
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem("freecoino-theme", m);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeCtx.Provider value={{ mode, toggle, setMode }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeCtx);
