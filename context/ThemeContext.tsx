// context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ColorSchemeName } from "react-native";

type ThemeType = "light" | "dark";

type ThemeContextType = {
  theme: ThemeType;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEME_KEY = "app_theme";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>("light");

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await AsyncStorage.setItem(THEME_KEY, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
