import { useLanguage } from "../localization/LanguageProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { SAMPLE_LIMIT, TESTING } from "../constants/Constants";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
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

const StoryScreen = () => {
  const { meta, story } = useStory();
  return <ActualStoryEngine meta={meta} story={story} />;
};

function ActualStoryEngine({ meta, story, resumePageId }) {
  const [unlockedChapters, setUnlockedChapters] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [page, setPage] = useState(null); // NEW: page from useEffect
  const [history, setHistory] = useState([]);
  const [decisionCount, setDecisionCount] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showPaywall, setShowPaywall] = useState(false);
  const [showChapterPopup, setShowChapterPopup] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [lastShownChapterId, setLastShownChapterId] = useState(null);
  const router = useRouter();
  const { t } = useLanguage();

  const startPageId = "intro";

  // Load saved progress
  useEffect(() => {
    const load = async () => {
      const savedPageId = await loadProgress(meta.id);
      const initialPage = savedPageId || startPageId;
      setCurrentPageId(initialPage);

      try {
        const savedChapters = await AsyncStorage.getItem(
          `unlockedChapters-${meta.id}`
        );
        if (savedChapters) {
          const parsed = JSON.parse(savedChapters);
          setUnlockedChapters(parsed);
        }
      } catch (err) {
        console.warn("Failed to load unlocked chapters:", err);
      }
    };
    load();
  }, []);

  // Keep page in sync with currentPageId
  useEffect(() => {
    const found = story.find((p) => p.id === currentPageId);
    console.log("✅ currentPageId changed:", currentPageId);
    setPage(found || null);
  }, [currentPageId, story]);

  // Page fade-in animation
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
    if (currentPageId) fadeIn();
  }, [currentPageId]);

  // Handle chapter unlock
  useEffect(() => {
    if (!page || !page.chapter?.title || currentPageId === lastShownChapterId)
      return;

    const alreadyUnlocked = unlockedChapters.some(
      (ch) => ch.id === currentPageId
    );
    if (!alreadyUnlocked) {
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

      AsyncStorage.setItem(
        `unlockedChapters-${meta.id}`,
        JSON.stringify(updated)
      ).catch((err) => console.warn("Failed to save unlocked chapters:", err));

      setUnlockedChapters(updated);
    }

    setLastShownChapterId(currentPageId);

    const timeout = setTimeout(() => setShowChapterPopup(false), 2500);
    return () => clearTimeout(timeout);
  }, [page]);

  // Determine if this is a single "Continue" button
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

  // Handle user making a choice
  const handleChoice = async (nextId) => {
    console.log("The next ID:", nextId);
    console.log("Prev:", [...history, currentPageId]);
    console.log("Current Page ID:", currentPageId);

    setHistory((prev) => [...prev, currentPageId]);
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
        visible={false}
        onClose={() => {}}
        unlockedChapters={unlockedChapters}
        onSelectChapter={(item) => {
          if (item.id === "home") {
            router.replace("/");
          } else {
            setCurrentPageId(item.id);
          }
        }}
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
  // This removes emojis and common variation selectors (e.g., U+FE0F)
  const emojiRegex = /^[\p{Extended_Pictographic}\uFE0F\s]+/u;
  return text.replace(emojiRegex, "").trim();
}
