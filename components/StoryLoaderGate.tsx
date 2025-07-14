import React, { createContext, useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useLanguage } from "../localization/LanguageProvider";
import { loadStory } from "../storyloader";
import { useTheme } from "context/ThemeContext";
import { router } from "expo-router";

// Define the context with chapters included
const StoryContext = createContext<{
  meta: any;
  story: any[];
  chapters: any[];
} | null>(null);

// Custom hook
export const useStory = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error("useStory must be used within a StoryLoaderGate");
  }
  return context;
};

// StoryLoaderGate component
const StoryLoaderGate = ({
  children,
  storyId = "covarnius",
}: {
  children: React.ReactNode;
  storyId?: string;
}) => {
  const { lang } = useLanguage();
  const [storyData, setStoryData] = useState<{
    meta: any;
    story: any[];
    chapters: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const { t } = useLanguage();
  useEffect(() => {
    const load = async () => {
      try {
        const { meta, story, chapters } = await loadStory(storyId, lang);

        setStoryData({ meta, story, chapters });
        setError(null);
      } catch (err: any) {
        console.error("Failed to load story:", err);
        setError(err.message || "Failed to load story");
      }
    };
    load();
  }, [storyId, lang]);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme === "dark" ? "#fff" : "#000",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
        accessible={true}
        accessibilityLabel={t("accessibility.storyLoadError", {
          message: error,
        })}
      >
        <Text
          style={{
            color: theme === "dark" ? "#fff" : "#000",
            fontSize: 18,
            marginBottom: 20,
          }}
          accessibilityRole="text"
        >
          ❌ {t("error.storyLoadFailed", { message: error })}
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/")}
          accessibilityRole="button"
          accessibilityLabel={t("accessibility.returnToTitle")}
          style={{
            backgroundColor: "#00ccff",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            🏠 {t("titleScreen.returnToTitle")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!storyData?.meta || !storyData?.story || !storyData?.chapters) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme === "dark" ? "#fff" : "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
        accessible={true}
        accessibilityLabel="Loading story, please wait"
      >
        <Text
          style={{ color: theme === "dark" ? "#fff" : "#000" }}
          accessibilityRole="text"
        >
          📖 Loading story...
        </Text>
      </View>
    );
  }

  return (
    <StoryContext.Provider value={storyData}>{children}</StoryContext.Provider>
  );
};

export default StoryLoaderGate;
