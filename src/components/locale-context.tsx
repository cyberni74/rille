import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  localeFromNavigator,
  readStoredLocale,
  storeLocale,
  type Locale,
} from "@/lib/locale";
import { uiCopy } from "@/lib/ui-copy";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: ReturnType<typeof uiCopy>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initial = DEFAULT_LOCALE,
  children,
}: {
  initial?: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  useEffect(() => {
    const stored = readStoredLocale();
    const next = stored ?? localeFromNavigator();
    setLocaleState(next);
    if (!stored) storeLocale(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    return {
      locale,
      setLocale: (next) => {
        storeLocale(next);
        setLocaleState(next);
      },
      t: uiCopy(locale),
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: uiCopy(DEFAULT_LOCALE),
    };
  }
  return ctx;
}
