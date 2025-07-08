import { useLanguage } from "../localization/LanguageProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRouter } from "expo-router";
import React, { useState, useRef } from "react";
import * as Haptics from "expo-haptics";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { clearProgressOnly } from "storage/progressManager";

const languages = [
  { code: "en", label: "🇺🇸/🇬🇧 English" },
  { code: "de", label: "🇩🇪 Deutsch" },
  { code: "es", label: "🇪🇸 Español" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "is", label: "🇮🇸 Íslenska" },
  { code: "jp", label: "🇯🇵 日本語" },
];

const storyFileMap: Record<string, () => Promise<any>> = {
  en: () => import("../stories/stories-en.json"),
  de: () => import("../stories/stories-de.json"),
  es: () => import("../stories/stories-es.json"),
  fr: () => import("../stories/stories-fr.json"),
  is: () => import("../stories/stories-is.json"),
  jp: () => import("../stories/stories-jp.json"),
};

const LanguageSelection = () => {
  const { theme } = useTheme();
  const s = styles(theme);
  const navigation = useNavigation();
  const { setLang, t } = useLanguage();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingLang, setPendingLang] = useState<string | null>(null);
  const router = useRouter();
  const [showModalText, setShowModalText] = useState(true);
  const modalOpacity = useRef(new Animated.Value(1)).current;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        accessibilityViewIsModal={true}
      >
        <View style={s.modalBackdrop} accessible={false}>
          <Animated.View
            style={[s.modalBox, { opacity: modalOpacity }]}
            accessibilityViewIsModal={true}
            accessible={false} // important
          >
            {showModalText && (
              <Text
                style={s.modalText}
                accessibilityRole="text"
                accessibilityLabel={t("accessibility.languageWarning")}
              >
                {t("languageChangeWarning") ||
                  "Changing language will return you to the title screen. Continue?"}
              </Text>
            )}
            {showModalText && (
              <View
                style={s.modalButtons}
                accessible={false} // ✅ Let the buttons get focus individually
              >
                <TouchableOpacity
                  onPress={() => setShowConfirm(false)}
                  accessibilityRole="button"
                  accessibilityLabel={t("accessibility.cancel")}
                >
                  <Text style={s.cancelButton}>
                    ❌ {t("titleScreen.cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    setShowModalText(false);
                    setTimeout(() => setShowModalText(true), 1000);

                    if (pendingLang) {
                      await AsyncStorage.setItem(
                        "selectedLanguage",
                        pendingLang
                      );
                      setLang(pendingLang);
                      try {
                        const loader = storyFileMap[pendingLang];
                        const fullStorySet = await loader?.();
                        for (const storyId of Object.keys(fullStorySet)) {
                          const storyBlock = fullStorySet[storyId];
                          const localizedChapters =
                            storyBlock?.meta?.chapters || [];
                          const savedChaptersRaw = await AsyncStorage.getItem(
                            `unlockedChapters-${storyId}`
                          );
                          if (savedChaptersRaw) {
                            const savedChapters = JSON.parse(savedChaptersRaw);
                            const relabeled = savedChapters
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
                              `unlockedChapters-${storyId}`,
                              JSON.stringify(relabeled)
                            );
                          }

                          await clearProgressOnly(storyId);
                        }
                      } catch (err) {
                        console.warn("⚠️ Failed to localize chapters:", err);
                      }

                      Animated.timing(modalOpacity, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: true,
                      }).start(() => {
                        setShowConfirm(false);
                        router.replace("/");
                      });
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t("accessibility.confirm")}
                >
                  <Text style={s.confirmButton}>✅ OK</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>

      <View style={s.container}>
        <Text
          style={s.title}
          accessibilityRole="header"
          accessibilityLabel={t("accessibility.languageSelectTitle")}
        >
          {t("languageChoice")}
        </Text>
        <FlatList
          data={languages}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.languageButton}
              onPress={() => {
                Haptics.selectionAsync();
                modalOpacity.setValue(1);
                setPendingLang(item.code);
                setShowConfirm(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={t("accessibility.selectLanguage", {
                language: item.label,
              })}
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
