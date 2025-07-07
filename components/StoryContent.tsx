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
  const [fullPath, setFullPath] = useState(
    getFullPathFromCurrent(page?.id, story)
  );

  useEffect(() => {
    const newPath = getFullPathFromCurrent(page?.id, story);
    setFullPath(newPath);
    const index = newPath.indexOf(page?.id);
    if (index !== -1) setDotIndex(index);
  }, [page?.id, story]);

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
      onMoveShouldSetPanResponder: () => true,
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

        const nextId = currentPage.choices[0]?.nextId;

        if (isGameOverPage) return;

        if (Math.abs(dx) < 10) {
          if (isSingleContinue && currentPage?.choices?.length === 1) {
            Haptics.selectionAsync();
            handleChoice(pageRef.current.id, nextId);
          } else {
            choiceRefs.current.forEach((ref) => ref?.pulse?.());
          }
        } else if (dx < -threshold) {
          if (isSingleContinue && currentPage?.choices?.length === 1) {
            Haptics.selectionAsync();
            handleChoice(pageRef.current.id, nextId);
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

      <Animated.View style={[s.textContainer, { opacity: fadeAnim }]}>
        <Text style={s.storyText}>{page.text}</Text>
      </Animated.View>

      <View style={s.storyContent} pointerEvents="box-none">
        {page.choices.length > 1 && (
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
                      handleChoice(pageRef.current.id, choice.nextId);
                    }
                  }}
                  style={s.choiceButton}
                  textStyle={s.choiceText}
                />
              );
            })}
          </View>
        )}
      </View>

      {fullPath.length > 0 && (
        <View style={styles.choiceTracker}>
          {fullPath.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === dotIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
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
    },
    inactiveDot: {
      backgroundColor: theme === "dark" ? "#555" : "#ccc",
    },
  });

export default StoryContent;
