"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AuraTheme = "dark" | "light";

type ThemeContextValue = {
  theme: AuraTheme;
  setTheme: (theme: AuraTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: AuraTheme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AuraTheme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("aura-theme");
    const next: AuraTheme = stored === "light" ? "light" : "dark";
    setThemeState(next);
    applyTheme(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme(next) {
        setThemeState(next);
        window.localStorage.setItem("aura-theme", next);
        applyTheme(next);
      },
      toggleTheme() {
        const next = theme === "dark" ? "light" : "dark";
        setThemeState(next);
        window.localStorage.setItem("aura-theme", next);
        applyTheme(next);
      },
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
