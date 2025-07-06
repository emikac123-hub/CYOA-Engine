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

  // ✅ Track current page via ref for gesture access
  const pageRef = useRef(page);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const dx = gestureState.dx;
        console.log("📲 Gesture dx:", dx);
        const threshold = 50;
        const currentPage = pageRef.current;

        if (Math.abs(dx) < 10) {
          // Treat as tap
          console.log("⚡ Tap detected");
          if (isSingleContinue && currentPage?.choices?.length === 1) {
            const nextId = currentPage.choices[0].nextId;
            console.log("➡️ Continue to:", nextId);
            Haptics.selectionAsync();
            handleChoice(nextId);
          } else {
            choiceRefs.current.forEach((ref) => ref?.pulse?.());
          }
        } else if (
          dx < -threshold &&
          isSingleContinue &&
          currentPage?.choices?.length === 1
        ) {
          // Swipe left → continue
          const nextId = currentPage.choices[0].nextId;
          console.log("➡️ Swipe left to:", nextId);
          Haptics.selectionAsync();
          handleChoice(nextId);
        } else if (dx > threshold && history.length > 0) {
          // Swipe right → go back
          console.log("⬅️ Swipe right to go back");
          const prev = [...history];
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
            {page.choices.map((choice, index) => (
              <ChoiceButton
                key={index}
                ref={(el) => (choiceRefs.current[index] = el)}
                text={choice.text}
                onPress={() => {
                  Haptics.selectionAsync();
                  handleChoice(choice.nextId);
                }}
                style={s.choiceButton}
                textStyle={s.choiceText}
              />
            ))}
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
            Back to story list
          </Text>
        </View>
      )}
    </View>
  );
};

export default StoryContent;
