import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet, // ✅ Add this
} from "react-native";
import { useLanguage } from "../localization/LanguageProvider";
import { useWindowDimensions } from "react-native";
import { useTheme } from "context/ThemeContext";

export const DeleteButtonText = () => {
  const { theme } = useTheme();
  const s = styles(theme);
  const { t } = useLanguage();
  const [fontSize, setFontSize] = useState(16);
  const windowWidth = useWindowDimensions().width;

  const label = `${t("titleScreen.delete")}`;

  useEffect(() => {
    // crude but effective: shrink font if too long
    if (label.length > 20 || windowWidth < 350) {
      setFontSize(14);
    } else {
      setFontSize(16);
    }
  }, [label, windowWidth]);

  return (
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={[s.buttonText, { fontSize }]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={t("accessibility.deleteStoryProgress")}
    >
      {label}
    </Text>
  );
};
const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    buttonText: {
      color: theme === "dark" ? "#ffffff" : "#000000",
      fontSize: 17,
      fontWeight: "500",
      letterSpacing: 0.3,
    },
    deleteButton: {
      backgroundColor:
        theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderColor:
        theme === "dark" ? "rgba(255, 0, 0, 0.4)" : "rgba(200, 0, 0, 0.6)",
    },
    deleteText: {
      color: theme === "dark" ? "#ff4d4d" : "#cc0000",
    },
  });
