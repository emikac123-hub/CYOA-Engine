import { useLanguage } from "../localization/LanguageProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { SAMPLE_LIMIT } from "../constants/Constants";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import SettingsModal from "../components/SettingsMenu";
import StoryLoaderGate, { useStory } from "../components/StoryLoaderGate";
import { loadProgress, saveProgress } from "../storage/progressManager";
import { isStoryUnlocked } from "../storage/unlockManager";
import AsyncStorage from "@react-native-async-storage/async-storage";

import StoryContent from "../components/StoryContent";
import ChapterUnlockPopup from "../components/ChapterUnlockPopup";
import ChapterSelectMenu from "../components/ChapterSelectMenu";
import { useTheme } from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StoryScreen = () => {
  const { meta, story, chapters } = useStory(); // ✅ Now includes chapters
  return <ActualStoryEngine meta={meta} story={story} chapters={chapters} />;
};

function ActualStoryEngine({ meta, story, chapters, resumePageId }) {
  const [unlockedChapters, setUnlockedChapters] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [page, setPage] = useState(null);
  const [history, setHistory] = useState([]);
  const [decisionCount, setDecisionCount] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showPaywall, setShowPaywall] = useState(false);
  const [showChapterPopup, setShowChapterPopup] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [lastShownChapterId, setLastShownChapterId] = useState(null);
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const startPageId = "intro";
  const [chapterMenuVisible, setChapterMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadInitialState = async () => {
      const allPageIds = new Set(story.map((p) => p.id));
      let initialPageId: string | null = null;

      try {
        const savedPageId = await loadProgress(meta.id);
        if (savedPageId && allPageIds.has(savedPageId)) {
          initialPageId = savedPageId;
        } else {
          const savedChapters = await AsyncStorage.getItem(
            `unlockedChapters-${meta.id}`
          );
          if (savedChapters) {
            const parsed = JSON.parse(savedChapters);
            const mostRecent = parsed[parsed.length - 1];
            if (mostRecent && allPageIds.has(mostRecent.id)) {
              initialPageId = mostRecent.id;
            }
          }
        }
      } catch (err) {
        console.warn("Error loading progress or chapters:", err);
      }

      setCurrentPageId(initialPageId || startPageId);

      // ✅ Localize chapters using `chapters` from useStory
      try {
        const savedChapters = await AsyncStorage.getItem(
          `unlockedChapters-${meta.id}`
        );
        if (savedChapters) {
          const parsed = JSON.parse(savedChapters);
          const localizedChapters = parsed
            .map((ch) => {
              const found = chapters.find((m) => m.id === ch.id);
              return found
                ? {
                    id: ch.id,
                    order: ch.order,
                    title: found.title,
                  }
                : null;
            })
            .filter(Boolean)
            .sort((a, b) => a.order - b.order);
          setUnlockedChapters(localizedChapters);
        }
      } catch (err) {
        console.warn("Failed to localize unlocked chapters:", err);
      }
    };

    loadInitialState();
  }, []);

  useEffect(() => {
    const found = story.find((p) => p.id === currentPageId);
    setPage(found || null);
  }, [currentPageId, story]);

  const fadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };
  useEffect(() => {
    console.log("🧠 History:", history);
  }, [history]);
  useEffect(() => {
    if (currentPageId) fadeIn();
  }, [currentPageId]);

  useEffect(() => {
    if (!page || !page.chapter?.title || currentPageId === lastShownChapterId)
      return;

    const alreadyVisible = unlockedChapters.some(
      (ch) => ch.id === currentPageId
    );
    if (alreadyVisible) return; // ✅ Prevent confetti & popup if chapter is already in menu

    const unlockNewChapter = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setShowChapterPopup(true);
      setConfettiKey((prev) => prev + 1);

      const newChapter = {
        title: page.chapter.title,
        order: page.chapter.order,
        id: currentPageId,
      };

      const updated = [...unlockedChapters, newChapter]
        .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
        .sort((a, b) => a.order - b.order);

      await AsyncStorage.setItem(
        `unlockedChapters-${meta.id}`,
        JSON.stringify(updated)
      ).catch((err) => console.warn("Failed to save unlocked chapters:", err));

      setUnlockedChapters(updated);
      setLastShownChapterId(currentPageId);
    };

    unlockNewChapter();

    const timeout = setTimeout(() => setShowChapterPopup(false), 2500);
    return () => clearTimeout(timeout);
  }, [page]);

  const isSingleContinue = useMemo(() => {
    if (!page || !page.choices || page.choices.length !== 1) return false;
    const stripped = (s) =>
      s
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .trim()
        .toLowerCase();
    const expected = stripped(t("titleScreen.continue"));
    const actual = stripped(page.choices[0].text);
    return actual === expected;
  }, [page, t]);
  const handleChoice = async (fromId: string, nextId: string) => {
    setHistory((prev) => [...prev, fromId]);

    const unlocked = await isStoryUnlocked(meta.id);
    const nextCount = decisionCount + 1;

    if (!unlocked && nextCount >= SAMPLE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    await saveProgress(meta.id, nextId);
    setCurrentPageId(nextId);
    setDecisionCount(nextCount);
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          position: "absolute",
          top: insets.top + 10,
          right: 20,
          zIndex: 10,
        }}
      >
        <TouchableOpacity onPress={() => setChapterMenuVisible(true)}>
          <Ionicons
            name="book-outline"
            size={28}
            color={theme === "dark" ? "#fff" : "#000"}
            style={{ opacity: 0.9 }}
          />
        </TouchableOpacity>
      </View>

      {page && (
        <StoryContent
          page={page}
          fadeAnim={fadeAnim}
          handleChoice={handleChoice}
          history={history}
          setCurrentPageId={setCurrentPageId}
          isSingleContinue={isSingleContinue}
          showPaywall={showPaywall}
          meta={meta}
          router={router}
          setShowPaywall={setShowPaywall}
          setHistory={setHistory}
        />
      )}

      <ChapterUnlockPopup
        visible={showChapterPopup}
        title={page?.chapter?.title}
        confettiKey={confettiKey}
      />
      <ChapterSelectMenu
        visible={chapterMenuVisible}
        onClose={() => setChapterMenuVisible(false)}
        unlockedChapters={unlockedChapters}
        onSelectChapter={(item) => {
          setChapterMenuVisible(false);
          if (item.id === "home") {
            router.replace("/");
          } else {
            setCurrentPageId(item.id);
          }
        }}
        currentPageId={currentPageId}
      />
    </View>
  );
}

export default () => (
  <StoryLoaderGate>
    <StoryScreen />
  </StoryLoaderGate>
);

export function stripEmoji(text: string): string {
  const emojiRegex = /^[\p{Extended_Pictographic}\uFE0F\s]+/u;
  return text.replace(emojiRegex, "").trim();
}
