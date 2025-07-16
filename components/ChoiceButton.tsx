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
          style={({ pressed }) => [
            s.choiceButton,
            pressed && {
              backgroundColor: theme === "dark" ? "#2a2a2a" : "#e6e6e6",
              transform: [{ scale: 0.98 }],
            },
            style,
          ]}
          accessibilityRole="button"
          accessibilityLabel={text}
        >
          <Text style={[s.choiceText, textStyle]} allowFontScaling={true}>
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
      backgroundColor: theme === "dark" ? "#222" : "#f0f0f0",
      paddingVertical: 14 * fontScale,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme === "dark" ? "#444" : "#ddd",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 3, // Android shadow
    },
    choiceText: {
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: 17 * fontScale,
      fontWeight: "600",
      letterSpacing: 0.3,
      textAlign: "center",
    },
  });

export default ChoiceButton;
