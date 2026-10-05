"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Language } from "@/lib/schemas/common";
import { translations, type LocaleTranslations } from "@/lib/i18n/translations";

type LocaleContextValue = { locale: Language; setLocale: (locale: Language) => void; toggleLocale: () => void; t: LocaleTranslations };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Language>("ar");
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = locale === "en" ? "ltr" : "rtl"; }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, toggleLocale: () => setLocale((current) => current === "ar" ? "en" : "ar"), t: translations[locale] }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}
