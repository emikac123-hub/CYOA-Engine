import React from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  SafeAreaView,
  View,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { useLanguage } from "../localization/LanguageProvider";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "context/ThemeContext";

const ChapterSelectMenu = ({
  visible,
  onClose,
  unlockedChapters,
  onSelectChapter,
  currentPageId,
}) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const s = styles(theme);
  const insets = useSafeAreaInsets();
  const chaptersWithHome = [
    { title: `${t("home")}`, id: "home" },
    ...unlockedChapters,
  ];

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <SafeAreaView style={[s.safeArea, { paddingTop: insets.top + 16 }]}>
        <View style={[s.header, { paddingTop: 24, paddingHorizontal: 20 }]}>
          <Ionicons
            name="book-outline"
            size={24}
            color={theme === "dark" ? "#fff" : "#000"}
          />
          <Text style={s.title}>{t("selectChapter")}</Text>
        </View>

        <FlatList
          data={chaptersWithHome}
          keyExtractor={(item, index) => `${item.id || item.title}-${index}`}
          renderItem={({ item }) => {
            const isActive = item.id === currentPageId;
            return (
              <View style={{ paddingHorizontal: 20 }}>
                <TouchableOpacity
                  onPress={() => onSelectChapter(item)}
                  style={[s.chapterButton, isActive && s.activeChapterButton]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[s.chapterText, isActive && s.activeChapterText]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </SafeAreaView>
    </Modal>
  );
};
const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    activeChapterButton: {
      backgroundColor: theme === "dark" ? "#00ccff" : "#0077aa",
      borderColor: theme === "dark" ? "#00ccff" : "#0077aa",
    },

    activeChapterText: {
      color: theme === "dark" ? "#000" : "#fff",
      fontWeight: "bold",
    },

    safeArea: {
      backgroundColor: theme === "dark" ? "#111" : "#f2f2f2",
      padding: 20,
      paddingTop: 32,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 8,
      paddingHorizontal: 20,
    },

    title: {
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: 20,
      fontWeight: "600",
      textShadowColor:
        theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.05)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },

    chapterButton: {
      backgroundColor:
        theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    },

    chapterText: {
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: 16,
      fontWeight: "500",
    },
  });

export default ChapterSelectMenu;
