import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "context/ThemeContext";
import { storyStyles } from "./storyStyles";
import ChoiceButton from "./ChoiceButton";
import { useLanguage } from "localization/LanguageProvider";
import { clearProgressOnly } from "storage/progressManager";

const StoryContent = ({
  page,
  story,
  fadeAnim,
  handleChoice,
  history,
  setCurrentPageId,
  isSingleContinue,
  showPaywall,
  meta,
  router,
  setShowPaywall,
  setHistory,
}) => {
  const { theme } = useTheme();
  const s = storyStyles(theme);
  const styles = dotStyles(theme);
  const choiceRefs = useRef([]);
  const { t } = useLanguage();

  const pageRef = useRef(page);
  const historyRef = useRef(history);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const getFullPathFromCurrent = (currentPageId, story) => {
    let path = [];
    let currentId = currentPageId;
    while (true) {
      const currentPage = story.find((p) => p.id === currentId);
      if (
        !currentPage ||
        !currentPage.choices ||
        currentPage.choices.length !== 1
      )
        break;
      path.push(currentId);
      currentId = currentPage.choices[0].nextId;
    }
    return path;
  };

  const [dotIndex, setDotIndex] = useState(0);
  const [basePageId, setBasePageId] = useState(page?.id);
  const [fullPath, setFullPath] = useState(() =>
    getFullPathFromCurrent(page?.id, story)
  );

  const updatePathForCurrent = (currentId) => {
    setBasePageId(currentId);
    const newPath = getFullPathFromCurrent(currentId, story);
    setFullPath(newPath);
    setDotIndex(0);
  };

  useEffect(() => {
    const isOnSinglePath = page?.choices?.length === 1;
    const index = fullPath.indexOf(page?.id);

    if (!isOnSinglePath || index === -1) {
      updatePathForCurrent(page?.id);
    } else {
      setDotIndex(index);
    }
  }, [page?.id]);

  const handleGameOver = async () => {
    const storyId = meta?.id;
    if (storyId) {
      await clearProgressOnly(storyId);
    }
    router.replace("/storyList");
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture if it's mostly horizontal movement
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy); // horizontal > vertical
      },
      onPanResponderRelease: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const dx = gestureState.dx;
        const threshold = 50;
        const currentPage = pageRef.current;
        const currentHistory = historyRef.current;

        const gameOverText = t("gameOver")?.toLowerCase();
        const isGameOverPage = currentPage?.choices?.some(
          (choice) =>
            choice.text
              .replace(
                /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
                ""
              )
              .trim()
              .toLowerCase() === gameOverText
        );

        if (isGameOverPage) {
          // 🚫 Disable all gestures — must tap button
          console.log("🚫 Gestures blocked on Game Over screen");
          return;
        }

        const nextId = currentPage.choices[0]?.nextId;

        if (Math.abs(dx) < 10) {
          if (currentPage?.choices?.length === 1) {
            Haptics.selectionAsync();
            handleChoice(currentPage.id, nextId);
          } else {
            choiceRefs.current.forEach((ref) => ref?.pulse?.());
          }
        } else if (dx < -threshold) {
          if (currentPage?.choices?.length === 1) {
            Haptics.selectionAsync();
            handleChoice(currentPage.id, nextId);
          } else {
            choiceRefs.current.forEach((ref) => ref?.pulse?.());
          }
        } else if (dx > threshold && currentHistory.length > 0) {
          const prev = [...currentHistory];
          const last = prev.pop();
          setHistory(prev);
          if (last) {
            setCurrentPageId(last);
          }
        }
      },
    })
  ).current;

  return (
    <View {...panResponder.panHandlers} style={s.container}>
      {page?.image && (
        <Image
          source={{ uri: page.image }}
          style={s.image}
          resizeMode="cover"
        />
      )}

      <Animated.View
        style={[s.textContainer, { opacity: fadeAnim }]}
        accessible={true}
        accessibilityLabel={page.text}
        accessibilityRole="text"
      >
        <ScrollView
          contentContainerStyle={s.scrollContainer}
          showsVerticalScrollIndicator={false}
          
        >
          <Text allowFontScaling style={s.storyText}>
            {page.text}
          </Text>
        </ScrollView>
      </Animated.View>

      <View style={s.storyContent} pointerEvents="box-none">
        <View style={s.choicesContainer}>
          {page.choices.map((choice, index) => {
            const stripped = choice.text
              .replace(
                /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
                ""
              )
              .trim()
              .toLowerCase();
            const gameOverText = t("gameOver")?.toLowerCase();
            const isGameOver = stripped === gameOverText;
            if (isSingleContinue) return;
            return (
              <ChoiceButton
                key={index}
                ref={(el) => (choiceRefs.current[index] = el)}
                text={choice.text}
                onPress={() => {
                  Haptics.selectionAsync();
                  if (isGameOver) {
                    handleGameOver();
                  } else {
                    updatePathForCurrent(choice.nextId);
                    handleChoice(pageRef.current.id, choice.nextId);
                  }
                }}
                style={s.choiceButton}
                textStyle={s.choiceText}
                isGameOverButton={isGameOver}
              />
            );
          })}
        </View>
      </View>
      {(() => {
        const gameOverText = t("gameOver")?.toLowerCase();
        const hasGameOverInPath = fullPath.some((id) => {
          const p = story.find((pg) => pg.id === id);
          return p?.choices?.some(
            (choice) =>
              choice.text
                .replace(/[^\p{L}\p{N}\s]/gu, "")
                .trim()
                .toLowerCase() === gameOverText
          );
        });

        const dotCount = hasGameOverInPath
          ? fullPath.length - 1
          : fullPath.length;
        if (dotCount > 0) {
          return (
            <View
              style={styles.choiceTracker}
              accessible={true}
              accessibilityLabel={t("accessibility.pageProgress", {
                current: dotIndex + 1,
                total: dotCount,
              })}
              accessibilityRole="progressbar"
            >
              {Array.from({ length: dotCount }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === dotIndex ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          );
        }

        return null;
      })()}
    </View>
  );
};

const dotStyles = (theme) =>
  StyleSheet.create({
    choiceTracker: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 3,
    },
    activeDot: {
      backgroundColor: "#00ccff",
      transform: [{ scale: 1.2 }],
      width: 10,
      height: 10,
      borderRadius: 5,
      shadowColor: theme === "dark" ? "yellow" : "#00ccff",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 4,
      elevation: 4, // for Android
    },
    inactiveDot: {
      backgroundColor: theme === "dark" ? "#555" : "#ccc",
    },
  });

export default StoryContent;
