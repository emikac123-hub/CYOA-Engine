import { Stack } from "expo-router";
import { LanguageProvider } from "../localization/LanguageProvider";
import { ThemeProvider } from "../context/ThemeContext"; // ✅ import the correct one
import ThemedHeader from "components/ThemeHeader";
import { useState } from "react";
import SettingsModal from "components/SettingsMenu";
import { AccessibilityProvider } from "../accessibility/AccessibilityService";
export default function RootLayout() {
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <AccessibilityProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ThemedHeader onSettingsPress={() => setSettingsVisible(true)} />
          <SettingsModal
            visible={settingsVisible}
            onClose={() => setSettingsVisible(false)}
          />
          <Stack
            screenOptions={{ headerShown: false, gestureEnabled: false }}
          />
        </LanguageProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}

export const screenOptions = {
  headerShown: false,
};
