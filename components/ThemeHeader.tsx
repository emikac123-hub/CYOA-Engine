import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  AccessibilityProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import FallbackBlurView from "./FallBackBlurView";

type Props = {
  onSettingsPress: () => void;
} & AccessibilityProps;

export default function ThemedHeader({ onSettingsPress, ...a11yProps }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const iconColor = theme === "dark" ? "#fff" : "#000";

  return (
    <View style={[styles.container, { top: insets.top + 10 }]}>
      <FallbackBlurView
        tint={theme === "dark" ? "dark" : "light"}
        intensity={60}
        style={styles.blurWrapper}
      >
        <TouchableOpacity
          onPress={onSettingsPress}
          accessibilityRole="button"
          accessibilityLabel="Open settings menu"
          accessible={true}
          {...a11yProps}
        >
          <Ionicons
            name="settings-outline"
            size={28}
            color={iconColor}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
        </TouchableOpacity>
      </FallbackBlurView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    zIndex: 1000,
  },
  blurWrapper: {
    borderRadius: 100,
    padding: 8,
    overflow: "hidden",
  },
});