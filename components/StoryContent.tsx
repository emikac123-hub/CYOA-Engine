import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "context/ThemeContext";
import { storyStyles } from "./storyStyles";
import ChoiceButton from "./ChoiceButton";
import { useLanguage } from "localization/LanguageProvider";
import { clearProgressOnly } from "storage/progressManager";

const StoryContent = ({
  page,
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
  const choiceRefs = useRef([]);
  const { t } = useLanguage();
  // Track latest page and history with refs
  const pageRef = useRef(page);
  const historyRef = useRef(history);


  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);
  const handleGameOver = async () => {
    const storyId = meta?.id;
    if (storyId) {
      await clearProgressOnly(storyId);
    }
    router.replace("/storyList"); // or router.push if you want stack behavior
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

        // ✅ NEW: Determine dynamically if it's a Game Over page
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
        if (isGameOverPage) {
          console.log("🚫 Swipe disabled — Game Over page");
          return;
        }
        if (Math.abs(dx) < 10) {
          // Tap
          if (isSingleContinue && currentPage?.choices?.length === 1) {
            Haptics.selectionAsync();
            handleChoice(pageRef.current.id, nextId);
          } else {
            choiceRefs.current.forEach((ref) => ref?.pulse?.());
          }
        } else if (dx < -threshold) {
          // Swipe left
          if (isSingleContinue && currentPage?.choices?.length === 1) {
            const nextId = currentPage.choices[0]?.nextId;
            Haptics.selectionAsync();
            handleChoice(pageRef.current.id, nextId);
          } else {
            choiceRefs.current.forEach((ref) => ref?.pulse?.());
          }
        } else if (dx > threshold && currentHistory.length > 0) {
          // Swipe right
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
        {!isSingleContinue && (
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

      {showPaywall && (
        <View style={s.paywall}>
          <Text style={s.paywallText}>
            Buy “{meta.title}” to continue reading!
          </Text>
          <Animated.View style={s.purchaseButton}>
            <Text style={s.purchaseButtonText}>
              {meta?.price ? `$${meta.price}` : "$1.99"}
            </Text>
          </Animated.View>
          <Text onPress={() => router.replace("/")} style={s.cancelText}>
            {t("paywall.returnToTitle")}
          </Text>
        </View>
      )}
    </View>
  );
};

export default StoryContent;
