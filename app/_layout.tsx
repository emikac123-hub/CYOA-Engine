import { Stack } from "expo-router";
import { LanguageProvider } from "../localization/LanguageProvider";
import { ThemeProvider } from "../context/ThemeContext"; // ✅ import the correct one
import ThemedHeader from "components/ThemeHeader";
import { useState } from "react";
import SettingsModal from "components/SettingsMenu";

export default function RootLayout() {
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ThemedHeader onSettingsPress={() => setSettingsVisible(true)} />
          <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
        <Stack screenOptions={{ headerShown: false }} />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export const screenOptions = {
  headerShown: false,
};
