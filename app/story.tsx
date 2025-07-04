import { useLanguage } from "../localization/LanguageProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { SAMPLE_LIMIT, TESTING } from "../constants/Constants";
import React, { useEffect, useRef, useState } from "react";
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

const StoryScreen = () => {
  const { meta, story } = useStory();
  return <ActualStoryEngine meta={meta} story={story} />;
};

function ActualStoryEngine({ meta, story, resumePageId }) {
  const [unlockedChapters, setUnlockedChapters] = useState([]);
  const router = useRouter();
  const { t } = useLanguage();
  const [chapterMenuVisible, setChapterMenuVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [history, setHistory] = useState([]);
  const [decisionCount, setDecisionCount] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showPaywall, setShowPaywall] = useState(false);
  const [showChapterPopup, setShowChapterPopup] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [lastShownChapterId, setLastShownChapterId] = useState(null);

  const startPageId = "intro";

  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    if (history.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [history]);

  const page = story.find((p) => p.id === currentPageId);

  useEffect(() => {
    if (currentPageId) fadeIn();

    if (
      currentPageId &&
      page?.chapter?.title &&
      currentPageId !== lastShownChapterId
    ) {
      const isAlreadyUnlocked = unlockedChapters.some(
        (ch) => ch.id === currentPageId
      );

      if (!isAlreadyUnlocked) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setShowChapterPopup(true);
        setConfettiKey((prev) => prev + 1);

        setUnlockedChapters((prev) => {
          const newChapter = {
            title: page.chapter.title,
            order: page.chapter.order,
            id: currentPageId,
          };
          const chapterMap = new Map(prev.map((ch) => [ch.id, ch]));
          chapterMap.set(newChapter.id, newChapter);
          const updated = Array.from(chapterMap.values()).sort(
            (a, b) => a.order - b.order
          );

          AsyncStorage.setItem(
            `unlockedChapters-${meta.id}`,
            JSON.stringify(updated)
          ).catch((err) =>
            console.warn("Failed to save unlocked chapters:", err)
          );

          return updated;
        });
      }

      setLastShownChapterId(currentPageId);

      const timeout = setTimeout(() => {
        setShowChapterPopup(false);
      }, 2500);

      return () => clearTimeout(timeout);
    }
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

  const localizedContinue = t("titleScreen.continue").toLowerCase();
  const isSingleContinue =
    page?.choices?.length === 1 &&
    page.choices[0].text.trim().toLowerCase() === localizedContinue;

  const handleChoice = async (nextId) => {
    setHistory((prev) => [...prev, currentPageId]);
    const unlocked = await isStoryUnlocked(meta.id);
    const nextCount = decisionCount + 1;

    if (!unlocked && nextCount >= SAMPLE_LIMIT) {
      setShowPaywall(true);
      return;
    }
    if (unlocked || TESTING) {
      await saveProgress(meta.id, nextId);
    }
    setCurrentPageId(nextId);
    setDecisionCount(nextCount);
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          position: "absolute",
          top: 40,
          left: 20,
          zIndex: 10,
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Ionicons
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            name="settings-outline"
            size={28}
            color="#fff"
          />
        </TouchableOpacity>

        {history.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              const prev = [...history];
              const last = prev.pop();
              setHistory(prev);
              if (last) {
                setCurrentPageId(last);
              }
            }}
            style={{ marginTop: 6 }}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons
                name="arrow-back-outline"
                size={24}
                color="#fff"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      <View
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        style={{ position: "absolute", top: 40, right: 20, zIndex: 10 }}
      >
        <TouchableOpacity onPress={() => setChapterMenuVisible(true)}>
          <Ionicons name="list-outline" size={28} color="#fff" />
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
          } else if (item.id) {
            setCurrentPageId(item.id);
          }
        }}
      />

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
