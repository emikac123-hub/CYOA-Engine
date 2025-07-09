import React from "react";
import {
  Linking,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "../localization/LanguageProvider";
import { useTheme } from "context/ThemeContext";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SettingsModal({ visible, onClose }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const s = styles(theme);
  const openSupportEmail = () => {
    Linking.openURL("mailto:croquet_player@proton.me?subject=Support Request");
  };
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel={t("accessibility.settingsModal")}
    >
      <TouchableWithoutFeedback accessible={false} onPress={onClose}>
        <View style={s.modalBackdrop}>
          <View style={s.modalContent}>
            <Text
              style={s.modalTitle}
              accessibilityRole="header"
              accessibilityLabel={t("accessibility.settingsModal")}
              accessible={true}
            >
              {t("settings.title")}
            </Text>

            {/* Dark Mode Toggle */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text style={s.optionText}>🌗 {t("settings.darkMode")}</Text>
              <Switch
                value={theme === "dark"}
                onValueChange={toggleTheme}
                thumbColor={theme === "dark" ? "#888" : "#ccc"}
                accessibilityRole="switch"
                accessibilityLabel={t("accessibility.darkModeToggle")}
              />
            </View>

            {/* Language */}
            <TouchableOpacity
              style={s.optionButton}
              onPress={() => {
                onClose();
                setTimeout(() => router.push("/LanguageSelection"), 0);
              }}
              accessibilityRole="button"
              accessibilityLabel={t("accessibility.languageSettings")}
              accessible={true}
            >
              <Text style={s.optionText}>🌐 {t("settings.language")}</Text>
            </TouchableOpacity>

            {/* Support */}
            <TouchableOpacity
              style={s.optionButton}
              onPress={openSupportEmail}
              accessibilityRole="button"
              accessibilityLabel={t("accessibility.support")}
              accessible={true}
            >
              <Text style={s.optionText}>📬 {t("settings.support")}</Text>
            </TouchableOpacity>

            {/* Terms of Use */}
            <TouchableOpacity
              style={s.optionButton}
              onPress={() => {
                onClose();
                Linking.openURL(
                  "https://github.com/emikac123-hub/CYOA-Engine?tab=readme-ov-file#terms-of-use"
                );
              }}
              accessibilityRole="button"
              accessibilityLabel={t("accessibility.termsOfUse")}
              accessible={true}
            >
              <Text style={s.optionText}>📄 {t("settings.terms")}</Text>
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity
              style={s.optionButton}
              onPress={() => {
                onClose();
                Linking.openURL(
                  "https://github.com/emikac123-hub/CYOA-Engine?tab=readme-ov-file#terms-of-use"
                );
              }}
              accessibilityRole="button"
              accessibilityLabel={t("accessibility.privacyPolicy")}
              accessible={true}
            >
              <Text style={s.optionText}>🔒 {t("settings.privacy")}</Text>
            </TouchableOpacity>

            {/* Close */}
            <TouchableOpacity
              style={[s.optionButton, { marginTop: 10 }]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t("accessibility.closeSettings")}
              accessible={true}
            >
              <Text style={[s.optionText, { color: "#B00020" }]}>
                {t("settings.close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: theme === "dark" ? "#333" : "#eee",
      paddingTop: 16,
      paddingBottom: 40,
      paddingHorizontal: 24,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
      color: theme === "dark" ? "white" : "black",
    },
    optionButton: {
      paddingVertical: 14,
    },
    optionText: {
      fontSize: 16,
      color: theme === "dark" ? "white" : "black",
    },
  });
