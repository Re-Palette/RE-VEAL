"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translateKey, type UIKey } from "@/lib/i18n/dictionary";
import type { LanguageCode } from "@/lib/types";

interface I18nValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: UIKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = "reveal.language";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // Read after mount rather than during render: the server has no access to
  // localStorage and a mismatch would hydrate the wrong language.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "ja" || stored === "ko" || stored === "zh") {
        setLanguageState(stored);
      }
    } catch {
      /* storage unavailable — English stays */
    }
  }, []);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* non-fatal */
    }
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<I18nValue>(
    () => ({ language, setLanguage, t: (key: UIKey) => translateKey(key, language) }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
