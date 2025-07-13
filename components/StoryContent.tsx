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
import { clearProgressOnly, loadSavedPath } from "storage/progressManager";
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
  decisionPath,
}) => {
  const { theme } = useTheme();
  const s = storyStyles(theme);
  const styles = dotStyles(theme);
  const choiceRefs = useRef([]);
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const pageRef = useRef(page);
  const historyRef = useRef(history);
  const fallbackImage = require("../assets/images/Earth.png");

  const [pressFeedback, setPressFeedback] = useState(new Animated.Value(1));
  const flashOverlayOpacity = useRef(new Animated.Value(0)).current;

  const [resolvedImage, setResolvedImage] = useState(fallbackImage);
  const imageFadeAnim = useRef(new Animated.Value(1)).current;
  const previousImageRef = useRef(resolvedImage);
  const [showText, setShowText] = useState(true);
  const [overlayActive, setOverlayActive] = useState(false);
  const textOpacity = useRef(new Animated.Value(1)).current;
  const isIntro = page.id === "intro";
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const LAST_IMAGE_KEY = "lastUsedStoryImage";

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop(); // optional cleanup
  }, []);
  const handleRestoreText = () => {
    Haptics.selectionAsync();
    setShowText(true);
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    console.log("History: " + history);
    const resolveImage = async () => {
      let imagePath = page.image;

      if (!imagePath || imagePath.trim() === "") {
        // 🔁 Load last used image from AsyncStorage
        const lastImage = await AsyncStorage.getItem(LAST_IMAGE_KEY);
        if (lastImage && imageMap[lastImage]) {
          setResolvedImage(imageMap[lastImage]);
        } else {
          setResolvedImage(fallbackImage);
        }
      } else {
        // Store new image path and use it
        await AsyncStorage.setItem(LAST_IMAGE_KEY, imagePath);
        setResolvedImage(imageMap[imagePath] || fallbackImage);
      }
    };

    resolveImage();
  }, [page?.id]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Show brief flash (white overlay)
    Animated.sequence([
      Animated.timing(flashOverlayOpacity, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(flashOverlayOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Then fade out the text
    Animated.timing(textOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowText(false);
    });
  };

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
    if (decisionPath?.length && decisionPath.includes(page.id)) {
      setFullPath(decisionPath);
      setDotIndex(decisionPath.indexOf(page.id));
    }
  }, [decisionPath, page.id]);

  const handleGameOver = async () => {
    const storyId = meta?.id;
    if (storyId) {
      await clearProgressOnly(storyId);
    }
    router.replace("/storyList");
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        // Only claim responder if the swipe is primarily horizontal
        // and has moved a minimum distance.
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
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

        if (isGameOverPage || !showText) {
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
          console.log("Current History: ", currentHistory);
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
          </View>

          {(() => {
            const gameOverText = t("gameOver")?.toLowerCase();
            const hasGameOverInPath = decisionPath.some((id) => {
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
              ? decisionPath.length - 1
              : decisionPath.length;
            if (dotCount > 0 && isSingleContinue && decisionPath.length > 0) {
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
  });

export default StoryContent;
