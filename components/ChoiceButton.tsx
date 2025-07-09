import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  PixelRatio,
} from "react-native";
import { useTheme } from "context/ThemeContext";

export interface ChoiceButtonRef {
  pulse: () => void;
}

interface ChoiceButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const ChoiceButton = forwardRef<ChoiceButtonRef, ChoiceButtonProps>(
  ({ text, onPress, style, textStyle }, ref) => {
    const { theme } = useTheme();
    const scale = useRef(new Animated.Value(1)).current;
    const fontScale = PixelRatio.getFontScale();
    const s = styles(theme, fontScale);

    useImperativeHandle(ref, () => ({
      pulse: () => {
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }));

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          style={[s.choiceButton, style]}
          accessibilityRole="button"
          accessibilityLabel={text}
        >
          <Text
            style={[s.choiceText, textStyle]}
            allowFontScaling={true}
          >
            {text}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }
);

const styles = (theme: "light" | "dark", fontScale: number) =>
  StyleSheet.create({
    choiceButton: {
      backgroundColor: theme === "dark" ? "#333" : "#e0e0e0",
      padding: 12 * fontScale,
      borderRadius: 10,
      marginBottom: 14,
      borderColor: theme === "dark" ? "#555" : "#ccc",
      borderWidth: 1,
    },
    choiceText: {
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: 16 * fontScale,
      textAlign: "center",
    },
  });

export default ChoiceButton;
