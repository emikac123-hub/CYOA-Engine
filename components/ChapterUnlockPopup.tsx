import React, { useEffect, useRef } from "react";
import {
  Modal,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  AccessibilityProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ConfettiCannon from "react-native-confetti-cannon";
import { useLanguage } from "localization/LanguageProvider";
import { useTheme } from "context/ThemeContext";
import { stripEmoji } from "app/story";
import { PixelRatio } from "react-native";
import { Audio } from "expo-av";
import { useAccessibility } from "accessibility/AccessibilityService"; // adjust path if needed

type ChapterUnlockPopupProps = {
  visible: boolean;
  title: string | null;
  confettiKey: number;
  onClose: () => void;
} & AccessibilityProps;
const ChapterUnlockPopup = ({
  visible,
  title,
  confettiKey,
  onClose,
  accessibilityLabel,
  accessibilityRole,
  accessibilityViewIsModal,
  accessible,
}: ChapterUnlockPopupProps) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const s = styles(theme);
  const chapterUnlockedSound = useRef<Audio.Sound | null>(null);
  const titleRef = useRef<View>(null);
  const { isScreenReaderEnabled } = useAccessibility();
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (visible && isScreenReaderEnabled) {
      timeout = setTimeout(() => {
        onClose();
      }, 6000); // Auto-close after 6 seconds if accessibility is on
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [visible, isScreenReaderEnabled]);
  useEffect(() => {
    if (visible && titleRef.current) {
      titleRef.current.setNativeProps({ accessibilityFocus: true });
    }
  }, [visible]);
  useEffect(() => {
    let isMounted = true;
    const loadAndPlay = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/chapter-unlocked.wav")
      );
      chapterUnlockedSound.current = sound;
      if (visible && isMounted) {
        await sound.replayAsync();
      }
    };

    if (visible) {
      loadAndPlay();
    }

    return () => {
      isMounted = false;
      chapterUnlockedSound.current?.unloadAsync();
    };
  }, [visible]);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={t("accessibility.popupWillCloseAutomatically")}
      accessibilityViewIsModal={accessibilityViewIsModal}
      accessible={accessible}
      accessibilityRole={accessibilityRole}
    >
      {visible && (
        <View
          style={s.overlay}
          accessible={true}
          accessibilityViewIsModal={true}
          importantForAccessibility="yes"
        >
          <ConfettiCannon
            count={80}
            origin={{ x: 200, y: 0 }}
            explosionSpeed={300}
            fallSpeed={2000}
            fadeOut
            autoStart
            key={confettiKey}
          />
          <LinearGradient
            colors={["#FF5F6D", "#FFC371", "#47CACC", "#7A5FFF", "#FF5F6D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.gradientBorder}
          >
            <View style={s.innerBox} accessible={true} ref={titleRef}>
              <Text
                style={s.subtitle}
                allowFontScaling
                accessibilityRole="header"
                accessibilityLabel={t("accessibility.chapterUnlockedSubtitle")}
              >
                {t("unlockPopup.unlocked")}
              </Text>
              <Text
                style={s.title}
                allowFontScaling
                accessibilityLabel={t("accessibility.chapterUnlockedTitle", {
                  title: stripEmoji(title),
                })}
              >
                🎉 {stripEmoji(title)}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={s.okButton}
                accessibilityRole="button"
                accessibilityLabel={t("accessibility.okButton")}
              >
                <Text allowFontScaling style={s.okText}>
                  🫡 OK
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
    </Modal>
  );
};
const styles = (theme: "light" | "dark") => {
  const fontScale = PixelRatio.getFontScale();
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)", // semi-transparent overlay for both themes
      justifyContent: "center",
      alignItems: "center",
    },
    gradientBorder: {
      padding: 4,
      borderRadius: 16,
    },
    innerBox: {
      backgroundColor: theme === "dark" ? "#111" : "#fff",
      paddingVertical: 30,
      paddingHorizontal: 50,
      borderRadius: 12,
      alignItems: "center",
    },
    subtitle: {
      fontSize: 16,
      color: theme === "dark" ? "#bbb" : "#444",
      marginBottom: 8,
      fontWeight: "500",
    },
    title: {
      fontSize: 24,
      color: theme === "dark" ? "#fff" : "#000",
      fontWeight: "bold",
      textAlign: "center",
    },
    okButton: {
      marginTop: 20,
      paddingVertical: 10,
      paddingHorizontal: 30,
      backgroundColor: "#00ccff",
      borderRadius: 8,
    },
    okText: {
      color: "#fff",
      fontSize: 16 * fontScale,
      fontWeight: "600",
    },
  });
};
export default ChapterUnlockPopup;
