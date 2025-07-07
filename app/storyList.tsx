import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { SAMPLE_LIMIT, TESTING } from "../constants/Constants";
import { useLanguage } from "../localization/LanguageProvider";
import { useRouter } from "expo-router";
import {
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

const coverImages: Record<string, any> = {
  korgle: require("../assets/images/KorgleTitle.png"),
  swamp: require("../assets/images/swamp.png"),
};

export default function StoryListScreen() {
  const [stories, setStories] = useState<any[]>([]);
  const [unlockedMap, setUnlockedMap] = useState<Record<string, boolean>>({});
  const [chapterMap, setChapterMap] = useState<Record<string, string | null>>(
    {}
  );
  const [chapterTitles, setChapterTitles] = useState<
    Record<string, Record<string, string>>
  >({});
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

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

  const renderItem = async ({ item }: { item: any }) => {
    const unlocked = unlockedMap[item.id];
    const currentChapterId = chapterMap[item.id] || "intro";
    console.log("current item id: " + item.id)
    console.log("current Chapter ID: " + currentChapterId);
    const chapterTitle = chapterTitles[item.id]?.[currentChapterId || ""];
    return (
      <TouchableOpacity
        style={[styles.card, theme === "light" && lightStyles.card]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({ pathname: "/story", params: { id: item.id } });
        }}
      >
        {item.coverImage && coverImages[item.coverImage] && (
          <Image
            source={coverImages[item.coverImage]}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.info}>
          <Text
            style={[
              styles.title,
              { color: theme === "dark" ? "#fff" : "#000" },
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.desc, { color: theme === "dark" ? "#ccc" : "#444" }]}
          >
            {item.description || t("subtitle")}
          </Text>
          {unlocked ? (
            <Text style={styles.status}>
              ✅ {t("storyList.continueChapter")}: {chapterTitle || t("intro")}
            </Text>
          ) : (
            <Text style={styles.status}>
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
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme === "dark" ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    borderColor: "#444",
    borderWidth: 1,
    width: "100%",
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

const lightStyles = StyleSheet.create({
  card: {
    backgroundColor: "#f8f8f8",
    borderColor: "#ddd",
  },
});
