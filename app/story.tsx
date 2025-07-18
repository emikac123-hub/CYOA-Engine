import { useLanguage } from "../localization/LanguageProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SAMPLE_LIMIT } from "../constants/Constants";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  findMatchingDecisionPath,
  saveChapterProgress,
  saveDecisionPathWithKey,
} from "../storage/progressManager";
import { Animated, Easing, TouchableOpacity, View } from "react-native";
import { useAccessibility } from "../accessibility/AccessibilityService"; // adjust path as needed

import StoryLoaderGate, { useStory } from "../components/StoryLoaderGate";
import { loadProgress, saveProgress } from "../storage/progressManager";
import { isStoryUnlocked } from "../storage/unlockManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HISTORY_KEY_PREFIX } from "../storage/progressManager";
import StoryContent from "../components/StoryContent";
import ChapterUnlockPopup from "../components/ChapterUnlockPopup";
import ChapterSelectMenu from "../components/ChapterSelectMenu";
import { useTheme } from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FallbackBlurView from "components/FallBackBlurView";

const StoryScreen = () => {
  const { meta, story, chapters } = useStory(); // ✅ Now includes chapters
  return <ActualStoryEngine meta={meta} story={story} chapters={chapters} />;
};

function ActualStoryEngine({ meta, story, chapters, resumePageId }) {
  // Hooks
  const { t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, reset } = useLocalSearchParams();

  // State
  const [unlockedChapters, setUnlockedChapters] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [currentChapterTitle, setCurrentChapterTitle] = useState(null);
  const [page, setPage] = useState(null);
  const [history, setHistory] = useState([]);
  const [decisionCount, setDecisionCount] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showPaywall, setShowPaywall] = useState(false);
  const [showChapterPopup, setShowChapterPopup] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [lastShownChapterId, setLastShownChapterId] = useState(null);
  const [chapterMenuVisible, setChapterMenuVisible] = useState(false);

  // Refs
  const previousPageIdRef = useRef(null);
  const startPageId = "intro";

  // Helper Functions
  const fadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const getFullPathFromCurrent = (startId, story): string[] => {
    const path: string[] = [];
    let currentId = startId;
    while (true) {
      const currentPage = story.find((p) => p.id === currentId);
      if (!currentPage) break;

      path.push(currentId);

      const choices = currentPage.choices;
      if (!choices || choices.length !== 1) {
        break; // stop at game-over or multi-choice
      }
      currentId = choices[0].nextId;
    }
    return path;
  };

  const handleChoice = async (fromId: string, nextId: string) => {
    setHistory((prev) => [...prev.filter((id) => id !== "GameOver"), fromId]);

    if (currentPageId === "GameOver") {
      router.replace("/");
      return;
    }

    const unlocked = await isStoryUnlocked(meta.id);
    const nextCount = decisionCount + 1;
    if (!unlocked && nextCount >= SAMPLE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    const currentPage = story.find((p) => p.id === fromId);
    const newDecisionPath = getFullPathFromCurrent(nextId, story);
    if (currentPage?.choices.length > 1) {
      await saveDecisionPathWithKey(meta.id, nextId, newDecisionPath);
    }

    if (!newDecisionPath.includes("GameOver")) {
      await saveProgress(meta.id, nextId);
    }
    setCurrentPageId(nextId);
    setDecisionCount(nextCount);
  };

  // Memoized Values
  // Determines if the current page should auto-advance with a single "Continue" button.
  // This logic ensures the page only auto-continues when:
  // - There is exactly one choice
  // - The choice text matches the expected "Continue" string (localized and stripped of symbols)
  // - VoiceOver or TalkBack is NOT active (for accessibility, we want screen reader users to explicitly activate buttons)
  const { isScreenReaderEnabled } = useAccessibility();
  const isSingleContinue = useMemo(() => {
    if (isScreenReaderEnabled) return false; // Show the continue button in screen read mode.
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

  // Effects

  // Initial Load
  useEffect(() => {
    const loadInitialState = async () => {
      const allPageIds = new Set(story.map((p) => p.id));
      let initialPageId: string | null = null;

      try {
        const savedPageId =
          reset === "true" ? null : await loadProgress(meta.id);
        const savedHistory = await AsyncStorage.getItem(
          `${HISTORY_KEY_PREFIX}${meta.id}`
        );
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
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
                ? { id: ch.id, order: ch.order, title: found.title }
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

  // Page and State Syncing
  useEffect(() => {
    const found = story.find((p) => p.id === currentPageId);
    setPage(found || null);
  }, [currentPageId, story]);

  // Animation
  useEffect(() => {
    if (currentPageId && currentPageId !== previousPageIdRef.current) {
      fadeIn();
      previousPageIdRef.current = currentPageId;
    }
  }, [currentPageId]);

  // Persistence
  useEffect(() => {
    if (meta?.id && history.length > 0) {
      AsyncStorage.setItem(
        `${HISTORY_KEY_PREFIX}${meta.id}`,
        JSON.stringify(history)
      ).catch((err) => console.warn("Failed to save history:", err));
    }
  }, [history]);

  useEffect(() => {
    const maybeSaveDecisionPath = async () => {
      if (!page?.id) return;
      const decisionPath = getFullPathFromCurrent(page.id, story);
      const existing = await findMatchingDecisionPath(meta.id, page.id);
      if (!existing) {
        await saveDecisionPathWithKey(meta.id, page.id, decisionPath);
      }
    };
    maybeSaveDecisionPath();
  }, [currentPageId, page, story, meta.id]);

  // Chapter Unlocking
  useEffect(() => {
    if (!page || currentPageId === lastShownChapterId) return;

    const foundChapter = chapters.find((ch) => ch.id === currentPageId);
    if (!foundChapter) return;

    const alreadyVisible = unlockedChapters.some(
      (ch) => ch.id === currentPageId
    );
    if (alreadyVisible) return;

    const unlockNewChapter = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setShowChapterPopup(true);
      setConfettiKey((prev) => prev + 1);
      setCurrentChapterTitle(foundChapter.title);

      const newChapter = {
        title: foundChapter.title,
        order: foundChapter.order,
        id: currentPageId,
      };

      const updated = [...unlockedChapters, newChapter]
        .filter(
          (v, i, a) =>
            a.findIndex((t) => stripEmoji(t.title) === stripEmoji(v.title)) ===
            i
        )
        .sort((a, b) => a.order - b.order);

      await AsyncStorage.setItem(
        `unlockedChapters-${meta.id}`,
        JSON.stringify(updated)
      );
      await saveChapterProgress(meta.id, currentPageId);

      setUnlockedChapters(updated);
      setLastShownChapterId(currentPageId);
    };

    unlockNewChapter();
  }, [page, chapters, unlockedChapters, lastShownChapterId, meta.id]);

  // Debugging
  useEffect(() => {
    console.log("🧠 History:", history);
  }, [history]);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          position: "absolute",
          top: insets.top + 10,
          right: 20,
          zIndex: 10,
        }}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel={t("accessibility.chapterMenuButtonHeader")}
      >
        <TouchableOpacity
          onPress={() => setChapterMenuVisible(true)}
          accessibilityLabel={t("accessibility.openChapterMenu")}
          accessibilityRole="button"
        >
          <FallbackBlurView
            tint={theme === "dark" ? "dark" : "light"}
            intensity={60}
            style={{
              width: 44,
              height: 44,
              overflow: "hidden",
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="book-outline"
              color={theme === "dark" ? "white" : "black"}
              size={24}
            />
          </FallbackBlurView>
        </TouchableOpacity>
      </View>

      {page && (
        <StoryContent
          page={page}
          story={story}
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
        title={currentChapterTitle}
        confettiKey={confettiKey}
        onClose={() => {
          setShowChapterPopup(false);
        }}
        accessibilityLabel={t("accessibility.chapterUnlockedPopup")}
        accessibilityViewIsModal={true}
        accessible={true}
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
        allChapters={chapters}
        accessibilityLabel={t("accessibility.chapterMenuList")}
        accessibilityViewIsModal={true}
        accessible={false}
      />
    </View>
  );
}

export default function StoryWrapper() {
  const { id } = useLocalSearchParams();
  const storyId = id;
  return (
    <StoryLoaderGate storyId={storyId}>
      <StoryScreen />
    </StoryLoaderGate>
  );
}

export function stripEmoji(text: string): string {
  const emojiRegex = /^[\p{Extended_Pictographic}\uFE0F\s]+/u;
  return text.replace(emojiRegex, "").trim();
}
