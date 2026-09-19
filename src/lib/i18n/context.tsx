"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE, createI18n, type I18n } from "@/lib/i18n";
import type { LanguageCode } from "@/lib/types";

interface I18nValue extends I18n {
  setLanguage: (language: LanguageCode) => void;
  /** True while the server re-renders after a language change. */
  switching: boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  initialLanguage,
  children,
}: {
  /** Read from the cookie on the server, so the first paint is already correct. */
  initialLanguage: LanguageCode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [language, setLanguageState] = useState<LanguageCode>(initialLanguage ?? DEFAULT_LANGUAGE);
  const [switching, startTransition] = useTransition();

  const setLanguage = useCallback(
    (next: LanguageCode) => {
      // Client text flips immediately…
      setLanguageState(next);
      document.documentElement.lang = next;
      document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      // …and the server re-renders everything it owns with the new cookie.
      startTransition(() => router.refresh());
    },
    [router],
  );

  const value = useMemo<I18nValue>(
    () => ({ ...createI18n(language), setLanguage, switching }),
    [language, setLanguage, switching],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
