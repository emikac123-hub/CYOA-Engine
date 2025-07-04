import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { SAMPLE_LIMIT } from "../constants/Constants";

import { useLanguage } from "../localization/LanguageProvider";
import { useRouter } from "expo-router";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { isStoryUnlocked } from "../storage/unlockManager";
import { Ionicons } from "@expo/vector-icons";

const coverImages: Record<string, any> = {
  korgle: require("../assets/images/KorgleTitle.png"),
  swamp: require("../assets/images/swamp.png"),
};

export const screenOptions = {
  gestureEnabled: true,
};

export default function StoryListScreen() {
  const [stories, setStories] = useState<any[]>([]);
  const [unlockedMap, setUnlockedMap] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { t } = useLanguage();
  useEffect(() => {
    const load = async () => {
      const data = await import("../stories/storyIndex.json").then(
        (mod) => mod.default
      );
      setStories(data);

      const unlockStatus = await Promise.all(
        data.map((s: any) => isStoryUnlocked(s.id))
      );
      const unlockedMap: Record<string, boolean> = {};
      data.forEach((s: any, i: number) => {
        unlockedMap[s.id] = unlockStatus[i];
      });
      setUnlockedMap(unlockedMap);
    };

    load();
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const unlocked = unlockedMap[item.id];

    return (
      <TouchableOpacity
        style={styles.card}
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
          <Text style={styles.title}>{t("titleScreen.mainTitle")}</Text>
          <Text style={styles.desc}>{t("subtitle")}</Text>
          <Text style={styles.status}>
            {unlocked
              ? t("unlocked")
              : t("titleScreen.sampleLimit", { count: `${SAMPLE_LIMIT}` })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000", padding: 16 }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={{ paddingRight: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
          {t("titleScreen.selectStory")}
        </Text>
      </View>

      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  desc: {
    color: "#ccc",
    marginVertical: 6,
  },
  status: {
    color: "#0af",
    fontWeight: "bold",
  },
});
