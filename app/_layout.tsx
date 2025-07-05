import { Stack } from "expo-router";
import { LanguageProvider } from "../localization/LanguageProvider";
import { ThemeProvider } from "../context/ThemeContext"; 

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export const screenOptions = {
  headerShown: false,
};
