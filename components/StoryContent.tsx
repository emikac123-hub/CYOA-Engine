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
  ImageBackground,
  Easing,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";
import { useTheme } from "context/ThemeContext";
import { storyStyles } from "./storyStyles";
import { useLanguage } from "localization/LanguageProvider";
import {
  clearProgressOnly,
  findMatchingDecisionPath,
} from "storage/progressManager";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BlurView } from "expo-blur";
import imageMap from "assets/imageMap";
import ChoiceButton from "./ChoiceButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FallbackBlurView from "./FallBackBlurView";

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
  // Hooks
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  // Styles
  const s = storyStyles(theme);
  const styles = dotStyles(theme);

  // Refs
  const choiceRefs = useRef([]);
  const pageRef = useRef(page);
  const historyRef = useRef(history);
  const flashOverlayOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // State
  const [resolvedImage, setResolvedImage] = useState(null);
  const [showText, setShowText] = useState(true);
  const [pageX, setPageX] = useState(1);
  const [pageY, setPageY] = useState(1);

  // Constants
  const isIntro = page.id === "intro";
  const fallbackImage = require("../assets/images/Earth.png");
  const LAST_IMAGE_KEY = "lastUsedStoryImage";

  // Helper Functions
  const getPageCounter = (path: string[], currentPageId: string): { x: number; y: number } => {
    const index = path.indexOf(currentPageId);
    return index === -1 ? { x: 0, y: path.length } : { x: index + 1, y: path.length };
  };

  const handleRestoreText = () => {
    Haptics.selectionAsync();
    setShowText(true);
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.sequence([
      Animated.timing(flashOverlayOpacity, { toValue: 0.5, duration: 100, useNativeDriver: true }),
      Animated.timing(flashOverlayOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
    Animated.timing(textOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowText(false));
  };

  const handleGameOver = async () => {
    if (meta?.id) {
      await clearProgressOnly(meta.id);
    }
    router.replace("/storyList");
  };

  // Effects

  // Pulse Animation for Intro
  useEffect(() => {
    if (!isIntro) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isIntro]);

  // Update Refs
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Image Resolving
  useEffect(() => {
    const resolveImage = async () => {
      let imagePath = page.image;
      if (!imagePath || imagePath.trim() === "") {
        const lastImage = await AsyncStorage.getItem(LAST_IMAGE_KEY);
        setResolvedImage(imageMap[lastImage] || fallbackImage);
      } else {
        await AsyncStorage.setItem(LAST_IMAGE_KEY, imagePath);
        setResolvedImage(imageMap[imagePath] || fallbackImage);
      }
    };
    resolveImage();
  }, [page?.id]);

  // Path and Counter Resolving
  useEffect(() => {
    const resolvePathAndCounter = async () => {
      try {
        const matchingPath = await findMatchingDecisionPath(meta.id, page.id);
        if (matchingPath) {
          const { x, y } = getPageCounter(matchingPath, page.id);
          setPageX(x);
          setPageY(y);
        } else {
          setPageX(1);
          setPageY(1);
        }
      } catch (error) {
        console.error("Error resolving path/counter:", error);
      }
    };
    resolvePathAndCounter();
  }, [page.id, meta.id]);

  // Pan Responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        const threshold = 50;
        const currentPage = pageRef.current;
        const currentHistory = historyRef.current;
        const gameOverText = t("gameOver")?.toLowerCase();
        const isGameOverPage = currentPage?.choices?.some(
          (choice) =>
            choice.text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim().toLowerCase() === gameOverText
        );

        if (isGameOverPage || !showText) {
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
    <>
      {showText && page?.choices?.length === 1 && (
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            handleChoice(page.id, page.choices[0]?.nextId);
          }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "30%",
            zIndex: 10,
          }}
          accessibilityLabel={t("accessibility.tapToContinue")}
          accessibilityRole="button"
        />
      )}

      <ImageBackground
        source={resolvedImage}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor:
              theme === "dark"
                ? "rgba(0, 0, 0, 0.0)"
                : "rgba(255, 255, 255, 0.0)",
          }}
        />
        <View {...panResponder.panHandlers} style={s.container}>
          <Animated.View
            style={[s.textContainer, { opacity: fadeAnim }]}
            accessible={true}
            accessibilityLabel={page.text}
            accessibilityRole="text"
          >
            <ScrollView
              contentContainerStyle={[
                s.scrollContainer,
                {
                  paddingTop: insets.top + 12,
                  paddingBottom: 24,
                  flex: 1,
                  justifyContent: "center",
                },
              ]}
              showsVerticalScrollIndicator={true}
            >
              {!showText && isIntro && (
                <View style={s.tapToRevealMessage}>
                  <Text style={s.tapToRevealText}>
                    {`👆 ${t("hint.tapToRestore")}` ||
                      " Tap the screen to bring back the text"}
                  </Text>
                </View>
              )}
              {page.text?.length > 1 && showText ? (
                <Animated.View
                  style={[s.blurWrapper, { opacity: textOpacity }]}
                >
                  <Pressable onLongPress={handleLongPress} delayLongPress={500}>
                    {({ pressed }) => (
                      <FallbackBlurView
                        intensity={50}
                        tint={theme}
                        style={[
                          s.blurContainer,
                          { opacity: pressed ? 0.5 : 1 },
                        ]}
                      >
                        {/* Flash overlay */}
                        <Animated.View
                          style={[
                            StyleSheet.absoluteFillObject,
                            {
                              backgroundColor: "white",
                              opacity: flashOverlayOpacity,
                            },
                          ]}
                          pointerEvents="none"
                        />

                        {/* Main story text */}
                        <Text style={s.storyText}>{page.text}</Text>

                        {/* Hint text with pulse */}
                        {isIntro && (
                          <Animated.View
                            style={{ transform: [{ scale: pulseAnim }] }}
                          >
                            <Text style={s.hintText}>
                              👆 {t("hint.longPressToReveal")}
                            </Text>
                          </Animated.View>
                        )}
                      </FallbackBlurView>
                    )}
                  </Pressable>
                </Animated.View>
              ) : (
                <TouchableWithoutFeedback onPress={handleRestoreText}>
                  <View style={s.tapToRevealArea} />
                </TouchableWithoutFeedback>
              )}
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
                        //    updatePathForCurrent(choice.nextId);
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
            {isSingleContinue && (
              <Text
                style={styles.pageCounter}
                accessibilityLabel={t("accessibility.pageProgress", {
                  current: pageX,
                  total: pageY,
                })}
                accessibilityRole="text"
              >
                {pageX} / {pageY}
              </Text>
            )}
          </View>
        </View>
      </ImageBackground>
    </>
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
    scrollContainer: {
      paddingHorizontal: 20,
    },
    pageCounter: {
      position: "absolute",
      bottom: 16,
      alignSelf: "center",
      fontSize: 14,
      fontWeight: "600",
      color: theme === "dark" ? "#ccc" : "#444",
      backgroundColor:
        theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      overflow: "hidden",
    },
  });

export default StoryContent;
