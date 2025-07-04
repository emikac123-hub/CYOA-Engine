import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";

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
import { isStoryUnlocked } from "../storage/unlockManager";
const { t } = useLanguage();
// ✅ Define the image map here
const coverImages: Record<string, any> = {
  korgle: require("../assets/images/KorgleTitle.png"),
  swamp: require("../assets/images/swamp.png"),
};

export default function StoryListScreen() {
  const [stories, setStories] = useState<any[]>([]);
  const [unlockedMap, setUnlockedMap] = useState<Record<string, boolean>>({});
  const router = useRouter();

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
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.description}</Text>
          <Text style={styles.status}>
            {unlocked
              ? t("unlocked")
              : t("sampleLimit", { count: `${item.sampleLimit}` })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={stories}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
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
    width: "100%", // Make sure it scales with screen width
  },
  image: {
    width: "100%",
    height: 180, // Adjusted for better fit
    resizeMode: "cover", // This keeps it from looking squished
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
