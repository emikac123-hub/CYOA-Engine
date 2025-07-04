import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { DeleteButtonText} from "./DeleteButtonText"
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { clearProgress, getLastPlayedStory } from "../storage/progressManager";
import GleamingButton from "./GleamingButton";
import SettingsModal from "./SettingsMenu";
import { ThemedText } from "./ThemedText";
import { useLanguage } from "../localization/LanguageProvider";

export default function TitleScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      const progress = await getLastPlayedStory();
      setLastPlayed(progress);
    };
    fetchProgress();
  }, []);

  return (
    <View style={[styles.container, StyleSheet.absoluteFill]}>
      <TouchableOpacity
        style={[styles.gearIcon, { top: insets.top + 10 }]}
        onPress={() => setSettingsVisible(true)}
      >
        <Ionicons name="settings-outline" size={28} color="white" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <ThemedText style={styles.title}>
            {t("titleScreen.mainTitle")}
          </ThemedText>
        </Animated.View>

        <GleamingButton
          title={t("titleScreen.start")}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/storyList");
          }}
        />

        {lastPlayed && (
          <View style={styles.continueContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({
                  pathname: "/story",
                  params: {
                    id: lastPlayed.storyId,
                    resume: lastPlayed.pageId,
                  },
                });
              }}
            >
              <ThemedText style={styles.buttonText}>
                {t("titleScreen.continue", {
                  title: `🕹️ ${lastPlayed.title}`,
                })}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() =>
                Alert.alert(
                  t("titleScreen.delete"),
                  t("titleScreen.confirmClear"),
                  [
                    { text: t("titleScreen.cancel"), style: "cancel" },
                    {
                      text: t("titleScreen.ok"),
                      onPress: () => clearProgress(lastPlayed.storyId),
                    },
                  ],
                  { cancelable: false }
                )
              }
            >
              <ThemedText style={styles.buttonText}>
               <DeleteButtonText />
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: 44,
    lineHeight: 54,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 48,
    textAlign: "center",
    letterSpacing: 1,
    opacity: 0.95,
    textShadowColor: "rgba(255,255,255,0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  continueContainer: {
    marginTop: 28,
    width: "80%",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "transparent",
    borderColor: "rgba(255, 0, 0, 0.4)",
  },
  gearIcon: {
    position: "absolute",
    left: 20,
    zIndex: 10,
  },
});
