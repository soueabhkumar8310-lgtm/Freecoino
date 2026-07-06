"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Lang, t as translate } from "@/lib/i18n/translations";

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nCtx = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("freecoino-lang") as Lang | null;
    if (saved === "en" || saved === "hi") {
      setLangState(saved);
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("freecoino-lang", l);
  }, []);

  const tFn = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(key, lang, vars),
    [lang]
  );

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nCtx.Provider value={{ lang, setLang, t: tFn }}>
      {children}
    </I18nCtx.Provider>
  );
}

export const useI18n = () => useContext(I18nCtx);
