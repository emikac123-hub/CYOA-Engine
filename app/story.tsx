import { useLanguage } from "../localization/LanguageProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SettingsModal from "../components/SettingsMenu";
import StoryLoaderGate, { useStory } from "../components/StoryLoaderGate";
import { loadProgress, saveProgress } from "../storage/progressManager";
import { isStoryUnlocked } from "../storage/unlockManager";

const SCREEN_WIDTH = Dimensions.get("window").width;

const StoryScreen = () => {
  const { meta, story } = useStory();
  return <ActualStoryEngine meta={meta} story={story} />;
};

function ActualStoryEngine({
  meta,
  story,
  resumePageId,
}: {
  meta: any;
  story: any[];
  resumePageId?: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [decisionCount, setDecisionCount] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(true);

  const startPageId = "intro";

  useEffect(() => {
    const load = async () => {
      const savedPageId = await loadProgress(meta.id);
      const initialPage = savedPageId || startPageId;
      console.log("✅ Initial Page ID:", initialPage);
      setCurrentPageId(initialPage);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (currentPageId) fadeIn();
  }, [currentPageId]);

  const fadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  if (!currentPageId) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
          Loading story...
        </Text>
      </View>
    );
  }

  const page = story.find((p) => p.id === currentPageId);

  if (!page) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
          ❌ Story page not found
        </Text>
      </View>
    );
  }

  const localizedContinue = t("titleScreen.continue").toLowerCase();
   const localizedGoBack = t("titleScreen.back");
  const isSingleContinue =
    page?.choices?.length === 1 &&
    page.choices[0].text.trim().toLowerCase() === localizedContinue;

  const handleChoice = async (nextId: string) => {
    setHistory((prev) => [...prev, currentPageId]);
    const unlocked = await isStoryUnlocked(meta.id);
    const nextCount = decisionCount + 1;

    if (!unlocked && nextCount >= meta.sampleLimit) {
      setShowPaywall(true);
      return;
    }

    await saveProgress(meta.id, nextId);
    setCurrentPageId(nextId);
    setDecisionCount(nextCount);
  };

  const handleTapAnywhere = () => {
    if (page?.choices?.length === 1) {
      Haptics.selectionAsync();
      handleChoice(page.choices[0].nextId);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Settings & Home Icons */}
      <View style={{ position: "absolute", top: 40, left: 20, zIndex: 10 }}>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={{ position: "absolute", top: 40, right: 20, zIndex: 10 }}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Ionicons name="home-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tap Area */}
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={handleTapAnywhere}
      >
        {page?.image && (
          <Image
            source={{ uri: page.image }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.storyText}>{page.text}</Text>
        </Animated.View>

        {/* Choices */}
        <View style={styles.storyContent} pointerEvents="box-none">
          {history.length > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Haptics.selectionAsync();
                setHistory((prev) => {
                  const newHistory = [...prev];
                  const lastId = newHistory.pop();
                  if (lastId) setCurrentPageId(lastId);
                  return newHistory;
                });
              }}
            >
      <Text style={styles.backText}>{localizedGoBack}</Text>
            </TouchableOpacity>
          )}

          {!isSingleContinue && (
            <View style={styles.choicesContainer}>
              {page.choices.map((choice, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.choiceButton}
                  onPress={() => {
                    Haptics.selectionAsync();
                    handleChoice(choice.nextId);
                  }}
                >
                  <Text style={styles.choiceText}>{choice.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Paywall */}
        {showPaywall && (
          <View style={styles.paywall}>
            <Text style={styles.paywallText}>
              Buy “{meta.title}” to continue reading!
            </Text>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={() =>
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              }
            >
              <Text style={styles.purchaseButtonText}>
                {t("titleScreen.unlockPrice", {
                  price: `${meta.price || "$1.99"}`,
                })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={styles.cancelText}>Back to story list</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
  );
}

export default () => (
  <StoryLoaderGate>
    <StoryScreen />
  </StoryLoaderGate>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 16 },
  image: {
    width: SCREEN_WIDTH - 32,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  textContainer: { flex: 1, justifyContent: "center" },
  storyText: { fontSize: 18, color: "#fff", lineHeight: 26 },
  storyContent: { paddingBottom: 24 },
  choicesContainer: { marginTop: 20 },
  choiceButton: {
    backgroundColor: "#333",
    padding: 12,
    marginVertical: 8,
    borderRadius: 10,
  },
  choiceText: { color: "#fff", fontSize: 16, textAlign: "center" },
  paywall: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
    alignItems: "center",
  },
  paywallText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  purchaseButton: {
    backgroundColor: "#00ccff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 10,
  },
  purchaseButtonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  cancelText: { color: "#aaa", textDecorationLine: "underline", marginTop: 10 },
  backButton: {
    backgroundColor: "#222",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: "stretch",
    borderColor: "#444",
    borderWidth: 1,
  },
  backText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
  },
});
