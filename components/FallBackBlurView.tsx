import React from "react";
import { View, Platform, StyleSheet, ViewStyle, AccessibilityProps } from "react-native";
import { BlurView } from "expo-blur";
import { blurSupported } from "./PlatformService";

type Props = {
  intensity?: number;
  tint?: "light" | "dark";
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
} & AccessibilityProps;

export default function FallbackBlurView({
  intensity = 50,
  tint = "dark",
  style,
  children,
  ...accessibilityProps
}: Props) {
  if (blurSupported()) {
    return (
      <BlurView
        intensity={intensity}
        tint={tint}
        style={style}
        {...accessibilityProps}
      >
        {children}
      </BlurView>
    );
  }

  const fallbackStyle =
    tint === "light"
      ? [styles.fallbackLight, style]
      : [styles.fallbackDark, style];

  return (
    <View style={fallbackStyle} {...accessibilityProps}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackDark: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  fallbackLight: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
});
