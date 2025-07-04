// components/SettingsModal.tsx
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "../localization/LanguageProvider"; // 👈 adjust path as needed

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SettingsModal({ visible, onClose }: Props) {
  const router = useRouter();
  const { t } = useLanguage(); // 👈 use translation function

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t("settings.title")}</Text>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onClose();
              setTimeout(() => router.push("/LanguageSelection"), 0);
            }}
          >
            <Text style={styles.optionText}>🌐 {t("settings.language")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={onClose}>
            <Text style={styles.optionText}>📬 {t("settings.support")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={onClose}>
            <Text style={styles.optionText}>📄 {t("settings.terms")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={onClose}>
            <Text style={styles.optionText}>🔒 {t("settings.privacy")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, { marginTop: 10 }]}
            onPress={onClose}
          >
            <Text style={[styles.optionText, { color: "#B00020" }]}>
              {t("settings.close")}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
