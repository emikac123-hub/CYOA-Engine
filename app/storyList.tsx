import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { SAMPLE_LIMIT } from "../constants/Constants";
import { useLanguage } from "../localization/LanguageProvider";
import { useRouter } from "expo-router";
import { clearProgress } from "../storage/progressManager";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { isStoryUnlocked } from "../storage/unlockManager";
import { loadChapterProgress } from "../storage/progressManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDeleteEmoji } from "components/PlatformService";

const coverImages: Record<string, any> = {
  korgle: require("../assets/images/KorgleTitle.png"),
  swamp: require("../assets/images/swamp.png"),
};

export default function StoryListScreen() {
  const [resetFlags, setResetFlags] = useState<Record<string, boolean>>({});
  const [hasSeenLongPressHint, setHasSeenLongPressHint] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [unlockedMap, setUnlockedMap] = useState<Record<string, boolean>>({});
  const [chapterMap, setChapterMap] = useState<Record<string, string | null>>(
    {}
  );
  // Define minimum versions that support 🫥 (Face with Dotted Outline)

  const [showHint, setShowHint] = useState("");
  const [chapterTitles, setChapterTitles] = useState<
    Record<string, Record<string, string>>
  >({});
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const s = styles(theme);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    AsyncStorage.getItem("hasSeenLongPressHint").then((val) => {
      console.log("val " + val);
      if (val !== "") setHasSeenLongPressHint(true);
    });
  }, []);
  useEffect(() => {
    AsyncStorage.setItem("hasSeenLongPressHint", "sh");
  }, []);
  useEffect(() => {
    console.log(hasSeenLongPressHint);
    if (!hasSeenLongPressHint) {
      setShowHint("sh"); // Show story title in the toast
      setTimeout(() => setShowHint(""), 5000);

      AsyncStorage.setItem("hasSeenLongPressHint", "true");
      setHasSeenLongPressHint(true);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showHint]);
  useEffect(() => {
    if (showHint !== "") {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // After delay, fade out and then clear showHint
      const timeout = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowHint("");
        });
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [showHint]);
  useEffect(() => {
    const load = async () => {
      const storyFileMap = {
        en: () => import("../stories/stories-en.json"),
        de: () => import("../stories/stories-de.json"),
        fr: () => import("../stories/stories-fr.json"),
        es: () => import("../stories/stories-es.json"),
        is: () => import("../stories/stories-is.json"),
        jp: () => import("../stories/stories-jp.json"),
      };

      const loader = storyFileMap[lang];
      const data = await loader().then((mod) => mod.default);
      const allStories = Object.keys(data).map((key) => data[key].meta);
      setStories(allStories);

      const unlockStatus = await Promise.all(
        allStories.map((s: any) => isStoryUnlocked(s.id))
      );
      const unlockedMap: Record<string, boolean> = {};
      const chapterMap: Record<string, string | null> = {};
      const titleMap: Record<string, Record<string, string>> = {};

      for (let i = 0; i < allStories.length; i++) {
        const story = allStories[i];
        const block = data[story.id];
        unlockedMap[story.id] = unlockStatus[i];
        chapterMap[story.id] = await loadChapterProgress(story.id);

        const map: Record<string, string> = {};
        for (const chapter of block.meta?.chapters || []) {
          map[chapter.id] = chapter.title;
        }
        titleMap[story.id] = map;
      }
      setUnlockedMap(unlockedMap);
      setChapterMap(chapterMap);
      setChapterTitles(titleMap);
    };

    load();
  }, [lang]);
  const handleLongPress = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      t("storyList.deleteProgressTitle", {
        defaultValue: "Delete Progress?",
      }),
      t("storyList.deleteProgressBody", {
        defaultValue: `This will remove saved progress for "${item.title}". Are you sure?`,
        title: item.title,
      }),
      [
        { text: t("titleScreen.cancel"), style: "cancel" },
        {
          text: t("titleScreen.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await clearProgress(item.id);

              // Don't re-lock the story
              setChapterMap((prev) => ({ ...prev, [item.id]: "intro" }));
              setResetFlags((prev) => ({ ...prev, [item.id]: true }));

              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              setStories((prev) => [...prev]);

              Alert.alert(
                t("storyList.deleted"),
                t("storyList.deletedMessage", {
                  defaultValue: "Progress cleared successfully.",
                })
              );
            } catch (err) {
              console.warn("Failed to delete progress:", err);
              Alert.alert("Error", "Unable to delete progress.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const unlocked = unlockedMap[item.id];
    let currentChapterId = chapterMap[item.id] || "intro";
    const chapterTitle = chapterTitles[item.id]?.[currentChapterId || ""];
    return (
      <TouchableOpacity
        style={s.card}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          unlocked
            ? t("accessibility.continueStory", {
                title: item.title,
                chapter: chapterTitle || t("intro"),
              })
            : t("accessibility.startStory", { title: item.title })
        }
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          const shouldReset = resetFlags[item.id];

          router.push({
            pathname: "/story",
            params: {
              id: item.id,
              ...(shouldReset ? { reset: "true" } : {}),
            },
          });

          if (shouldReset) {
            setResetFlags((prev) => {
              const updated = { ...prev };
              delete updated[item.id];
              return updated;
            });
          }
        }}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
      >
        {item.coverImage && coverImages[item.coverImage] && (
          <Image
            source={coverImages[item.coverImage]}
            style={s.image}
            resizeMode="cover"
          />
        )}
        <View style={s.info}>
          <Text
            style={[s.title, { color: theme === "dark" ? "#fff" : "#000" }]}
          >
            {item.title}
          </Text>
          <Text style={[s.desc, { color: theme === "dark" ? "#ccc" : "#444" }]}>
            {item.description || t("subtitle")}
          </Text>
          {unlocked ? (
            <Text style={s.status}>
              ✅ {t("storyList.continueChapter")}: {chapterTitle || t("intro")}
            </Text>
          ) : (
            <Text style={s.status}>
              {t("storyList.sampleLimit", { count: `${SAMPLE_LIMIT}` })}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme === "dark" ? "#000" : "#fff",
        paddingTop: insets.top + 10,
        paddingHorizontal: 16,
      }}
    >
      {showHint !== "" && (
        <Animated.View
          style={[
            s.toast,
            { opacity: fadeAnim },
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={s.toastText}>
            {`${getDeleteEmoji()} ${t("storyList.deleteInstructions")}`}
          </Text>
        </Animated.View>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={{ paddingRight: 12 }}
          accessibilityRole="button"
          accessibilityLabel={t("accessibility.backToHome")}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme === "dark" ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text
          accessibilityRole="header"
          accessibilityLabel={t("accessibility.selectStoryHeader")}
          style={{
            color: theme === "dark" ? "#fff" : "#000",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          {t("titleScreen.selectStory")}
        </Text>
      </View>

      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    toast: {
      position: "absolute",
      bottom: 30,
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 1000,
    },

    toastText: {
      backgroundColor: "rgba(0,0,0,0.7)",
      color: "#fff",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      fontSize: 13,
      overflow: "hidden",
    },
    card: {
      backgroundColor: theme === "dark" ? "#1a1a1a" : "#fff",
      marginBottom: 20,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme === "dark" ? "#333" : "#ddd",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    image: {
      width: "100%",
      height: 180,
      resizeMode: "cover",
    },
    info: {
      padding: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
    },
    desc: {
      marginVertical: 6,
    },
    status: {
      color: "#0af",
      fontWeight: "bold",
    },
  });
