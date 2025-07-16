import React from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  SafeAreaView,
  View,
  StyleSheet,
  Dimensions,
  AccessibilityProps,
  PixelRatio,
} from "react-native";
import Modal from "react-native-modal";
import { useAccessibility } from "../accessibility/AccessibilityService";
import { useLanguage } from "../localization/LanguageProvider";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "context/ThemeContext";
import { stripEmoji } from "app/story";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import FallbackBlurView from "./FallBackBlurView";

type ChapterSelectMenuProps = {
  visible: boolean;
  onClose: () => void;
  unlockedChapters: any[];
  onSelectChapter: (item: any) => void;
  currentPageId: string;
  allChapters: any[];
} & AccessibilityProps;

const ChapterSelectMenu = ({
  visible,
  onClose,
  unlockedChapters,
  onSelectChapter,
  currentPageId,
  allChapters,
  accessibilityLabel,
  accessibilityViewIsModal,
  accessible,
}: ChapterSelectMenuProps) => {
  const numberOfDuplicateChaptersAndHomeScreen = 2;
  const { t } = useLanguage();
  const { isScreenReaderEnabled } = useAccessibility();
  const { theme } = useTheme();
  const s = styles(theme);
  const insets = useSafeAreaInsets();
  const totalChapters = allChapters.length;
  const unlockedCount = unlockedChapters.length;
  const fontScale = PixelRatio.getFontScale();

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
      accessibilityLabel={accessibilityLabel}
      accessibilityViewIsModal={accessibilityViewIsModal}
      accessible={accessible}
    >
      {isScreenReaderEnabled ? (
        // ✅ Simpler version for VoiceOver / TalkBack
        <SafeAreaView style={[s.safeArea, { padding: 20 }]}>
          <Text
            style={[s.title, { marginBottom: 16 }]}
            accessibilityRole="header"
          >
            {t("chapterMenu.selectChapter")}
          </Text>

          {chaptersWithStatus.map((item, index) => (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              onPress={() => item.unlocked && onSelectChapter(item)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                item.unlocked
                  ? t("accessibility.chapterUnlocked", {
                      title: item.title,
                      current:
                        item.id === currentPageId
                          ? t("accessibility.currentChapter")
                          : "",
                    })
                  : t("accessibility.chapterLocked")
              }
              accessibilityHint={
                item.unlocked
                  ? t("accessibility.selectChapterHint")
                  : t("accessibility.chapterLockedHint")
              }
              disabled={!item.unlocked}
              style={[
                {
                  backgroundColor: item.unlocked ? "#007AFF" : "#ccc",
                  padding: 14,
                  marginBottom: 12,
                  borderRadius: 10,
                },
              ]}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t("accessibility.closeChapterMenu")}
            style={{
              backgroundColor: "#444",
              padding: 14,
              marginTop: 24,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {t("accessibility.close")}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      ) : (
        // ❖ Your ex
        <SafeAreaView
          style={[
            s.safeArea,
            {
              paddingTop: insets.top + 16,
              height: Dimensions.get("window").height * 0.75,
            },
          ]}
          accessible={true}
          accessibilityViewIsModal={true}
          accessibilityLabel={
            accessibilityLabel || t("accessibility.chapterMenuModal")
          }
          importantForAccessibility="yes"
        >
          <View style={[s.header, { paddingHorizontal: 20 }]}>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t("accessibility.close")}
              accessible={true}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close"
                size={28}
                color={theme === "dark" ? "#fff" : "#000"}
              />
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={s.title}>{t("chapterMenu.selectChapter")}</Text>
              <Text
                style={[s.progressText, { fontStyle: "italic", marginTop: 4 }]}
              >
                {`${unlockedCount}/${
                  totalChapters - numberOfDuplicateChaptersAndHomeScreen || "?"
                } ${t("chapterMenu.chaptersUnlocked")}`}
              </Text>
            </View>
            <FallbackBlurView
              tint={theme === "dark" ? "dark" : "light"}
              intensity={60}
              style={{
                borderRadius: 20,
                padding: 6,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="book-outline" size={24} color="transparent" />
            </FallbackBlurView>
          </View>

          <FlatList
            data={chaptersWithStatus}
            keyExtractor={(item, index) => `${item.id || item.title}-${index}`}
            renderItem={({ item }) => {
              const isActive = item.id === currentPageId;
              const card = (
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
              );

              return (
                <View style={{ paddingHorizontal: 20 }}>
                  {item.unlocked ? (
                    <TouchableOpacity
                      onPress={() => onSelectChapter(item)}
                      style={[
                        s.chapterButton,
                        isActive && s.activeChapterButton,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={t("accessibility.chapterUnlocked", {
                        title: item.title,
                        current: isActive
                          ? t("accessibility.currentChapter")
                          : "",
                      })}
                      accessible={true}
                      accessibilityTraits={["button"]}
                      importantForAccessibility="yes"
                    >
                      <Text
                        style={[s.chapterText, isActive && s.activeChapterText]}
                        allowFontScaling
                        accessibilityRole="text"
                      >
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <LinearGradient
                      colors={
                        theme === "dark"
                          ? ["#00f0ff", "#0ff", "#00f0ff"]
                          : ["#00ccff", "#66f2ff", "#00ccff"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={s.lockedChapterBorder}
                    >
                      <FallbackBlurView
                        intensity={60}
                        tint={theme === "dark" ? "dark" : "light"}
                        style={s.lockedChapterBlur}
                        accessible={true}
                        accessibilityLabel={t("accessibility.chapterLocked")}
                        accessibilityRole="text"
                      >
                        {card}
                      </FallbackBlurView>
                    </LinearGradient>
                  )}
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          />
        </SafeAreaView>
      )}
    </Modal>
  );
};

const styles = (theme: "light" | "dark") => {
  const fontScale = PixelRatio.getFontScale();
  return StyleSheet.create({
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
      fontSize: 20 * fontScale,
      fontWeight: "600",
    },
    progressText: {
      color: theme === "dark" ? "#aaa" : "#444",
      fontSize: 14 * fontScale,
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
      alignItems: "center",
      justifyContent: "center",
    },

    chapterText: {
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: 16 * fontScale,
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
    lockedChapterBorder: {
      borderRadius: 16,
      padding: 2,
      marginBottom: 12,
    },
    lockedChapterBlur: {
      borderRadius: 14,
      overflow: "hidden",
    },
    lockedChapterContent: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
    },
  });
};

export default ChapterSelectMenu;
