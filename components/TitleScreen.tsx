import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { clearProgress, getLastPlayedStory } from "../storage/progressManager";
import GleamingButton from "./GleamingButton";
import { useLanguage } from "../localization/LanguageProvider";

// 👇 Import your background image
const background = require("../assets/images/Two-Roads.png");

export default function TitleScreen() {
  const { theme } = useTheme();
  const s = styles(theme);
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [lastPlayed, setLastPlayed] = useState(null);

  // Animations for dramatic title
  const [fatesAnim] = useState(new Animated.Value(100)); // Fates slides from right
  const [parallelAnim] = useState(new Animated.Value(-100)); // Parallel slides from left
  const [opacityAnim] = useState(new Animated.Value(0)); // Initial fade-in

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fatesAnim, {
        toValue: 0,
        duration: 2000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(parallelAnim, {
        toValue: 0,
        duration: 2000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      const progress = await getLastPlayedStory();
      console.log("📦 Last Played Progress:", progress);
      setLastPlayed(progress);
    };
    fetchProgress();
  }, [t]);

  return (
    <ImageBackground
      source={background}
      style={s.background}
      resizeMode="cover"
    >
      <View style={s.overlay}>
        <View style={s.content}>
          <Animated.View style={{ opacity: opacityAnim }}>
            <View style={s.titleContainer}>
              <Animated.Text
                style={[
                  s.parallel,
                  { transform: [{ translateX: parallelAnim }] },
                ]}
              >
                {t("titleScreen.mainTitleTop")}
              </Animated.Text>
              <Animated.Text
                style={[s.fates, { transform: [{ translateX: fatesAnim }] }]}
              >
                           {t("titleScreen.mainTitleBottom")}
              </Animated.Text>
            </View>
          </Animated.View>

          <GleamingButton
            title={`⚔️ ${t("titleScreen.start")}`}
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/storyList");
            }}
            accessibilityRole="button"
            accessibilityLabel={t("accessibility.startStoryTitleScreen")}
            accessible={true}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    background: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor:
        theme === "dark" ? "rgba(0, 0, 0, 0.0)" : "rgba(255, 255, 255, 0.0)",
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    titleContainer: {
      alignItems: "center",
      marginBottom: 48,
    },
    parallel: {
      fontSize: 48,
      fontWeight: "600",
      color: "#ffffff",
      letterSpacing: 1.2,
      textShadowColor: "rgba(255,255,255,0.25)",
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
    },
    fates: {
      fontSize: 48,
      fontWeight: "600",
      color: "#ffffff",
      letterSpacing: 2,
      textShadowColor: "rgba(255,255,255,0.35)",
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
    },
  });
