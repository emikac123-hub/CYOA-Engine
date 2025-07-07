import React from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  SafeAreaView,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { useLanguage } from "../localization/LanguageProvider";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "context/ThemeContext";
import { stripEmoji } from "app/story";
import { BlurView } from "expo-blur";

const ChapterSelectMenu = ({
  visible,
  onClose,
  unlockedChapters,
  onSelectChapter,
  currentPageId,
  allChapters,
}) => {
  const numberOfDuplicateChaptersAndHomeScreen = 2;
  const { t } = useLanguage();
  const { theme } = useTheme();
  const s = styles(theme);
  const insets = useSafeAreaInsets();
  const totalChapters = allChapters.length;
  const unlockedCount = unlockedChapters.length;

  const chaptersWithStatus = [
    {
      title: t("home"),
      id: "home",
      order: 0,
      unlocked: true,
    },
    ...allChapters
      .filter(
        (ch, index, self) =>
          self.findIndex(
            (c) => stripEmoji(c.title) === stripEmoji(ch.title)
          ) === index
      )
      .filter((ch) => ch.id !== "home")
      .map((ch) => {
        const isUnlocked = unlockedChapters.some((uc) => uc.id === ch.id);
        return {
          ...ch,
          unlocked: isUnlocked,
        };
      })
      .sort((a, b) => a.order - b.order),
  ];

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <SafeAreaView
        style={[
          s.safeArea,
          {
            paddingTop: insets.top + 16,
            height: Dimensions.get("window").height * 0.75,
          },
        ]}
      >
        <View style={[s.header, { paddingHorizontal: 20 }]}>
          <Ionicons
            name="book-outline"
            size={24}
            color={theme === "dark" ? "#fff" : "#000"}
          />
          <Text style={s.title}>{t("chapterMenu.selectChapter")}</Text>
          <Text style={s.progressText}>
            {`${unlockedCount}/${
              totalChapters - numberOfDuplicateChaptersAndHomeScreen || "?"
            } ${t("chapterMenu.chaptersUnlocked")}`}
          </Text>
        </View>

        <FlatList
          data={chaptersWithStatus}
          keyExtractor={(item, index) => `${item.id || item.title}-${index}`}
          renderItem={({ item }) => {
            const isActive = item.id === currentPageId;

            return (
              <View style={{ paddingHorizontal: 20 }}>
                {item.unlocked ? (
                  <TouchableOpacity
                    onPress={() => onSelectChapter(item)}
                    style={[
                      s.chapterButton,
                      isActive && s.activeChapterButton,
                    ]}
                  >
                    <Text
                      style={[
                        s.chapterText,
                        isActive && s.activeChapterText,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <BlurView
                    intensity={70}
                    tint={theme === "dark" ? "dark" : "light"}
                    style={s.lockedChapterBlur}
                  >
                    <View
                      style={[
                        s.lockedChapterContent,
                        {
                          backgroundColor:
                            theme === "dark"
                              ? "rgba(0,0,0,0.3)"
                              : "rgba(255,255,255,0.3)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={theme === "dark" ? "#ccc" : "#555"}
                      />
                    </View>
                  </BlurView>
                )}
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: theme === "dark" ? "#111" : "#f2f2f2",
      paddingBottom: 20,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    title: {
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: 20,
      fontWeight: "600",
    },
    progressText: {
      color: theme === "dark" ? "#aaa" : "#444",
      fontSize: 14,
    },
    chapterButton: {
      backgroundColor:
        theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    },
    chapterText: {
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: 16,
      fontWeight: "600",
    },
    activeChapterButton: {
      backgroundColor: theme === "dark" ? "#00ccff" : "#0077aa",
      borderColor: theme === "dark" ? "#00ccff" : "#0077aa",
    },
    activeChapterText: {
      color: theme === "dark" ? "#000" : "#fff",
      fontWeight: "bold",
    },
    lockedChapterBlur: {
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 12,
    },
    lockedChapterContent: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
    },
  });

export default ChapterSelectMenu;
