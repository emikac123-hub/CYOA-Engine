import { useLanguage } from "../localization/LanguageProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRouter } from "expo-router";
import React, { useState } from "react";
import * as Haptics from "expo-haptics";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { clearProgressOnly } from "storage/progressManager";
const { theme } = useTheme();
const languages = [
  { code: "en", label: "🇺🇸/🇬🇧 English" },
  { code: "de", label: "🇩🇪 Deutsch" },
  { code: "es", label: "🇪🇸 Español" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "is", label: "🇮🇸 Íslenska" },
  { code: "jp", label: "🇯🇵 日本語" },
];

const LanguageSelection = () => {
  const { theme } = useTheme();
  const s = styles(theme);
  const navigation = useNavigation();
  const { setLang, t } = useLanguage(); // ✅ get the `t` function from context
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingLang, setPendingLang] = useState<string | null>(null);
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={s.modalBackdrop}>
          <View style={s.modalBox}>
            <Text style={s.modalText}>
              {t("languageChangeWarning") ||
                "Changing language will return you to the title screen. Continue?"}
            </Text>
            <View style={s.modalButtons}>
              <TouchableOpacity onPress={() => setShowConfirm(false)}>
                <Text style={s.cancelButton}>❌ {t("titleScreen.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (pendingLang) {
                    await AsyncStorage.setItem("selectedLanguage", pendingLang);
                    setLang(pendingLang);

                    // 👇 Try to relabel unlocked chapters before clearing progress
                    try {
                      const storyFiles = {
                        en: () => import("../stories/covarnius-en.json"),
                        de: () => import("../stories/covarnius-de.json"),
                        fr: () => import("../stories/covarnius-fr.json"),
                        es: () => import("../stories/covarnius-es.json"),
                        is: () => import("../stories/covarnius-is.json"),
                        jp: () => import("../stories/covarnius-jp.json"),
                      };

                      const loader = storyFiles[pendingLang];
                      const mod = await loader();
                      const localizedChapters = mod.meta?.chapters || [];

                      const savedChapters = await AsyncStorage.getItem(
                        "unlockedChapters-covarnius"
                      );
                      if (savedChapters) {
                        const parsed = JSON.parse(savedChapters);
                        const relabeled = parsed
                          .map((ch) => {
                            const found = localizedChapters.find(
                              (m) => m.id === ch.id
                            );
                            return found
                              ? {
                                  id: ch.id,
                                  order: ch.order,
                                  title: found.title,
                                }
                              : null;
                          })
                          .filter(Boolean)
                          .sort((a, b) => a.order - b.order);

                        await AsyncStorage.setItem(
                          "unlockedChapters-covarnius",
                          JSON.stringify(relabeled)
                        );
                      }
                    } catch (err) {
                      console.warn("⚠️ Failed to localize chapters:", err);
                    }

                    await clearProgressOnly("covarnius");
                    router.replace("/");
                  }
                }}
              >
                <Text style={s.confirmButton}>✅ OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={s.container}>
        <Text style={s.title}>{t("languageChoice")}</Text>
        <FlatList
          data={languages}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.languageButton}
              onPress={() => {
                Haptics.selectionAsync();
                setPendingLang(item.code); // store temporarily
                setShowConfirm(true); // show the confirmation modal
              }}
            >
              <Text style={s.languageText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default LanguageSelection;

export const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalBox: {
      backgroundColor: "#222",
      padding: 20,
      borderRadius: 14,
      width: "80%",
    },
    modalText: {
      color: "#fff",
      fontSize: 16,
      marginBottom: 20,
      textAlign: "center",
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    cancelButton: {
      color: "#ccc",
      fontSize: 16,
    },
    confirmButton: {
      color: "#00ccff",
      fontSize: 16,
      fontWeight: "bold",
    },

    container: {
      flex: 1,
      backgroundColor: theme === "dark" ? "#111" : "#fff",
      padding: 20,
    },
    title: {
      fontSize: 22,
      color: theme === "dark" ? "#fff" : "#000",
      marginBottom: 20,
      textAlign: "center",
    },
    languageButton: {
      backgroundColor: theme === "dark" ? "#222" : "#eee",
      padding: 15,
      borderRadius: 10,
      marginBottom: 12,
      alignItems: "center",
    },
    languageText: {
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: 18,
    },
  });
