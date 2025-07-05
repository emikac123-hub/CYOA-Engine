import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

type Props = {
  onSettingsPress: () => void;
};

export default function ThemedHeader({ onSettingsPress }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const iconColor = theme === "dark" ? "#fff" : "#000";

  return (
    <View
      style={[
        styles.container,
        { top: insets.top + 10 },
      ]}
    >
      <TouchableOpacity onPress={onSettingsPress}>
        <Ionicons
          name="settings-outline"
          size={28}
          color={iconColor}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    zIndex: 100,
  },
});
