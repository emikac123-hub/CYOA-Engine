import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  useWindowDimensions,
  PixelRatio,
} from "react-native";
import { useLanguage } from "../localization/LanguageProvider";
import { useTheme } from "context/ThemeContext";

export const DeleteButtonText = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const label = `${t("titleScreen.delete")}`;
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const baseSize = label.length > 20 || width < 350 ? 14 : 16;
    const scaled = baseSize * PixelRatio.getFontScale();
    setFontSize(scaled);
  }, [label, width]);

  const s = styles(theme, fontSize);

  return (
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={s.buttonText}
      allowFontScaling
      accessibilityRole="text"
      accessible={true}
      accessibilityLabel={t("accessibility.deleteStoryProgress")}
    >
      {label}
    </Text>
  );
};

const styles = (theme: "light" | "dark", fontSize: number) =>
  StyleSheet.create({
    buttonText: {
      color: theme === "dark" ? "#ffffff" : "#000000",
      fontSize,
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
