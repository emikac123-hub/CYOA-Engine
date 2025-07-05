// components/SettingsModal.tsx
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "../localization/LanguageProvider"; // 👈 adjust path as needed
import { useTheme } from "context/ThemeContext";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SettingsModal({ visible, onClose }: Props) {
  const router = useRouter();
  const { t } = useLanguage(); // 👈 use translation function
  const { theme, toggleTheme } = useTheme();
  const s = styles(theme);
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={s.modalBackdrop} onPress={onClose}>
        <View style={s.modalContent}>
          <Text style={s.modalTitle}>{t("settings.title")}</Text>
          {/* Theme Toggle */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text style={s.optionText}>🌓 Dark Mode</Text>
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              thumbColor={theme === "dark" ? "#888" : "#ccc"}
            />
          </View>
          <TouchableOpacity
            style={s.optionButton}
            onPress={() => {
              onClose();
              setTimeout(() => router.push("/LanguageSelection"), 0);
            }}
          >
            <Text style={s.optionText}>🌐 {t("settings.language")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.optionButton} onPress={onClose}>
            <Text style={s.optionText}>📬 {t("settings.support")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.optionButton} onPress={onClose}>
            <Text style={s.optionText}>📄 {t("settings.terms")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.optionButton} onPress={onClose}>
            <Text style={s.optionText}>🔒 {t("settings.privacy")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.optionButton, { marginTop: 10 }]}
            onPress={onClose}
          >
            <Text style={[s.optionText, { color: "#B00020" }]}>
              {t("settings.close")}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === "dark" ? "#111" : "#fff",
      padding: 20,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: "#fff",
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
    },
    optionButton: {
      paddingVertical: 14,
    },
    optionText: {
      fontSize: 16,
      color: "#333",
    },
  });