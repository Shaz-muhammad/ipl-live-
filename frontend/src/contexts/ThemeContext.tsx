import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface TeamTheme {
  teamId: string | null;
  primaryColor: string;
  secondaryColor: string;
}

interface ThemeContextValue {
  theme: TeamTheme;
  setTeamTheme: (teamId: string, primary: string, secondary: string) => void;
  resetTheme: () => void;
}

const DEFAULT_THEME: TeamTheme = {
  teamId: null,
  primaryColor: "160 100% 50%",
  secondaryColor: "280 100% 65%",
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<TeamTheme>(() => {
    const saved = localStorage.getItem("ipl-team-theme");
    return saved ? (JSON.parse(saved) as TeamTheme) : DEFAULT_THEME;
  });

  useEffect(() => {
    localStorage.setItem("ipl-team-theme", JSON.stringify(theme));
    document.documentElement.style.setProperty("--primary", theme.primaryColor);
    document.documentElement.style.setProperty("--accent", theme.secondaryColor);
    document.documentElement.style.setProperty("--ring", theme.primaryColor);
    document.documentElement.style.setProperty("--sidebar-primary", theme.primaryColor);
  }, [theme]);

  const setTeamTheme = useCallback((teamId: string, primary: string, secondary: string) => {
    setTheme({ teamId, primaryColor: primary, secondaryColor: secondary });
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTeamTheme,
      resetTheme,
    }),
    [theme, setTeamTheme, resetTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}

