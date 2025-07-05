import React, { createContext, useContext, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useLanguage } from "../localization/LanguageProvider";
import { loadStory } from "../storyloader";
import { useTheme } from "context/ThemeContext";

// Define the context
const StoryContext = createContext<{
  meta: any;
  story: any[];
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
  storyId = "covarnius", // You can pass this in dynamically if needed
}: {
  children: React.ReactNode;
  storyId?: string;
}) => {
  const { lang } = useLanguage();
  const [storyData, setStoryData] = useState<{
    meta: any;
    story: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const iconColor = theme === "dark" ? "#fff" : "#000";
  useEffect(() => {
    const load = async () => {
      try {
        const data = await loadStory(storyId, lang);
        setStoryData(data);
        setError(null);
      } catch (err: any) {
        console.error("❌ Failed to load story:", err);
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
        }}
      >
        <Text style={{ color: theme === "dark" ? "#fff" : "#000" }}>❌ {error}</Text>
      </View>
    );
  }

  if (!storyData?.meta || !storyData?.story) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme === "dark" ? "#fff" : "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme === "dark" ? "#fff" : "#000" }}>📖 Loading story...</Text>
      </View>
    );
  }

  return (
    <StoryContext.Provider value={storyData}>{children}</StoryContext.Provider>
  );
};

export default StoryLoaderGate;
