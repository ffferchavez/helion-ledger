"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/lib/i18n/constants";
import { getDictionary, translate, type Dictionary } from "@/lib/i18n/dictionaries";
import { DEFAULT_THEME, THEME_COOKIE, type Theme } from "@/lib/theme";

type I18nContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: (path: string, values?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type AppProvidersProps = {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialTheme?: Theme;
};

export function AppProviders({
  children,
  initialLocale = DEFAULT_LOCALE,
  initialTheme = DEFAULT_THEME,
}: AppProvidersProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const didMountRef = useRef(false);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    if (didMountRef.current) {
      router.refresh();
    } else {
      didMountRef.current = true;
    }
  }, [locale, router]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme]);

  const dictionary = useMemo(() => getDictionary(locale), [locale]);
  const t = useMemo(
    () => (path: string, values?: Record<string, string | number>) =>
      translate(dictionary, path, values),
    [dictionary]
  );

  const setLocale = (nextLocale: Locale) => setLocaleState(nextLocale);
  const setTheme = (nextTheme: Theme) => setThemeState(nextTheme);
  const toggleTheme = () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <I18nContext.Provider value={{ locale, dictionary, t, setLocale }}>
        {children}
      </I18nContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within AppProviders");
  }
  return context;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within AppProviders");
  }
  return context;
}
